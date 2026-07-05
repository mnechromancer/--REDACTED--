# Handoff — AMBER/Quippy mechanic build (post-§6)

**To:** a build instance (code track).
**Read first:** `planning/reframe_amber_quippy.md` (the master re-frame; §6 now **resolved**). Then the specs it points to: `design_document.md` §3/§5/§6, `technical_document.md` §7/§10, `scp_x_bible.md` §5.
**Supersedes the gated parts of:** `planning/handoff_janitor.md` (its "do not build before §6" boundary is lifted) and the PENDING flags in `planning/handoff_docs_reviser.md`.

## Why this handoff exists

The two prior handoffs were written with the central mechanic **gated** on two unresolved design questions. **Both are now answered (2026-06-13):**

- **[R§6.2] AMBER's manual-unredaction verb → the citation-cost gate.** To commit a value in AMBER, the player cites the corroborating cross-reference(s); AMBER adjudicates the citation. (Detail: `design_document.md` §5.3, `technical_document.md` §7.5.)
- **[R§6.6] CLI scope → full CLI now.** Build the real keyboard-driven AMBER terminal this pass; rebuild the interaction layer, don't restyle it. Quippy is a distinct GUI overlay mode.

Plus the already-adopted recommendations: **[R§6.1]** Concordance = AMBER's honest tool; **[R§6.3]** per-entry `via` provenance; **[R§6.4]** AMBER unredaction costs **zero** exposure, Quippy carries all of it; **[R§6.5]** keep the Colorado canon.

This handoff turns those into ordered build steps. **It does not re-derive the design** — it cites the specs and gives the engine seams.

---

## The one-paragraph target

The single GUI splits into **AMBER** (a monochrome keyboard-driven CLI; the honest, hard tool) and **Quippy** (a refusable GUI overlay = SCP-X; the easy, exposure-bearing tool). Unredaction in AMBER is a **cited commit**: look up cross-references → choose a bounded candidate → cite the co-carrier(s) that corroborate it → AMBER accepts (via=amber, exposure +0) or rejects (go read more). Quippy does the same insertion with **one click, no citation, exposure charged.** The win is **unredacting the whole corpus in AMBER with zero Quippy assists**, read from the `via` provenance across all solved slots. Every other outcome is a breach.

---

## What's already in place (don't rebuild)

The mechanic-stable core (committed, tests green): the corpus pipeline, `insert()` + propagation (index-aligned, idempotent, with the carrier-clobber guard), `raiseClearance()` batched reveal, the four-state grammar, breaches/recovery, `conceptClues(ref)` / `crossMentions(ref)` / `mapMutation()`. **These survive untouched.** The citation gate is built *on top of* them; the CLI is a new presentation + traversal layer over the same store.

## Janitor prep (do first if not already landed)

From `planning/handoff_janitor.md` — all still valid, and now the on-ramp:
1. Add `via?: 'amber' | 'quippy'` to `OverlayEntry` (`corpus.ts`) — currently flagged, not landed.
2. Thread an optional `via` through `insert()` (default-preserving), and **write it onto both the inserted entry and its propagated ripples** (propagated inherits the cause's `via` — see `technical_document.md` §4 pseudocode).
3. Fix the HTML-comment token bug in the parser.
4. Delete `Counter.svelte` (dead scaffold).
5. Quarantine the obsolete win model (`sessionResult` & constants) — it is replaced by the no-Quippy ending (Step 5 below); keep tests green until then.

---

## Build steps (each independently testable)

### Step 1 — `via` end to end  *(extends janitor prep)*
Make `insert(ref, value, via)` stamp `via` on the inserted entry and every propagated entry it creates. Add `boardState` counts `viaAmber` / `viaQuippy`. **Test:** an insert with `via:'quippy'` that propagates to 2 carriers yields 3 entries all `via:'quippy'`; an `amber` insert likewise. Provenance is now queryable; nothing branches on it yet.

### Step 2 — exposure re-aim  [R§6.4]
Gate the exposure charge in `insert()` on `via === 'quippy'` (`technical_document.md` §4 pseudocode). AMBER inserts charge **zero**; Quippy inserts charge the anchor's `exposure_weight` (and `* PROPAGATION_FACTOR` on ripples). **Test:** a full corpus solved entirely `via:'amber'` ends at exposure 0 (no breach possible); the same solved `via:'quippy'` reproduces today's exposure curve. *(This is the keystone of the whole design — verify it hard.)*

### Step 3 — the citation-cost gate  [R§6.2] — `technical_document.md` §7.5
Implement `corroborates(citationRef, ref, k)` and `commitWithCitations(ref, value, citations)` exactly as specced in §7.5. Key rules:
- A co-carrier corroborates index *k* iff it *currently reads* `mutations[k]` via **revealed truth** or **a prior player insert** — **never** via a propagated value.
- ≥1 good citation → call `insert(ref, value, 'amber')` and return `{ok:true}`. Zero → `{ok:false, reason:'uncorroborated'}`, no write.
- **Edge to handle:** orphan/local slots (`concept:""` or single-carrier) have no citable co-carrier (§7.5 "Open sub-question"). Decide the fallback (recommend: such slots are AMBER-soluble only once their *own* truth is clearance-revealed, i.e. they can't be pre-empted by Quippy-style guessing in AMBER; or allow an in-file textual citation). Pick one, document it, test it. Most slots are multi-carrier (roster ≥2-keys discipline), so this is an edge.

**Tests:** (a) cite a clearance-revealed co-carrier at index k → accept, via=amber; (b) cite a co-carrier the player solved at index k → accept; (c) cite a co-carrier holding a *propagated* index-k value → reject (uncorroborated); (d) cite a co-carrier reading a *different* index → reject; (e) no citation → reject; (f) accepted commit propagates and charges zero exposure.

### Step 4 — the full AMBER CLI  [R§6.6] — `technical_document.md` §7.1–7.5, §9
Net-new presentation/traversal layer over the existing store:
- `ui.mode` (`'amber' | 'quippy'`), default `'amber'`, AMBER always available, Quippy summoned/dismissed (one keystroke back to AMBER — the refusable thesis).
- `AmberTerminal.svelte`: command input, keybound file traversal, redacted-span jumping, terminal log. Commands at minimum: open file, next/prev redacted span, look up cross-references (renders `conceptClues`), commit-with-citations, raise clearance, search.
- Restyle `FilePane`/`SlotSpan`/`RippleLog`/`SearchPane` to monochrome-terminal idiom; the four-state grammar re-rendered per §7.4 (+ optional fifth via-distinction).
- `AmberLookup.svelte`: renders `conceptClues(ref)` as **selectable citations**; selecting candidate + citations calls `commitWithCitations`; prints accept/reject in AMBER's terse register.
- Keep AMBER and Quippy registers **disjoint** (no shared styling/voice except the slot grammar).

### Step 5 — Quippy overlay  — `scp_x_bible.md` §2–§4, `technical_document.md` §7.2
`QuippyPanel.svelte`: the GUI overlay. Candidate suggestions + **one-click fill** that calls `insert(ref, value, 'quippy')` — **no citation gate**, exposure charged (Step 2). The degrading-tone bands (`scp_x_bible.md` §4) keyed to exposure; the paperclip-diamondback presence; the "ours/re-shelving" register at high bands; post-breach auto-suggested propagations. Summoning sets `ui.mode='quippy'`; it visibly sits *over* AMBER.

### Step 6 — the no-Quippy ending  — `design_document.md` §6, `scp_x_bible.md` §5
Replace the quarantined win model. The true ending: corpus **fully unredacted to truth AND every solved slot `via:'amber'`** (no surviving truth-contradictions, zero Quippy assists). Every other outcome is a breach ending (recovery-first; breaches are board state). Read it from `boardState`/provenance, not a counter.
- **Enforcement gate (tuning):** start the **hard gate** (any Quippy assist forecloses the true ending — `scp_x_bible.md` §5.3); relax to a tolerance band only if playtest shows it inhumane.
- `App.svelte` hosts the end-state surface reading this condition; the obsolete `sessionResult` is now deletable.

### Step 7 — dials & polish
The **Quippy-temptation / AMBER-difficulty dial** is the new central one (`design_document.md` §8): how much corroboration a commit needs (1 citation vs. ≥2), how cheap/curdly Quippy is. Then autofill, set size, exposure decay, reduced-glitch, the via-provenance visibility toggle.

---

## Watch items (real design edges, not implementation trivia)

1. **AMBER-onto-Quippy-touched slot** (flagged in the reviser report). If a slot was filled `via:'quippy'` and the player later re-solves it correctly in AMBER, does the AMBER commit **clear the Quippy taint** for the ending? Recommend **yes** — a correct AMBER re-solve overwrites the entry to `via:'amber'`, so the player can *redeem* a slot by doing the honest work. This makes recovery meaningful and the hard gate humane. Confirm in playtest; it is a real design decision, decide it explicitly.
2. **Propagation provenance.** A single Quippy edit rippling to N carriers must count as Quippy reliance at all N (Step 1 handles this). An AMBER edit propagating onto a slot the player hasn't touched marks those ripples `via:'amber'` — fine, they're consequences of an honest edit.
3. **The orphan-slot AMBER path** (Step 3 edge). Don't let it become a Quippy-only slot by accident, or the no-Quippy win is unreachable for any corpus containing one.
4. **The temptation must be real but escapable** (`design_document.md` §9). If AMBER feels *impossible* early (too few corroboratable slots), the moral inverts — the game feels like it forces Quippy. Tune the corpus so the earliest tier has at least a few slots corroboratable from clearance-1 reveals. This is content × mechanic; coordinate with the lore track.

## Definition of done (this build)

- `via` end to end; AMBER inserts cost zero exposure, Quippy inserts carry it (Step 2 tested hard).
- The citation-cost gate works per §7.5 with the six tests in Step 3 green (incl. the propagated-value-doesn't-corroborate rule and the orphan-slot fallback).
- A full keyboard-driven AMBER CLI; Quippy a distinct, refusable overlay; the switch is one keystroke.
- The no-Quippy ending replaces the obsolete win model; a no-Quippy run reaches the true ending, any Quippy reliance (under the chosen gate) reaches a breach ending.
- The four watch items above each have an explicit, documented decision.
- Tests green; `npm run check` clean; the loop felt on the existing trio before content scales.
