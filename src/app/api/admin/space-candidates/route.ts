import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  createSpaceCandidate,
  listSpaceCandidates,
} from "@/lib/admin-space-candidates";
import { routes } from "@/lib/routes";
import { isUserStoreConfigured } from "@/lib/user-store";

export async function GET() {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }
    const candidates = await listSpaceCandidates();
    return NextResponse.json({ ok: true, candidates });
  } catch (error) {
    console.error("admin space candidates GET failed", error);
    return NextResponse.json(
      { ok: false, error: "매장후보 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      channel?: unknown;
      handle?: unknown;
    };
    const channel = typeof body.channel === "string" ? body.channel.trim() : "";
    const handle = typeof body.handle === "string" ? body.handle.trim() : "";

    if (!handle) {
      return NextResponse.json(
        { ok: false, error: "아이디를 입력해 주세요." },
        { status: 400 },
      );
    }

    try {
      const candidate = await createSpaceCandidate({ channel, handle });
      revalidatePath(routes.adminSpaceCandidates);
      return NextResponse.json({ ok: true, candidate });
    } catch (error) {
      if (error instanceof Error && error.message === "channel-invalid") {
        return NextResponse.json(
          { ok: false, error: "채널을 선택해 주세요." },
          { status: 400 },
        );
      }
      if (error instanceof Error && error.message === "handle-required") {
        return NextResponse.json(
          { ok: false, error: "아이디를 입력해 주세요." },
          { status: 400 },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("admin space candidates POST failed", error);
    return NextResponse.json(
      { ok: false, error: "매장후보 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
