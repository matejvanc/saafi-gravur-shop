# Saafi Gravur Shop

Multilingual demo e-shop for personalised engraved gifts. The site presents custom
Christmas baubles, wooden bookmarks, wooden keychains, wooden bottle openers and
wooden pens.

## Features

- Product detail pages with configurable text, colour/finish and logo design
- Separate product catalog page at `/produkty`
- Cart page with persistent cart summary
- Language switcher for German, English, Czech, French and Italian
- Passwordless customer sign-in via Supabase email links
- Standalone terms page at `/agb`
- Public deployment on Cloudflare Workers

## Customer sign-in setup

Customer sign-in uses Supabase Auth email links. Create a Supabase project, enable
email sign-in, and set the project's Site URL and redirect URL to the shop origin:
`https://saafi-gravur-shop.vancmatej.workers.dev`.

In the Cloudflare Worker settings, add `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` as Worker secrets. Use the Supabase project URL and its
publishable key (or legacy `anon` key); never use a `service_role` or secret key.
The Worker exposes only these public client credentials through
`/api/auth-config`. Redeploy the Worker after adding them.

## Tech Stack

- React 19
- Vinext
- OpenAI Sites
- Node.js `>=22.13.0`

## Useful Commands

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm test
```

## Attribution

Created with assistance from OpenAI Codex (ChatGPT).
