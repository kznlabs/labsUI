---
paths:
  - "tests/e2e/**"
  - "src/app/e2e/**"
  - "scripts/affected.ts"
  - ".github/workflows/e2e.yml"
---

# E2E

- `tests/e2e/`, Playwright + axe: `bun run e2e:build`, then
  `bun run e2e [--project chromium-1280]`. `E2E_PAGES=dialog,select` limits
  pages, `bun run e2e:affected` lists those a diff reaches.
- Specs end in `.e2e.ts` (not `bun test`). No fixed waits: locators or
  `expect.poll`.
- Every page gets generic checks (`checks.ts`): controls a click can't reach,
  hairline scrollbars, dead wheel scrolling, `aria-expanded`/tab/slider
  contracts. A component that breaks one on purpose needs a reason, not an
  exemption list.
- Behavior the docs promise is tested on probe pages,
  `src/app/e2e/*/page.e2e.tsx`, built only by `e2e:build` (`E2E=1` adds the
  `e2e.tsx` page extension).
- Runs in CI only (`e2e.yml`); trigger it by hand for a page.
