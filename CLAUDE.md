# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Also read `AGENTS.md` — it holds the UI conventions (dark mode, small screens) that
almost every page change has to satisfy.

## Commands

Package manager is **pnpm** (CI uses it; the README's `npm` lines are stale).

```bash
pnpm dev            # dev server
pnpm build          # astro build -> dist/
pnpm preview        # preview the build
pnpm test           # vitest run (all tests)
pnpm test:watch     # vitest watch
pnpm format         # prettier --write .
pnpm format:check   # prettier --check .
```

Single test file / single test:

```bash
npx vitest run src/lib/posts/__tests__/schema.test.ts
npx vitest run -t "some test name"
```

Vitest only picks up `src/**/__tests__/**/*.test.ts` (node environment, globals on).
Astro components and pages are not covered by tests — the testable logic lives in
`src/lib/`.

Deployment is automatic: pushing to `main` triggers `.github/workflows/deploy.yml`,
which builds with pnpm and publishes `dist/` to GitHub Pages via
`upload-pages-artifact` + `deploy-pages`. There is no manual deploy path any more
(the old `scripts/deploy.sh`, which built locally and copied `dist/` into a sibling
repo, is gone). `public/CNAME` carries the custom domain into every build — don't
delete that file.

This repo is **`magnuswahlstrand/magnuswahlstrand.github.io`**, the account's *user
site*, and that is load-bearing: `wahlstrand.dev` must stay attached to the user
site's Pages, because GitHub serves every other Pages-enabled repo in the account at
`wahlstrand.dev/<repo>/` by inheriting the user site's custom domain. Moving the
domain onto a project repo silently 404s all of those (`/tools/`, `/til/`,
`/presentations/`, …). The blog source used to live in `magnuswahlstrand/blog`; that
repo is now dormant and its Pages site is deleted. The pre-Actions built site is
kept on the `legacy-built-site` branch.

`.husky/pre-commit` runs `lint-staged`, which prettier-formats every staged file.

## Architecture

Astro 5 static site (Tailwind + React islands + MDX), originally based on the
AstroPaper theme. Site config (title, author, socials, `postPerPage`) is in
`src/config.ts`; global page shell and meta tags in `src/layouts/Layout.astro`.

### Content sources — five separate mechanisms, deliberately

There are **no Astro content collections**. Each kind of content has its own loader:

1. **Blog posts** — `src/contents/*.{md,mdx}`, loaded via `loadPosts()` from
   `src/lib/posts/`, which globs them once and **zod-validates** frontmatter
   against `postSchema`; an invalid post throws at build time with its path.
   Never re-glob `contents/` in a page — call `loadPosts()`.
   `src/types.ts:Frontmatter` is a re-export of the schema-inferred type, so the
   type and the validation cannot drift.
   Two gotchas the schema encodes: `datetime` is a **`Date`**, not a string (YAML
   parses unquoted `2019-04-28` into a Date), and `slug` is **optional** — 8 posts
   omit it and fall back to the title via `@utils/slugify`.
   Sorting and draft filtering go through `@utils/getSortedPosts` (which applies
   `filterDraftPostsInProd` — drafts are visible in dev, hidden in prod).
   URLs come from `@utils/slugify(frontmatter)`, not the filename.
2. **Board games** — `src/games/*.md`, loaded by `src/lib/games/index.ts`, same
   glob-and-validate pattern as posts (`gameSchema`). Rendered by
   `src/pages/lists/board-games.astro`.
3. **Recipes** — plain markdown pages in `src/pages/recipes/*.md`, routed
   *directly* by Astro (`layout: ../../layouts/AboutNowLayout.astro` in the
   frontmatter, body is just `## Ingredients` / `## How to`). Adding a recipe means
   dropping in a file — the URL is the filename, and there is no route file or
   registry to update.
   Because Astro renders these pages itself, `src/lib/recipes/` is not in the render
   path; it globs the same directory so `src/pages/recipes.astro` (the index table)
   can **zod-validate every recipe's frontmatter** against `recipeSchema`. That page
   is always built, so an invalid recipe still fails the build with its path — the
   same guarantee posts and games get, just enforced from the side.
   `title` is required; `added` (`YYYY-MM`) and `source` (`{ label, url }`) feed the
   table, `images` feeds the carousel in the layout.
   These recipes used to be TS modules carrying an `operations` DAG rendered as a
   flow diagram; that subsystem (`src/lib/recipe-flow/`) was removed.
4. **Reading takes** — `src/reading/*.md`, one file per article read: the
   frontmatter *is* the article (`title`, `url`, `author?`, `read`, `tags`), the
   markdown body is the take. Loaded by `src/lib/reading/index.ts` (glob +
   `readingSchema`, same pattern as posts/games) and rendered as sections of a
   single page, `src/pages/lists/reading.astro`, newest `read` first. Adding a
   take means dropping in a file — no registry, no route.
   These deliberately live **outside `src/contents/`** so they never reach
   `/posts`, RSS, search or the tag pages; that separation is the whole point of
   the format. Each entry gets an `id` anchor from its filename with the date
   prefix stripped (`readingSlug`), so a take is linkable as
   `/lists/reading#some-article`.
   The three `reading-summary-week-*.md` files in `src/contents/` are the old
   week-batched version of this, still shipping as posts; they're meant to be
   retired over time.
5. **JSON data** — `src/data/food-log.json`, `src/pages/menu/_menus.json`,
   imported directly by their pages (`_`-prefixed files are not routed by Astro).

### Routing

`src/pages/` file routing, all static (`getStaticPaths`). `/articles/[slug]` exists
only as a meta-refresh redirect to `/posts/[slug]` for legacy URLs — keep it in sync
if post slugging changes. `rss.xml.ts` must export **`GET`** (uppercase); Astro
silently emits no file for a lowercase `get`.

### Styling

Tailwind with a `skin` token layer (`text-skin-*`, `bg-skin-*`, `border-skin-*`,
`fill-skin-*`) mapped to CSS variables in `src/styles/base.css`. Dark mode is the
`.theme-dark` class on `<html>`, **not** Tailwind's `dark:` variant. See `AGENTS.md`
before touching colors.

### Imports

`tsconfig.json` maps `@*` → `./src/*`, so `@components/...`, `@utils/...`,
`@layouts/...` all work, and `src/config` / `src/types` are imported bare. Both
styles appear in the codebase; match whatever the file you're editing already uses.
