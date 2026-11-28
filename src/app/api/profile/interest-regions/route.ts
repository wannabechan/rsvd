import { NextResponse } from "next/server";
import {
  authUserFromProfile,
  isValidEmail,
  normalizeEmail,
} from "@/domain/auth";
import { normalizeInterestRegions } from "@/domain/interest-region";
import { resolveUserRole } from "@/lib/admin";
import {
  isUserStoreConfigured,
  updateInterestRegions,
} from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "프로필 저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      email?: string;
      interestRegions?: unknown;
    };
    const email = normalizeEmail(body.email ?? "");
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }

    const interestRegions = normalizeInterestRegions(body.interestRegions);
    const profile = await updateInterestRegions(email, interestRegions);
    return NextResponse.json({
      ok: true,
      user: authUserFromProfile(email, profile, resolveUserRole(email)),
    });
  } catch (error) {
    console.error("interest-regions POST failed", error);
    return NextResponse.json(
      { ok: false, error: "관심지역 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
