export type AccountLanguage = "de" | "en" | "cs" | "fr" | "it";

export const accountCopy: Record<
  AccountLanguage,
  {
    account: string;
    close: string;
    description: string;
    email: string;
    emailSent: string;
    error: string;
    heading: string;
    loading: string;
    notConfigured: string;
    retry: string;
    sendLink: string;
    sending: string;
    signedInAs: string;
    signedOut: string;
    signOut: string;
    success: string;
  }
> = {
  de: {
    account: "Konto",
    close: "Schließen",
    description: "Melde dich sicher mit einem Link an, den wir dir per E-Mail schicken.",
    email: "E-Mail-Adresse",
    emailSent: "Der Anmeldelink wurde angefordert. Prüfe bitte dein E-Mail-Postfach.",
    error: "Die Anmeldung ist fehlgeschlagen",
    heading: "Bei Saafi Gravur anmelden",
    loading: "Anmeldung wird geladen …",
    notConfigured: "Die Anmeldung ist noch nicht eingerichtet.",
    retry: "Erneut versuchen",
    sendLink: "Anmeldelink senden",
    sending: "Wird gesendet …",
    signedInAs: "Du bist angemeldet als",
    signedOut: "Du wurdest abgemeldet.",
    signOut: "Abmelden",
    success: "Prüfe dein E-Mail-Postfach und öffne den Anmeldelink auf diesem Gerät.",
  },
  en: {
    account: "Account",
    close: "Close",
    description: "Sign in securely with a link sent to your email address.",
    email: "Email address",
    emailSent: "A sign-in link has been requested. Check your email inbox.",
    error: "Sign-in failed",
    heading: "Sign in to Saafi Gravur",
    loading: "Loading sign-in …",
    notConfigured: "Sign-in has not been set up yet.",
    retry: "Try again",
    sendLink: "Send sign-in link",
    sending: "Sending …",
    signedInAs: "You are signed in as",
    signedOut: "You have been signed out.",
    signOut: "Sign out",
    success: "Check your inbox and open the sign-in link on this device.",
  },
  cs: {
    account: "Účet",
    close: "Zavřít",
    description: "Přihlas se bezpečně pomocí odkazu, který ti pošleme e-mailem.",
    email: "E-mailová adresa",
    emailSent: "Odkaz k přihlášení byl vyžádán. Zkontroluj svou e-mailovou schránku.",
    error: "Přihlášení se nezdařilo",
    heading: "Přihlášení do Saafi Gravur",
    loading: "Načítám přihlášení…",
    notConfigured: "Přihlášení zatím není nastavené.",
    retry: "Zkusit znovu",
    sendLink: "Poslat přihlašovací odkaz",
    sending: "Odesílám…",
    signedInAs: "Jsi přihlášen/a jako",
    signedOut: "Byl/a jsi odhlášen/a.",
    signOut: "Odhlásit se",
    success: "Zkontroluj schránku a otevři přihlašovací odkaz na tomto zařízení.",
  },
  fr: {
    account: "Compte",
    close: "Fermer",
    description: "Connectez-vous en toute sécurité grâce au lien envoyé par e-mail.",
    email: "Adresse e-mail",
    emailSent: "Un lien de connexion a été demandé. Vérifiez votre boîte e-mail.",
    error: "La connexion a échoué",
    heading: "Connexion à Saafi Gravur",
    loading: "Chargement de la connexion…",
    notConfigured: "La connexion n’est pas encore configurée.",
    retry: "Réessayer",
    sendLink: "Envoyer le lien de connexion",
    sending: "Envoi…",
    signedInAs: "Vous êtes connecté en tant que",
    signedOut: "Vous êtes déconnecté.",
    signOut: "Se déconnecter",
    success: "Vérifiez votre boîte e-mail et ouvrez le lien sur cet appareil.",
  },
  it: {
    account: "Account",
    close: "Chiudi",
    description: "Accedi in modo sicuro con il link che ti invieremo via e-mail.",
    email: "Indirizzo e-mail",
    emailSent: "È stato richiesto un link di accesso. Controlla la tua casella e-mail.",
    error: "Accesso non riuscito",
    heading: "Accedi a Saafi Gravur",
    loading: "Caricamento dell’accesso…",
    notConfigured: "L’accesso non è ancora configurato.",
    retry: "Riprova",
    sendLink: "Invia link di accesso",
    sending: "Invio…",
    signedInAs: "Hai effettuato l’accesso come",
    signedOut: "Hai effettuato la disconnessione.",
    signOut: "Esci",
    success: "Controlla la posta e apri il link di accesso su questo dispositivo.",
  },
};
