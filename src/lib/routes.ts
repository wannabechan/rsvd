/**
 * Canonical in-app paths. Use these for navigation and future deep links
 * (Universal Links / App Links) so web and native stay aligned.
 */
export const routes = {
  home: "/",
  spaceList: "/space",
  spaceDetail: (spaceId: string) => `/space/${spaceId}`,
  login: "/login",
  profile: "/profile",
  admin: "/admin",
  adminSettings: "/admin",
  adminSpaces: "/admin/spaces",
  adminSpaceNew: "/admin/spaces/new",
  adminSpaceCandidates: "/admin/space-candidates",
  adminUsers: "/admin/users",
  adminSpaceEdit: (spaceId: string) => `/admin/spaces/${spaceId}/edit`,
  adminSpaceHours: (spaceId: string) => `/admin/spaces/${spaceId}/hours`,
  adminSpaceExceptions: (spaceId: string) =>
    `/admin/spaces/${spaceId}/exceptions`,
  adminSpaceExceptionNew: (spaceId: string) =>
    `/admin/spaces/${spaceId}/exceptions/new`,
  adminSpaceExceptionEdit: (spaceId: string, exceptionId: string) =>
    `/admin/spaces/${spaceId}/exceptions/${exceptionId}`,
} as const;

export function isAdminPath(pathname: string): boolean {
  return pathname === routes.admin || pathname.startsWith(`${routes.admin}/`);
}

export function isSpaceDetailPath(pathname: string, spaceId: string): boolean {
  return pathname === routes.spaceDetail(spaceId);
}

/** True for `/space/:id` (not the list `/space`). */
export function isSpaceDetailPathname(pathname: string): boolean {
  if (!pathname.startsWith(`${routes.spaceList}/`)) {
    return false;
  }
  const rest = pathname.slice(routes.spaceList.length + 1);
  return rest.length > 0 && !rest.includes("/");
}
