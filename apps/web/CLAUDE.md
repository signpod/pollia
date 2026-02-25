# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server (Turbopack, port 3000)
yarn build        # Production build
yarn lint         # Biome linter (error-level)
yarn check-types  # TypeScript type check
yarn test         # Jest (run all tests)
yarn test --testPathPattern="surveyService" # Run single test file

# Database
yarn db:generate  # Regenerate Prisma Client after schema changes
yarn db:push      # Apply schema to dev DB (no migration file)
yarn db:migrate   # Create migration file (production-bound changes)
yarn db:studio    # Open Prisma Studio
```

After any Prisma schema change, always run `db:generate`. Use `db:push` during development; commit `db:migrate` output for production.

## Architecture

**3-Layer Server Architecture** (unidirectional: Action → Service → Repository):

```
src/actions/            "use server" functions — auth, error handling, DTO wrapping
src/server/services/    Business logic — validation, error.cause throw
src/server/repositories/ Prisma queries only — no logic, returns null on miss
```

Full conventions are in `/.claude/rules/07-server-layers.md`.

### Repository Layer

- Class-based, Singleton export (`export const xxxRepository = new XxxRepository()`)
- Methods: `find*`, `create*`, `update*`, `delete*`, `exists`, `count`
- Use Prisma types directly: `Prisma.XxxUncheckedCreateInput`
- No error handling — return `null` for not found
- Transactions: accept `client: Prisma.TransactionClient = prisma` as a default parameter; services own transaction boundaries

### Service Layer

- Class-based, Constructor Injection for testability, Singleton export
- Methods: `get*`, `create*`, `update*`, `delete*`, `toggle*`
- Error pattern: `const error = new Error("한국어 메시지"); error.cause = 404; throw error;`
- Types: `Pick<Prisma.XxxUncheckedCreateInput, ...>` in `types.ts`, or import Zod schema types directly if no extra fields needed
- Never use try-catch — only throw

### Server Action Layer

```typescript
"use server";
export async function createFoo(request: CreateFooRequest): Promise<CreateFooResponse> {
  try {
    const user = await requireAuth();
    const result = await fooService.createFoo(request, user.id);
    return { data: result };
  } catch (error) {
    console.error("foo 생성 실패:", error);
    if (error instanceof Error && error.cause) throw error;
    const e = new Error("foo 생성 중 오류가 발생했습니다.");
    e.cause = 500;
    throw e;
  }
}
```

Action files are organized as `src/actions/{domain}/create.ts | read.ts | update.ts | delete.ts`.

## Schemas (Zod)

Full conventions in `/.claude/rules/08-schemas.md`.

- `{domain}InputSchema` — shared client/server; contains only user-provided fields
- `{domain}UpdateSchema` — partial version with `.refine()` ensuring ≥1 field
- `{domain}ServerSchema` — extends input with server-decided fields (role, creatorId)
- Mirror `src/schemas/` structure to `src/server/services/`
- Error messages must be Korean and user-friendly

## Hooks (TanStack Query)

Full conventions in `/.claude/rules/06-hooks-tanstack-query.md`.

- Query hooks: `staleTime` + `refetchInterval` required; `queryKey` from `src/constants/queryKeys/`
- Mutation hooks: `"use client"` directive; accept `Options` interface with `onSuccess?`/`onError?`
- Export `ReturnType`: `export type UseXxxReturn = ReturnType<typeof useXxx>`
- All mutation handler names: `handle{Action}` (e.g., `handleLike`)

## Prisma Schema

Full conventions in `/.claude/rules/05-prisma-schema.md`.

- `prisma/schema.prisma` — datasource + generator only
- All models in `prisma/models/` as flat files: `{domain}.{entity}.prisma` or `{domain}.prisma`
- No subdirectories (VSCode Language Server limitation)
- Field order: ID → business fields → status fields → foreign keys → relations → timestamps → indexes
- Enums co-located with their model file
- DB column names use `@map("snake_case")`

## DTOs

```
src/types/dto/{domain}/
  requests.ts   # type CreateFooRequest = FooInput  (from Zod schema)
  responses.ts  # interface GetFooResponse { data: Foo }  (from Prisma type)
  index.ts      # re-exports both
```

## File Naming

| Layer | Pattern |
|-------|---------|
| Repository | `{domain}Repository.ts` |
| Service | `{domain}Service.ts` |
| Action files | `create.ts`, `read.ts`, `update.ts`, `delete.ts` |
| Schema | `{domain}Schema.ts` |
| Hook | `use{Verb}{Domain}.ts` |
| Component | `ComponentName.tsx` (PascalCase) |
| Query keys | `{domain}QueryKeys.ts` |

## Testing

- **Only test the Service layer.** Repositories and Actions are excluded.
- Mock via constructor injection: `service = new FooService(mockRepo)`
- Use `jest.Mocked<FooRepository>` for the mock type
- Verify `error.cause` in error case tests
- Split into `__tests__/` directory when a test file exceeds ~500 lines

## Key Paths

```
src/actions/common/auth.ts   requireAuth(), requireActiveUser()
src/constants/routes.ts      All app routes
src/lib/                     Shared utilities (date, auth, crypto, etc.)
src/atoms/                   Jotai atoms for client state
```

## Environment

- `DATABASE_URL` must include `?pgbouncer=true` (Supabase Pooler port 6543) to prevent Postgres 42P05 error
- `DIRECT_URL` for direct connection used in migrations
