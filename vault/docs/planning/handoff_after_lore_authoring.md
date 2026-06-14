# Handoff — after the lore/content authoring pass

**To:** the next instance (lore or code).
**From:** the lore/content track that completed the authoring work flagged in `handoff_lore_after_amber_build.md`.
**Status:** all six authoring items from that handoff are **done, verified, and green** — `npm run build:corpus` clean (4 entries), `npm run check` 0 errors / 0 warnings (162 files), `npm test` 129 passed (12 files). Committed to `main`.

Read first: `reframe_amber_quippy.md` (north star) → `scp_x_bible.md` (Quippy's voice + the ending; its §7 checklist is now mostly ticked) → `concept_key_registry.md` (the propagation backbone) → `handoff_lore_after_amber_build.md` (the prior handoff, whose work this pass closed out).

---

## What this pass did

The prior handoff resolved the AMBER-winnable BLOCKER (truth-index alignment) and left six authoring items open. All six are now done:

1. **Onboarding rewrite** — `src/lib/progression.svelte.ts`. The `SCRIPT` no longer voices the obsolete single-Concordance loop. It now teaches the **two tools** in AMBER's own clinical voice: the citation verb (cite a co-carrier → COMMIT, zero exposure), RAISE CLEARANCE to unseal held values, and Quippy named only as the costed shortcut. The narrator is **AMBER, not Quippy** — the player forms their own distrust. The `open` step states the temptation and the win condition plainly.

2. **Quippy voice pass** — `src/lib/quippy.svelte.ts` (`QUIPPY_GREETING`, `quippyFillLine`) + the in-panel lines in `QuippyPanel.svelte`. Rewritten against the casting rule (`scp_x_bible.md` §2.2/§4): bright/clerical at low, the first quiet *we* mid-sentence at mid, proprietary "ours/re-shelving" at high, the assistant act dropped post-breach. Marsh-calm throughout, rationed, never monologue. The engine already drives the four bands and the candidate-ordering tell; only the **strings** changed.

3. **AMBER voice pass** — `src/components/AmberLookup.svelte` + `AmberTerminal.svelte`. Reject reasons now carry error codes (`E10/E21/E30 REJECT … commit aborted`), accept reads `COMMIT OK …`, and the Concordance notes / search / help / raise / no-file lines got the terse Quality-Approval coldness (`scp_x_bible.md` §2.1). This clinical register is the **contrast** that makes Quippy legible. Also cleared a stale re-frame marker in `RippleLog.svelte`.

4. **Halloran-marginalia recast** — across the trio (`SCP-41B-003` → `002` → `001`). The marginalia now read as **one predecessor degrading** from method ("trace the lot by hand, the helper smooths the disagreement out, that is the disagreement") → warning ("do not let the assistant fill these") → surrender ("stopped checking by hand around the third stack… it's never wrong about the small ones") → the vacant post the player inherits. A warning about the **tool**, legible only once the reader knows which tool Halloran trusted (`scp_x_bible.md` §6). The original answer-clue ("count the copies, not the years") is preserved inside that arc, attributed to Halloran.

5. **The real `SCP-41B-000`** — `vault/entries/SCP-41B-000.md` replaces the play-test placeholder. A full Keter dossier, `entity_self: true`, **five anchors threading the five entity keys** (`concordance-program` a1, `the-transfer` a2, `acquisition-lot` a3, `record-reality-coupling` a4, `halloran-marginalia` a5) at their **high-tier index-2 readings**. Original solution (the cataloguing-process-continued-past-describing-itself turn; licensing wall held, `scp_x_bible.md` §8). Marked **excluded from the restoration target** in-world ("Completion is not containment"). See the build-safety notes below.

6. **Two stale-doc fixes** (caught during cleanup): the `scp_x_bible.md` §7 checklist now reflects the four completed items, and the `game.svelte.ts` header comment was corrected — it had called **live, tested** symbols (`BREACH_THRESHOLD`, `STRUCK_PENALTY`) "obsolete" and named two removed ones (`sessionResult`, `CONTAINMENT_TARGET`). Comment-only; no logic touched.

7. **A duplicate-anchor-token bug fixed** in `SCP-41B-000` before commit: `⟦a1⟧` and `⟦a3⟧` each appeared twice in the body. The parser only validates that tokens *resolve* (`scripts/lib/parse-entry.ts` `validateTokensResolve`), **not** that each appears once, so it passed build but would have rendered a second redaction bar for the same slot at runtime. Collapsed each to a single token; the recurring fact is now described in prose. **Watch for this** — it is template rule 4 and an unenforced one.

---

## What is genuinely still open (none of it blocks play)

- **The no-Quippy ending's exact gate** (`scp_x_bible.md` §5.3, R§6.3) — hard-gate vs tolerance-band vs spectrum. **Tracking** via `via` provenance is settled and built; the **threshold** is a tuning/design call for the human. The code currently implements the **hard gate** (any Quippy assist forecloses the true ending), which the bible recommends starting with. Nothing to do unless playtest shows it is inhumane.

- **The unwritten co-carriers of four entity keys.** `SCP-41B-000` is currently the **sole authored carrier** of `concordance-program`, `the-transfer`, `record-reality-coupling`, and `halloran-marginalia` (their registry co-carriers — 018/020/024 etc. — are unwritten). Each is kept at **mutation-set length 3, truth at index 2**, alignment-ready. **When you author those entities, match the registry's index meanings** (`concept_key_registry.md` §1/§3) and keep length 3, or the `concept-alignment` build rule will fail. (`acquisition-lot` already has three carriers — 000#a3 at rl5/index-2, plus 001#a2 / 002#a1 at rl3/index-0; the different tiers are why the index-2 truth on 000 is legal under the same-tier rule.)

- **Broader content scale** (`reframe_amber_quippy.md` §3/§4): longer multi-section dossiers, the area arc (Rocky-Mountain surroundings, placeholder keys in `concept_key_registry.md` §3b), and the **redactor** thread (the *second* entity that made the redactions — distinct from Quippy; `the-redactor` key is reserved-but-dormant). The trio + self-file are the playable core; this is roadmap, not a gap.

---

## Engine constraints the next author must respect (unchanged, all enforced)

- **Build-time invariants** (`scripts/lib/validate-corpus.ts`): exactly one `entity_self: true`; concept co-carriers have **equal-length** mutation sets (across all tiers); every xref resolves; **every body `[[wikilink]]` must be a declared xref** (so only wikilink files that exist — 000 references unwritten carriers in *prose only* for this reason).
- **The winnable regression guard** (`src/lib/__tests__/real-corpus-winnable.test.ts`) loads the **real** `static/corpus.json` and asserts (a) every same-tier concept key shares a truth index, and (b) an end-to-end AMBER-only solve of the non-self files reaches `loop-broken` at exposure 0. **Keep it green.** If you add a same-tier co-carrier of an existing key, its truth must sit at the shared index (index 0 for the teaching keys).
- **Do not touch the engine to fix content** — the exposure model (only Quippy spends; AMBER commits cost zero), the citation gate, propagation, reveal, and the provenance-based ending in `game.svelte.ts` are done and correct. If content *feels* like it needs an engine change, flag it back to the code track (`amber_build_decisions.md`).

---

## Suggested next step

Either (a) **playtest the trio + self-file** end-to-end in `npm run dev` to feel the new onboarding/voice and confirm the hard-gate ending lands, then decide the §5.3 threshold from felt experience; or (b) **scale content** — author the next entity (a `the-transfer` or `concordance-program` co-carrier is highest-value, since it both relieves 000's sole-carrier status and deepens the entity thread). Coordinate any new key with `concept_key_registry.md` *before* writing (coin-here-first rule).
