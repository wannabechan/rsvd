/**
 * One-time helper: open Google consent, then print GMAIL_REFRESH_TOKEN.
 *
 * Prerequisites:
 * 1. Gmail API enabled
 * 2. OAuth client (Web) with redirect URI:
 *    http://localhost:3333/oauth2callback
 * 3. .env.local with GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 *
 * Run: npm run gmail:token
 */

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { google } from "googleapis";

const REDIRECT_URI = "http://localhost:3333/oauth2callback";
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

loadEnvLocal();

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

const server = createServer(async (req, res) => {
  try {
    if (!req.url?.startsWith("/oauth2callback")) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const url = new URL(req.url, REDIRECT_URI);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Google 동의 실패: ${error}`);
      console.error("OAuth error:", error);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("code 파라미터가 없습니다.");
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>승인 완료</h1><p>터미널에 출력된 refresh token을 .env.local에 저장하세요. 이 창은 닫아도 됩니다.</p>",
    );

    console.log("\n=== 성공 ===");
    console.log("아래 값을 .env.local / Vercel 환경변수에 넣으세요.\n");
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token ?? "(없음 — prompt=consent로 다시 시도)"}`);
    if (tokens.expiry_date) {
      console.log(`# access token expiry: ${new Date(tokens.expiry_date).toISOString()}`);
    }
    console.log("\nGMAIL_SENDER=발송에_사용한_구글계정이메일");
    console.log("==============\n");

    server.close();
    process.exit(tokens.refresh_token ? 0 : 1);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("토큰 교환 실패. 터미널 로그를 확인하세요.");
    server.close();
    process.exit(1);
  }
});

server.listen(3333, () => {
  console.log("로컬 콜백 서버: http://localhost:3333");
  console.log("브라우저에서 아래 URL을 여세요 (발송에 쓸 Google 계정으로 로그인):\n");
  console.log(authUrl);
  console.log("\n동의 후 이 터미널에 refresh token이 출력됩니다.");
});

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    return;
  }

  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
