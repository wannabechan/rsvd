import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { brandFavicons } from "@/lib/brand-assets";
import "./globals.css";

export const metadata: Metadata = {
  title: "rsvd",
  description: "Restaurant reservation",
  icons: {
    icon: [
      { url: brandFavicons[32], sizes: "32x32", type: "image/png" },
      { url: brandFavicons[192], sizes: "192x192", type: "image/png" },
      { url: brandFavicons[512], sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: brandFavicons[180], sizes: "180x180", type: "image/png" }],
  },
};

/** Shrink layout with the virtual keyboard where the browser supports it (e.g. Chrome Android). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
