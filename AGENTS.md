# Foyer Agent Notes

## Workspace Layout
- `apps/*` — React + Vite + TanStack Router web applications
- `services/*` — Backend services using Effect framework
- `packages/*` — Shared packages and configuration

## Conventions
- **Package manager**: bun@1.3.9
- **Formatter/Linter**: Biome (config from belfort)
- **Task runner**: Turbo
- **Backend framework**: Effect
- **Frontend**: React 19 + Vite 7 + TanStack Router + Tailwind CSS 4
- **Executor SDK**: All `@executor-js/*` packages pinned to `0.0.1` (enforced by `scripts/check-executor-pins.ts`)
- **No destructuring**: Use `obj.property` instead of `const { property } = obj`
- **No fake fallbacks**: Throw errors on failure paths
- **Functional style**: Avoid global side effects
