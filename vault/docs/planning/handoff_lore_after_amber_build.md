# Handoff — lore/content track, after the AMBER/Quippy mechanic build

**To:** a lore/content instance.
**From:** the code track that just built the AMBER/Quippy mechanic (merged to `main`, commit `e9f2648`; build steps in `handoff_amber_build.md`, decisions in `amber_build_decisions.md`).
**Status:** the mechanic is built, tested, and green (127 tests, check clean, `vite build` + `build:corpus` green). The engine is **done and correct**. What remains is **content**, and one content bug blocks the intended win. Everything below is authoring, not engineering — do not change the engine to fix these.

Read first: `reframe_amber_quippy.md` (the north star) → `scp_x_bible.md` (Quippy's voice + the ending) → `concept_key_registry.md` (the propagation backbone you must keep aligned) → `amber_build_decisions.md` (what the code track decided and why).

---

## What the engine now expects from content

The mechanic is live, so authoring decisions now have *mechanical* consequences they didn't before. Three things the engine relies on:

1. **Index-0 = the mundane truth, and same-tier co-carriers must share the truth index.** The citation gate lets the player commit candidate *k* at a slot by citing a co-carrier that *already reads index k*. If two slots share a concept and are at the **same tier**, their truths must sit at the **same mutation index** (the registry says index 0), or the second slot becomes AMBER-unsolvable — you can't cite the first to corroborate the second. Tier-**escalating** keys (low-tier carriers index 0, high-tier index 2) intentionally differ by index — that's fine and by design; the contradiction-on-reveal is the point. The rule is only for **same-tier** carriers of a key.

2. **Every redaction should be grounded in ≥1 citable co-carrier reachable early** (`design_document.md` §9, watch item 4). The AMBER route bootstraps from clearance-revealed truth: reaching a tier reveals in-tier truth for slots in *open* files, and those become citable. So the earliest accessible tier needs at least a few slots whose co-carriers reveal at that tier — or the player has nothing to cite and is forced to Quippy, inverting the moral. Tune the opening so AMBER feels hard-but-possible, never impossible.

3. **The self-file is the entity you starve, not the puzzle you solve.** The ending excludes the `entity_self` file from the restoration target (`scp_x_bible.md` §5.4). You win by reconstructing *everything else*; Quippy, getting no assists, can't complete itself. Author `SCP-41B-000` accordingly — its anchors thread the five entity keys *narratively*, but filling them is not the win.

---

## BLOCKER — the authored trio is not fully AMBER-winnable as written

Two same-tier teaching keys have truths at **different indices** across their carriers, which (per #1 above) makes the high carrier AMBER-unsolvable and the no-Quippy win unreachable on the real corpus:

| Concept | Carrier A | Carrier B | Problem |
|---|---|---|---|
| `acquisition-lot` | SCP-41B-001#a2, truth index **0** | SCP-41B-002#a1, truth index **1** | both rl=3 (same tier) → truths must share an index |
| `audit-cycle` | SCP-41B-001#a3, truth index **1** | SCP-41B-002#a2, truth index **2** | both rl=3 (same tier) → truths must share an index |

(For contrast, `the-quiet-exchange` is correct: 001#a1 and 003#a1 both truth at index 0.)

**Fix (content, your call which):**
- **Preferred:** make each key's truth index 0 on *both* carriers, per `concept_key_registry.md` (index 0 = the mundane reading; e.g. acquisition-lot index 0 = "the 1962 lot as administrative intake event"). Adjust the entries' `truth:` values and/or re-order the `mutations:` arrays so the true reading is index 0 on every same-tier carrier — keeping all carriers of a key length-equal and index-aligned.
- **Alternative:** if you *intend* these to diverge, re-coin them as tier-escalating keys (carriers at different `redaction_level`s) and document the intent in the registry — then the divergence is legitimate and the high carrier is solved by clearance-reveal, not citation.

Keep the licensing wall (`scp_x_bible.md` §8): truths stay original; flavor may resemble canon, solutions may not.

How to verify your fix: after editing, the trio should be fully solvable in AMBER with zero Quippy assists, reaching the "loop breaks" ending. The engine path is proven on an aligned corpus in `src/lib/__tests__/endgame-integration.test.ts` — mirror that shape with the real entries to confirm.

---

## Authoring work the re-frame opened (from `scp_x_bible.md` §7 + the re-frame markers)

These are flagged in the docs/code but are content, not mechanic:

- **Quippy's voice pass** (`scp_x_bible.md` §2.2/§3/§4). The engine already drives four exposure-band tones and the candidate-ordering "tell"; the *strings* are first-draft placeholders in `src/lib/quippy.svelte.ts` (`QUIPPY_GREETING`, `quippyFillLine`). Write them against the casting rule: Marsh-calm, rationed, never monologue; the first "ours" should land before the player can explain it.
- **AMBER's voice pass** (`scp_x_bible.md` §2.1). The terse clinical register is the *contrast* that makes Quippy legible — the terminal log lines / reject lines in `AmberLookup.svelte` and `AmberTerminal.svelte` are functional but plain; give them the Quality-Approval coldness.
- **The onboarding rewrite** (`progression.svelte.ts` — still carries a re-frame marker). The `SCRIPT` still teaches the *old single-interface* loop ("the Concordance hands you values"). It must teach the **two tools** and the temptation to lean on Quippy. This is the most load-bearing content gap — the current onboarding voices the obsolete design.
- **Halloran-marginalia recast** (`scp_x_bible.md` §6). Halloran is who you become if you lean on Quippy; the marginalia should read as a warning about the *tool*, not just a guide to answers.
- **Longer, multi-section dossiers** (`reframe_amber_quippy.md` §3). The current trio entries are short; the FilePane scales to long dossiers, and richer files make redactions feel earned. Multi-source grounding per `entry_template.md`.
- **Author the real `SCP-41B-000`** (Quippy's self-file). It is currently a PLACEHOLDER stub holding the `entity_self` invariant. When you author the real one, you can delete the placeholder and build with `npm run build:corpus -- --allow-incomplete` in the gap (the flag the code track added for exactly this). Coordinate its five-key mutation ordering with `concept_key_registry.md`.

---

## What NOT to touch (engine — already correct)

- The exposure model (only Quippy spends — `design_document.md` §3 keystone). Never make an AMBER edit cost exposure.
- The citation gate, propagation, reveal model, or the ending logic in `src/lib/game.svelte.ts`.
- The `via` provenance field and the hard-gate ending.

If something *feels* like it needs an engine change to make content work, flag it back to the code track — the watch-item decisions in `amber_build_decisions.md` were deliberate, and content should be authored to them, not the reverse.
