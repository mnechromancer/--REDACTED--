# Handoff — Documentation Reviser

**To:** a lore/spec-revision instance.
**Read first:** `planning/reframe_amber_quippy.md` (the master re-frame; items below cite it as `[R§n]`).
**Companion:** `planning/handoff_janitor.md` (code track — your spec rewrites must stay buildable against what the engine can actually do; coordinate on schema terms like the `via: amber|quippy` provenance field).

## Your remit

The re-frame changes the fiction and the spec, not just the code. Several `vault/docs` files now contain **statements that are actively wrong** under the new direction (chiefly: SCP-X = AMBER's help utility; win = decipher the self-file using it). Your job is to **rewrite the design/lore/spec docs to the new frame** and **expand the lore** toward the richer, longer, more interactive files the human wants ([R§3], [R§4]).

**Hard gate:** the central open questions ([R§6], especially naming [R§6.1], AMBER's manual tooling [R§6.2], and the exposure model [R§6.4]) are **unresolved by the human.** Where a rewrite depends on them, **write the options and flag the decision — do not invent the answer.** It is fine (preferred) to restructure docs around clearly-marked "PENDING [R§6.x]" gaps.

**Do not** touch code or the entries' machine-readable frontmatter (that's the janitor / a future lore-author). You may revise prose specs, the setting bible, the design doc, templates, and planning docs.

---

## File-by-file (`vault/docs/`)

### `design_document.md` — **major rewrite** [R§1, R§2, R§3]
- **§1 Logline & fantasy / §3 "one identity":** the current fantasy is "a help utility offers to fill the gaps; the utility is the entity." Still true, but now reframed: the help utility is **Quippy, a GUI wrapper you can refuse**, and the **honest** tool (AMBER CLI) is separate. Rewrite the fantasy as *forbidden literacy where the easy tool is the threat and mastery is doing without it.*
- **§3 "Inference is the spend":** survives in spirit but must be restated for the split — the *spend* is leaning on Quippy; *inference in AMBER* is the safe path. Reconcile carefully; this is the keystone, don't break it, re-express it.
- **§4 Core loop:** rewrite. The mouse-over → two interfaces. The loop's one-sentence statement ("guess to see, but every guess corrupts…") needs a new form around AMBER vs Quippy and the no-Quippy win.
- **§5 mechanics:** §5.2 "fake-OS desktop" → CLI ([R§1]). §5.3 "SCP-X mouse-over" → split into AMBER lookup + Quippy panel. §5.9 breach states survive but are now "all non-true endings" ([R§2]).
- **§6 Endgame:** **replace** the ouroboros/self-file-decipher climax with the **no-Quippy win** ([R§2]). The "ending = board state" principle survives; the board state that matters is now Quippy-reliance, not thread coherence.
- **New section:** the AMBER/Quippy aesthetic clash as core investigation content ([R§1, R§3]).

### `scp_x_bible.md` — **largest conflict; near-total rewrite** [R§1, R§2, R§5, R§6.1]
- The entire doc assumes **SCP-X = AMBER's Concordance help utility** and the win = decipher the self-file using it via `thread_coherence`. The re-frame **separates** SCP-X (Quippy) from AMBER and **inverts** the win.
- Rewrite to: **SCP-X is Quippy** — a paperclip-with-diamondback-patterning assistant entity that wraps AMBER in a friendly GUI, names itself "Quippy" to mislead, and whose every assist advances breach. Its self-file is SCP-41B-000.
- **`thread_coherence` fork (§5) is obsolete as the win condition.** Replace with the no-Quippy ending ([R§2]). You may preserve "ending = accumulated overlay/board state" as the principle. Flag the new tracked state (Quippy-reliance) as PENDING [R§6.3]/[R§6.4] for the exact mechanic.
- **The degrading-tone spec (§4)** is reusable and good — but it's now *Quippy's* voice, and Quippy is refusable, so the degradation is what the player learns to distrust *and avoid by not summoning it.* Re-aim it.
- Keep the licensing/originality discipline (§3.3) verbatim — that's still binding.
- **Flag for human ([R§6.1]):** is "the Concordance" AMBER's honest tool or Quippy's mask? This doc can't be finished until that's set. Recommend documenting the recommended answer (Concordance = AMBER's legitimate cross-reference tool) and marking PENDING.

### `site_41b.md` — **§5 rewrite, §1.2 adjust, §4/§6 expand** [R§1, R§4]
- **§1.2** already introduces AMBER and "the Concordance" as AMBER's deprecated help utility — this is the conflation to break. AMBER stays (the OS), but the Concordance-as-SCP-X-mask framing moves; SCP-X becomes Quippy ([R§1]).
- **§5 "SCP-X at Site-41B — the Concordance":** rewrite as "SCP-X — Quippy." The "diegetic mask = AMBER's help utility" line is the core thing to change: Quippy is a *parasitic GUI wrapper*, not AMBER's own utility. Keep the "feral indexing process" nature if the human likes it (flag — it may want revisiting given the new redactor-entity thread).
- **§3 cast / §6 arc:** ADD the new threads ([R§4]): (a) a **Site-41B + surrounding-area arc** (Rocky Mountains; confirm/refine the existing Colorado molybdenum-mine canon — [R§6.5]); (b) a **second entity, the redactor** — distinct from Quippy, the actual perpetrator of the redactions, initially unknown, later revealed. Add to the setting bible as a seeded thread (not fully authored).

### `entry_template.md` — **expand for longer files** [R§3]
- The current template is a short 3-section page (Containment / Description / one Addendum). The re-frame wants **long, multi-section, densely cross-referenced dossiers** that are places to spend time. Revise the template toward more sections (multiple addenda, incident logs, interview fragments, recovery, exploration logs), more `⟦anchor⟧` slots, more `[[xref]]` density, and guidance on grounding each redaction in *multiple* files for the "a-ha" payoff ([R§3]).
- Keep the machine-readable frontmatter contract intact (anchors, concepts, mutations) — coordinate with janitor: if a `via`-provenance or new fields land in the schema, reflect them. Note the one-token-per-anchor rule (a recent bug: anchors must appear exactly once in the body).

### `technical_document.md` — **§7 and §9 rewrite, §2 maybe extend** [R§1, R§5, R§6.3]
- **§7 UI architecture:** currently specs a `Desktop` window manager (GUI). **Replace** with the **AMBER CLI** architecture + the **Quippy GUI overlay** as a distinct mode ([R§1]). Keyboard traversal, terminal rendering, mode-switch. Coordinate the component names with the janitor's planned split (`AmberLookup` / `QuippyPanel`).
- **§2 data model:** if the `via: amber|quippy` provenance field is adopted ([R§6.3]), document it here. Flag PENDING until janitor + human confirm.
- **§9 repo layout / §10 build order:** the build order milestones (esp. M5 HelpUtility, M6 breach, M7 endgame) are reordered by the re-frame — the endgame is now "no-Quippy completion," and the M5 "help utility" is two things now. Revise the milestone list. Keep the pipeline sections (§4 propagation, §8 authoring) — they survive.

### `concept_key_registry.md` — **light: extend, don't overturn** [R§4]
- The propagation graph survives ([R§5]). New keys will be needed for the **Site-41B-area arc** and the **redactor-entity thread** ([R§4]). Add placeholder key entries (with index meanings TBD) for those threads so authors coin them here first (the registry's own rule). The existing trio keys are fine.
- Flag: the five "entity thread" keys (`concordance-program`, `the-transfer`, etc.) were designed to feed the obsolete `thread_coherence` fork — their *narrative* role survives but their *mechanical* endgame role is gone. Note this so a future author doesn't rebuild the fork around them.

### `entity_roster.md` — **expand the roster** [R§3, R§4]
- Add the **Site-41B-area arc** entities and a slot for the **redactor entity** ([R§4]). Re-confirm the 15–30 budget against the new longer-file scale ([R§3]) — fewer, richer files may be the better trade; flag for the human.
- The SCP-X / Quippy entry (SCP-41B-000) framing changes — update its roster line to "Quippy."

### `agents.md` — **light: process note**
- If it describes the authoring/agent pipeline, add a note that the re-frame ([R§1]) is in effect and point to the master doc. No deep rewrite unless it contains design claims that now conflict (scan for "Concordance"/"help utility"/"self-file decipher" and flag).

### `handoff.md` (top-level onboarding) — **update pointers**
- It routes new instances to the specs. Add the re-frame as the **first** thing to read and note which docs are mid-rewrite. Keep it a thin index.

### `planning/` docs
- `roadmap.md`, `sprint_01_vertical_slice.md`, `sprint_process.md`, `README.md`, `handoff_lore_trio.md`: these describe the **completed** Sprint 1 under the old design. **Do not rewrite history** — add a dated note at the top of `roadmap.md` and `README.md` that the project pivoted (point to the master doc), and mark `handoff_lore_trio.md` as "completed under prior design; trio may need expansion per [R§3]." Future sprints get new planning docs.
- `discovery/` (source-canon digest): untouched — it's the licensing-wall reference, still valid.

---

## Lore expansion priorities (the generative half of your job) [R§3, R§4]

Beyond reconciling conflicts, the human wants the world *more interesting and interactive*. Concrete asks to develop (propose in the docs; flag anything needing human buy-in):
1. **Longer files with real internal structure** — design what a "full" Site-41B dossier looks like (sections, logs, the multi-source grounding of each redaction for the "a-ha"). Encode in `entry_template.md`.
2. **The Site-41B-area arc** — files about the site and its Rocky Mountain surroundings ([R§4]). Outline the cluster in `entity_roster.md` + `site_41b.md`.
3. **The redactor entity** — seed the second-entity thread (who corrupted the files) distinct from Quippy. Setting bible + roster.
4. **Quippy's characterization** — the paperclip-diamondback assistant: its voice, its tells, how its friendliness curdles. This is the entity's whole presence; develop it in `scp_x_bible.md` (reusing the degrading-tone bands).
5. **AMBER's institutional voice** — the honest CLI's register (clinical, Quality-Approval-esque). Distinct from Quippy. The aesthetic clash ([R§1]) lives in this contrast.

## What to preserve (do not "fix")
- The licensing wall: flavor may resemble canon; every `truth:` resolution original ([R§5], `design_document.md §7`, `scp_x_bible.md §3.3`). Binding.
- The concept-key propagation graph and the build pipeline ([R§5]).
- The completed Sprint 1 history (annotate, don't rewrite).

## Definition of done (this rewrite pass)
- Every `vault/docs` file either rewritten to the re-frame, extended per [R§3]/[R§4], or annotated as historical — with no surviving statement that contradicts the master doc.
- Every dependency on an unresolved [R§6] question is **clearly flagged PENDING with the options laid out**, not silently decided.
- New lore threads (area arc, redactor entity, Quippy/AMBER voices, longer-file template) seeded enough for a lore-author to run with.
- A short report appended here: what you rewrote, what you flagged PENDING, what new lore you added, and any conflict the master doc didn't anticipate.
- Coordinate one shared vocabulary with the janitor (esp. `via: amber|quippy`, component names) so spec and code agree.

---

## ✅ Done report — docs-reviser pass (2026-06-13)

**Decisions taken into this pass** (from the human, before starting): use the re-frame's recommended answers for the resolvable §6 questions — **§6.1** Concordance = AMBER's honest tool (Quippy imitates it); **§6.3** per-overlay-entry provenance (`via`); **§6.4** AMBER manual = ~zero exposure, Quippy carries the cost; **§6.5** keep the Colorado Front Range molybdenum-mine canon. **§6.2** (AMBER tooling mechanics) and **§6.6** (CLI scope) had no recommendation and are flagged PENDING throughout. Scope: **full remit, one pass.**

### What I rewrote
- **`design_document.md`** — rewrote to the AMBER/Quippy frame. §1 fantasy → "forbidden literacy where the easy tool is the threat." §3 keystone ("inference is the spend") **re-expressed, not broken** — the spend is now *specifically Quippy*; AMBER inference is the safe route; explicit guard that making AMBER cost exposure would re-collapse the identity. §4 loop rewritten (two-route unredaction, new one-liner). §5 split into AMBER CLI (§5.2) + manual unredaction (§5.3, PENDING) + provenance (§5.7) + re-aimed exposure (§5.10). New **§5a aesthetic-clash** section. §6 endgame **inverted** to no-Quippy completion. Old one-liner and old §6 ouroboros preserved as cited-retired.
- **`scp_x_bible.md`** — near-total rewrite. SCP-X = **Quippy** (paperclip-diamondback, the "Quippy" mislead). §2 AMBER-vs-Quippy voices + the Concordance-is-AMBER's-tool correction. §3 Quippy's tells, §4 the **degrading-tone bands re-aimed** (now refusable, the curdle is a reliance signal). §5 the no-Quippy endgame; the five-key `thread_coherence` fork **retired as win condition** (narrative role of the keys preserved; explicit "do not rebuild the fork" note). §5.4 self-file's changed role (starve, don't decipher). §8 **licensing kept verbatim** from the old §3.3.
- **`site_41b.md`** — §1.2 corrected (Concordance = AMBER's honest tool; AMBER is a CLI). §5 rewritten (Quippy, separate from AMBER). §6 endings recast to no-Quippy; cosmology prose preserved with the entity/tool distinction threaded in. Added **§3.1 the redactor** and **§6a the area arc** (see new lore). §7 follow-ups de-conflicted.
- **`technical_document.md`** — §2 added `via?: 'amber' | 'quippy'` to `OverlayEntry` + an orthogonality note (`source` × `via`). §4 `insert(value, via)` pseudocode updated (exposure gated on Quippy; propagated entries inherit `via`; carrier-clobber guard documented to match the engine). §7 **UI rewritten** to AMBER CLI + Quippy overlay with the `AmberTerminal`/`AmberLookup`/`QuippyPanel`/`FilePane` component split. §9 repo layout + §10 build order **reordered** (M7–M10 = CLI restyle → AMBER tooling → Quippy → no-Quippy endgame). Pipeline §5/§8 untouched.
- **`entry_template.md`** — expanded toward **long multi-section dossiers**: richer body skeleton (Recovery, Incident/Test Log, Interview, Exploration/Xref-note), guidance for 3–6 staggered anchors, higher xref density, and the **multi-source-grounding discipline** (rule 6) that makes manual-AMBER deduction possible. Reinforced the **one-token-per-anchor** rule (the recent bug). **Worked example (SCP-41B-003) preserved as-is** (locked by the trio) + a "what a re-frame-scale version adds" note.
- **`concept_key_registry.md`** — light: re-frame banner; **§3b placeholder keys** for the area arc (`the-access-road`, `the-claim`, `the-watershed`) and the dormant `the-redactor` (indices TBD); annotated the entity-thread keys' note so the obsolete endgame role is marked and the fork isn't rebuilt.
- **`entity_roster.md`** — `SCP-41B-000` line updated to **Quippy** + changed role; **Reserved-threads** section (area-arc seed table + redactor slot); **budget re-confirmed** against the longer-file scale (recommend fewer-richer, flagged PENDING for the human); historical fork checklist item annotated-superseded (not rewritten).
- **`agents.md`** — re-frame banner + flagged the two conflicting design claims (the "hover" user-story example → AMBER/Quippy split; Epic D "ouroboros fork" → no-Quippy endgame). Methodology untouched.
- **`handoff.md`** — re-frame moved to **READ FIRST**; §1 description + one-liner updated; two doc-index lines fixed; the "ouroboros endgame" decision annotated-superseded; SCP-X-bible status line updated.
- **`planning/`** — dated pivot banners on `roadmap.md` + `README.md`; **historical markers** (not rewrites) on `handoff_lore_trio.md`, `sprint_01_vertical_slice.md`. `discovery/` untouched (licensing reference, still valid).

### What I flagged PENDING (options laid out, not decided)
- **[R§6.2] AMBER's manual-unredaction mechanics** — the single biggest gap; gates the core verb and `AmberLookup`. Flagged in design §5.3, tech §7/§10 (M8), bible §7. Intent fixed; interaction TBD by human.
- **[R§6.6] CLI scope for the prototype** — how much keyboard traversal ships now vs. restyle-first. Flagged in design §5.2, tech §7 (`AmberTerminal`, M7).
- **No-Quippy ending *enforcement*** (the tracking via `via` is settled; the gate is not) — hard-gate / tolerance-band / spectrum. Options + recommendation (start hard-gate) in bible §5.3, design §6.
- **Budget re-confirmation** (15–30 vs fewer-richer under longer files) — roster, with a recommendation (fewer-richer).
- **Redactor nature/motive** — three candidate readings in `site_41b.md` §3.1; key dormant in registry §3b until resolved.
- **Area-arc placement + location confirm** — sixth cluster vs Drift expansion (roster); keep-Colorado confirm (site §6a, low-stakes).

### New lore added (seeded for a lore-author)
- **The redactor** — a *second* entity that **made** the redactions, distinct from Quippy (which fills them). `site_41b.md` §3.1, roster reserved slot, registry `the-redactor`. Deliberately unwritten nature; seeded implicitly via redacted surface records in the area arc.
- **The Site-41B-area arc** — the Rocky Mountain surroundings as record/territory drift at ground level: the adit & road, the played-out town, the resurvey country, the watershed, the claim & deed. `site_41b.md` §6a, roster seed table, three new placeholder keys.
- **Quippy's characterization** — voice, tells, the curdle, the paperclip-diamondback mask, the "ours/re-shelving" register. `scp_x_bible.md` §2.2–§4.
- **AMBER's institutional voice** — the honest, clinical, Quality-Approval CLI register; the contrast that makes Quippy legible. `scp_x_bible.md` §2.1, `site_41b.md` §1.2/§5.
- **Longer-file dossier design** — the "places to spend time" template scale + multi-source grounding. `entry_template.md` §"Longer files."
- **Halloran recast** — the predecessor loop now reads as a warning *about the tool*; Halloran is who you become if you lean on Quippy. `scp_x_bible.md` §6; flagged as a content task for the lore-author.

### Shared vocabulary confirmed with the janitor track
- **Provenance field: `via?: 'amber' | 'quippy'` on `OverlayEntry`** — matches the janitor's in-file flag in `corpus.ts` exactly (the field is flagged there but **not yet added** — still `source: 'inserted' | 'propagated'`; the spec now documents the agreed shape for the code track to land). `source` and `via` are **orthogonal** (documented in tech §2).
- **Component names:** `AmberTerminal`, `AmberLookup`, `QuippyPanel` (the `HelpUtility` split the janitor flagged), `FilePane` (optional rename of `FileWindow`). Used in tech §7/§9 and agents.md.
- **`insert(value, via)`** signature + propagation inheriting `via` + the carrier-clobber guard — tech §4 now matches the engine's actual behavior (the clobber fix already landed in `game.svelte.ts`).

### Conflicts / notes the master doc didn't fully anticipate
1. **Provenance honesty across propagation.** A single Quippy edit can ripple onto many slots; an AMBER edit can land on a Quippy-touched carrier. I specced "propagated entries inherit the originating edit's `via`" and "AMBER edits never clobber a player insert," but the **AMBER-onto-Quippy-touched-slot** resolution is a real edge the mechanic build must settle (does re-solving a slot in AMBER *clear* its Quippy taint for the ending?). Flagged in design §9 and tech §4; the existing carrier-clobber fix is the relevant precedent. **The janitor/mechanic track should treat this as an explicit design question, not an implementation detail.**
2. **`SCP-41B-000.md` is still a `PLACEHOLDER` stub** (its `truth` literally says so; `entity_self: true`). Not my remit (entries' frontmatter belongs to janitor/lore), but noted: when the real Quippy self-file is authored, the roster line, changed role, and the paperclip-diamondback mask I specced (roster + bible §5.4) are the content to realize. The corpus build currently emits 4 entries (3 trio + this stub) **cleanly** — my docs-only changes don't affect the build (parser ignores `vault/docs/`); confirmed via `npm run build:corpus`.
3. **The "can't get anywhere without Quippy" tuning is the keystone risk** and is more delicate than the master doc states: if AMBER is too hard the moral *inverts* (the game feels like it forces the bad tool). Surfaced as the top design risk (design §9) so the mechanic build treats AMBER difficulty as the central dial, not an afterthought.
4. **The five entity-thread keys are now "all narrative, no mechanic"** — they were *designed* to feed the retired fork. I preserved their narrative role and explicitly warned (registry + bible §5.5) against rebuilding the fork around them. A future author re-encountering five conspicuously-threaded keys converging on the self-file is the most likely person to accidentally resurrect the obsolete endgame; the warnings are placed where they'll look.

**Definition of done:** met. Every `vault/docs` file is rewritten / extended / annotated with no surviving statement that contradicts the master doc; every §6 dependency is PENDING-flagged with options; the four new lore threads are seeded; shared vocab is aligned with the janitor track. Cross-references verified to resolve; corpus build clean.
