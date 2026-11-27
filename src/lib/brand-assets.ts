/**
 * Brand image paths served from /public.
 * Prefer the closest size when picking a favicon / PWA / apple-touch icon.
 */

export const brandLogos = {
  main: "/img/rsvd_logo_main.png",
  symbol: "/img/rsvd_logo_symbol.png",
} as const;

export const brandFavicons = {
  32: "/img/rsvd_logo_fav_32.png",
  180: "/img/rsvd_logo_fav_180.png",
  192: "/img/rsvd_logo_fav_192.png",
  512: "/img/rsvd_logo_fav_512.png",
} as const;

export type BrandFaviconSize = keyof typeof brandFavicons;

/** Pick the smallest favicon that is >= requested CSS px (fallback: largest). */
export function faviconForSize(px: number): string {
  const sizes = Object.keys(brandFavicons)
    .map(Number)
    .sort((a, b) => a - b) as BrandFaviconSize[];

  for (const size of sizes) {
    if (size >= px) {
      return brandFavicons[size];
    }
  }

  return brandFavicons[sizes[sizes.length - 1]];
}
