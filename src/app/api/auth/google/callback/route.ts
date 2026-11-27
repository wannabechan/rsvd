import { NextResponse } from "next/server";
import {
  getAppOrigin,
  getGmailOAuthClient,
  isGmailOauthSetupAllowed,
} from "@/lib/gmail-oauth";

export async function GET(request: Request) {
  if (!isGmailOauthSetupAllowed()) {
    return new NextResponse("Gmail OAuth setup is disabled.", { status: 403 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return new NextResponse(`Google 동의 실패: ${oauthError}`, { status: 400 });
  }

  if (!code) {
    return new NextResponse("code 파라미터가 없습니다.", { status: 400 });
  }

  try {
    const origin = getAppOrigin(request);
    const redirectUri = `${origin}/api/auth/google/callback`;
    const client = getGmailOAuthClient(redirectUri);
    const { tokens } = await client.getToken(code);

    const refreshToken = tokens.refresh_token;
    const html = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>Gmail OAuth 완료</title>
    <style>
      body { font-family: sans-serif; max-width: 40rem; margin: 2rem auto; line-height: 1.5; }
      code { display: block; padding: 0.75rem; background: #f5f5f5; word-break: break-all; }
      .warn { color: #b4433d; }
    </style>
  </head>
  <body>
    <h1>승인 완료</h1>
    <p>아래 값을 Vercel 환경변수에 저장한 뒤, <strong>ALLOW_GMAIL_OAUTH_SETUP</strong> 을 끄세요.</p>
    ${
      refreshToken
        ? `<p><strong>GMAIL_REFRESH_TOKEN</strong></p><code>${refreshToken}</code>`
        : `<p class="warn">refresh token이 없습니다. Cloud Console에서 앱 접속을 취소한 뒤 prompt=consent로 다시 시도하세요.</p>`
    }
    <p><strong>GMAIL_SENDER</strong> = 방금 동의한 Google 계정 이메일</p>
  </body>
</html>`;

    return new NextResponse(html, {
      status: refreshToken ? 200 : 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token exchange failed";
    return new NextResponse(message, { status: 500 });
  }
}
