import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  updateCatalogSpace,
  type AdminSpaceEditableFields,
} from "@/lib/admin-catalog";
import { routes } from "@/lib/routes";
import { isUserStoreConfigured } from "@/lib/user-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Preserve newlines and blank lines from textarea / line arrays. */
function asNoticeLines(value: unknown): string[] {
  if (typeof value === "string") {
    return value.split("\n");
  }
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function asNonNegInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return fallback;
  }
  return Math.floor(n);
}

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

    const body = (await request.json()) as Partial<AdminSpaceEditableFields>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (!name) {
      return NextResponse.json(
        { ok: false, error: "공간명칭을 입력해 주세요." },
        { status: 400 },
      );
    }
    if (!address) {
      return NextResponse.json(
        { ok: false, error: "주소를 입력해 주세요." },
        { status: 400 },
      );
    }

    const heroImage =
      typeof body.heroImage === "string" ? body.heroImage.trim() : "";
    if (!heroImage) {
      return NextResponse.json(
        { ok: false, error: "대표 이미지를 업로드해 주세요." },
        { status: 400 },
      );
    }

    const fields: AdminSpaceEditableFields = {
      name,
      address,
      contact: typeof body.contact === "string" ? body.contact.trim() : "",
      adminEmail:
        typeof body.adminEmail === "string" ? body.adminEmail.trim() : "",
      notices: asNoticeLines(body.notices),
      heroImage,
      menuImages: asStringArray(body.menuImages),
      otherImages: asStringArray(body.otherImages),
      bookingBufferDays: asNonNegInt(body.bookingBufferDays, 0),
      maxBookingDays: asNonNegInt(body.maxBookingDays, 30),
      minPartySize: Math.max(1, asNonNegInt(body.minPartySize, 1)),
      maxPartySize: Math.max(1, asNonNegInt(body.maxPartySize, 6)),
      active: Boolean(body.active),
    };

    if (fields.minPartySize > fields.maxPartySize) {
      return NextResponse.json(
        { ok: false, error: "최소 인원은 최대 인원보다 클 수 없습니다." },
        { status: 400 },
      );
    }

    const space = await updateCatalogSpace(id, fields);
    if (!space) {
      return NextResponse.json(
        { ok: false, error: "공간을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    revalidatePath(routes.adminSpaces);
    revalidatePath(routes.spaceList);
    revalidatePath(routes.spaceDetail(id));

    return NextResponse.json({ ok: true, space });
  } catch (error) {
    console.error("admin space PUT failed", error);
    return NextResponse.json(
      { ok: false, error: "공간 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
