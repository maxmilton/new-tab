# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repo.

## Commands

Use bun for all commands & dev, not node. Use bunx, not npx.

`bun run build` must be run (or re-run after touching `manifest.config.ts`/`src/`) before `bun test` —
several test files (`manifest.test.ts`, `newtab.test.ts`, `settings.test.ts`, `theme.test.ts`,
`index.test.ts`) read directly from `dist/` and will show stale or misleading failures otherwise.

```bash
# Build for production
bun run build

# Build for development (unminified, with source maps)
bun run dev

# Run unit tests (only failures by default)
bun test

# Run all unit tests with coverage
bun run test:ci

# Run a single test file
bun test test/unit/utils.test.ts

# Run e2e tests
bun run test:e2e

# Lint everything
bun run lint

# Individual lint steps
bun run lint:fmt    # biome formatting
bun run lint:css    # stylelint
bun run lint:js     # oxlint
bun run lint:js2    # eslint
bun run lint:ts     # tsc type check
```

## Architecture

Chrome extension (Manifest V3), replaces new tab page. Built with [bun](https://bun.sh) and [stage1](https://github.com/maxmilton/stage1), micro UI framework that compiles HTML templates to raw DOM ops at build time via `stage1/macro`.

### Entry points and pages

- **`src/newtab.ts`** — new tab page. Imports `theme.ts` first (must run before else to avoid FOUC), then constructs `Search`, `BookmarkBar`, `Menu` and mounts to `document.body`.
- **`src/settings.ts`** — settings/options page. Single `Settings` component with theme selection, section order drag-and-drop, experimental sync.
- **`src/sw.ts`** — service worker. Handles install/update events to preload active theme into `chrome.storage.local`, startup events for settings sync pull.

### Build system

`build.ts` orchestrates:
1. Clears `dist/`, copies `static/` assets.
2. Compiles CSS via `lightningcss` (nesting, vendor prefixes for Chrome 149+).
3. Compiles all `src/themes/*.css` into single `dist/themes.json` keyed by theme name.
4. Bundles TypeScript via `bun build` (two passes: apps and service worker).
5. Production: post-processes JS with `terser` (mangles `$$`-prefixed properties, strips `performance.mark/measure` calls).

Theme CSS stored as raw strings in `themes.json` and `chrome.storage.local` (key `t`) so service worker preloads correct theme before page renders.

### Component pattern (stage1)

Components follow strict pattern enforced by stage1:

```ts
import { clone, collect, h } from "stage1/fast";
import { compile } from "stage1/macro" with { type: "macro" };

// compile() runs at build time — produces { html, d, ref } metadata
const meta = compile<Refs>(`<div><span @myRef>text</span></div>`);
// h() converts the compiled HTML string to a live DOM node (singleton template)
const view = h<ComponentType>(meta.html);

export const MyComponent = (): ComponentType => {
  const root = clone(view);               // clone template for each instance
  const refs = collect<Refs>(root, meta.d); // collect @-ref nodes
  const myRef = refs[meta.ref.myRef];     // typed DOM node access
  // ...
  return root;
};
```

`$$`-prefixed properties (e.g. `$$update`, `$$filter`) are public component APIs. Terser mangles these in production. `ONCLICK` from stage1 is Symbol used as synthetic delegated click handler property.

### Storage schema

`UserStorageData` in `src/types.ts` defines what persists in `chrome.storage.local`:
- `t` — raw CSS of active theme (preloaded by service worker)
- `n` — theme name string
- `b` — `true` when bookmarks bar hidden
- `o` — section order array
- `s` — sync enabled boolean

### Path aliases

`#*` resolves to `./src/*` (configured in `package.json` `imports` and `tsconfig.json` `paths`). Use `#types.ts`, `#utils.ts` etc. for cross-component imports.

### Test setup

Unit tests use bun's test runner with happy-dom for DOM environment. `test/setup.ts` preloads before every test file — sets up chrome API mock, resets DOM state. Call `reset()` from `test/setup.ts` between describes when mutating global state. `@maxmilton/test-utils` provides custom matchers and DOM utilities.

### Performance constraints

Aggressively optimised for load time and runtime performance:
- Avoid DOM reconciliation — components delete and re-insert entire lists (see `SearchResult.ts`).
- `performance.mark/measure` calls stripped in production builds by terser.
- `Link` component accesses DOM children by position (not `collect`) to reduce overhead — renders in tight loops.
- `BookmarkBar` uses sequential layout measurement for overflow detection — inherently synchronous and layout-triggering by design.
- Return `false` from click handlers preferred over `event.preventDefault()` to save bytes.
