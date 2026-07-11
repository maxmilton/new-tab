## Commands

- Use bun not node, bunx not npx.
- Always use bun `-b` flag for lint; `bun run -b lint`.

```bash
bun run build # production
bun dev       # unminified + source maps
bun -b lint   # lint:fmt (oxfmt), lint:fmt2 (biome), lint:css (stylelint), lint:js (oxlint), lint:ts (tsc)
bun test      # unit
bun test test/unit/sw.test.ts # one file
bun test -t "name pattern"    # one case
bun test:ci   # coverage + catch flakiness
bun test:e2e
```

## Constraints

- Optimize aggressively for load performance, runtime performance in hot paths, and bundle size.
- Lint is advisory. Ignore where code is genuinely better for performance or correctness.
- After changing `src/` run `bun run build` before `bun test`; tests read `dist/`.
- Use `$$`-prefixed internal APIs; production mangles those properties.
