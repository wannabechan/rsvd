import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  createSpaceCandidate,
  listSpaceCandidates,
  updateSpaceCandidates,
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

export async function PUT(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      updates?: unknown;
    };
    if (!Array.isArray(body.updates) || body.updates.length === 0) {
      return NextResponse.json(
        { ok: false, error: "저장할 변경 사항이 없습니다." },
        { status: 400 },
      );
    }

    const updates: Array<{
      id: string;
      email: string;
      verifyCode: string;
      verifyCodeExpiresAt: string;
    }> = [];

    for (const item of body.updates) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const row = item as Record<string, unknown>;
      const id = typeof row.id === "string" ? row.id.trim() : "";
      if (!id) {
        continue;
      }
      updates.push({
        id,
        email: typeof row.email === "string" ? row.email : "",
        verifyCode: typeof row.verifyCode === "string" ? row.verifyCode : "",
        verifyCodeExpiresAt:
          typeof row.verifyCodeExpiresAt === "string"
            ? row.verifyCodeExpiresAt
            : "",
      });
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { ok: false, error: "저장할 변경 사항이 없습니다." },
        { status: 400 },
      );
    }

    const candidates = await updateSpaceCandidates(updates);
    revalidatePath(routes.adminSpaceCandidates);
    return NextResponse.json({ ok: true, candidates });
  } catch (error) {
    console.error("admin space candidates PUT failed", error);
    return NextResponse.json(
      { ok: false, error: "매장후보 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
