# RSVD Architecture

## Product direction

1. **Web first** — ship and validate the product on the mobile web (Next.js).
2. **App Store / Play after 1차 검증** — wrap or reuse the same product surface for iOS/Android.

Preferred near-term native path: **Capacitor (or equivalent) WebView shell** around the production web app / static export, sharing deep-link paths with the website. A full React Native rewrite is deferred unless native modules force it.

## Layering

| Layer | Path | Rules |
| --- | --- | --- |
| Domain | `src/domain/` | Types + pure helpers + product copy. No React, Next, or DOM. |
| Data | `src/data/` | Sample/API adapters. Import domain types; swap to real API later. |
| Lib | `src/lib/` | Routes, platform detection, shared non-UI utilities. |
| UI | `src/components/` | Web (and later native-webview) presentation. |
| App router | `src/app/` | Next.js routes only — keep thin. |

## Deep links

Use `src/lib/routes.ts` for all in-app paths (`/space`, `/space/:id`, …). The same paths should become Universal Links / App Links when native shells ship.

## Do / Don't (mobile readiness)

- **Do** put business rules and system message copy in `src/domain/`.
- **Do** navigate via `routes.*` helpers.
- **Do** keep the mobile shell (`max-w-[480px]`, `dvh`) touch-first.
- **Don't** bury product rules inside JSX (like-count minimum, chat copy, etc.).
- **Don't** introduce web-only APIs inside `src/domain/`.
- **Don't** invent a monorepo/RN app until 1차 웹 검증 is done — structure for sharing first.

## Color / semantics

- Colors: `docs/RSVD_COLOR_SYSTEM.md` and `.cursor/rules/rsvd-color-system.mdc`
- Likes vs reservers: `.cursor/rules/rsvd-domain-semantics.mdc`
