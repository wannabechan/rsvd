import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  WEEKDAY_KEYS,
  type TimeSlot,
  type WeekdayKey,
} from "@/domain/admin-space";
import { updateCatalogSpaceDayHours } from "@/lib/admin-catalog";
import { routes } from "@/lib/routes";
import { isUserStoreConfigured } from "@/lib/user-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isWeekdayKey(value: unknown): value is WeekdayKey {
  return typeof value === "string" && (WEEKDAY_KEYS as readonly string[]).includes(value);
}

function parseSlots(value: unknown): TimeSlot[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const slots: TimeSlot[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const raw = item as Partial<TimeSlot>;
    const start = typeof raw.start === "string" ? raw.start.trim() : "";
    const end = typeof raw.end === "string" ? raw.end.trim() : "";
    const intervalMinutes = Number(raw.intervalMinutes);
    const maxReservations = Number(raw.maxReservations);
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
      return null;
    }
    if (!Number.isFinite(intervalMinutes) || intervalMinutes < 1) {
      return null;
    }
    if (!Number.isFinite(maxReservations) || maxReservations < 1) {
      return null;
    }
    slots.push({
      id:
        typeof raw.id === "string" && raw.id.trim()
          ? raw.id.trim()
          : `slot-${Date.now()}-${slots.length}`,
      start,
      end,
      intervalMinutes: Math.floor(intervalMinutes),
      maxReservations: Math.floor(maxReservations),
      extraBufferDays: 0,
    });
  }
  return slots;
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

    const body = (await request.json()) as {
      day?: unknown;
      slots?: unknown;
    };
    if (!isWeekdayKey(body.day)) {
      return NextResponse.json(
        { ok: false, error: "요일이 올바르지 않습니다." },
        { status: 400 },
      );
    }
    const slots = parseSlots(body.slots);
    if (!slots) {
      return NextResponse.json(
        { ok: false, error: "시간대 값이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const space = await updateCatalogSpaceDayHours(id, body.day, { slots });
    if (!space) {
      return NextResponse.json(
        { ok: false, error: "공간을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    revalidatePath(routes.adminSpaces);
    revalidatePath(routes.adminSpaceHours(id));
    revalidatePath(routes.spaceList);
    revalidatePath(routes.spaceDetail(id));

    return NextResponse.json({ ok: true, space });
  } catch (error) {
    console.error("admin space hours PUT failed", error);
    return NextResponse.json(
      { ok: false, error: "영업시간 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
