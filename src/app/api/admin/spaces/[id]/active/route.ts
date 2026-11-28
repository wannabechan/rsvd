import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { updateCatalogSpaceActive } from "@/lib/admin-catalog";
import { routes } from "@/lib/routes";
import { isUserStoreConfigured } from "@/lib/user-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json(
        { ok: false, error: "공간 ID가 필요합니다." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { active?: unknown };
    if (typeof body.active !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "활성 상태가 필요합니다." },
        { status: 400 },
      );
    }

    const result = await updateCatalogSpaceActive(id, body.active);
    if (!result.ok) {
      if (result.reason === "has-reservations") {
        return NextResponse.json(
          {
            ok: false,
            reason: "has-reservations",
            error: "잔여 예약이 남아있습니다.",
          },
          { status: 409 },
        );
      }
      if (result.reason === "incomplete") {
        return NextResponse.json(
          {
            ok: false,
            reason: "incomplete",
            error: result.error ?? "필수 항목을 입력해 주세요.",
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { ok: false, error: "공간을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    revalidatePath(routes.adminSpaces);
    revalidatePath(routes.spaceList);
    revalidatePath(routes.spaceDetail(id));

    return NextResponse.json({ ok: true, space: result.space });
  } catch (error) {
    console.error("admin space active PUT failed", error);
    return NextResponse.json(
      { ok: false, error: "활성 상태 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
