import { NextResponse } from "next/server";
import {
  isValidEmail,
  isValidNickname,
  normalizeEmail,
} from "@/domain/auth";
import {
  buildAuthUser,
  isUserStoreConfigured,
  updateNickname,
} from "@/lib/user-store";

export async function GET(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "프로필 저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const email = normalizeEmail(
      new URL(request.url).searchParams.get("e") ?? "",
    );
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }

    const user = await buildAuthUser(email);
    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("profile GET failed", error);
    return NextResponse.json(
      { ok: false, error: "프로필을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

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
      nickname?: string;
    };
    const email = normalizeEmail(body.email ?? "");
    const nickname = body.nickname ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }
    if (!isValidNickname(nickname)) {
      return NextResponse.json(
        { ok: false, error: "닉네임은 1–20자로 입력해 주세요." },
        { status: 400 },
      );
    }

    await updateNickname(email, nickname);
    const user = await buildAuthUser(email);
    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("profile POST failed", error);
    return NextResponse.json(
      { ok: false, error: "닉네임 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
