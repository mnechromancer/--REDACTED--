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

## 6. Open questions (human to resolve; handoffs should flag, not assume)

1. **Naming:** Is "the Concordance" now AMBER's *honest* manual-unredaction toolset, or is it Quippy's mask (the old meaning)? The split forces a choice. Recommend: "Concordance" = AMBER's legitimate cross-reference tool; Quippy is separate and *imitates* it. Confirm.
2. **What exactly are AMBER's manual unredaction tools?** §1 lists the intent (cross-ref lookup, concordance-by-hand, citation tooling) but the concrete mechanics are unspecced. This is the single biggest design gap and gates the code work.
3. **How is "without Quippy" tracked and enforced?** Per-unredaction provenance flag (`source: 'amber' | 'quippy'`)? A global "Quippy reliance" counter feeding the ending? (Recommend a per-overlay-entry provenance field; see janitor handoff.)
4. **Exposure model under the split:** does AMBER manual unredaction cost *zero* exposure (so a perfect no-Quippy run never breaches) and Quippy cost the exposure? That cleanly realizes the curve. Confirm.
5. **Rocky Mountains location** — keep the existing Colorado molybdenum-mine canon or relocate?
6. **CLI scope for the prototype** — full keyboard-driven CLI now, or CLI file-rendering with the existing interaction model first and CLI traversal next? (Affects how much of the current Svelte UI is rebuilt vs. restyled.)

---

## 7. Suggested sequencing (not binding)

1. Human resolves §6 open questions (esp. #2 AMBER tooling and #4 exposure model — they gate everything).
2. Docs reviser rewrites `design_document.md`, `scp_x_bible.md`, `site_41b.md §5`, `technical_document.md §7` to the new frame (see docs handoff).
3. Janitor does the **non-destructive prep**: schema additions (provenance), de-risking the obsolete fork code, CLI-ready component boundaries (see janitor handoff). No mechanic rewrite until the design questions are answered.
4. Then: AMBER manual-unredaction tooling, Quippy GUI layer, the no-Quippy ending — net-new, specced after §6.

**Nothing in the two handoffs should be executed before §6.2 and §6.4 are answered** — they determine the shape of the central mechanic. The handoffs are written so the *prep and flagging* can happen now and the *mechanic build* is clearly gated.
