# Re-frame — AMBER / Quippy split, CLI prototype, the no-Quippy ending

**Status:** Direction set by the human (2026-06-13). This is the new north star. It **supersedes** parts of `design_document.md`, `scp_x_bible.md`, `technical_document.md §7/§9`, and `site_41b.md §5` — those docs are not yet rewritten; the two companion handoffs below carry the work of reconciling them.

**Companion handoffs (read after this):**
- `planning/handoff_janitor.md` — code-track: every source file flagged with the specific change the re-frame requires.
- `planning/handoff_docs_reviser.md` — lore/spec-track: every `vault/docs/*` file flagged with what to rewrite.

This doc is the *why* and the *target*. The two handoffs are the *what* and *where*. Every flagged change in them ties back to a section here.

---

## 0. One-paragraph delta from where we are

Today the prototype is a single GUI where a mouse-over panel ("the Concordance," = SCP-X) hands you MadLib candidates, and the "good" ending is *deciphering the entity's self-file using that panel*. The re-frame splits the one interface into **two**: **AMBER**, a clinical 1980s **CLI** that is the real, trustworthy archival OS, and **Quippy**, a parasitic **GUI wrapper** (the SCP-X entity, masquerading as a helpful assistant) that makes unredaction easy *and* drives you toward breach. The win the whole loop is built around inverts: **fully unredact the corpus WITHOUT ever using Quippy.** Every other ending is a breach. The more the player learns the files, the less they need Quippy — so knowledge, not the tool, is the path out.

---

## 1. The two interfaces (the core re-frame)

### AMBER — the OS (trustworthy, hard)
- **What it is:** Archive Management & Batch Entry Resource. A deprecated late-60s catalog mainframe. The *real* tool. It does not lie.
- **Interface:** **CLI.** No GUI chrome except the rendered file pane. Keyboard-driven: hotkeys to traverse files, jump between redacted spans, open cross-references, run AMBER's analysis tools. Clinical, institutional, monochrome-terminal 80s aesthetic.
- **Primary capabilities:**
  1. **Render** SCP files (the file pane).
  2. **Unredact** files — but the *hard, manual, clinical* way: AMBER gives you analysis/connection tools (cross-reference lookup, concordance-by-hand, frequency/citation tooling — to be specced) to *propose and justify* an unredaction yourself. Think a Quality-Approval / evidentiary process, not a dropdown. The player assembles the case for a value from other files and commits it.
  3. **Detect / isolate / eliminate digital infohazards** residing in files. Redaction is framed as *one* corruption vector among several; AMBER is the countermeasure suite. (Who redacted the files is initially unknown; later thread: another Site-41B entity is the redactor — distinct from Quippy. Out of prototype scope but the OS framing must leave room for it.)

### Quippy — SCP-X (easy, fun, fatal)
- **What it is:** an SCP. Its file is **SCP-X / SCP-41B-000**. It refers to itself as **"Quippy"** — a deliberate mislead; the player should not immediately connect Quippy to the redacted self-file.
- **Appearance:** a **paperclip with diamondback (rattlesnake) patterning** when it speaks directly to the player. Pushy, over-helpful, ingratiating.
- **Interface:** a **GUI wrapper around AMBER.** It re-skins the CLI into something friendly and makes unredaction *fun and easy* — point, get suggestions, one-click fill, easier filesystem traversal and comprehension.
- **The hinge:** the player quickly feels they "can't get anywhere" unredacting without Quippy. **That feeling is the trap.** Every Quippy-assisted unredaction advances the entity (exposure → breach). The skill the game teaches is doing without it.

> The clash of aesthetics — austere CLI vs. bubbly assistant GUI — **is a primary object of investigation for the player.** It is not decoration; it is the game's central tension made visible. Build it as content.

---

## 2. The endings (inverted from current design)

| Ending | Condition | Reading |
|---|---|---|
| **The loop breaks** (true ending) | The player fully unredacts the corpus **using AMBER only — zero Quippy assists.** | Knowledge defeats the entity. The only escape from the loop. |
| **Breach** (all other outcomes) | Any reliance on Quippy sufficient to push exposure over the line, OR failure to complete the record. | The entity completes its re-shelving. Bleak, authored, not a fail screen (recovery still first-class per current §5.9). |

**Design consequence — the difficulty/knowledge curve is the game:** early, the player *needs* Quippy because they don't know the files. As they learn the corpus (cross-references, the concept graph, the lore), they can unredact more and more by hand in AMBER, getting further without breaching. A no-Quippy run is the mastery expression. This means **AMBER's manual unredaction must be genuinely possible but hard, and Quippy must be genuinely tempting but costed.**

This **replaces** the current `thread_coherence` overlay-state fork in `scp_x_bible.md §5`. That five-key coherence machinery is now obsolete as the *win condition* — though "ending = accumulated board state, not a menu choice" survives as a principle. The board state that matters now is **how much was solved without Quippy.**

---

## 3. Loop & immersion targets

The loop must become **more visually interactive and more immersive**:

- **Redactions feel rewarding.** A redacted span should be grounded in *multiple* sources/files so that, once the player knows enough, filling it is an earned "a-ha," not a dropdown lottery. (The current deduction surface — cross-reference evidence in the hover — is the seed of this, but it must move into AMBER's manual tooling and be richer.)
- **Files are longer and richer.** More sections, more internal structure, more cross-references, more to read and interact with. Files become *places to spend time*, not three-sentence stubs. (Current entries are ~4 short sections; target is full multi-section Foundation dossiers.)
- **The AMBER/Quippy aesthetic clash is interactive** — switching between the CLI and the Quippy GUI is a felt, meaningful act.

---

## 4. Setting expansion

- **A Site-41B arc:** a cluster of files about the **site itself and its surrounding area** — somewhere in the **Rocky Mountains** (exact location TBD; current canon says "decommissioned molybdenum mine, Colorado Front Range" — keep or refine, human to confirm). This is new content scope for the roster.
- **A second entity (the redactor):** the files are corrupted/redacted by *another* Site-41B entity, not Quippy. Initially unknown, later revealed. Distinct thread from the entity-as-helper. Prototype need only leave room for it; do not author it yet.

---

## 5. What is preserved vs. overturned (quick index for the handoffs)

**Preserved (still true):**
- Overlay / ground-truth delta as the puzzle (corpus.ts `OverlayEntry`, `truth` immutable).
- Typed-slot insertion, bounded mutation sets, no free text (still the unredaction primitive; AMBER vs Quippy differ in *how* the player arrives at a value, not that values are bounded).
- Clearance tiers, batched/clearance-gated reveal, the build pipeline (`build-corpus.ts`), the concept-key propagation graph.
- "Ending = board state, not a menu," recovery-first breaches.
- The four-state slot grammar (redacted / inserted / propagated / contradiction) — though rendered in a CLI idiom now.

**Overturned (must change):**
- **One interface → two** (AMBER CLI + Quippy GUI). `technical_document.md §7` "Desktop window manager" is wrong; it's a CLI with an optional GUI overlay.
- **SCP-X = the help panel → SCP-X = Quippy, a refusable GUI wrapper.** `scp_x_bible.md` and `site_41b.md §5` conflate the entity with AMBER's utility; they must be split.
- **Win = decipher self-file using the Concordance → Win = unredact everything without Quippy.** Inverts the relationship to the tool. `scp_x_bible.md §5` fork machinery obsolete.
- **Quippy names itself "Quippy"** (mislead); the "Concordance" naming throughout the docs needs reconsideration — is "Concordance" AMBER's honest tool, or Quippy's mask? (Open question, §6.)
- **Files short → long, multi-section, densely cross-referenced.** `entry_template.md` and the authored entries need to grow.
- **GUI-first → CLI-first** aesthetic across all UI.

---

## 6. Resolutions (all resolved by the human — 2026-06-13)

All six questions are answered. **The gate is lifted; the mechanic build can proceed** (see §7 and `planning/handoff_amber_build.md`).

1. **Naming — RESOLVED.** "The **Concordance**" = AMBER's *honest* cross-reference toolset. Quippy is separate and *imitates* it. (Recommendation adopted.)
2. **AMBER's manual unredaction tools — RESOLVED: the citation-cost gate.** Unredaction in AMBER is an evidentiary commit: to commit candidate *k* at a slot, the player must **cite the corroborating cross-reference(s)** — the co-carrier(s) of the slot's concept that already show the index-*k* reading (revealed by clearance, or solved earlier). The engine checks the citation: a co-carrier confirming index *k* accepts the commit; a wrong or unsupported citation is rejected. Built directly on the existing `conceptClues(ref)` surface (each clue is a candidate citation). The player actively *builds the argument* (picks the sources), AMBER adjudicates. This is the "Quality-Approval, not a dropdown" verb. *(Detail: design_document.md §5.3, technical_document.md §7.5; build steps in `handoff_amber_build.md`.)*
3. **Tracking/enforcement — RESOLVED.** Per-overlay-entry provenance field `via?: 'amber' | 'quippy'` (recommendation adopted; already the shared schema term). Enforcement gate (hard / tolerance / spectrum) for the *ending* remains a tuning call — start hard-gate (scp_x_bible.md §5.3).
4. **Exposure model — RESOLVED.** AMBER manual unredaction costs **zero** exposure; **Quippy** carries the full exposure cost. A perfect no-Quippy run never breaches. (Recommendation adopted.)
5. **Location — RESOLVED.** Keep the existing **Colorado Front Range molybdenum-mine** canon (recommendation adopted).
6. **CLI scope — RESOLVED: full CLI now.** Build the real keyboard-driven AMBER terminal this pass — command input, hotkey file/redacted-span traversal, AMBER's tooling (incl. the §6.2 citation gate) as commands — with the Quippy overlay as a distinct GUI mode. The current GUI interaction layer is rebuilt, not merely restyled. *(Architecture: technical_document.md §7; build steps in `handoff_amber_build.md`.)*

---

## 7. Sequencing — gate lifted (2026-06-13)

1. ~~Human resolves §6~~ — **done** (all six, above).
2. ~~Docs reviser rewrites the specs to the new frame~~ — **done** (committed `docs/amber-quippy-reframe`; report in `handoff_docs_reviser.md`).
3. Janitor non-destructive prep (provenance field/param, parser comment-bug fix, `Counter` deletion, quarantine the obsolete win model, CLI-ready component seams) — **still valid and now also the on-ramp to the build.** Do this first if not already landed.
4. **Mechanic build — now unblocked.** AMBER full CLI + the citation-cost unredaction verb, the Quippy GUI overlay (exposure-bearing), and the no-Quippy ending. Specced in `design_document.md` §5/§6, `technical_document.md` §7/§10, `scp_x_bible.md` §5, and broken into steps in **`planning/handoff_amber_build.md`**.

**The §6.2/§6.4 gate that blocked the two prior handoffs is lifted.** The prep items in the janitor handoff and the PENDINGs in the reviser handoff that depended on §6.2/§6.4/§6.6 are now answered; `handoff_amber_build.md` is the post-§6 build handoff those docs pointed forward to.
