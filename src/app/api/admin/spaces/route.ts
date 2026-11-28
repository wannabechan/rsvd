import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  adminSpaceRequiredFieldsError,
  adminSpaceRequiredFieldValuesFromEditable,
  inviteHandleFromSpaceName,
  SPACE_INVITE_CHANNEL_DEFAULT,
} from "@/domain/admin-space";
import {
  createCatalogSpace,
  type AdminSpaceEditableFields,
} from "@/lib/admin-catalog";
import { routes } from "@/lib/routes";
import { isUserStoreConfigured } from "@/lib/user-store";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Preserve newlines and blank lines as one text blob. */
function asNoticeText(value: unknown): string {
  if (typeof value === "string") {
    return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .join("\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  }
  return "";
}

function asNonNegInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return fallback;
  }
  return Math.floor(n);
}

export async function POST(request: Request) {
  try {
    if (!isUserStoreConfigured()) {
      return NextResponse.json(
        { ok: false, error: "저장소가 연결되지 않았습니다." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as Partial<AdminSpaceEditableFields>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const heroImage =
      typeof body.heroImage === "string" ? body.heroImage.trim() : "";

    const fields: AdminSpaceEditableFields = {
      name,
      address,
      contact: typeof body.contact === "string" ? body.contact.trim() : "",
      adminEmail:
        typeof body.adminEmail === "string" ? body.adminEmail.trim() : "",
      notices: asNoticeText(body.notices),
      heroImage,
      menuImages: asStringArray(body.menuImages),
      otherImages: asStringArray(body.otherImages),
      bookingBufferDays: asNonNegInt(body.bookingBufferDays, 0),
      maxBookingDays: asNonNegInt(body.maxBookingDays, 30),
      minPartySize: Math.max(1, asNonNegInt(body.minPartySize, 1)),
      maxPartySize: Math.max(1, asNonNegInt(body.maxPartySize, 6)),
      active: body.active !== false,
    };

    const requiredError = adminSpaceRequiredFieldsError(
      adminSpaceRequiredFieldValuesFromEditable({
        ...fields,
        inviteChannel: SPACE_INVITE_CHANNEL_DEFAULT,
        inviteHandle: inviteHandleFromSpaceName(fields.name),
      }),
    );
    if (requiredError) {
      return NextResponse.json(
        { ok: false, error: requiredError },
        { status: 400 },
      );
    }

    if (fields.minPartySize > fields.maxPartySize) {
      return NextResponse.json(
        { ok: false, error: "최소 인원은 최대 인원보다 클 수 없습니다." },
        { status: 400 },
      );
    }

    const space = await createCatalogSpace(fields);
    revalidatePath(routes.adminSpaces);
    revalidatePath(routes.spaceList);
    revalidatePath(routes.spaceDetail(space.id));

    return NextResponse.json({ ok: true, space });
  } catch (error) {
    console.error("admin space POST failed", error);
    return NextResponse.json(
      { ok: false, error: "공간 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
