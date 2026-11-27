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
} as const;

export function isSpaceDetailPath(pathname: string, spaceId: string): boolean {
  return pathname === routes.spaceDetail(spaceId);
}
