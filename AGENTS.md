## Commands

- Use `bun`, never `node` or `npx`.

## Constraints

- Optimize aggressively for load performance, runtime performance in hot paths, and bundle size.
- Lint is advisory. Ignore where code is genuinely better for performance or correctness.
- After changing `src/` run `bun run build` before `bun test`; tests read `dist/`.
- Use `$$`-prefixed internal APIs; production mangles those properties.
