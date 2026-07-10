# SPEC

## §G GOAL
Chrome MV3 ext replaces new tab page ∴ fast unified search across open tabs, bookmarks, history, top sites, recently closed tabs + bookmarks bar + themeable settings page.

## §C CONSTRAINTS
- bun for all build/test/dev cmds, bunx ! npx (⊥ node/npm directly)
- stage1 micro framework: HTML templates compiled to raw DOM ops @ build time via `stage1/macro`
- Manifest V3, min Chrome 149 — buffer above actual feature floor (CSS Anchor Positioning needs 125+, §R1) since release ships well after today (`manifest.config.ts` + `build.ts` lightningcss targets locked together)
- perf-first: ⊥ DOM reconciliation in hot paths (`SearchResult` deletes+reinserts full list); `BookmarkBar` sync layout measurement by design (! synchronous, ! layout-triggering)
- prod build: terser mangles `$$`-prefixed props, strips `performance.mark/measure` calls
- TS strict; path alias `#*` → `./src/*`
- click handlers return `false` over `event.preventDefault()` (fewer bytes)
- `src/theme.ts` ! import first in `newtab.ts` (avoid FOUC)
- theme CSS stored raw in `dist/themes.json` & `chrome.storage.local` key `t` ∴ sw preloads theme before page render
- settings sync (`chrome.storage.sync`) ⊥ experimental — committed stable feature; quotas confirmed sufficient (§R3)
- theme color customisation reuses existing CSS custom-property mechanism (per-theme `:root` vars); ⊥ new structured per-token storage — overrides baked into resolved CSS string before written to `t` (same schema as today, `sw.ts`/`theme.ts` untouched)
- color overrides ⊥ persist across base-preset switch — picking different preset discards current overrides
- presets ? define non-color themeable things (fonts, etc.) — those stay preset-only, ⊥ user-adjustable
- power tier (import/export raw theme CSS as string) ⊥ in scope this cycle — backburner
- theme var redesign ! rename/restructure existing 6 vars (`--s`/`--b`/`--t`/`--c1-3`) for clearer user-facing semantics
- theme var redesign goal: derive full palette from minimal seed-color inputs (few user-facing customisation points, richer output) — direction locked, derivation *mechanism* ? undecided (see §T10)

## §I INTERFACES
- entry `src/newtab.ts` → new tab override page, mounts Search + BookmarkBar (unless `storage.b`) + Menu
- entry `src/settings.ts` → options page (`options_ui`, opens in dedicated full tab per V10), theme select, bookmarks-bar toggle, section drag-reorder, sync
- entry `src/sw.ts` → background service_worker; on install preload theme+migrate old storage keys; on startup pull sync data
- storage `UserStorageData` (chrome.storage.local): `t` theme CSS, `n` theme name, `b` hide-bookmarks-bar flag, `o` section order array, `s` sync-enabled flag
- storage `SyncStorageData` (chrome.storage.sync): `data` (UserStorageData minus t,s), `ts` last-sync timestamp
- build outputs (`dist/`): `manifest.json`, `newtab.css`, `settings.css`, `themes.json` (CSS per theme keyed by filename), bundled `newtab.js`/`settings.js`/`sw.js`
- permissions: bookmarks, favicon, history, sessions, storage, tabs, topSites
- CSP: `default-src 'none'; base-uri 'none'; script-src 'self'; style-src 'self'; img-src 'self'`
- themes dir `src/themes/*.css` → 13 files incl. `auto`,`light`,`dark`,`black`,4×catppuccin,3×hacker-*,`neon-dreams`,`tilde-club`
- component public API convention: `$$`-prefixed methods (`$$update`, `$$filter`, `$$closePopup`, `$$adjustPosition`)
- `DEFAULT_SECTION_ORDER` (src/utils.ts): `["Open Tabs","Bookmarks","History","Top Sites","Recently Closed Tabs"]`, index-order significant (referenced positionally elsewhere)

## §R RESEARCH
id|topic|finding|src
R1|anchor-pos & popover API support|CSS Anchor Positioning native Chrome 125+; Popover API native Chrome 114+; both ≤ manifest min_chrome_version 149 ∴ T2 (BookmarkNode popup rewrite) safe to build now w/ no polyfill|caniuse.com/css-anchor-positioning, caniuse.com/mdn-api_htmlelement_popover
R2|Bun.build native CSS bundling|Bun core bundler ⊥ configurable browser-targets/browserslist for CSS; only 3rd-party plugin (bun-style-loader) adds that & it just wraps lightningcss anyway ∴ T8 (build.ts TODO) stays open, direct lightningcss call still required|bun.sh/docs/bundler
R3|chrome.storage.sync quotas|QUOTA_BYTES=102400B total, QUOTA_BYTES_PER_ITEM=8192B, MAX_ITEMS=512, MAX_WRITE_OPERATIONS_PER_HOUR=1800 (per-minute cap deprecated ⊥ enforced) ∴ current UserStorageData (minus t,s) well under limits, sync feature viable to ship as-is|developer.chrome.com/docs/extensions/reference/api/storage
R4|color-mix() browser support|`color-mix()` native unflagged Chrome 111+ (≪ min_chrome 149) ∴ CSS-native derivation technically viable|developer.chrome.com/docs/css-ui/css-color-mix
R5|CSS relative color syntax support|relative color syntax (`oklch(from ...)` etc.) native unflagged Chrome 119+ (≪ min_chrome 149) ∴ CSS-native derivation technically viable|developer.chrome.com/blog/css-relative-color-syntax
R6|prior art: seed-color palette derivation|Material Design 3 (HCT algorithm) & Radix Colors both precompute full palette from seed color (JS/build-time lib), ⊥ runtime CSS math, despite `color-mix()` being framed as CSS-native "best practice" for simple cases per MDN blog ∴ precomputed/JS-baked approach matches this project's existing "theme = static resolved CSS string" constraint (§C) & has production prior art; CSS-native runtime derivation is lighter-weight but less proven at scale|m3.material.io/styles/color/system/how-the-system-works, radix-ui.com/colors/docs/overview/custom-palettes, developer.mozilla.org/en-US/blog/color-palettes-css-color-mix

## §V INVARIANTS
V1: sw.ts install/startup handlers → ⊥ console calls, ⊥ performance.mark/measure calls
V2: sw.ts → fetch() only `themes.json`
V3: `DEFAULT_SECTION_ORDER` len=5, unique entries, `"Open Tabs"` first
V4: `handleClick(event)` takes 1 param; walks target→parent chain, invokes first found `[ONCLICK]` handler only (⊥ multiple handlers fire)
V5: `handleClick` url ∉ starts-with `"h"` (non-http, e.g. chrome://) → ctrl-click ⇒ `chromeTabs.create`, plain click ⇒ `chromeTabs.update`, both return `false` (preventDefault)
V6: `handleClick` url starts `"h"` (http/https) → default ⊥ prevented
V7: `handleClick` no link target & no ONCLICK handler → focuses search input `#s`, ⊥ return false
V8: `createManifest()` output ≡ JSON-safe plain object, ≡ `dist/manifest.json` except `version_name`
V9: manifest has exactly 18 top-level props (see `manifest.config.ts`); `permissions` has exactly 7 entries; `icons` has exactly 3 entries; ⊥ extra/unexpected props
V10: manifest `manifest_version` ≡ 3; `options_ui.open_in_tab` ≡ `true` — settings page opens in dedicated full tab (ahead of settings UI growth: sync UI + theme customiser need more room than the embedded options popup)
V11: `createManifest(isDebug)` → `version_name` defined iff `isDebug` true (arg explicit `true`/`false`, or default `!process.env.CI`)
V12: BookmarkBar resize → insert nodes one-by-one until cumulative width ≥ `root.clientWidth - 68`, overflow items ∴ move into trailing "All Bookmarks"-adjacent overflow folder; "All Bookmarks" folder always last (`.end` class)
V13: `sectionOrder` from `storage.o` (fallback `DEFAULT_SECTION_ORDER`) drives which `SearchResult` sections mount + their DOM order in Search
V14: test files needing fresh module state per test ! cache-bust dynamic `import()` via query string (`?bust=N`); ⊥ rely on undocumented Bun internals (`Loader.registry` — removed, doesn't exist in Bun 1.4.0)
V15: `minimum_chrome_version` ! justified in §C — either ≡ max §R-verified feature-floor, or set higher w/ explicit reasoning (e.g. release lead time) written inline, ⊥ silently ratcheted
V16: `dist/`-dependent tests (`manifest.test.ts`, `newtab.test.ts`, `settings.test.ts`, `theme.test.ts`, `index.test.ts`) require fresh `dist/` — `bun run build` ! run before `bun test` for correct results; documented in CLAUDE.md

## §T TASKS
id|status|task|cites
T1|.|resolve `?` open items below w/ user, confirm inferred goal/constraints|-
T2|.|decide fate of `src/components/BookmarkNode.ts` TODO — rewrite folder-popup positioning via Anchor Positioning API / Popover API|I.BookmarkNode
T3|.|decide fate of `src/components/Search.ts` TODO — single global debounced tabs listener instead of per-newtab-page listeners (perf issue w/ many open new-tab pages)|C.perf-first
T4|.|settings.ts TODO — surface errors in UI (currently swallowed)|I.settings
T5|.|settings.ts TODO — message when user disables all sections|I.settings
T6|.|sw.ts TODO — remove storage-migration code (`tn`→`n`, `rich-dark`→`dark`) once most users updated (v0.24.0)|I.sw
T7|.|decide fate of `test/unit/newtab_EXPERIMENT.test.ts.bak` — disabled happy-dom Browser experiment, currently dead file|-
T8|.|build.ts TODO — replace lightningcss CSS bundling w/ bun native bundler once configurable (targets/include)|C.build
T9|.|settings.ts UI copy — drop "Experimental" heading + qualifiers around Sync Settings section, now committed stable per §C|C.sync,I.settings
T10|.|`/research` color-mix()/relative color syntax support @ Chrome 149 + prior art on minimal-seed theme derivation, to decide CSS-native vs JS-computed mechanism|C.theme-custom
T11|.|redesign CSS var set (naming + seed-derivation mechanism from T10) across 13 theme files|T10,C.theme-custom
T12|.|build color-token override UI in settings (pickers, live re-theme, bake-into-string-on-change)|T11,C.theme-custom

## §B BUGS
id|date|cause|fix
B1|2026-07-10|`sw.test.ts`/`settings.test.ts`/`Search.test.ts` called `Loader.registry.delete(MODULE_PATH)` to bust the module cache between tests — `Loader` is an undocumented Bun internal that no longer exists (Bun 1.4.0), threw `ReferenceError` before each test's `import()`, silently breaking test isolation (12 tests failing, +1 knock-on failure in `newtab.test.ts` from leaked spy state across files)|V14
B2|2026-07-10|initially misread `options_ui.open_in_tab` as an accidental leak of a dev-only toggle & "fixed" it by omitting the value; owner clarified it's a deliberate permanent choice (dedicated full tab, ahead of settings UI growth) — V10 amended to require `true` instead of `⊥ set`, test updated to match|V10

---
? uncertain / needs confirmation (DISTILL mode, flag per FORMAT.md):
- theme var redesign: naming + minimal-seed direction settled; derivation *mechanism* (CSS-native `color-mix()`/relative color syntax vs JS-computed) still open, blocks T11/T12 — next step is `/research` (T10), not a guess
