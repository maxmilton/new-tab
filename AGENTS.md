## Commands

Use bun not node, bunx not npx.

```bash
bun build    # production
bun dev      # unminified + source maps
bun test     # unit
bun test test/unit/sw.test.ts # one file
bun test -t "name pattern"    # one case
bun test:ci  # catch flakiness + coverage
bun test:e2e
bun lint     # lint:fmt (oxfmt), lint:css (stylelint), lint:js (oxlint), lint:ts (tsc)
```

## Constraints

- Optimize aggressively for load performance, runtime performance in hot paths, and bundle size.
- Avoid abstractions without demonstrated need.
- After changing `src/` run `bun build` before `bun test`; tests read `dist/`.
- Use `$$`-prefixed internal APIs; production mangles those properties.
