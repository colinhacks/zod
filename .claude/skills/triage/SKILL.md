---
name: triage
description: Investigate a GitHub issue or pull request in colinhacks/zod and write up a durable verdict. Use whenever asked to triage, investigate, review, evaluate, or form an opinion on an issue or PR (by number, URL, or "the open PR queue"), and when sweeping many of them in bulk. Covers where write-ups live on disk (.triage/issues/NNNN/, .triage/prs/NNNN/), the cheap-disqualifier pass that avoids spinning up a worktree for stale PRs, the worktree checkout procedure for PRs, and the results.md format that keeps a 250-PR sweep greppable and resumable.
---

# Investigating issues and PRs

Produce a write-up a maintainer can act on without re-reading the thread. The deliverable is always a file on disk, never just a chat message — sweeps span many sessions and agents, so anything living only in a transcript is lost.

**Read-only on GitHub.** Never comment, label, assign, close, review, approve, or merge unless the user explicitly asks in this session. You are forming an opinion, not publishing one.

## Where things live

Everything goes under `.triage/` in the **root repo**, which is gitignored — write freely, it never shows up in `git status`.

```
.triage/
  index.md               # the original issue sweep index — hand-maintained prose, still the canonical issue queue
  issues/index.md        # generated from frontmatter by reindex.mjs
  issues/<N>/results.md  # the write-up; scratch files live beside it
  prs/index.md           # generated
  prs/<N>/results.md
```

One directory per ticket, named by bare GitHub number (no leading zeros, no `issue-`/`pr-` prefix). `results.md` is the write-up. Everything else you need — repro scripts, a saved `gh pr diff`, test fixtures, benchmark output, notes — goes in that same directory. Name scratch files descriptively (`repro.ts`, `diff.patch`, `bench-before.txt`); there is no naming rule beyond not colliding with `results.md`.

For an issue repro, `pnpm dev .triage/issues/<N>/repro.ts` from the root repo works directly.

A repro must sit **inside** the checkout it is testing, because module resolution walks up from the file, not from the cwd — a script under `.triage/` cannot resolve `zod` from a PR worktree. Keep the canonical copy in the ticket directory and copy it in to run: `cp .triage/prs/<N>/repro.ts <worktree>/repro-<N>.ts`. That is also what lets you run the identical file against both `main` and the PR and diff the output, which is the cheapest way to characterize a behavior change. For a probe needing GC or other flags, skip `pnpm dev` and invoke node directly: `node --expose-gc --conditions=@zod/source --import tsx repro-<N>.ts`.

### Writing to the root repo from a PR worktree

This is the one mistake that silently destroys work. A worktree has its **own** gitignored `.triage/`, so a relative write from inside it lands somewhere nobody will ever look.

Resolve the root once and always write through it:

```bash
ZOD_ROOT=$(git worktree list | head -1 | awk '{print $1}')   # correct from inside any worktree
mkdir -p "$ZOD_ROOT/.triage/prs/<N>"
```

Every path you write must start with `$ZOD_ROOT`. Investigate in the worktree, record in the root.

## results.md format

Open with YAML frontmatter. It is what makes a 250-PR sweep aggregatable and resumable — an interrupted sweep is resumed by grepping `status`, never by re-reading write-ups.

```yaml
---
number: 5928
type: pr                    # pr | issue
status: done                # in-progress | done
verdict: merge-with-changes
title: "fix: preserve brand through .optional()"
author: someuser
url: https://github.com/colinhacks/zod/pull/5928
investigated: 2026-08-08
---
```

`verdict` for **PRs** — one of:

- `merge-as-is` — correct, tested, in scope. Say so plainly.
- `merge-with-changes` — right idea, needs specific edits. Enumerate them concretely enough to apply.
- `needs-author-changes` — blocked on something only the author can supply (repro, rebase, scope cut).
- `decline` — out of scope or wrong approach. Give the one or two strongest reasons, plus the escape hatch users actually have.
- `superseded` — already fixed on `main` or landed via another PR. Name the commit or PR.
- `needs-maintainer-decision` — the code is fine; the call is a product/API judgment that is Colin's to make. State the tradeoff and your recommendation.

`verdict` for **issues** — reuse the vocabulary already established in `.triage/index.md`: `good-idea`, `already-fixed`, `needs-maintainer-input`, `not-recommended`, `needs-more-reproduction`, `duplicate` (add a `duplicate_of: NNNN` key alongside it).

Set `status: in-progress` in a stub the moment you start, so a parallel agent or a later session does not duplicate the work. Flip to `done` only when the write-up stands on its own.

After the frontmatter, write prose under these headings. Match the density of the existing issue write-ups in `.triage/issues/*/results.md` — they are the house style; skim one before your first write-up.

- `## Request` / `## Change` — what is actually being asked or changed, in your own words. Include the thread's evolution when maintainers or the author already moved the discussion.
- `## Current state` — what the code on `main` does **today**, with `file.ts:line` references. Most old tickets were filed against v3 or early v4 and are stale on arrival; this section is usually where the verdict comes from.
- `## Analysis` — correctness, edge cases, type-level implications, perf, and whether the tests actually cover the claim.
- `## Recommendation` — the action to take, and the substance of the reply to post. Do not draft it in maintainer voice unless asked; AGENTS.md owns that tone if you are asked to post.

## Investigating an issue

No worktree — read the code on `main`.

1. `gh issue view <N> -R colinhacks/zod --comments` and read the whole thread, including maintainer replies. A prior decision from Colin usually settles it.
2. Check for duplicates and prior art: `gh search issues --repo colinhacks/zod '<keywords>'`, and grep `.triage/issues/*/results.md` — the sweep may already cover it. Cross-link with a relative `../NNNN/results.md`.
3. Reproduce against current source before believing the report. Write the repro to `.triage/issues/<N>/repro.ts` and run `pnpm dev` on it. A large share of open issues are already fixed.
4. Brainstorm before concluding. Consider the fix, its blast radius, whether it belongs in core at all, and what userland escape hatch already exists.
5. Write `results.md`.

## Investigating a PR

Cheap pass first — most of a 250-PR backlog is resolved without ever checking out code.

```bash
gh pr view <N> -R colinhacks/zod --json number,title,author,state,isDraft,mergeable,mergeStateStatus,baseRefName,headRefName,headRepositoryOwner,maintainerCanModify,createdAt,updatedAt,additions,deletions,changedFiles,labels,comments
gh pr diff <N> -R colinhacks/zod
```

Disqualify early and write the write-up straight from this, no worktree, when the diff is small and self-evident, or when the PR targets v3 / duplicates a landed change / is already superseded by `main` / is abandoned with unresolved conflicts. Verify `superseded` against actual code on `main` — do not infer it from dates.

Otherwise check it out (this repo's convention, per AGENTS.md):

```bash
git fetch origin pull/<N>/head:pr-<N>
git worktree add ~/.cursor/worktrees/zod/pr-<N> pr-<N>
cd ~/.cursor/worktrees/zod/pr-<N>
pnpm install --frozen-lockfile      # fast, the pnpm store is shared
```

Do **not** use `gh pr checkout --detach` — it detaches your current working tree instead of creating a worktree.

Then, in the worktree:

1. Read the diff in full context, not just the hunks. What did it touch that the author did not think about?
2. `git log --oneline main..HEAD` — is this rebased on anything current, or written against a version of the code that has since moved?
3. Run the tests the change implicates: `pnpm vitest run <path>`. Run the full suite only when the change is broad.
4. Judge test coverage against the repo's own bar: a feature or bug fix without a test is incomplete, and tests must be TypeScript.
5. Probe the edge cases the author's tests skip — write them into `$ZOD_ROOT/.triage/prs/<N>/` and run them. A passing suite over a shallow test is not evidence.
6. Write `$ZOD_ROOT/.triage/prs/<N>/results.md`.

**Clean up when done**, or worktrees accumulate across a large sweep:

```bash
cd "$ZOD_ROOT"
git worktree remove ~/.cursor/worktrees/zod/pr-<N> && git branch -D pr-<N>
```

Keep the worktree only when the verdict is `merge-with-changes` and you have been asked to push the changes; AGENTS.md covers pushing back to a contributor's fork, including preserving their commits.

## Sweeping in bulk

Seed the queue, then work it:

```bash
gh pr list -R colinhacks/zod --state open --limit 400 --json number,title,updatedAt
```

Resume by asking disk, not memory:

```bash
grep -l 'status: done' .triage/prs/*/results.md | wc -l                    # progress
grep -h '^verdict:' .triage/prs/*/results.md | sort | uniq -c              # verdict spread
node .claude/skills/triage/scripts/reindex.mjs prs                   # regenerate .triage/prs/index.md
```

`reindex.mjs` rebuilds an index table from frontmatter, so the index is derived and never hand-edited for PRs. Pass `issues` or `prs`.

When parallelizing across sub-agents, give each agent a disjoint set of numbers and have each write only its own ticket directories. Never have two agents share a results file.
