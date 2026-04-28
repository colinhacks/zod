# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The project uses pnpm workspaces. Key commands:

- `pnpm build` - Build all packages (runs recursive build command)
- `pnpm vitest run` - Run all tests with Vitest
- `pnpm vitest run <path>` - Run specific test file (e.g., `packages/zod/src/v4/classic/tests/string.test.ts`)
- `pnpm vitest run <path> -t "<pattern>"` - Run specific test(s) within a file (e.g., `-t "MAC"`)
- `pnpm vitest run --update` - Update all test snapshots
- `pnpm vitest run <path> --update` - Update snapshots for specific test file
- `pnpm test:watch` - Run tests in watch mode
- `pnpm vitest run --coverage` - Run tests with coverage report
- `pnpm dev` - Execute code with tsx under source conditions
- `pnpm dev <file>` - Execute `<file>` with tsx & proper resolution conditions. Usually use for `play.ts`.
- `pnpm dev:play` - Quick alias to run play.ts for experimentation
- `pnpm lint` - Run biome linter with auto-fix
- `pnpm format` - Format code with biome
- `pnpm fix` - Run both format and lint

## Rules

- Node.js v24+ required (use nvm if needed); pnpm v10.12.1
- ES modules are used throughout (`"type": "module"`)
- All tests must be written in TypeScript - never use JavaScript
- Use `play.ts` for quick experimentation; use proper tests for all permanent test cases
- Features without tests are incomplete - every new feature or bug fix needs test coverage
- Don't skip tests due to type issues - fix the types instead
- Test both success and failure cases with edge cases
- No log statements (`console.log`, `debugger`) in tests or production code
- Ask before generating new files
- Use `util.defineLazy()` for computed properties to avoid circular dependencies
- Performance is critical - parameter reassignment is allowed for optimization
- ALWAYS use the `gh` CLI to fetch GitHub information (issues, PRs, etc.) instead of relying on web search or assumptions
- Keep JSDoc as minimal as possible. A self-explanatory type or symbol name needs no doc comment. When a comment is genuinely required, write one short sentence describing behavior — not history, rationale, or examples. Don't add interface-level JSDoc that just restates the interface name.
- When you've modified a PR (or opened/closed/commented on one), include the PR URL liberally in summary messages — at minimum once at the end of any reply that touched it

## Iterating on a contributor PR in a worktree

When asked to make changes on top of an open PR (e.g. as a maintainer review suggestion), use a worktree so `main` stays clean:

```bash
# 1. Fetch the PR as a local branch and create a worktree for it
git fetch origin pull/<N>/head:pr-<N>
git worktree add ~/.cursor/worktrees/zod/pr-<N> pr-<N>
cd ~/.cursor/worktrees/zod/pr-<N>
pnpm install --frozen-lockfile   # fast, pnpm store is shared across worktrees

# 2. Look up the PR's head info — you'll need the contributor's fork URL
#    and the head ref name to push back.
gh pr view <N> --repo colinhacks/zod \
  --json headRefName,headRepositoryOwner,maintainerCanModify

# 3. If maintainerCanModify is true, add the fork as a remote and push to
#    the PR's head ref (NOT to your local branch name).
git remote add <contributor> git@github.com:<contributor>/zod.git
git push <contributor> pr-<N>:<headRefName>                 # first push
git push <contributor> pr-<N>:<headRefName> --force-with-lease   # for amends
```

Notes:
- Do NOT use `gh pr checkout --detach` for this — it moves your *current* working tree into detached HEAD instead of creating a worktree.
- Husky pre-commit runs biome format/lint via lint-staged; pre-push runs the full vitest suite. Both are fast and act as a safety net — don't bypass with `--no-verify` unless you have a specific reason.
- When done, clean up: `git worktree remove ~/.cursor/worktrees/zod/pr-<N>` and `git branch -D pr-<N>` (and optionally `git remote remove <contributor>`).
