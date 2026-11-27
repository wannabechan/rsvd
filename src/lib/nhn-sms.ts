/**
 * NHN Cloud Notification SMS (v3.0) sender.
 * Docs: https://docs.nhncloud.com/ko/Notification/SMS/ko/api-guide/
 */

import { normalizePhone, phoneVerificationSmsBody } from "@/domain/auth";

const NHN_SMS_API_BASE = "https://sms.api.nhncloudservice.com";

type NhnSmsConfig = {
  appKey: string;
  secretKey: string;
  sendNo: string;
};

type NhnSmsHeader = {
  isSuccessful: boolean;
  resultCode: number;
  resultMessage: string;
};

type NhnSmsSendResponse = {
  header: NhnSmsHeader;
  body?: {
    data?: {
      requestId?: string;
      sendResultList?: Array<{
        recipientNo?: string;
        resultCode?: number;
        resultMessage?: string;
      }>;
    };
  };
};

export function getNhnSmsConfig(): NhnSmsConfig | null {
  const appKey = process.env.NHN_SMS_APP_KEY?.trim();
  const secretKey = process.env.NHN_SMS_SECRET_KEY?.trim();
  const sendNo = process.env.NHN_SMS_SEND_NO?.replace(/\D/g, "");
  if (!appKey || !secretKey || !sendNo) {
    return null;
  }
  return { appKey, secretKey, sendNo };
}

export function isNhnSmsConfigured(): boolean {
  return getNhnSmsConfig() !== null;
}

export async function sendNhnSmsVerificationCode(
  phone: string,
  code: string,
): Promise<void> {
  const config = getNhnSmsConfig();
  if (!config) {
    throw new Error(
      "NHN SMS is not configured. Set NHN_SMS_APP_KEY, NHN_SMS_SECRET_KEY, NHN_SMS_SEND_NO.",
    );
  }

  const recipientNo = normalizePhone(phone);
  const url = `${NHN_SMS_API_BASE}/sms/v3.0/appKeys/${encodeURIComponent(config.appKey)}/sender/sms`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "X-Secret-Key": config.secretKey,
    },
    body: JSON.stringify({
      body: phoneVerificationSmsBody(code),
      sendNo: config.sendNo,
      recipientList: [
        {
          recipientNo,
          countryCode: "82",
        },
      ],
      userId: "rsvd",
    }),
  });

  let payload: NhnSmsSendResponse | null = null;
  try {
    payload = (await response.json()) as NhnSmsSendResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      `NHN SMS HTTP ${response.status}: ${payload?.header?.resultMessage ?? "request failed"}`,
    );
  }

  if (!payload?.header?.isSuccessful || payload.header.resultCode !== 0) {
    throw new Error(
      `NHN SMS failed: ${payload?.header?.resultMessage ?? "unknown error"} (${payload?.header?.resultCode ?? "?"})`,
    );
  }

  const sendResult = payload.body?.data?.sendResultList?.[0];
  if (sendResult && sendResult.resultCode !== 0) {
    throw new Error(
      `NHN SMS recipient failed: ${sendResult.resultMessage ?? "unknown"} (${sendResult.resultCode})`,
    );
  }
}
