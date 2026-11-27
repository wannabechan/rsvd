import { google } from "googleapis";
import { brandLogos } from "@/lib/brand-assets";

function getSenderAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const sender = process.env.GMAIL_SENDER;

  if (!clientId || !clientSecret || !refreshToken || !sender) {
    throw new Error(
      "Gmail is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER.",
    );
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return { auth, sender };
}

function getAppOrigin() {
  const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!origin) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL for email logo URL");
  }
  return origin;
}

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildLoginCodeHtml(code: string, logoUrl: string) {
  return `<!DOCTYPE html>
<html lang="ko">
  <body style="margin:0;padding:24px;background:#ffffff;color:#242a27;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;line-height:1.6;">
    <p style="margin:0 0 8px;">애정하는 단골 예약 rsvd.</p>
    <p style="margin:0 0 20px;">로그인 코드입니다.</p>
    <p style="margin:0 0 20px;font-size:24px;font-weight:600;letter-spacing:0.12em;line-height:1.3;">${code}</p>
    <p style="margin:0 0 8px;">이 코드는 10분 동안 유효합니다.</p>
    <p style="margin:0 0 28px;">본인이 요청하지 않았다면 무시해 주세요.</p>
    <img src="${logoUrl}" alt="rsvd" width="300" style="display:block;width:300px;max-width:100%;height:auto;border:0;" />
  </body>
</html>`;
}

function buildLoginCodeText(code: string) {
  return [
    "애정하는 단골 예약 rsvd.",
    "로그인 코드입니다.",
    "",
    code,
    "",
    "이 코드는 10분 동안 유효합니다.",
    "본인이 요청하지 않았다면 무시해 주세요.",
  ].join("\n");
}

export async function sendLoginCodeEmail(to: string, code: string) {
  const { auth, sender } = getSenderAuth();
  const gmail = google.gmail({ version: "v1", auth });
  const logoUrl = `${getAppOrigin()}${brandLogos.main}`;

  const subject = "애정하는 단골 예약 rsvd. 로그인 코드 확인";
  const textBody = buildLoginCodeText(code);
  const htmlBody = buildLoginCodeHtml(code, logoUrl);
  const boundary = `rsvd_boundary_${Date.now()}`;

  const mime = [
    `From: rsvd <${sender}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    textBody,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    htmlBody,
    "",
    `--${boundary}--`,
  ].join("\r\n");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: toBase64Url(mime),
    },
  });
}
