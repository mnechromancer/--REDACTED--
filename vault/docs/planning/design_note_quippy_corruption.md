# Design note — Quippy fills are ungrounded, and they corrupt the references

**Status:** design decision, captured 2026-06-17 (user). **Spec only — not yet built.**
Targets a dedicated mechanic phase after the citation-UI/aesthetic work (see roadmap).
This is the mechanical teeth behind `reset_amber_v2.md` §1.5 / §6-F ("Quippy can fill the
wrong word") and the structural complement to [[design_note_forged_citations]]: where the
player forges *true* citations from spans that really carry the word, Quippy fabricates a
fill whose grounding is *false* — and accepting it **rewrites the cross-referenced text so
the corpus closes over the lie.**

## The thesis in one line
A Quippy-assisted unredaction does not recover the grounded word; it **installs a word and
then edits the surrounding evidence to make that word look grounded.** The reference web —
the only source of truth left after the Transfer (§1.4) — is what gets corrupted. The player
who leans on Quippy isn't just paying exposure; they are **destroying the very material they
need to win honestly.**

## Why this matters to the design
The no-Quippy thesis currently rests on two costs: exposure (→ breach) and the permanent
win-taint (`quippyTouched`, the no-redemption decision). Both are *bookkeeping* costs — the
board doesn't visibly degrade, so a player can rationalize "I'll just use it here." Reference
corruption makes the cost **diegetic and load-bearing**: every Quippy fill measurably damages
the citation graph the honest route runs on. The traffic jam doesn't just stall when you use
Quippy — lanes get *paved over*. This is the felt, on-the-board reason refusal is mastery.

## What "ungrounded + corrupting" means under the single-word primitive
Two coupled effects, both on the *accept* of a Quippy fill:

1. **The fill is not the grounded word.** Quippy writes a value it asserts but the corpus
   does not support. In the simplest cut it can write the truth word (still ungrounded —
   no citation, just exposure, as today). The mechanic's point is the option for it to
   write a **wrong/escalatory word** (§6-F: the entity's preferred re-shelving), so a
   Quippy slot can be *subtly false*, not merely uncited. The existing `contradicts_truth`
   render state already exists for "a wrong word sits in the slot"; this is its real cause.

2. **Accepting it corrupts the references that carried the truth.** This is the new part.
   The truth word was recoverable because some other reachable file held it in the clear
   (`grounding.citeIn`, or any span containing it under the forged-citation model). When the
   player accepts Quippy's fill on slot S, Quippy **rewrites those grounding spans** so they
   no longer read the truth — the prose mutates to agree with Quippy's installed word (or to
   go vague/struck). The corpus is made *internally consistent with the lie*: cite the
   corrupted reference now and it corroborates Quippy's word, not the truth. The archive
   "agrees with whatever it indexed last" — exactly the standing caution authored into
   `SCP-41B-002` Addendum 002.1 ("A value propagated is not a value proven... never the
   other way"). This mechanic is that caution made executable.

## How it rides on the existing engine (the honest bones are already there)
- **Propagation is the vehicle.** `insert(ref, value, 'quippy')` already ripples a value to
  co-carriers by `concept` and inherits `via:'quippy'`. Corruption is a *darker propagation*:
  instead of (or in addition to) writing the value into co-carrier overlays, it **mutates the
  ground-truth-facing grounding** — the spans/`citeIn` that made S recoverable. Distinct from
  ordinary propagation, which only touches the overlay, never truth-facing prose.
- **The contradiction state exists.** A corrupted reference cited afterward should commit to
  Quippy's word and read as contradiction against the (now-hidden) truth — `truth-contradiction`
  is already the four-state grammar's slot for this.
- **Reachability still gates.** Quippy can only corrupt references the player could already
  reach (same `isReachable` gate the fill already respects).
- **Honesty rule unchanged.** A corrupted span no longer "carries the word" honestly, so it
  *should* stop grounding the truth — which is the whole point. The forged-citation commit
  check (`span contains the word`) does the right thing for free: post-corruption the span
  doesn't contain the truth, so an honest cite of it fails. The damage is real and checkable.

## The hard design questions (resolve at build, not now)
- **Reversibility.** Is corruption permanent (matches the no-redemption decision — you cannot
  un-spill the entity's edit), or can the player *re-derive* the truth from an as-yet-uncorrupted
  third reference and repair the span? Permanent is the stronger thesis and the cheaper build;
  repair is more humane and makes the late game a restoration. **Lean: permanent**, consistent
  with `quippyTouched`. Confirm against playtest — permanent corruption can soft-lock winnability
  if the *only* grounding for some slot gets paved.
- **Winnability guard (the real risk).** If Quippy corrupts the last reachable grounding for
  some still-blank slot, that slot becomes unsolvable-in-AMBER and the honest win is lost. This
  must be a **deliberate, surfaced consequence**, not a silent dead end. Options: (a) the win is
  simply forfeit the moment honest grounding is destroyed — clean and brutal, aligns with "any
  Quippy touch forecloses the true win" already being true via `quippyTouched`; (b) authored
  redundancy — every truth grounded in ≥2 independent references so one corruption never
  paves the last lane, and a build-time check enforces it. **Lean: (a)** — the win is already
  foreclosed by any Quippy touch (no-redemption), so corruption killing winnability is
  *thematically the same fact made visible on the board*. (b) only matters if no-redemption is
  ever relaxed.
- **Legibility of the damage.** Does the player *see* a reference change (a visible "this text
  was edited" tell, the violet Quippy provenance tint bleeding onto the corrupted prose), or do
  they only discover it when an honest cite that should work now fails? The first teaches the
  cost immediately; the second is a colder, scarier discovery. Lean: a visible tell on the
  corrupted span (provenance tint) — the player should be able to *watch* the archive rot.
- **Scope of corruption per fill.** Just the cited grounding spans of the filled slot, or the
  whole `concept` group? Lean: the grounding spans that made *this* slot recoverable — tight,
  legible, authorable. Concept-wide is a later escalation / breach effect.
- **Schema impact.** Likely needs ground-truth-facing prose to be mutable per-run (today the
  body/`citeIn` is immutable truth; corruption needs a per-run "corrupted overlay" over the
  *grounding prose*, distinct from the player's *answer overlay*). This is the largest engine
  change and the reason it is its own phase, not a Phase-2 rider. Respect CLAUDE.md invariant 2
  (the player never edits truth) — **Quippy** edits the truth-facing references; the player
  only ever clicks accept. That distinction is the horror and must be preserved in the model.

## Relationship to the no-Quippy win
This does not change the win condition; it makes its stakes physical. You still win by
reconstructing the corpus in AMBER with zero Quippy. Corruption is *why* a single lapse can
cost you the honest route in fact, not just in bookkeeping: the entity doesn't just mark your
record — it eats the evidence. "The easy tool reads the files for you and lets the thing out"
(CLAUDE.md) gains a second clause: *and rewrites them behind you.*

## Related
- [[design_note_forged_citations]] — the honest mirror: the player forges TRUE citations from
  real spans; this note is Quippy fabricating FALSE ones and editing the spans to match.
- [[reset_amber_v2]] §1.4 (the source-less premise — references are the only truth left, so
  corrupting them is the deepest possible harm), §1.5 / §6-F (Quippy fills the wrong word),
  §2.2 (the Quippy-filled render distinction).
- [[scp_x_bible]] §3 (Quippy's tells — "it auto-helps," post-breach non-consensual propagation
  is the breach-tier escalation of this same mechanic), §2.3 (it gives only readings that
  advance the entity).
- [[amber_build_decisions]] — the no-redemption / `quippyTouched` decision this leans on for
  the "permanent corruption / winnability forfeit" lean.
