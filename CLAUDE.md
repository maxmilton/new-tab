# CLAUDE.md

## Commands

Use bun, not node. Use bunx, not npx.

`bun run build` MUST be run after touching `manifest.config.ts`/`src/` or before `bun test` — some test files read from `dist/` and give stale results otherwise.

```bash
bun run build    # Build for production
bun run dev      # Build for dev (unminified, with source maps)
bun test         # Run unit tests
bun run test:ci  # Run all unit tests with coverage
bun test test/unit/utils.test.ts # Run a single test file
bun run test:e2e # Run e2e tests
bun run lint     # Lint everything

# Individual lint steps
bun run lint:fmt # biome formatting
bun run lint:css # stylelint
bun run lint:js  # oxlint
bun run lint:js2 # eslint
bun run lint:ts  # tsc type check
```

## Architecture

Chrome extension (Manifest V3) replacing the new tab page. Built with [bun](https://bun.sh) and
[stage1](https://github.com/maxmilton/stage1), a micro UI framework compiling HTML templates to raw
DOM ops at build time via `stage1/macro`.

### Entry points and pages

- **`src/newtab.ts`** — new tab page. Imports `theme.ts` first (must run before all else to avoid FOUC), then constructs `Search`, `BookmarkBar`, `Menu` and mounts to `document.body`.
- **`src/settings.ts`** — settings/options page. Single `Settings` component: theme selection, section order drag-and-drop, experimental sync.
- **`src/sw.ts`** — service worker. Install/update events preload active theme into `chrome.storage.local`; startup events pull settings sync.

### Build system

`build.ts`:
1. Clears `dist/`, copies `static/`.
2. Compiles CSS via `lightningcss` (nesting, vendor prefixes for Chrome 150+).
3. Compiles `src/themes/*.css` into single `dist/themes.json` keyed by theme name.
4. Bundles TypeScript via `bun build` (two passes: apps, service worker).
5. Production: post-processes JS with `terser` (mangles `$$`-prefixed properties, strips `performance.mark/measure`).

Theme CSS stored as raw strings in `themes.json` and `chrome.storage.local` (key `t`) so the service worker preloads the correct theme before page render.

### Component pattern (stage1)

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

`$$`-prefixed properties (e.g. `$$update`, `$$filter`) are public component APIs, mangled by terser in production. `ONCLICK` from stage1 is a Symbol used as a synthetic delegated click handler property.

### Storage schema

`UserStorageData` in `src/types.ts` — persisted in `chrome.storage.local`:
- `t` — raw CSS of active theme (preloaded by service worker)
- `n` — theme name string
- `b` — `true` when bookmarks bar hidden
- `o` — section order array
- `s` — sync enabled boolean

### Path aliases

`#*` → `./src/*` (in `package.json` `imports` and `tsconfig.json` `paths`). Use `#types.ts`, `#utils.ts` etc. for cross-component imports.

### Test setup

Bun test runner + happy-dom. `test/setup.ts` preloads before every test file — sets up chrome API mock, resets DOM state. Call `reset()` from `test/setup.ts` between describes when mutating global state. `@maxmilton/test-utils` provides custom matchers and DOM utilities.

### Performance constraints

Aggressively optimised for load and runtime performance:
- Avoid DOM reconciliation — components delete and re-insert entire lists (see `SearchResult.ts`).
- `performance.mark/measure` stripped in production by terser.
- `Link` accesses DOM children by position (not `collect`) to reduce overhead — renders in tight loops.
- `BookmarkBar` uses sequential layout measurement for overflow detection — synchronous and layout-triggering by design.
- Prefer returning `false` from click handlers over `event.preventDefault()` to save bytes.
