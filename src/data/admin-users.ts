import type { AdminUser } from "@/domain/admin-user";

const NICKNAMES = [
  "민수",
  "서연",
  "지훈",
  "하은",
  "도윤",
  "수아",
  "예준",
  "지아",
  "현우",
  "소율",
  "준서",
  "채원",
  "시우",
  "유나",
  "건우",
  "다은",
  "주원",
  "예린",
  "태윤",
  "서현",
];

/** Deterministic sample-grade users for catalog seed. */
export function buildSeedSampleUsers(count = 15): AdminUser[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    const nickname = NICKNAMES[index % NICKNAMES.length];
    const day = String((index % 28) + 1).padStart(2, "0");
    return {
      id: `sample-user-${n}`,
      email: `sample${n}@rsvd.example`,
      joinedAt: `2025-0${(index % 9) + 1}-${day}`,
      nickname,
      phone: `010${String(1000 + n * 37).slice(-4)}${String(2000 + n * 53).slice(-4)}`,
      grade: "sample" as const,
    };
  });
}
