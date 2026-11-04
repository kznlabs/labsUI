---
paths:
  - "src/site/**"
  - "src/app/**"
  - "public/**"
  - "scripts/build-api.ts"
  - "scripts/format-snippets.ts"
  - "scripts/check-snippets.ts"
  - "README.md"
  - "next.config.ts"
  - ".github/workflows/pages.yml"
---

# Docs site

## Routes

- `/` is the showcase (hero, curated live compositions from `showcase` in
  `catalog.tsx`, getting started, the grouped component index).
- `/components/[id]` is one static page per registry entry with its own title,
  description, canonical, JSON-LD (`ComponentStructuredData`) and sitemap entry,
  rendering `ShowcaseSection` from `sectionProps()` (code, API).

## API docs

- `scripts/build-api.ts` (part of `bun run registry`, run by Node 22.18+ until
  oven-sh/bun#39747 ships) reads exported components' prop types with TS 7's API
  (`typescript/unstable/sync`, drives tsgo over `tsconfig.json`; unstable, so
  rerun it after bumping TypeScript) into `src/site/api.generated.json`, shown
  as each section's API reference and in `/llms.txt`.
- **JSDoc on a prop is its public description**; own props only (inherited DOM
  props are summarized, `className` omitted). Every own prop needs one: the
  script fails and lists the gaps otherwise.
- Types the docs print (`types`) must be exported, the script fails otherwise.
- In a discriminated union (`mode`, `multiple`, `type`), TS joins the docs of
  every branch, so document the first branch only, worded for both.

## Code examples

Code examples (snippets, registry `usage`, playground strings) go through
Prettier: `scripts/format-snippets.ts` formats snippets and `usage` at build
time (`src/site/snippets.formatted.json`, generated), and only code a demo
rewrites live formats in the browser. Author them readable; they must parse as
TSX.

## SEO and GEO

Semantic tags, one `h1`, `section[aria-labelledby]`→`h2`; the registry feeds
JSON-LD (`<StructuredData />`, `@/site/seo/structured-data`) and `/llms.txt`.

## Originality and claims

- Every component is written here. Demo images are drawn for them or CC0,
  downloaded into `public/` with their license metadata kept
  (`public/avatar-demo.svg` is DiceBear Thumbs, CC0); no hotlinked images, no
  logos.
- Copy, docs, comments and names describe labsUI on its own terms, without
  comparisons to other projects.
- Browser support (README "Accessibility and browsers", the gallery's checks
  strip) names engines and browsers as plain facts, and only claims what the
  last automated sweep measured.

## GitHub Pages

- `.github/workflows/pages.yml` does a static export to `out/` under `/labsUI`.
  Plain `<a href>`/`<img src>` to root paths use `withBase()` from
  `@/site/config`.
- The favicon and header mark are `public/icon.svg` and `public/logo.svg`; the
  link preview is `public/og.png`, rendered from `public/og.svg` (social sites
  need a raster). No icon/opengraph-image conventions: they miss basePath in the
  static export.
