import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

export function getAppOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (!host) {
    throw new Error("Cannot resolve app origin. Set NEXT_PUBLIC_APP_URL.");
  }
  return `${proto}://${host}`;
}

export function getGmailOAuthClient(redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGmailAuthUrl(redirectUri: string) {
  const client = getGmailOAuthClient(redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

export function isGmailOauthSetupAllowed() {
  return process.env.ALLOW_GMAIL_OAUTH_SETUP === "true";
}
