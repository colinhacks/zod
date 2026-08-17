---
name: security-advisory
description: Triage a draft security advisory in colinhacks/zod — a private vulnerability report from the Security tab, named by GHSA id (GHSA-xxxx-xxxx-xxxx) or reached from "the draft advisories", "the security reports", "the vulnerability queue". Use instead of the `triage` skill whenever the ticket is an advisory rather than a public issue or PR, because the workflow is different: the report is private, the burden of proof is on the reporter, the fix must be LANDED before any comment is drafted, and the publish-or-decline call has its own calculus. Covers reproducing a PoC against main, the schema-vs-input test, deduplicating a cluster of reports into distinct defects, landing the fix first, the publish-vs-decline framework, per-reporter privacy rules that make a GHSA id unlinkable, and the results.md format under .triage/advisories/GHSA-xxxx-xxxx-xxxx/.
---

# Triaging a draft security advisory

Advisories are not issues with a scarier label. Four things differ, and each one changes the order you work in:

- **The report is private**, and private in both directions — see `## Privacy cuts both ways`.
- **The burden of proof is on the reporter.** Most submissions are scanner output or a rediscovery of intended behavior. A plausible writeup is not evidence.
- **The fix lands before the comment exists.** See `## Land the fix first`. This is the rule most often broken and the one that wastes the most of Colin's time.
- **Real defect and publishable vulnerability are different questions.** See `## Publish or decline`.

Everything in the `triage` skill about where files live, `results.md` frontmatter, close-comment voice, and reporting back in chat still applies. This skill replaces only its `## Investigating a draft advisory` section.

**Never accept, publish, decline, or comment on an advisory.** The write-up and the drafted note are the deliverables; the disposition is Colin's. Landing a fix is a code change and follows the repo's normal rules; publishing a CVE is not, and is never yours.

## Reading the queue

```bash
gh api repos/colinhacks/zod/security-advisories --paginate \
  --jq '.[] | select(.state=="triage") | [.ghsa_id, .severity, .summary] | @tsv'
gh api repos/colinhacks/zod/security-advisories/<GHSA-ID> --jq '.description'   # full report + PoC
```

Write-ups go to `.triage/advisories/<GHSA-ID>/results.md`, scratch files beside them. Frontmatter swaps `number:` for `ghsa:` and adds `severity_claimed:` (what the reporter asserted) next to `severity_actual:` (yours, or `none`).

`verdict` is one of `valid`, `not-a-vulnerability`, `already-fixed`, `duplicate` (with `duplicate_of:`), `needs-reporter-info`, `needs-maintainer-decision`. Add `fixed_by:` / `fix_pr:` once a fix lands, and `disposition_recommended:` when you have a publish-or-decline opinion. Keep `verdict` describing the defect and `disposition_recommended` describing what to do about it — do not let a decline quietly rewrite a real finding as `not-a-vulnerability`.

## Order of work

1. **Extract the PoC verbatim** into `.triage/advisories/<GHSA-ID>/poc.ts`. Do not clean it up first — a PoC that only works after you fix it is a finding in itself.
2. **Reproduce against current `main`**: `pnpm dev .triage/advisories/<GHSA-ID>/poc.ts`. If it does not reproduce, say so and check whether it ever did (`git log -S`, or test the version the reporter named).
3. **Decide whether the reproduced behavior is a vulnerability at all.** The recurring question on this repo is whether the attacker controls the **schema** or only the **input**. A schema is application code, so a report needing an attacker-authored schema is usually `not-a-vulnerability`. For prototype reports: is the polluted prototype the returned object's own (contained) or `Object.prototype` itself (real)?
4. **Enumerate reachability yourself; do not inherit the reporter's.** Reporters test the path they found. Grep every call site that can feed attacker data into the sink and build a route table — precondition per route, and whether each needs only input, or a particular schema shape, or cooperating application code. This is where the severity actually gets decided, and it routinely turns up both routes the reporter missed and routes that are already closed.
5. **Dedupe the cluster.** Many reports describe one defect. `grep -rl '<keyword>' .triage/advisories/*/results.md`, pick a canonical, cross-link the rest with `duplicate_of`. Fold by underlying defect, never by title keyword.
6. **Check for public prior art** — an open issue or PR describing the same bug without the security framing. If one exists the defect is already public, which kills the embargo and changes the disposition.
7. **Land the fix** — see below.
8. **Then** write `results.md` and draft the reporter note.

## Land the fix first

A close comment's entire value is the line that says where it was fixed. Draft one before a fix exists and you have written a decline, whatever it says — the reporter gets no commit to verify, no release to wait for, and no reason to believe the report was acted on. Colin then has to do the work you were asked to do before he can send anything.

So the fix is not a follow-up to the triage. It is a step inside it, and it comes before any comment is drafted:

- **Search for existing PRs before writing one.** Popular defects attract near-duplicate community PRs — this repo had seven for a single formatter bug. Read every diff, rank them, and take the best as a base rather than opening an eighth.
- **Judge the candidates against the whole defect, not the reported symptom.** A patch that fixes the one function in the PoC while three sibling call sites keep the bug is partial. Build a behavior matrix of the cases that matter, run it against `main` and against each candidate patch, and let that table pick the winner. This is also how you catch a patch that trades a crash for silent data loss.
- **Extend the base rather than starting over**, and preserve the contributor's commits — AGENTS.md covers pushing to a contributor's head ref.
- **Run what CI runs** before pushing, then confirm CI itself is green.
- **Do not bump a version and do not cut a release.** Landing on `main` is the goal. Release timing on a security fix is Colin's, and on this repo a version bump is the one irreversible action.

Only once the fix is merged do you write the comment, and the comment names the merge commit and the PR.

If the fix cannot land — the right change is a breaking one, or the affected major is EOL — say so explicitly in `results.md` and draft the comment around what the reporter's actual remedy is. That is a real outcome, not a skipped step.

## Privacy cuts both ways

The report body may contain an unpatched exploit, so it never goes into a public issue, PR, or commit message. A fix can land publicly while the advisory stays private — describe the defect neutrally in the commit and let the mechanism speak for itself.

The direction that gets missed: **each reporter can see only their own advisory thread.** A GHSA id in a comment is a dead link to everyone but the maintainers. A duplicate close must never say "duplicate of GHSA-xxxx" or "see the reasoning on that thread" — the reporter can open neither. Every comment stands alone: state the reasoning inline, and refer to a sibling report as "a separate report of the same defect", without the id and without the other reporter's name. Public issues, PRs and commit SHAs are the only cross-references a reporter can follow. The `duplicate_of` link belongs in `results.md`, which is for Colin.

## Publish or decline

A defect can be real and still not be worth a published GHSA. Answer these before recommending either way:

- **Does the attacker control the value, or only the key?** A write the attacker cannot choose the value of — a fixed object, a truthiness flip — needs a second-order sink in the victim's own code before it does anything. That sink is the application's bug, not the library's.
- **What actually happens at the boundary?** Test the near-miss cases rather than assuming. A gadget that throws on the interesting inputs and only pollutes on the boring ones is much weaker than the report claims.
- **Is the supported major reachable without cooperating application code?** If the current version needs an unusual schema shape or an app that derives paths from user input, an advisory naming it overstates the exposure.
- **Is there a patch to point at?** An advisory against an EOL major with no patch turns every install red in `npm audit`, mostly transitively, with "upgrade the major" as the only remedy. That is a large ecosystem cost for little defensive gain.
- **Is it already public?** A defect with an open issue describing it was never embargoable. Fix it in the open.

State the recommendation plainly and name what would reverse it. Where a reachability judgment rests on how common some application pattern is, say that you reasoned it rather than measured it.

Credit is the thing to offer when declining. A reporter who found a real bug that produced a real fix wants attribution — release-notes credit costs nothing and is usually what they were after.

## The reporter note

Per the `triage` skill's `## Drafting the close comment`, plus one advisory-specific pressure: a decline invites you to walk the reporter through the entire severity argument, and the analysis is right there. Do not paste it. Four things belong in the note — it is fixed and where, whether you are publishing, the single reason that decides it, and the offer of credit. Everything else lives in `results.md`.

Correct a reporter's overstated impact when it is wrong, in one sentence, with what you actually observed. Do not relitigate their CVSS vector line by line.
