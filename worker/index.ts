/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await handleWorkerRequest(request, env, ctx);
    return addSecurityHeaders(response, new URL(request.url));
  },
};

async function handleWorkerRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/post-locations") {
      if (request.method !== "GET") {
        return Response.json(
          { error: "Method not allowed." },
          { status: 405, headers: { Allow: "GET" } },
        );
      }

      const query = url.searchParams.get("q")?.trim() ?? "";
      if (query.length < 2 || query.length > 100) {
        return Response.json(
          { locations: [] },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      const requestedLanguage = url.searchParams.get("lang") ?? "de";
      const language = ["de", "fr", "it", "en"].includes(requestedLanguage)
        ? requestedLanguage
        : "de";
      const swissPostUrl = new URL(
        "https://places.post.ch/StandortSuche/StaoCacheServiceV2/api/v1/Geocode",
      );
      swissPostUrl.searchParams.set("query", query);
      swissPostUrl.searchParams.set("pois", "T1.S248,T6.S852,T9.S248,T9.S852");
      swissPostUrl.searchParams.set("lang", language);
      swissPostUrl.searchParams.set("limit", "30");

      try {
        const swissPostResponse = await fetch(swissPostUrl, {
          headers: { Accept: "application/json" },
        });
        if (!swissPostResponse.ok) {
          return Response.json(
            { error: "Swiss Post location search is temporarily unavailable." },
            { status: 502, headers: { "Cache-Control": "no-store" } },
          );
        }

        const result = (await swissPostResponse.json()) as {
          locations?: Array<{
            id?: unknown;
            name?: unknown;
            type?: unknown;
            subtype?: unknown;
            pt?: unknown;
          }>;
        };
        const locations = (result.locations ?? [])
          .filter(
            (location) =>
              location.type === "poi" &&
              typeof location.id === "string" &&
              typeof location.name === "string" &&
              Array.isArray(location.pt) &&
              location.pt.length === 2 &&
              location.pt.every((coordinate) => typeof coordinate === "number"),
          )
          .slice(0, 8)
          .map((location) => ({
            id: location.id,
            name: location.name,
            type: typeof location.subtype === "string" ? location.subtype : "",
            coordinates: location.pt,
          }));

        return Response.json(
          { locations },
          { headers: { "Cache-Control": "public, max-age=30, s-maxage=120" } },
        );
      } catch {
        return Response.json(
          { error: "Swiss Post location search is temporarily unavailable." },
          { status: 502, headers: { "Cache-Control": "no-store" } },
        );
      }
    }

    if (url.pathname === "/api/auth-config") {
      if (request.method !== "GET") {
        return Response.json(
          { error: "Method not allowed." },
          { status: 405, headers: { Allow: "GET" } },
        );
      }

      const responseHeaders = { "Cache-Control": "no-store" };
      const supabaseUrl = env.SUPABASE_URL?.trim();
      const publishableKey = env.SUPABASE_PUBLISHABLE_KEY?.trim();
      if (!supabaseUrl || !publishableKey) {
        return Response.json(
          { error: "Authentication is not configured." },
          { status: 503, headers: responseHeaders },
        );
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(supabaseUrl);
      } catch {
        return Response.json(
          { error: "Authentication configuration is invalid." },
          { status: 500, headers: responseHeaders },
        );
      }

      if (
        (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") ||
        !isPublishableSupabaseKey(publishableKey)
      ) {
        return Response.json(
          { error: "Authentication configuration is invalid." },
          { status: 500, headers: responseHeaders },
        );
      }

      return Response.json(
        { url: parsedUrl.origin, publishableKey },
        { headers: responseHeaders },
      );
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
}

function addSecurityHeaders(response: Response, requestUrl: URL): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
  if (requestUrl.protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=15552000");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default worker;

function isPublishableSupabaseKey(key: string): boolean {
  if (key.startsWith("sb_publishable_")) return true;

  const encodedPayload = key.split(".")[1];
  if (!encodedPayload) return false;

  try {
    const normalizedPayload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const payload = JSON.parse(
      atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")),
    ) as { role?: unknown };
    return payload.role === "anon";
  } catch {
    return false;
  }
}
