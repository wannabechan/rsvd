/**
 * Server-only admin grade resolution from ADMIN_EMAIL.
 */

import { isAdminEmailAddress, type UserRole } from "@/domain/auth";

export function resolveUserRole(email: string): UserRole {
  return isAdminEmailAddress(email, process.env.ADMIN_EMAIL) ? "admin" : "member";
}
