import { google } from "googleapis";

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

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function sendLoginCodeEmail(to: string, code: string) {
  const { auth, sender } = getSenderAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const subject = "rsvd 로그인 코드";
  const body = [
    "rsvd 로그인 코드입니다.",
    "",
    code,
    "",
    "코드는 10분 동안 유효합니다.",
    "본인이 요청하지 않았다면 이 메일을 무시해 주세요.",
  ].join("\n");

  const mime = [
    `From: rsvd <${sender}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ].join("\r\n");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: toBase64Url(mime),
    },
  });
}
