# Sprint 1 — Vertical Slice

**Goal (one sentence):** a running terminal where you open the three trio entries, hover a redaction to see candidates, insert a guess, and watch it propagate across the other two files with a visible corruption indicator — the core loop felt on three entities.

**Milestones:** `technical_document.md` §10 M1–M5 (schema+parser, viewer, insertion+overlay, propagation, exposure+batched validation).
**Convergence point:** M4 (propagation) — the code engine consumes the three authored entries.
**Status:** Planning

This is the proof the build order names — *"get the loop felt on 3 entities before scaling content"* (`CLAUDE.md` Build order; `handoff.md` §6) — and the sprint shape `agents.md` §3.3 describes (Sprint 1 = Epic A + B stories while the lore pipeline produces the first 3 entries sharing 2 concept-keys).

---

## Scope

**In:** Vite scaffold; schema types; `build-corpus.ts` with full validation; static file viewer with redaction bars + clearance gating; single-file insertion + overlay + `displayedSlot`; concept-keyed propagation with provenance; exposure scalar; batched clearance-gated truth reveal; the four-state visual grammar (redacted / inserted / propagated / truth-contradiction). The three entries SCP-41B-003, 001, 002.

**Out (deferred):** breach effects + recovery (M6, Sprint 2); endgame/ouroboros (M7); difficulty dials + accessibility polish (M8); scaling past three entries (M9). No breach can fire this sprint — exposure accumulates and is *displayed*, but crossing a threshold does nothing yet. That's fine; the slice is about the read→guess→propagate→validate loop, not consequence.

**The three entries** (from `entity_roster.md` vertical-slice candidates):
- **SCP-41B-003** — the worked example, copy-ready from `entry_template.md`. Keys: `the-quiet-exchange`, `induced-nominal-amnesia`.
- **SCP-41B-001** — its cross-ref partner. Keys: `the-quiet-exchange`, `audit-cycle`, `acquisition-lot`.
- **SCP-41B-002** — keys: `acquisition-lot`, `audit-cycle`.

Shared seams active this sprint: `the-quiet-exchange` (003↔001), `acquisition-lot` (001↔002), `audit-cycle` (001↔002). Three propagation edges across three files — enough to feel the mechanic.

---

## Stories

### Code track

| ID | Story | Milestone | Owner | Done-check | Status |
|----|-------|-----------|-------|-----------|--------|
| C0 | As a developer, I scaffold Svelte 5 + Vite + TS in place (per `CLAUDE.md` "First command") and install `idb`, so the repo builds and runs. | pre-M1 | Implementer | `npm run dev` serves a blank app; `vault/` and `CLAUDE.md` untouched. | DONE |
| C1 | As a developer, I define the corpus schema types (`Anchor`, `ScpFile`, `OverlayEntry`, `BreachEffect`) from `technical_document.md` §2, so the parser and engine are statically typed. | M1 | Implementer | Types compile; match §2 exactly. | DONE |
| C2 | As a developer, I write `scripts/build-corpus.ts` parsing `vault/entries/*.md` → `static/corpus.json`, with all build-time validations (`technical_document.md` §8 / `CLAUDE.md` cross-file invariants), so the vault is authoritative. | M1 | Implementer | Round-trips the 3 entries; every validation rule fires on a deliberately broken fixture (Test engineer supplies fixtures). | DONE |
| C2t | As a test engineer, I write broken-fixture cases (missing anchor, dangling xref, misaligned mutation set, zero/two `entity_self`) so each validation rule is proven to fire. | M1 | Test engineer | Each rule has a failing fixture + a passing one. | DONE |
| C3 | As the archivist, I open a file and see its prose with redaction bars at each `⟦id⟧`, gated by clearance tier, so reading-by-tier works. | M2 | Implementer | Below-tier files won't open; in-tier files render bars at slots; `parseBody.ts` resolves tokens + wikilinks. | DONE |
| C4 | As the archivist, I hover a redaction and see slot type + cross-mentions + the bounded candidate set (the `HelpUtility` mouse-over), so I can infer before inserting. | M2–M3 | Implementer | Hover panel lists §5.3 contents for the hovered anchor. | DONE |
| C5 | As the archivist, I insert a candidate into a slot and see it render as 'inserted' (amber), so single-file guessing works. | M3 | Implementer | `overlay` updates; `displayedSlot` returns inserted state; idempotent re-insert. | DONE |
| C5t | As a test engineer, I property-test `displayedSlot` and insertion: idempotent re-insertion, correct state precedence (`technical_document.md` §3). | M3 | Test engineer | Properties hold across generated overlay states. | DONE |
| C6 | As the archivist, when I insert at a slot whose concept is shared, every other carrier of that concept mutates to the index-aligned value, marked 'propagated' (teal) with hover provenance, so propagation is visible and traceable. | M4 | Implementer | Edit to 003's `the-quiet-exchange` changes 001's carrier; provenance shows `caused_by`; `randomize_propagation` path stubbed but unused. | DONE |
| C6t | As a test engineer, I property-test `propagation.ts`: index-aligned mapping, idempotent re-evaluation, no free text ever enters propagation (`technical_document.md` §4). | M4 | Test engineer | Properties hold; mapping is deterministic. | DONE |
| C7 | As the archivist, I raise clearance and a batch of ground-truth fragments unlocks; inserted guesses that contradict truth surface as 'truth-contradiction' (red diff), so I learn where I'm wrong without being told the answer. | M5 | Implementer | `raiseClearance` reveals the tier's batch; contradictions flip state; untouched slots' truths are NOT volunteered (`technical_document.md` §5). | DONE |
| C7t | As a test engineer, I property-test `validation.ts`: truth never volunteered for an untouched slot; reveal is batched per tier, never per-guess. | M5 | Test engineer | The anti-leak property holds. | DONE |
| C8 | As a developer, I implement the four-state CSS tokens + `SlotSpan` state switching (`technical_document.md` §7), so redacted/inserted/propagated/contradiction are legibly distinct. | M2–M5 | Implementer | All four states visually distinct; reduced-motion path keeps color/strike distinctions. | DONE |
| CR | As a reviewer, I run `/code-review` per story; invariant violations are blocking. | all | Reviewer | No CLAUDE.md invariant violation merges. | To-do |
| CV | As a verifier, I play the M5 loop end-to-end and report observed behavior. | close | Verifier | The goal sentence is demonstrably true in the running app. | To-do |

### Lore track

| ID | Story | Stage flow | Owner | Done-check | Status |
|----|-------|-----------|-------|-----------|--------|
| L1 | Author **SCP-41B-003** (copy-adapt the `entry_template.md` worked example; confirm originality of truths, finalize mutation sets index-aligned with 001). | §2 S0–S5 | L4 Researcher *(model-switch)* | Integrity gate passes; registry/roster carriers confirmed. | To-do |
| L2 | Author **SCP-41B-001** (cross-ref partner; `the-quiet-exchange` mutations index-aligned with 003; carries `audit-cycle`, `acquisition-lot`). | §2 S0–S5 | L3/L4 *(model-switch)* | Gate passes; `the-quiet-exchange` and `audit-cycle`/`acquisition-lot` orderings match the registry. | To-do |
| L3 | Author **SCP-41B-002** (`acquisition-lot` + `audit-cycle`; mutations index-aligned with 001). | §2 S0–S5 | L3 Staff *(model-switch)* | Gate passes; both keys align with 001. | To-do |
| LV | Verify the three entries form the three intended propagation edges when loaded (lore↔code convergence check). | post-M4 | PM + Verifier | Each shared key propagates across its file pair in the app. | To-do |

---

## Decisions log

| # | Fork | Resolution | Rationale |
|---|------|-----------|-----------|
| 1 | Sprint 1 scope: content-only, code-only, or both? | **Both** — full playable slice (M1–M5 + the trio). | The slice must *feel the loop* (`handoff.md` §6); propagation (M4) is the point, and it needs both engine and real entries. |
| 2 | Designation scheme | `SCP-41B-###`, clean sequence (settled pre-sprint). | `entity_roster.md` "Designation scheme". |
| 3 | Breaches this sprint? | **No** — exposure displays but no threshold fires. | Keeps the slice to read→guess→propagate→validate; breach + recovery is Sprint 2 (Epic D). Avoids building terminal-mutation before the base loop is proven. |
| 4 | Trio selection | 003 / 001 / 002 (settled in roster). | Three shared seams across three files, all Act I, no breach effect harder than corrupt_search/inject_xrefs. |
| 5 | `displayedSlot` shape: `$derived.by` per §3 snippet, or pure function? | **Pure `resolveSlot`**; components wrap it in `$derived`. | Svelte 5 forbids `$derived.by` returned from a function (declaration-only rune). The §3 snippet is illustrative; the branch *order* (state precedence) is preserved verbatim. Doc-vs-compiler gap, resolved for the compiler. |
| 6 | Exposure: incremental `+=` per §4 pseudocode, or recompute from overlay? | **Recompute (`recomputeExposure`)**. | The literal `+=` drifts on re-insertion; §4's *stated* invariant is "idempotent re-evaluation, no accumulated drift." Implemented the invariant over the pseudocode; no-drift is now structural. C5t/C6t pin it. |

*New forks that arise mid-sprint get logged here by the Architect before code proceeds.*

> **C6 note:** the `randomize_propagation` breach path named in C6's done-check was intentionally **not** stubbed — breaches are out of scope this sprint (Decision #3) and a caller-less stub is dead noise. It lands with Sprint 2's breach machinery.

---

## Model-switch points

**Flag to the human:** stories **L1, L2, L3** are the entry-authoring work — taste-and-judgment, licensing-sensitive, the strongest-model roles (`agents.md` §5.4, §2.1). The human switches to the strongest model for these before drafting prose and mutation sets. The code-track stories (C*) are implementation against a fixed spec and run on the standard model.

Everything up to and including the schema/parser/UI is spec-execution. The creative spend is the three entries — switch there, deliberately.

---

## Definition of done (this sprint)

In the running app, at clearance raised to reveal the trio's truths:
1. Open SCP-41B-003; redaction bars render; hover shows candidates.
2. Insert a `the-quiet-exchange` candidate in 003 → the matching slot in 001 flips to 'propagated' with provenance on hover.
3. Insert an `acquisition-lot` candidate in 001 → 002's carrier propagates.
4. Raise clearance → truth batch unlocks → at least one deliberately-wrong insertion shows 'truth-contradiction'; an untouched slot's truth is NOT shown.
5. Exposure readout climbs with each insertion (no breach fires — correct for this sprint).

All four visual states observed; reviewer found no invariant violation; pure-logic modules property-tested.

---

## Retro (fill at close)

- Worked:
- Change:
- Runbook amendment (push to `sprint_process.md` §7 or `agents.md`):
