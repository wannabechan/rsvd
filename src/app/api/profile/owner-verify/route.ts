import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  isValidEmail,
  isValidLoginCode,
  normalizeEmail,
} from "@/domain/auth";
import { setCatalogUserGrade } from "@/lib/admin-catalog";
import { completeOwnerVerifyOnCandidates } from "@/lib/admin-space-candidates";
import { routes } from "@/lib/routes";
import {
  buildAuthUser,
  isUserStoreConfigured,
  markOwnerVerified,
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
      code?: string;
    };
    const email = normalizeEmail(body.email ?? "");
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }
    if (!isValidLoginCode(code)) {
      return NextResponse.json(
        { ok: false, error: "인증 코드 6자리를 입력해 주세요." },
        { status: 400 },
      );
    }

    const completed = await completeOwnerVerifyOnCandidates(email, code);
    if (!completed) {
      return NextResponse.json(
        { ok: false, error: "유효한 인증코드가 아닙니다." },
        { status: 400 },
      );
    }

    await markOwnerVerified(email);
    await setCatalogUserGrade(email, "manager");
    revalidatePath(routes.adminSpaceCandidates);
    revalidatePath(routes.adminSpaces);
    revalidatePath(routes.adminUsers);
    revalidatePath(routes.spaceList);

    const user = await buildAuthUser(email);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("owner-verify POST failed", error);
    return NextResponse.json(
      { ok: false, error: "사장님 인증에 실패했습니다." },
      { status: 500 },
    );
  }
}
