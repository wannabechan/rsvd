/**
 * Platform-agnostic reservation-chat domain (copy + message shapes).
 * UI shells (web/native) should call these helpers instead of inlining product copy.
 */

export type ChatRole = "system" | "restaurant" | "guest";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: Date;
  showDatePicker?: boolean;
};

/** System speaker label for automated messages. */
export const SYSTEM_SPEAKER = "rsvd.";

export function createReservationStartMessage(spaceName: string): ChatMessage {
  return {
    id: `reservation-${Date.now()}`,
    role: "system",
    text: `안녕하세요. ${spaceName} 예약을 진행합니다. 먼저 예약 희망일을 선택하세요.`,
    createdAt: new Date(),
    showDatePicker: true,
  };
}

export function createReservationCancelMessage(spaceName: string): ChatMessage {
  return {
    id: `reservation-cancel-${Date.now()}`,
    role: "system",
    text: `${spaceName} 예약 진행이 중단되었습니다.`,
    createdAt: new Date(),
  };
}

export function createGuestMessage(text: string): ChatMessage {
  return {
    id: `guest-${Date.now()}`,
    role: "guest",
    text,
    createdAt: new Date(),
  };
}

export function speakerLabelFor(
  role: ChatRole,
  spaceName: string,
): string | null {
  if (role === "system") {
    return SYSTEM_SPEAKER;
  }
  if (role === "restaurant") {
    return spaceName;
  }
  return null;
}
