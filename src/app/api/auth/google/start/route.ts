import { NextResponse } from "next/server";
import {
  getAppOrigin,
  getGmailAuthUrl,
  isGmailOauthSetupAllowed,
} from "@/lib/gmail-oauth";

export async function GET(request: Request) {
  if (!isGmailOauthSetupAllowed()) {
    return NextResponse.json(
      { error: "Gmail OAuth setup is disabled. Set ALLOW_GMAIL_OAUTH_SETUP=true temporarily." },
      { status: 403 },
    );
  }

  try {
    const origin = getAppOrigin(request);
    const redirectUri = `${origin}/api/auth/google/callback`;
    const authUrl = getGmailAuthUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth start failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
