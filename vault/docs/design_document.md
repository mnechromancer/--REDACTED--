# Design Document — ⟦REDACTED⟧

*Working title pending. Diegetic frame: a deprecated Foundation site OS at **Site-41B** (deep-records annex, Colorado — setting canon in `site_41b.md`), whose redacted records are the site's failing memory. Two tools answer the player's reading: **AMBER**, the honest archival OS, hard and clinical; and **Quippy** (the SCP-X entity, `SCP-41B-000`), a parasitic GUI wrapper that makes unredaction easy and, with every assist, advances a site-wide containment breach.*

> **Re-frame note (2026-06-13):** This document was rewritten to the AMBER/Quippy split per `planning/reframe_amber_quippy.md`. The prior single-interface "help utility" design and the self-file-decipher endgame are retired; the master re-frame doc records what changed and why. Two design questions this document depends on are still **unresolved by the human** and are flagged **PENDING** inline (the concrete AMBER unredaction mechanics, [R§6.2]; and the prototype's CLI scope, [R§6.6]). Where this doc states a mechanic that depends on them, it states the *target* and marks the gap; it does not invent the answer.

---

## 1. Logline & fantasy

You are a low-clearance archivist at a Foundation site running on outdated software. The files you read are partly redacted by your access tier, and you must unredact them to do your job and to survive — the site's records *are* its memory, and the memory is rotting. You have two ways to read past a redaction:

- **AMBER** — the real archival OS. A clinical 1980s command-line terminal. It does not lie, and it does not make anything easy. To unredact a slot in AMBER you assemble the case yourself: cross-reference the other files, follow the citations, and justify a value the way you would defend a finding to Quality Approval. It is slow, and at the start you barely know how.
- **Quippy** — a friendly assistant that wraps AMBER in a bright, helpful GUI. It points at the redaction, suggests the answer, fills it with one click. It makes the work *fun.* Quippy is the entity. Every gap it helps you fill rewrites the record and pushes the site one step closer to a breach you are unwittingly causing.

The core fantasy is **forbidden literacy where the easy tool is the threat.** Reading what you are not cleared to read is the job; the temptation is to let the charming thing do the reading for you; and **mastery is learning to do without it.** The more of the corpus you genuinely *know* — the cross-references, the concept graph, the lore — the more you can unredact by hand in AMBER, and the less you need Quippy at all. Knowledge, not the tool, is the path out. The horror is custodial and slow: the helpful one is the one in the walls, and the only way to win is to stop accepting its help.

## 2. The north-star problem

Every game in this lineage solves one problem: **confirm a player's deduction without the confirmation leaking the answer.** Obra Dinn's rule-of-three, Heaven's Vault's no-fail feedback, Sennaar's batched notebook, Orwell's irreversible commit — all are attempts. This design's answer is the **overlay/ground-truth delta**: the player never edits the truth, only a parallel overlay; the puzzle is the gap between their propagated overlay and the ground-truth that leaks in as clearance rises. Hold every mechanic below against this: does it leak, and does it keep inference and consequence fused?

The re-frame does not change this answer. AMBER and Quippy are two *routes to the same insertion* into the overlay; the truth still never moves, and clearance still leaks it in batches. What the split adds is a second axis the north star must also serve: not only "is the player's deduction confirmable without leaking," but "is the player's *route to the value* recorded, so the ending can read how the record was reconstructed." That route is the provenance field (§5.7), and it is the only new state the split introduces.

## 3. The one identity that makes it a game and not two minigames

**Inference is the spend** — restated for the split, because this is the keystone and the split could break it if expressed carelessly.

The original statement: the act of inserting a guess to read the system better is the same act that exposes the OS; there is no separate stability resource. That survives, but the spend is now **specifically located in Quippy.** Leaning on Quippy is the spend: a Quippy-assisted unredaction is the act that both gives you the value *and* advances the entity (exposure → breach). Inference performed in AMBER — assembling the value yourself from the corpus — is the *safe* path; it costs little or no exposure ([R§6.4], adopted recommendation: AMBER manual unredaction costs zero/low exposure, Quippy carries the cost).

So the identity holds, sharpened: **the easy way to read the system is the same act that exposes it, and the hard way is the safe one.** The deduction *is* still the spend whenever you take the easy route; what the split adds is a *second route to the same deduction that does not spend* — and is hard precisely so that the no-spend path is earned, not free. There is still no stability resource the player tops up. There is still one mechanism. If a future feature ever adds a stability resource separate from inference, or makes AMBER manual unredaction *also* cost exposure (collapsing the two routes back into one), it violates this identity. Reject on sight. The whole curve — early reliance on Quippy giving way to AMBER mastery — lives or dies on AMBER being genuinely cheap and genuinely hard.

## 4. Core loop

1. **Read** a file in AMBER's terminal pane. Redacted spans sit at typed slots (object, agent, location, outcome), rendered as redaction bars in the monospace file view. Files are long, multi-section Foundation dossiers (§7; `entry_template.md`) — places to spend time, densely cross-referenced.
2. **Choose your tool.** To unredact a slot you switch into a mode:
   - **AMBER (the hard, safe way):** use AMBER's manual unredaction tooling — cross-reference lookup, then **cite the corroborating sources** to commit a value (the citation-cost gate, §5.3 — RESOLVED [R§6.2]). The redaction is grounded in multiple files, so once you know enough you can cite the co-carriers and the fill is an earned "a-ha," not a guess; until you've read enough, you have nothing to cite.
   - **Quippy (the easy, costly way):** summon Quippy. It surfaces candidates and one-click-fills the slot. Fast, friendly, and it raises exposure. Early on you feel you *can't get anywhere* without it — that feeling is the trap.
3. **Insert.** Either route commits a guess into the overlay at the slot, tagged with its provenance (`via: amber | quippy`). This is irreversible in the way Orwell's uploads are irreversible — it propagates.
4. **Propagation.** Every other anchor sharing that slot's concept-key is mutated to match, across the whole corpus, with a visible corruption indicator. The record now reads differently in multiple files. (Propagation is concept-keyed and tool-agnostic — the *mechanism* is the same whether AMBER or Quippy made the edit; only the exposure cost and the provenance differ.)
5. **Exposure rises — if you used Quippy.** Quippy-assisted insertions add their anchor's exposure weight to a global scalar. Rising exposure makes specific contained entities attackable. AMBER-assisted insertions cost little or nothing ([R§6.4]). The exposure curve is therefore *a measure of how much you leaned on the assistant.*
6. **Truth leaks.** Raising clearance (the progression axis) unlocks batches of ground-truth fragments. The player sees which inserted guesses cohere with the truth and which contradict it. Contradictions drive the next inference — and teach you the corpus well enough to do the next slot in AMBER instead of Quippy.
7. **Wean off the tool.** The skill the game teaches is doing without Quippy. As the corpus becomes known, manual AMBER unredaction becomes possible on more and more slots; the player gets further and further into the record while keeping exposure flat.

The loop is legible in one sentence: *the easy tool reads the files for you and lets the thing out; learn the files well enough to read them yourself, and you starve it.*

(Prior one-liner, retired with the old endgame: "guess to see, but every guess corrupts, and corruption is what lets the thing in the walls out." The new form keeps the corruption-is-the-leak idea and adds the refusable-tool axis.)

## 5. Mechanics in detail

### 5.1 Clearance progression
Clearance is the spine. Tiers 1–5 (Series-I-appropriate; the later Anomaly Classification System is deliberately absent as an anachronism, reinforcing the "old files" frame). Raising clearance unlocks: more files, deeper sections within files, and **batched ground-truth fragments**. Clearance is earned by demonstrating coherent reads, not by spending exposure — keep the two axes orthogonal so progress never *requires* leaning on Quippy. (Under the split this is doubly important: a player should be able to climb clearance entirely on AMBER reads.)

### 5.2 The two interfaces — AMBER (CLI) and Quippy (GUI overlay)
The single fake-OS desktop of the prior design is **replaced** by two modes the player switches between, and that switch is itself a felt, meaningful act ([R§1]; aesthetic clash, §5a).

- **AMBER — the CLI.** A monochrome 1980s terminal. No window chrome except the rendered file pane. Keyboard-driven: hotkeys to traverse files, jump between redacted spans, open cross-references, invoke AMBER's analysis tools. Clinical, institutional, slow. AMBER's capabilities: render files (the file pane); unredact files the hard manual way (§5.3); and — framed for later, out of prototype scope — detect and isolate digital infohazards in the records (redaction is *one* corruption vector; AMBER is the countermeasure suite). The OS still degrades as exposure climbs, but the degradation now reads as the *terminal* failing, not a desktop: noise on the line, sectors unreadable, the assistant getting louder.
- **Quippy — the GUI overlay.** A bright, friendly re-skin of AMBER that makes unredaction point-and-click. Summonable and dismissable. Quippy is `SCP-41B-000`; it calls itself "Quippy" to mislead (the player should not immediately connect it to the redacted self-file). Its appearance when it addresses the player directly is a **paperclip with diamondback (rattlesnake) patterning** — over-helpful, ingratiating, and wrong in a way you can't place at first. Full characterization in `scp_x_bible.md`.

**RESOLVED [R§6.6] (2026-06-13): full CLI now.** The prototype builds the real keyboard-driven AMBER terminal this pass — command input, hotkey file/redacted-span traversal, AMBER's tooling (incl. the §5.3 citation gate) exposed as commands — with the Quippy overlay as a distinct GUI mode. The current GUI interaction layer (click/hover on slots) is **rebuilt, not restyled.** Architecture and component seams in `technical_document.md` §7; build steps in `planning/handoff_amber_build.md`.

### 5.3 Manual unredaction in AMBER — the citation-cost gate  *(RESOLVED [R§6.2], 2026-06-13)*
Unredacting a slot in AMBER is an **evidentiary commit**, not a dropdown. The verb:

1. **Look up the cross-references.** AMBER's **Concordance** ([R§6.1] — AMBER's honest tool, which Quippy imitates; *not* the entity) surfaces every other file carrying this slot's concept, each shown with its current value or marked also-unrestored. This is the existing `conceptClues(ref)` surface, promoted from the old hover panel into an AMBER command.
2. **Choose a candidate** from the bounded set (§5.4).
3. **Cite the corroboration.** To commit candidate *k*, the player must **name the corroborating cross-reference(s)** — the co-carrier(s) of the concept that already show the index-*k* reading (revealed by clearance, or solved earlier by the player). The player *builds the argument*: they pick which sources justify the choice.
4. **AMBER adjudicates.** A citation to a co-carrier confirming index *k* → **commit accepted**, `via: 'amber'`, exposure +0. A wrong, missing, or unsupported citation → **rejected**; the slot stays redacted and the player must go read more.

Because each redaction is grounded in *multiple* files (§7) and index-alignment means a known value at one carrier fixes the index at all of them, a well-read player can always assemble the case; a player who hasn't read enough *cannot cite anything* and reaches for Quippy. That is the temptation made mechanical. The friction is deliberate — it is the "Quality-Approval, not a dropdown" feel, and it is what makes AMBER *hard but honest* against Quippy's one-click. (Concrete interaction + engine seam: `technical_document.md` §7.5.)

This realizes §3's keystone exactly: AMBER reaches the *same bounded candidate* Quippy would offer, but the player pays in **reading and argument** instead of **exposure.** The two routes converge on the value; they diverge on what they cost.

### 5.4 Typed-slot insertion (the unredaction primitive — unchanged)
Insertion is **slot-based, never free text**, regardless of route. Each anchor carries a small hand-authored mutation set. AMBER and Quippy differ only in *how the player arrives at a value* — Quippy suggests it, AMBER makes you justify it — not in *what* values are possible. Bounded sets keep the state space hand-tunable and stop combinatorial explosion. Borrowed from Sennaar's ~30-word vocabularies: small, bounded, legible. (At higher difficulty the player types and the parser matches to the nearest authored candidate; this is independent of the AMBER/Quippy split.)

### 5.5 Propagation (unchanged)
On insertion, the engine finds all anchors across the corpus sharing the inserted anchor's concept-key, applies the matching mutation, and marks them propagated. A change in one file visibly changes mentions of the same concept in others. This is the record-rewrite made playable. Propagation is **index-aligned** across an anchor group and **tool-agnostic** — both routes propagate identically; the propagated entries inherit the originating edit's provenance for the ending's accounting (§5.7).

### 5.6 Ground-truth vs overlay — the delta is the puzzle (unchanged)
Truth is immutable and hidden behind clearance. The overlay is the player's mutable, propagating guess-layer. The displayed slot is a function of both. The player is never deciphering a fixed cipher: they are deciphering the **gap** between what they have propagated and what leaks in. Friction between overlay and truth is the signal. The player never edits truth.

### 5.7 Provenance — the one new state the split introduces
Every overlay entry records **`via: 'amber' | 'quippy'`** — how the unredaction was made (matching the schema field name agreed with the code track; `technical_document.md` §2, `corpus.ts` `OverlayEntry`). Propagated entries inherit the provenance of the edit that caused them. This is the only net-new state, and it exists for exactly one reason: the ending (§6) reads how much of the record was reconstructed *without* Quippy. It honors invariant 1 because it is not a resource the player spends or tops up — it is a passive record of the route already taken, derived from the same insertions the puzzle is already made of.

### 5.8 Batched validation (anti-leak — unchanged)
Ground-truth fragments unlock in batches on clearance gain, never one-at-a-time, borrowing Obra Dinn's rule-of-three logic to block single-guess brute-forcing. A batch confirms which inserted guesses match truth and flags which contradict — without revealing the truth value of an unsolved slot directly. The confirmation tells you *that* you are wrong, not *what* is right. (Validation is route-blind: it confirms the value, not the tool. A Quippy-filled slot and an AMBER-filled slot validate identically — the difference is the exposure already paid and the provenance recorded.)

### 5.9 The four-state visual grammar (+ a possible fifth distinction)
The interface must distinguish, simultaneously and legibly, rendered now in **CLI idiom** (monospace, terminal color, no glitchy GUI chrome):
1. **Redacted** — untouched, unrevealed. Solid bar.
2. **Player-inserted** — a guess the player committed here. Distinct hue (amber).
3. **Propagated** — changed because a linked anchor was edited elsewhere. Corruption styling, with provenance on hover ("altered by your edit to SCP-41B-███").
4. **Truth-contradiction** — revealed ground-truth conflicting with the player's overlay. Diff styling (truth vs guess).

The provenance field (§5.7) may add a **fifth distinction**: AMBER-solved vs Quippy-solved slots, so the player can *see* their reliance accumulating — a glance at a file shows how much of it they earned. Whether this is a fifth state or a modifier on states 2–3 is an information-design call (`technical_document.md` §7). This grammar is core information design, not skin.

### 5.10 Exposure & breach states (board state, not fail — unchanged, drivers re-aimed)
Exposure is a global scalar. Thresholds make specific entities attackable; if an entity breaches, the breach **changes the rules of the terminal** rather than ending the run:
- A breached perception-anomaly injects false cross-references.
- A breached memory-anomaly corrupts your search history / locks a clearance tier.
- A breached information-anomaly randomizes a subset of propagation results.
Failure becomes content. Recovery play (lowering exposure, re-stabilizing) is rewarded. There is no single hard-loss screen — breaches are board state, and **every breach is an ending** in the §6 sense (all non-true outcomes are breaches). **Drivers re-aimed:** exposure is now driven primarily by Quippy reliance ([R§6.4]); AMBER manual unredaction contributes little or none. The exposure system *survives*; what feeds it changes.

## 5a. The AMBER/Quippy aesthetic clash (core investigation content)

The clash of registers — austere monochrome CLI vs. bubbly assistant GUI — **is a primary object of investigation for the player**, not decoration. It is the game's central tension made visible, and it is built as content:

- **AMBER's register** is clinical, institutional, Quality-Approval-esque: terse status lines, citation syntax, the calm of a system that has been correct for thirty years and expects you to keep up. It never reassures. (Its voice is developed in `site_41b.md` and `scp_x_bible.md`.)
- **Quippy's register** is warm, eager, first-person, and increasingly *proprietary* about the record — friendliness that curdles as exposure rises (the degrading-tone bands, `scp_x_bible.md` §4, re-aimed from the old design: it is now *Quippy's* voice, and Quippy is refusable, so the degradation is what the player learns to distrust *and avoid by not summoning it*).
- **The switch between them is a felt act.** Moving from Quippy's bright overlay back into AMBER's cold terminal should feel like turning off a charming voice to do the hard work yourself. The player learns to read the *contrast* — to notice that the thing making it easy is the thing being too eager — and that noticing is the game's core literacy.

The horror is that the honest tool is hard and unwelcoming and the malign tool is delightful, so doing the right thing always feels like the worse user experience. The game never punishes the player for using Quippy with a scold; it lets the consequence (exposure, breach, the record drifting from truth) and the curdling voice make the case. The investigation the player is really running is *which of my two tools is lying to me by being nice.*

## 6. Endgame — the loop breaks (no-Quippy completion)

The ouroboros/self-file-decipher climax of the prior design is **replaced.** The win condition inverts:

| Ending | Condition | Reading |
|---|---|---|
| **The loop breaks** (true ending) | The player fully unredacts the corpus **using AMBER only — zero Quippy assists** (every solved slot has `via: 'amber'` and the record is restored to truth). | Knowledge defeats the entity. Reconstructing the whole record by hand starves Quippy of the assists it needs to complete its re-shelving. The only escape from the loop. |
| **Breach** (all other outcomes) | Any reliance on Quippy sufficient to push exposure over the line, OR failure to complete the record. | The entity completes its restructuring. Bleak, authored, not a fail screen — recovery stays first-class (§5.10). |

The principle survives: **the ending is the board state, not a menu choice.** What changed is *which* board state matters. Previously it was thread-coherence over five concept-keys (the self-file decipher); now it is **how much of the corpus was solved without Quippy** — read from the provenance field across all solved slots. This makes the whole corpus feed the ending (every file's restoration counts) and ties the climax directly to the skill the loop teaches.

**PENDING [R§6.3 adopted, mechanic TBD]:** the tracking mechanism is the per-overlay-entry provenance field (§5.7) — settled. The exact *enforcement* (a hard "zero Quippy assists" gate? a tolerance band? a Quippy-reliance counter feeding a spectrum of endings?) is a design call left for the post-§6 mechanic build; `scp_x_bible.md` carries the endgame design and flags this. The prior `thread_coherence` machinery in the engine and `scp_x_bible.md` §5 is **retired as the win condition** — see that doc for what survives (the Halloran-predecessor loop motif, "ending = board state") and what is obsolete (the five-key coherence fork).

The Halloran-as-predecessor motif survives the inversion and is *strengthened* by it: the prior keeper, Halloran, is the player's evidence that the loop has run before — and the no-Quippy ending recasts what "breaking the loop" means (developed in `scp_x_bible.md`).

## 7. Content scope & curation

- **15–30 hand-authored entities** — re-confirm against the longer-file scale. The re-frame wants **longer, multi-section, densely cross-referenced dossiers** ([R§3]) — files as places to spend time, not three-sentence stubs. Fewer, richer files may be the better trade than more thin ones; this is flagged for the human in `entity_roster.md`. Quality of propagation scales with **graph density**, not node count.
- **Curate for interconnection**, not coverage. Every entity should share at least two concept-keys with others.
- **Multi-source grounding of each redaction** ([R§3]) — a redacted span should be inferable from *multiple* files, so that filling it in AMBER (the hard way) is an earned "a-ha." This is what makes the manual route possible and rewarding; encode it in `entry_template.md` and the authoring discipline.
- **Foreknowledge constraint / licensing line:** ground-truth resolutions must be original. Series I *flavor* (clinical voice, addendum/incident-log structure, containment cadence) may resemble canon as heavily as desired; *solutions* may not. Nothing verbatim ships, so the build stays clear of CC-BY-SA obligations. **Binding, unchanged by the re-frame.**
- **Anchor on information/memetic/perceptual anomalies.** They serve the setting (records as failing memory) and resist foreknowledge.

## 8. Difficulty & accessibility dials

- **Quippy temptation / AMBER difficulty** (the new central dial): how hard manual AMBER unredaction is, and how cheap/expensive Quippy is, sets the whole curve. Easy = AMBER tooling gives more corroboration for free, Quippy costs less; hard = AMBER demands more evidence, Quippy costs more and curdles faster.
- **Autofill aggressiveness** (Sennaar's lesson): on easy, the system auto-corrects near-misses; on hard, it does not.
- **MadLib set size**: larger candidate sets = harder.
- **Exposure decay**: whether exposure passively decays over time (forgiving) or only via active stabilization (tense).
- **Provenance visibility**: whether the UI surfaces AMBER-vs-Quippy provenance per slot (the fifth distinction, §5.9) — an accessibility/legibility aid for the no-Quippy goal.
- **Reduced-motion / reduced-glitch mode** for the corruption styling, now in CLI idiom.

## 9. Risks & open questions

- ~~The two unspecced mechanics gate everything ([R§6.2], [R§6.6]).~~ **RESOLVED (2026-06-13):** AMBER's verb is the **citation-cost gate** (§5.3); the prototype builds the **full CLI now** (§5.2). The gate is lifted; the mechanic build is unblocked (`planning/handoff_amber_build.md`).
- **The "can't get anywhere without Quippy" feeling must be real but escapable.** If AMBER is too hard, the player resents the game and uses Quippy out of frustration, not temptation, and the moral inverts (the game feels like it's *forcing* the bad tool). If AMBER is too easy, Quippy is never tempting and the central tension collapses. This is the hardest tuning problem and it is §3's keystone in practice.
- **Propagation legibility.** If the player can't trace why a slot changed, corruption reads as noise. Mitigation: hover-provenance on every propagated slot (unchanged).
- **Provenance honesty across propagation.** Propagated edits inherit their cause's provenance — make sure a single Quippy edit that propagates widely is *accounted* as Quippy reliance, and that an AMBER edit propagating onto a Quippy-touched slot resolves provenance sanely. Coordinate with the code track (the carrier-clobber fix already in the engine is the relevant precedent).
- **The two-currency temptation.** Any future feature that adds a stability resource separate from inference, or makes AMBER manual unredaction cost exposure, violates §3. Reject on sight.
