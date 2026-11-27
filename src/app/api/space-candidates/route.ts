import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  findSpaceCandidate,
  submitSpaceCandidateRequest,
} from "@/lib/admin-space-candidates";
import { routes } from "@/lib/routes";
import { isUserStoreConfigured } from "@/lib/user-store";

/** Lookup whether channel+handle already exists (for confirm copy). */
export async function GET(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const channel = (searchParams.get("channel") ?? "").trim();
    const handle = (searchParams.get("handle") ?? "").trim();
    if (!handle) {
      return NextResponse.json(
        { ok: false, error: "아이디를 입력해 주세요." },
        { status: 400 },
      );
    }

    const existing = await findSpaceCandidate(channel, handle);
    return NextResponse.json({
      ok: true,
      exists: Boolean(existing),
    });
  } catch (error) {
    console.error("space candidates GET failed", error);
    return NextResponse.json(
      { ok: false, error: "조회에 실패했습니다." },
      { status: 500 },
    );
  }
}

/** Create a candidate, or increment requestCount for the same channel+handle. */
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
      const result = await submitSpaceCandidateRequest({ channel, handle });
      revalidatePath(routes.adminSpaceCandidates);
      return NextResponse.json({
        ok: true,
        created: result.created,
        candidate: result.candidate,
      });
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
    console.error("space candidates POST failed", error);
    return NextResponse.json(
      { ok: false, error: "등록 요청 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
