# Handoff — Phase 3 (the real CLI + the citation verb + the 80s aesthetic)

**To:** the instance executing Phase 3 of the `reset_amber_v2.md` reset.
**From:** the Phase 2 build (2026-06-17). Phases 0–2 are **done and merged to `main`** (`e7225c9`); `check` clean, 124 tests pass.
**Prereqs, in order:** `reset_amber_v2.md` §2 (aesthetic) + §5 (phasing) → `design_note_forged_citations.md` (the citation verb — the heart of Phase 3) → `amber_build_decisions.md` (full decision + phase-completion log) → `roadmap.md` top box (the v2 phase ledger) → **this file**. Read `technical_document.md` §7 (UI/CLI) before the CLI rebuild.

---

## 0. Where the project stands

The single-word, citation-grounded **traffic-jam primitive** (Phase 1) is proven on the two-file teaching pair (`SCP-41B-001` intake → `SCP-41B-002` Concordance primer). The **playable opening** (Phase 2) is built: a bootup that states the source-less premise in AMBER's voice, no scripted onboarding, and Quippy's uninvited paced first contact. What has NOT been touched: the aesthetic (still plain dark-terminal chrome), the citation *interaction* (AMBER still **surfaces** the grounding clue rather than making the player find it), and any content beyond the pair. Those are Phase 3 / Phase 4.

**Invariants still in force (CLAUDE.md + decisions):** inference-in-AMBER is the safe path (zero exposure); leaning on Quippy is the spend; the player never edits truth; typed/bounded insertion only; no clearance (pure-graph reachability, decision D); the no-Quippy win with **permanent** Quippy taint (no redemption — `quippyTouched`). Do not reopen these without the user.

---

## 1. What Phase 2 built (so you don't undo it)

- **Deleted `progression.svelte.ts`** — the scripted SCRIPT onboarding, file-unlock gating, `advanceProgression`. Gone for good (it taught the retired clearance loop and named Quippy in AMBER's voice, §0.2). **Do not resurrect a script.**
- **New `src/lib/session.svelte.ts`** — minimal boot/first-contact state: `booting`, `quippyMet`, `beginSession()`, `resetSession()`. No file gating, no truth/overlay touch. App calls `resetSession()` beside `loadCorpus`/`seedReach`.
- **Bootup** lives in `App.svelte` (`bootLines`) — AMBER's clinical voice, states the source-less premise, **never names Quippy** (§0.2). Keep that rule when you restyle it for the 80s register.
- **Quippy's first contact** (`ui.svelte.ts` `maybeFirstContact`, called from `openFile`): fires once per run on the first open of a **non-seed reachable file** (= the player followed a link). It **routes the cursor back to the blank the player left** (`priorSpan`) and pitches *that*, never the unread file's slot. `ui.quippyReason: 'first-contact' | 'summon'` distinguishes the entrance.
- **`QUIPPY_FIRST_CONTACT`** (`quippy.svelte.ts`) is a **5-beat sequence**; `QuippyPanel` walks it (`inIntro`/`introStep`/`offering`) and withholds the fill offer until the last beat. The recurring band greetings are separate (`QUIPPY_GREETING`).
- Tests: `ui.test.ts` "Quippy's uninvited first contact (§3.3)" — covers seed-vs-link, once-per-run, and route-back. The pure-traversal/span suites set `session.quippyMet = true` in a local `beforeEach` to disarm the trigger; preserve that pattern if you add navigation tests.

---

## 2. Phase 3 — the work, in priority order

Phase 3 is the §5 resequencing point: the aesthetic was deferred behind the playable opening, and it arrives now **bundled with the citation-verb rebuild**, because they touch the same files (`AmberTerminal`, `AmberLookup`) and the verb is what the CLI is *for*.

### 2.1 The citation verb — the load-bearing change (`design_note_forged_citations.md`)
**This is the heart of Phase 3, not the paint.** Today (Phase-1 stopgap) `AmberLookup` *hands the player the grounding* — it shows which file holds the word. That short-circuits the thesis ("learn the files well enough to read them yourself"). The decided replacement:

1. Player **types the recovered word** into the slot (recall).
2. Player **highlights a span** in some reachable document and **forges a citation** from it — the link **always draws** (it's the player's assertion, not AMBER-pre-validated).
3. Player **commits**; AMBER adjudicates: the citation grounds iff its **cited span contains the word** (span-scoped, replacing the current whole-file `bodyContainsWord`) **and** the file is reachable.

Engine implications are itemized in the note §"Engine implications" — chiefly: citation unit changes from a *ref* to a *(file, span)*; `citeIn` likely downgrades from the play-time gate to a build-time winnability guarantee (play accepts any reachable span containing the word). The honesty rule (a propagated value can't ground) and reachability are unchanged. **Read the note's "any span links, commit judges" rationale before designing the UI** — validating on link re-introduces the hand-holding this removes.

### 2.2 Strip how-to-cite scaffolding from entry prose (note §"Companion principle")
The teaching entries currently narrate the method ("follow the link, find the word, cite it") **inside the document body** — a giveaway and a category error. **The method belongs to AMBER** (a `help`/`hint` command, the Concordance tooling, AMBER's register), never the record. When you re-author entries for the forged-citation verb, strip all how-to-cite lines from `SCP-41B-001`/`002` prose; the record should read as in-world paperwork that merely *contains* the grounding word. (This is a small content edit that rides with the verb rebuild.)

### 2.3 The 80s institutional aesthetic (`reset_amber_v2.md` §2)
- **AMBER:** Deluxe Paint + institutional-80s / VMware-console register — monochrome/limited palette, chunky bitmap type, boxed status regions, a real command line. `AmberTerminal` is "rebuilt, not restyled" (the R§6.6 debt). It **never references Quippy** (§2.1 — keep the §0.2 rule).
- **Entries as paperwork:** header block, sectioned addenda, monospace body, and **margin notes in the actual margins** (Halloran's marginalia in a gutter, not inline — the current biggest visual miss). `FilePane`/`SlotSpan` are where this lands.
- **Quippy stays visually distinct** — already a separate violet GUI overlay (`QuippyPanel`); keep it un-AMBER. Its fills already render distinct (`--slot-via-quippy` / provenance tint).

---

## 3. Watch items / hazards

- **Don't let the aesthetic eat the verb.** The verb (2.1) is the playable substance; the palette (2.3) is dressing. If time is tight, ship the forged-citation interaction in plain chrome first, then paint — the same lesson Phase 2 learned (mechanic before makeup).
- **The corruption mechanic is NOT Phase 3.** `design_note_quippy_corruption.md` (roadmap **Phase 6**) depends on the span/citation model you're about to build, so build the citation verb *aware* that a future phase will need **mutable per-run truth-facing prose** (Quippy edits the references; the player never does). Don't hard-bake immutable grounding prose in a way that blocks that — but don't build the corruption itself.
- **`citeIn` semantics shift.** If you downgrade `citeIn` to a winnability guarantee (note §2.1 lean), update `validate-corpus.ts` accordingly and keep the build-time check that *some* reachable grounding exists for every teaching slot — that check is what guarantees the no-Quippy win stays reachable.
- **Winnable-regression guard.** `real-corpus-winnable.test.ts` / `endgame-integration.test.ts` assert AMBER-only solve → `loop-broken` at exposure 0. The forged-citation rewrite changes *how* a commit is reached; keep the **intent** (honest full solve wins clean), update the assertions.

---

## 4. Open, non-blocking (trailing Phase 3, owed before/at Phase 4)

- **§6-E** — arc list + first-batch size for the content spine (Phase 4).
- **§6-F** — exact Quippy-fill distinctness; partly subsumed by the corruption note (Quippy fills the wrong/escalatory word) but the *render* distinctness call is still open.
- **Docs cleanup** (`reset_amber_v2.md` §7/§8): the completed handoffs (`handoff_amber_build.md`, the lore handoffs, `sprint_01_vertical_slice.md`) and the superseded `reframe_amber_quippy.md` still sit un-archived in `planning/`. Fold the `planning/archive/` move into whenever you next touch those docs (the reference specs — `entry_template.md`, `concept_key_registry.md`, `technical_document.md` §7 — get rewritten in Phase 3 anyway). `roadmap.md` is now half-current (v2 ledger added at top; the old epic table below is history) — finish reconciling it when convenient.

---

## 5. One-line summary
Phase 0–2 done and merged: the single-word traffic-jam primitive and the playable opening (bootup premise, no script, Quippy's paced uninvited first contact). **Phase 3 = make the player FIND the grounding (forged-citation verb, `design_note_forged_citations.md`) and rebuild AMBER as a real 80s CLI with paperwork rendering** — verb first, paint second; build it aware that Phase 6 corruption will need mutable reference prose, but don't build corruption.
