# Sprint Process — the runbook

The repeatable cycle every sprint follows. Operationalizes `agents.md` §3 (dev lifecycle) and §2 (lore pipeline) into a concrete sequence with gates. Generalized from Sprint 1; apply unchanged to every subsequent sprint unless a retrospective amends it (amendments are logged in §7).

The unit of progress is the **playable milestone** (`technical_document.md` §10): every sprint ends with something you can run and feel. "Playable" is the definition of done — not "code written," not "tests pass," but *the loop the milestone introduces can be performed by hand*.

---

## 1. The two tracks

A sprint runs two tracks in parallel (`agents.md` §4.5), converging where state demands:

- **Code track** — orchestrator-worker (`agents.md` §3.2 roles: PM, Architect, Implementer, Test engineer, Reviewer, Verifier). Builds the engine and UI per `technical_document.md` §10 milestones.
- **Lore track** — evaluator-optimizer staged pipeline (`agents.md` §2). Produces validated entries through the descending-clearance stages.

The tracks are independent until the **convergence point**: propagation (M4) needs real entries to act on. Before convergence, code can run on stub fixtures and lore can author without a UI; they meet when the engine consumes the authored corpus.

---

## 2. Sprint phases

### Phase 0 — Plan (open the sprint)
- PM opens `sprint_NN_<name>.md` from the template (§6), pulling scope from `roadmap.md`.
- Slice milestones into **user stories** (`agents.md` §3.2): "As the archivist, I \<verb\> and see \<result\>." Each story names its track, owner role, the milestone it serves, and its done-check.
- Architect (plan mode only) resolves any design fork that touches the inference/exposure economy or the overlay/truth boundary **before** code exists (`agents.md` §3.2). Forks logged in the sprint doc's decisions section.
- Identify the convergence point and the serialization constraints (stories touching `game.svelte.ts` serialize; distinct components parallelize — `agents.md` §3.3).

### Phase 1 — Build (run the tracks)
- **Code:** Implementer takes one story per worktree when parallel. Test engineer writes property tests for the invariants alongside (idempotent re-insertion, index-aligned mutation mapping, truth never volunteered — `agents.md` §3.2).
- **Lore:** entries flow through the §2 pipeline stages (commission → author → redact → mutate → integrity gate → registry update). Each entry's Stage 5 updates `concept_key_registry.md` and `entity_roster.md`.
- Sprint doc status is kept live: stories move To-do → In-progress → Done-pending-verify → Done.

### Phase 2 — Integrate & verify (converge)
- Code track consumes the authored corpus at the convergence point; PM integrates worktrees.
- **Reviewer** runs `/code-review` per story. Invariant violations (a second resource, per-guess validation, free-text insertion) are **blocking**, not style notes (`agents.md` §5.1).
- **Verifier** runs the app and plays each milestone's definition-of-done loop, reporting observed behavior (not "looks done" — actual played behavior).

### Phase 3 — Close (land the sprint)
- Every story verified against its done-check, or explicitly carried to the next sprint (carried stories are logged, not silently dropped).
- Update `handoff.md` (keep it lean — status deltas only, link out for detail), `roadmap.md` (mark sprint done, surface next), and this file's §7 if the retro amended the process.
- Commit on a branch; the human approves the merge.

---

## 3. Definition of done (the gates)

A story is done when **all** apply:

1. **Playable** — the loop it introduces can be performed in the running app (Verifier-confirmed).
2. **Invariant-clean** — Reviewer found no violation of the six CLAUDE.md invariants.
3. **Tested where pure** — `propagation.ts` / `validation.ts` / `breaches.ts` logic has property tests; UI stories have at least a verified manual path.
4. **Corpus-valid** (lore stories) — `build-corpus.ts` passes; the registry and roster reflect the new entry.

A sprint is done when every committed story is done or explicitly carried.

---

## 4. Ceremonies (lightweight)

This is a solo-human + agents project; ceremonies are artifacts, not meetings.

- **Planning** = Phase 0, written into the sprint doc.
- **Standup** = the sprint doc's live status table; no synchronous check-in.
- **Review** = Phase 2 (`/code-review` + Verifier play session).
- **Retro** = a short section at the bottom of the sprint doc: what worked, what to change, and any amendment to push into this runbook (§7) or `agents.md`.

---

## 5. Roles → who does what (reference)

Full definitions in `agents.md` §3.2 (code) and §2.1 (lore). Quick map:

| Role | Track | Phase active | Model tier (`agents.md` §5.4) |
|---|---|---|---|
| PM / Orchestrator | both | 0, 2, 3 | mid |
| Architect | code | 0 (forks) | strongest |
| Implementer | code | 1 | mid–strong by story |
| Test engineer | code | 1 | mid |
| Reviewer | code | 2 | strong |
| Verifier | code | 2 | cheap (mechanical play) |
| Authoring personas (L3/L4/L5) | lore | 1 | by severity (`agents.md` §2.1) |
| Records Officer / CI Officer / Integrity | lore | 1 | mid / strong / mid |

**Model-switch note:** high-severity authoring and Stage 3 mutation craft are taste-and-judgment work — the human switches to the strongest model for these, and the sprint doc flags exactly which stories are model-switch points so the switch is deliberate, not incidental.

---

## 6. Sprint doc template

Copy into `sprint_NN_<name>.md`:

```markdown
# Sprint NN — <name>

**Goal (one sentence):** <the playable thing that exists at sprint end>
**Milestones:** <technical_document.md §10 refs>  **Convergence point:** <where tracks meet>
**Status:** Planning | In-progress | Verifying | Closed

## Stories
| ID | As the… I… so that… | Track | Owner role | Milestone | Done-check | Status |
|----|----------------------|-------|------------|-----------|-----------|--------|

## Decisions log
| # | Fork | Resolution | Rationale (invariant ref) |
|---|------|-----------|---------------------------|

## Model-switch points
- <stories requiring the strongest model, flagged for deliberate human switch>

## Definition of done (this sprint)
- <the specific playable loop that closes the sprint>

## Retro (fill at close)
- Worked / Change / Runbook amendment:
```

---

## 7. Runbook amendments

Process changes adopted from retrospectives. Each is dated and supersedes the matching part of §1–6.

*(none yet — Sprint 1 is the first run)*
