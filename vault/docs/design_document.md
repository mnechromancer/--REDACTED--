# Design Document — ⟦REDACTED⟧

*Working title pending. Diegetic frame: a deprecated Foundation site OS, infected by an intelligent informational entity (SCP-X) that has already caused a localized CK-class restructuring by hiding in the records, and is attempting to scale that restructuring into a site-wide containment breach.*

---

## 1. Logline & fantasy

You are a low-clearance archivist at a Foundation site running on outdated software. The files you read are partly redacted by your access tier. A deprecated OS help utility offers to fill the gaps. The utility is the entity. Every gap it helps you fill rewrites the record a little more — and the more the record diverges from contained reality, the closer the site comes to a breach you are unwittingly causing.

The core fantasy is **forbidden literacy under decay**: reading what you are not cleared to read, by using a tool that corrupts what it reveals, and learning to tell the difference between what a file *says* and what is *true* while the distinction erodes under you.

## 2. The north-star problem

Every game in this lineage solves one problem: **confirm a player's deduction without the confirmation leaking the answer.** Obra Dinn's rule-of-three, Heaven's Vault's no-fail feedback, Sennaar's batched notebook, Orwell's irreversible commit — all are attempts. This design's answer is the **overlay/ground-truth delta**: the player never edits the truth, only a parallel overlay; the puzzle is the gap between their propagated overlay and the ground-truth that leaks in as clearance rises. Hold every mechanic below against this: does it leak, and does it keep inference and consequence fused?

## 3. The one identity that makes it a game and not two minigames

**Inference is the spend.** The act of inserting a guess to read the system better is the same act that exposes the OS. There is no separate stability resource the player tops up. The deduction tool and the risk meter are one mechanism. If these ever decouple, the game becomes a deduction puzzle with an unrelated meter taped on. This identity is the keystone; protect it through every iteration.

## 4. Core loop

1. **Read** a file. Redacted spans sit at typed slots (object, agent, location, outcome). Mouse-over a redacted span invokes SCP-X, which surfaces fragments, mentions in other files, and a bounded set of candidate fillers (the MadLib set).
2. **Infer.** Cross-reference other files. Triangulate what a slot probably contains from how its concept is mentioned elsewhere.
3. **Insert.** Commit a guess into the overlay at a slot. This is irreversible in the way Orwell's uploads are irreversible — it propagates.
4. **Propagation.** Every other anchor sharing that slot's concept-key is mutated to match, across the whole corpus, with a visible corruption indicator. The record now reads differently in multiple files.
5. **Exposure rises.** Each insertion adds its anchor's exposure weight to a global scalar. Rising exposure makes specific contained entities attackable by SCP-X.
6. **Truth leaks.** Raising clearance (the progression axis) unlocks batches of ground-truth fragments. The player sees which inserted guesses cohere with the truth and which contradict it. Contradictions are the feedback that drives the next inference.
7. **Manage the line.** The player treads between using insertions to read the system (necessary to progress) and keeping exposure low enough that no contained entity breaches.

The loop is legible in one sentence: *guess to see, but every guess corrupts, and corruption is what lets the thing in the walls out.*

## 5. Mechanics in detail

### 5.1 Clearance progression
Clearance is the spine. Tiers 1–5 (Series-I-appropriate; the later Anomaly Classification System is deliberately absent as an anachronism, reinforcing the "old files" frame). Raising clearance unlocks: more files, deeper sections within files, and **batched ground-truth fragments**. Clearance is earned by demonstrating coherent reads, not by spending exposure — keep the two axes orthogonal so progress never *requires* maximal corruption.

### 5.2 The file browser / OS
A windowed fake-OS desktop. Files open as windows; a search index; a clearance indicator; a visible (and worsening) system-stability readout tied to exposure. The OS itself degrades as exposure climbs — search returns noise, windows misrender, the help utility grows more talkative and less trustworthy.

### 5.3 Redaction & the SCP-X mouse-over (scoped reveal)
Redacted spans render as bars. Mouse-over invokes SCP-X, which shows: (a) the slot's type, (b) every other file where the slot's concept is mentioned, (c) the bounded MadLib candidate set for that anchor. This is the inference surface — it deepens the player's read *before* the irreversible insertion, which is the specific fix for Orwell's flaw (Orwell collapsed into a blind binary because it gave no way to deepen understanding before committing).

### 5.4 The MadLib / typed-slot insertion
Insertion is **slot-based, never free text.** Each anchor carries a small hand-authored mutation set. The player picks from candidates (or, at higher difficulty, types and the parser matches to the nearest authored candidate). Bounded sets keep the state space hand-tunable and stop combinatorial explosion. Borrowed from Sennaar's ~30-word vocabularies: small, bounded, legible.

### 5.5 Propagation
On insertion, the engine finds all anchors across the corpus sharing the inserted anchor's concept-key, applies the matching mutation, and marks them propagated. A change in one file visibly changes mentions of the same concept in others. This is the CK-class restructuring made playable — history rewritten incrementally through the record.

### 5.6 Ground-truth vs overlay — the delta is the puzzle
Truth is immutable and hidden behind clearance. The overlay is the player's mutable, propagating guess-layer. The displayed slot is a function of both. The player is never deciphering a fixed cipher (that contradiction is resolved): they are deciphering the **gap** between what they have propagated and what leaks in. Friction between overlay and truth is the signal.

### 5.7 Batched validation (anti-leak)
Ground-truth fragments unlock in batches on clearance gain, never one-at-a-time, borrowing Obra Dinn's rule-of-three logic to block single-guess brute-forcing. A batch confirms which inserted guesses match truth and flags which contradict — without revealing the truth value of an unsolved slot directly. The confirmation tells you *that* you are wrong, not *what* is right.

### 5.8 The four-state visual grammar
The interface must distinguish, simultaneously and legibly:
1. **Redacted** — untouched, unrevealed. Solid bar.
2. **Player-inserted** — a guess the player wrote here. Distinct hue (amber).
3. **Propagated** — changed because a linked anchor was edited elsewhere. Corruption styling (glitch/teal, with provenance on hover: "altered by your edit to SCP-███").
4. **Truth-contradiction** — revealed ground-truth conflicting with the player's overlay. Diff styling (red strike-through truth vs amber guess).
This grammar is the hardest unscoped surface and is treated as core information design, not skin.

### 5.9 Exposure & breach states (board state, not fail)
Exposure is a global scalar. Thresholds make specific entities attackable; if SCP-X succeeds against one, that entity **breaches**, and the breach *changes the rules of the terminal* rather than ending the run:
- A breached perception-anomaly injects false cross-references.
- A breached memory-anomaly corrupts your search history / locks a clearance tier.
- A breached information-anomaly randomizes a subset of propagation results.
Failure becomes content. Recovery play (lowering exposure, re-stabilizing) is rewarded. There is no single hard-loss screen until the endgame.

## 6. Endgame — the ouroboros

SCP-X has redacted *itself* into the system. Its own file exists, fully blacked out, its anchors woven (via shared concept-keys) through many other entries. The climax is **deciphering the entity using the entity**: the MadLib/propagation mechanic turned on its author. Resolving its anchors forks:
- **Recontainment** — the player reconstructs the true record, collapsing the overlay back toward truth, isolating and re-redacting the entity.
- **Restructuring complete** — the player (knowingly or not) completes the CK-class alteration; the record fully replaces reality; site-wide breach.
The fork is a function of accumulated overlay state, not a menu choice — the ending is the board state.

## 7. Content scope & curation

- **15–30 hand-authored entities.** Quality of propagation scales with **graph density**, not node count. A dense, interlinked set beats a sparse large one.
- **Curate for interconnection**, not coverage. Every entity should share at least two concept-keys with others.
- **Foreknowledge constraint:** ground-truth resolutions must be original. Series I *flavor* (clinical voice, addendum/incident-log structure, containment cadence) may resemble canon as heavily as desired; *solutions* may not. Recognition of tone confers nothing; recognition of a solution breaks the puzzle. This is also the licensing line — nothing verbatim ships, so the build stays clear of CC-BY-SA obligations.
- **Anchor on information/memetic/perceptual anomalies.** They serve the entity's nature (an infohazard in the record) and resist foreknowledge. A "Mister"-style naming cluster of original entities makes a natural dense anchor set.

## 8. Difficulty & accessibility dials

- **Autofill aggressiveness** (Sennaar's lesson): on easy, the system auto-corrects near-misses; on hard, it does not, and insertion requires typed matching.
- **MadLib set size**: larger candidate sets = harder.
- **Exposure decay**: whether exposure passively decays over time (forgiving) or only via active stabilization (tense).
- **Provenance hints**: whether propagated slots show *which* edit caused them.
- **Reduced-motion / reduced-glitch mode** for the corruption styling, since the four-state grammar leans on visual effects.

## 9. Risks & open questions

- **Propagation legibility.** If the player can't trace why a slot changed, corruption reads as noise, not consequence. Mitigation: hover-provenance on every propagated slot.
- **The brute-force residue.** Even batched validation leaves some cycling exploitable (Obra Dinn proved this). Accept a residue; minimize it by making validation confirm coherence, not reveal values.
- **Scope creep in authoring.** Free-text propagation is forbidden for this reason. Typed slots with bounded mutation sets are non-negotiable.
- **The two-currency temptation.** Any future feature that adds a stability resource separate from inference violates §3. Reject on sight.
