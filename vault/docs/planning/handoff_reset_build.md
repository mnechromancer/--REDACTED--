# Handoff — the v2 reset build (single-word, citation-grounded, traffic-jam)

**To:** the instance executing Phase 1 of the `reset_amber_v2.md` reset.
**From:** the planning pass that answered §6 (2026-06-17).
**Prereqs, in order:** `reset_amber_v2.md` (the plan) → its handoff section (execution order) → `amber_build_decisions.md` §"v2 reset — §6 decisions" (the locked answers) → **this file** (file-by-file build). Read `technical_document.md` §2/§5/§7.5 and `concept_key_registry.md` for the structures you are about to change.

This is the detailed build handoff `reset_amber_v2.md` §8 promised, written now that §6 A–D are answered. Scope is locked: it builds **Phase 1 (the primitive on one teaching pair)** and tees up Phase 2. It does **not** scale content.

---

## 0. The locked decisions (what this build assumes)

From `amber_build_decisions.md` §"v2 reset":

- **A — transparent grounding meter.** Deep/inference slots show accumulated grounding against a visible threshold; the commit boundary returns a *quantity*, not just accept/reject. Opaque is a later dial.
- **B — renumber freely.** The teaching pair takes the lowest numbers; registry/roster/`entity_self` get rewritten. No numbering to preserve.
- **C — retire the trio, mine the lore.** Phase 1 builds a **clean two-file teaching pair**, not a conversion of `SCP-41B-001/002/003`. The trio leaves playable content.
- **D — cut clearance entirely (pure-graph).** No `clearance`, no `redaction_level`, no `revealedTruth`/`raiseClearance`. A file is reachable iff its inbound citations are reachable. **This is the decision that forces the hardest engine change — see §2.**

E and F (arc list, exact Quippy distinctness) are non-blocking and out of scope here.

---

## 1. The load-bearing risk, stated plainly

**Cutting clearance breaks the citation gate's bootstrap, and replacing that bootstrap IS Phase 1's real work.**

Today `corroborates()` (`game.svelte.ts`) accepts a cited co-carrier only when it reads index *k* by one of two independent-knowledge routes:

1. **clearance-revealed truth** — `revealedTruth.has(c) && anchorOf(c).truth === mutations[k]`, or
2. **prior player solve** — `overlay[c].source === 'inserted' && value === mutations[k]`.

Decision D deletes route 1. That route was the *only* non-circular seed: route 2 needs a prior solve, which needed a prior citation, which (at the very first slot) needed route 1. **Remove clearance and the first commit can never be accepted — the game is unstartable.** The `amber_build_decisions.md` "Reveal model" note already identified this circularity; clearance-reveal was the fix. Cutting clearance reopens it.

The reset's answer (`reset_amber_v2.md` §1.3, §3.2) is **teaching depth — direct co-occurrence**: the word appears **plainly, unredacted, in a reachable file the player can cite.** That is the new non-circular seed. It does not exist in the engine yet. Building it — and proving the traffic-jam primitive feels right on one hand-built pair — is the whole of Phase 1.

**Do not scale content until this is proven on the teaching pair.** A polished corpus on an unstartable or unsatisfying primitive is the expensive mistake this reset exists to avoid.

---

## 2. The new corroboration model (the core design + engine change)

The single-word primitive changes what a slot *is* and what "grounds" it. Two grounding depths, per `reset_amber_v2.md` §1.3:

### 2.1 Teaching depth — direct co-occurrence (the bootstrap, the first-file verb)
A slot's truth word appears **literally, unredacted, in the body of another reachable file.** The player follows the xref, sees the word in plain text, and cites that file. AMBER commits. **Cost: zero exposure. Needs no prior solve and no clearance** — this is the seed route that replaces clearance-reveal.

Engine shape: a new corroboration source. A citation `c` corroborates the truth word `w` at `ref` iff file `c` is reachable AND `w` occurs as plain text in `c`'s body (outside a redaction token). This is **not** index-aligned mutation matching — it is literal string grounding. The authored support for it is a **citeability map**: per slot, which reachable file(s) contain the word in the clear.

### 2.2 Deep depth — parallel-context inference (the Truth mechanic, the meter)
**No file states the word outright.** The player assembles partial/circumstantial grounding across multiple files until a **grounding score** clears a per-slot **threshold** (decision A: this meter is *visible*). Below threshold → rejected, "insufficient grounding"; at/above → commit. This is the manual citation-linking surface Quippy later shortcuts.

Engine shape: each citation contributes grounding weight; the commit accumulates it and compares to the slot's authored threshold. The commit return must expose the running total and the threshold so `AmberLookup` can render ▮▮▯ (decision A). `CITATIONS_REQUIRED` (the current count-based dial) generalizes into this scored threshold — keep the dial idea, change its unit from "count of corroborating co-carriers" to "grounding score vs threshold."

### 2.3 The difficulty curve (the traffic jam) falls out of this for free
A slot starts ungroundable (no reachable file holds its word, no inference reachable), becomes teaching-citeable once a neighbor that holds its word is reached, and the hardest slots are only ever inference-grounded. The corpus is a dependency graph solved in topological order — the order *discovered*, not told. The wiki-graph view (Phase 5) visualizes exactly this.

---

## 3. Schema changes (`corpus.ts` + parser + registry)

This is the heaviest spec rewrite (`reset_amber_v2.md` §7 flags `entry_template.md` and `concept_key_registry.md` as the biggest). Land the schema + parser **first**, with the teaching pair, before anything else.

### 3.1 `src/lib/corpus.ts` — the `Anchor` and `ScpFile` types
- **`Anchor.mutations: string[]` → collapses to a single truth word + a citeability map.** The MadLib candidate set is the wrong primitive for "produce the exact word." Replace with:
  - `truth: string` survives, but is now **the redacted word itself** (was already immutable-correct; semantics narrow from "correct proposition" to "exact word/phrase").
  - a citeability/grounding descriptor: for teaching-depth slots, which reachable file(s) hold the word in the clear; for deep slots, the grounding threshold and (optionally) the contributing carriers. Exact shape is a Phase-1 design call — keep it minimal for the pair; do **not** over-engineer before it's felt. A first cut: `grounding: { kind: 'teaching'; citeIn: string[] } | { kind: 'inference'; threshold: number }`.
- **Remove `Anchor.redaction_level`** (decision D). Nothing reveals by tier anymore.
- **Remove `ScpFile.clearance`** (decision D). File reachability is graph-derived (§4), not a baseline tier.
- `concept?` — **survives, repurposed.** It was the propagation/co-carrier key; under the grounding graph it remains the edge set for *inference* grounding (which carriers can contribute to a deep slot's score) and for propagation. `reset_amber_v2.md` §1.2 and §8 both call concept/propagation a survivor. Keep it; re-document its meaning in the registry from "escalating readings index" to "grounding contributors + propagation."
- `exposure_weight`, `entity_self`, `breach_effect`, `xrefs`, `body`, `slot_type` — survive. `xrefs` becomes load-bearing: it's the literal followable-link surface the teaching verb runs on (§3.2 of the reset). Consider validating that a teaching slot's `citeIn` files are in `xrefs`.

### 3.2 The overlay (`OverlayEntry`)
- `via: 'amber' | 'quippy'` — **survives unchanged.** The no-Quippy win is unchanged (every decision and the reset's §9 reaffirm this). Provenance is the whole endgame; do not touch it.
- `contradicts_truth` — its trigger changes. It was set by `raiseClearance` when a revealed truth differed from a guess. With clearance cut, a contradiction now surfaces differently (e.g. a Quippy fill of an ungrounded/wrong word, or an inference commit later undercut). Decide the new trigger in Phase 1; the four-state grammar's *contradiction* state survives, its cause changes.
- Add the **Quippy-filled** visual distinction (`reset_amber_v2.md` §2.2, §1.5) — a fifth render state, or a `via`-driven modifier on inserted. Info-design call (the spec already floated `--slot-via-quippy`).

### 3.3 Parser (`scripts/lib/parse-entry.ts`) + validators
- `asTier`/`redaction_level`/`clearance` parsing — **remove.** `parseAnchor` and `parseEntry` drop those fields.
- `parseAnchor` — `mutations` array validation → single-truth + grounding-descriptor validation.
- **New build-time invariants** (replace the mutation-set-length check):
  - a teaching slot's `citeIn` files exist and contain the truth word as plain text in their body (the strongest, most valuable new check — it makes "the word is actually citeable" a build error, not a runtime surprise).
  - every `citeIn` resolves to a real file; consider requiring it also be in `xrefs`.
  - the existing "exactly one `entity_self`", "every `⟦id⟧` resolves", "every xref resolves" checks survive.
- The `--allow-incomplete` flag (decisions record) survives for the self-file gap.

### 3.4 `concept_key_registry.md` + `entry_template.md`
- Registry **survives structurally** as the grounding graph, but the "mutation index 0/1/2 escalating readings" semantics are gone with `mutations[]`. Rewrite per-key meaning to "the word + where it's grounded / which carriers contribute." This is a big edit, not a delete (reset §7).
- `entry_template.md` is the heaviest rewrite: the whole anchor/mutation-set worked example → single-word + citeability. Re-author the worked example as the **teaching pair itself** so the template doubles as the proven reference.

---

## 4. Reachability replaces clearance (`game.svelte.ts`)

Decision D: a file is reachable iff its inbound citations are reachable — the graph is the only gate.

- **Delete `raiseClearance`, `revealedTruth`, `clearance` state, `ClearancePanel`.** These are the clearance-reveal subsystem.
- **Add reachability.** A derived set of reachable files: seed = the opening file(s) the bootup hands the player (§3.2 of the reset — the first early-chronology entry, plus any file it links). A file becomes reachable when a reachable file's solved slot (or its `xrefs`) opens the link to it. Keep it minimal for the pair: with two files, reachability is "file 1 is open; following its xref opens file 2." Do not build a general graph solver before the pair proves the primitive.
- **`commitWithCitations` / `corroborates` rewrite** — the core engine change:
  - drop the `revealedTruth`-based corroboration branch (route 1 is gone).
  - add the **teaching-depth branch**: citation `c` corroborates iff `c` is reachable and the truth word occurs in `c`'s body in the clear. This is the new bootstrap.
  - add the **inference branch**: accumulate grounding from cited carriers, compare to threshold, return the running total (decision A — the meter needs the number).
  - keep the honesty rule: a *propagated* value never corroborates (it's the player's own unconfirmed ripple). The literal-occurrence check makes this naturally honest — you cite where the word *is*, not where you pushed it.
  - the orphan-slot fallback (`commitWithCitations` orphan branch) **depended on clearance-reveal and is now gone.** Orphan handling under pure-graph is an **open Phase-1 sub-question**: most slots should be teaching- or inference-grounded by construction; an orphan with no reachable plain-text source and no inference carriers is simply unsolvable-in-AMBER, which is a *content* error to catch at build time, not an engine fallback. Lean: forbid true orphans by validation rather than special-casing them in the engine. Confirm against the pair.

`insert()`, `mapMutation`/propagation, `recomputeExposure`, `evaluateBreaches`, `boardState`, `endState` — **survive.** The propagation primitive, the exposure-only-from-Quippy keystone, and the provenance-read ending are all untouched by the reset (reset §8). `endState` no longer reads `revealedTruth` for "restored" — a slot is restored iff it reads its truth word via an `amber` insert; rework that condition to not depend on clearance reveal.

---

## 5. Onboarding & UI (Phase 2 tee-up — don't build in Phase 1)

Flagged here so Phase 1 doesn't entrench what Phase 2 removes:

- **`progression.svelte.ts` `SCRIPT`** — the scripted onboarding is **removed** in Phase 2 (`reset_amber_v2.md` §3, §0.3). Don't extend it in Phase 1; don't let Phase 1 code depend on it.
- **Bootup + source-less premise** (§3.1) — Phase 2. Phase 1 may stub a bare premise line so the pair is testable, but the real bootup waits.
- **Quippy's motivated entrance** at the second-file trigger (§3.3) — Phase 2.
- **Aesthetic (80s register, real CLI, margin-gutter rendering)** — **Phase 3, after the playable opening** (the reset's one resequencing from §5). **Single exception:** if the single-word puzzle only *reads* right with document-like rendering (word-sized redaction bars, margin notes), pull just the **document-as-paperwork rendering** forward into Phase 1 — the full CLI and palette still wait. Judge this when you first see a single-word slot rendered.

---

## 6. Tests

The Sprint-1 fixtures and trio-specific assertions are built on the old propositional primitive and get rewritten with the schema (reset §8). Preserve **intent**, change **assertions**:

- **The winnable-regression guard survives in spirit** (`real-corpus-winnable.test.ts` / `endgame-integration.test.ts`): *AMBER-only solve of the whole reachable corpus → `loop-broken` at exposure 0.* Rewrite its assertions against the teaching pair and the new grounding model. This is the most important test to carry forward — it proves the no-Quippy win is reachable on the real corpus.
- `citation-gate.test.ts` — rewrite `corroborates`/`commitWithCitations` cases for teaching-depth + inference; delete the clearance-reveal and orphan-clearance-fallback cases.
- `validation.test.ts` (`game.svelte.ts` side) and the parser/`validate-corpus` tests — drop clearance/`redaction_level`; add the new citeability/grounding invariants.
- `provenance.test.ts`, `quippy.test.ts`, `game.test.ts` redemption/idempotency — **largely survive** (provenance, exposure, redemption are untouched). Re-check they don't assume clearance.

Run `npm run check` and `npm run test` green before calling Phase 1 done.

---

## 7. Build order within Phase 1 (do these in order)

1. **Schema + parser carrying one truth word + a citeability map** (§3). Build-corpus round-trips and validates the new invariants on the teaching pair.
2. **The teaching pair** — two hand-built files: file A has a single redacted word grounded by direct co-occurrence in file B, which is explicitly xref-linked from A. This is `entry_template.md`'s new worked example.
3. **Reachability + the rewritten citation gate** (§4): teaching-depth corroboration accepting a co-occurrence cite, inference branch returning a grounding total. Exposure/no-Quippy accounting intact.
4. **Minimal render** to actually play the pair (plain chrome; pull document-rendering forward only if §5's exception applies).
5. **Prove it:** the pair solves AMBER-only, exposure 0, win reachable; a Quippy fill taints and is redeemable. Then — and only then — Phase 2.

If the traffic-jam primitive doesn't feel right on the pair, stop and re-spec. Everything downstream depends on it.

---

## 8. Cleanup (parallel chore, not a phase)

Per the reset's handoff: fold the `planning/archive/` move into whenever those docs get touched anyway. Phase 1 rewrites `entry_template.md`, `concept_key_registry.md`, and `technical_document.md` §2/§5/§7.5 regardless — archive the completed handoffs (`handoff_amber_build.md`, the lore handoffs, `sprint_01_vertical_slice.md`) and banner `reframe_amber_quippy.md` as superseded-in-part when you next touch the planning dir. No dedicated slot.

---

## 9. One-line summary

Phase 1 is: **replace clearance-reveal with teaching-depth co-occurrence as the citation gate's bootstrap, collapse `mutations[]` to a single truth word + a citeability map, cut `clearance`/`redaction_level` for pure-graph reachability — and prove the single-word traffic-jam primitive feels right on exactly one hand-built teaching pair before any content scales.** Provenance, propagation, exposure, and the no-Quippy win are untouched.
