# Handoff — Janitor / Code Reviewer

**To:** a code-review/cleanup instance.
**Read first:** `planning/reframe_amber_quippy.md` (the master re-frame; every item below cites its sections as `[R§n]`).
**Companion:** `planning/handoff_docs_reviser.md` (lore/spec track — keep your changes consistent with theirs; don't rewrite lore).

## Your remit and its hard boundary

The re-frame ([R§1–§5]) splits the single GUI into **AMBER (CLI)** + **Quippy (refusable GUI)** and inverts the win to **"unredact everything without Quippy."** That is a big mechanic change — **but you are NOT building the new mechanic yet.** The central design questions ([R§6.2] AMBER's manual tools, [R§6.4] exposure model) are unresolved, and building before they're answered wastes work.

**Your job is the prep that is safe regardless of how §6 resolves:**
1. **Flag & document** every file that the re-frame touches, with the specific change (this doc is the index; in-file markers point back here — see "In-file flags" below).
2. **Non-destructive de-risking:** isolate/quarantine code the re-frame makes obsolete so it's not load-bearing, *without deleting* until the new design lands.
3. **Schema & boundary prep** that any version of the new design will need (provenance field; component seams for CLI vs GUI).
4. **Code-review hygiene** on what exists (there are known deferred findings — §"Carry-over findings").

**Do NOT:** rebuild the UI as a CLI, implement AMBER tooling, implement Quippy, or rip out the fork machinery. Those are post-§6. If you find yourself designing a mechanic, stop and flag it instead.

---

## File-by-file (source)

### `src/lib/corpus.ts` — schema [R§6.3]
- **Change (prep, safe now):** add an optional provenance field to `OverlayEntry`: `source: 'inserted' | 'propagated'` → extend toward `via?: 'amber' | 'quippy'` (optional, defaults undefined). The no-Quippy ending ([R§2]) needs to know *how* each unredaction was made. Add the field as optional so nothing breaks; do not yet branch on it.
- **Flag:** `entity_self: boolean` and the whole self-file framing ([R§5 "Overturned"]). The self-file is now Quippy (SCP-X), still `entity_self`, but its *role* changes (no longer the thing you decipher to win). Leave the field; flag that its semantics are pending docs-reviser's `scp_x_bible` rewrite.
- **Flag:** `BreachEffect` kinds are fine to keep, but note breaches are now "all non-true endings" ([R§2]) — the breach *system* survives, the *win* moves.

### `src/lib/game.svelte.ts` — the engine (biggest impact)
- **`sessionResult()` / `Outcome` / `BREACH_THRESHOLD` / `CONTAINMENT_TARGET` / `STRUCK_PENALTY`** — the entire win/loss model is **obsolete as written** ([R§2]). Current: "contain by N correct reads under exposure." New: "break the loop by unredacting all without Quippy; everything else breaches." **Do not delete** — quarantine: mark deprecated, keep tests green, and flag that the ending model is being redesigned post-[R§6.4]. The new condition will read provenance (`via !== 'quippy'` across all solved slots), not a correctness count.
- **`raiseClearance()` filled-only reveal** — survives ([R§5 preserved]). No change.
- **`insert()`** — survives as the unredaction primitive, but will gain a `via` argument (who made the edit, AMBER or Quippy) feeding the provenance field. Prep: thread an optional `via` param through, defaulting to current behavior. Don't branch on it yet.
- **`conceptClues()`** — this is the *seed* of AMBER's manual-unredaction tooling ([R§1 AMBER, R§3]). It will likely **move/expand** into AMBER's tool suite rather than live in the hover panel. Flag as "promote to AMBER tooling," keep working for now.
- **`exposure` / `recomputeExposure()` / `STRUCK_PENALTY`** — exposure survives but its *drivers* change ([R§6.4]): likely Quippy-assisted edits cost exposure, AMBER manual edits cost little/none. Flag; do not retune until §6.4 is answered.
- **`auditSummary()`, `boardState()`** — keep; `boardState` will need a `viaQuippy` / `viaAmber` count once provenance lands. Flag.

### `src/lib/progression.svelte.ts` — onboarding
- The current `boot → restore → audit → link → open → free` script ([its SCRIPT]) is **written for the old single-interface loop.** The re-frame's onboarding must teach **two interfaces and the temptation** ([R§1, R§3]). Flag the whole `SCRIPT` and `advanceProgression` gates as "rewrite for AMBER/Quippy onboarding." Keep functioning; do not rewrite (docs-reviser + design own the new script content).

### `src/components/HelpUtility.svelte` — **the most conceptually conflicted file**
- This component **is "the Concordance / SCP-X mouse-over"** in the current design. Under the re-frame it splits in two ([R§1, R§6.1]):
  - The **evidence/clue surface** (`conceptClues`) → belongs to **AMBER** (honest manual tooling).
  - The **easy one-click candidate fill + the entity's voice** → belongs to **Quippy** (the GUI wrapper).
- **Flag, do not split yet** (gated on [R§6.1] naming decision + [R§6.2] AMBER tooling spec). Add a prominent in-file marker. This file will likely become two components (`AmberLookup` + `QuippyPanel`) or be deleted in favor of new ones.

### `src/components/FileWindow.svelte` / `SlotSpan.svelte` / `bodyBlocks.ts` / `inlineMarkdown.ts` / `parseBody.ts`
- **File rendering survives** — it's AMBER's primary capability ([R§1]). But:
  - **Aesthetic flips to CLI** ([R§1, R§5]). Current styling is GUI-windowed (rounded panels, gradients, classification banners). Flag for restyle to monochrome-terminal idiom. Don't restyle yet (design/aesthetic pass).
  - **Files get much longer/multi-section** ([R§3]). The renderer (`bodyBlocks`, `parseBody`) handles `#`/`##`/`**` and tokens — verify it scales to long multi-section dossiers; flag any assumptions about short bodies. This is a *good* review task you can do now: confirm `bodyBlocks` handles many sections, nested structure, long prose without layout break.
  - **Keyboard traversal** ([R§1 CLI: hotkeys to traverse files and redacted spans]) is net-new and not present. Flag as new work; note `SlotSpan` currently uses hover/focus — CLI needs explicit keybound span-jumping.
- `SlotSpan` four-state grammar survives ([R§5]) but re-rendered in CLI idiom; the provenance (`via`) may add a fifth visual distinction (AMBER-solved vs Quippy-solved). Flag.

### `src/components/RippleLog.svelte`
- Survives conceptually (propagation log). Under CLI aesthetic it becomes a terminal log pane. Flag for restyle. Also: it should likely log **provenance** (was this ripple AMBER- or Quippy-caused) once [R§6.3] lands.

### `src/App.svelte`
- Top-level composition. Will need to host **two interface modes** (AMBER CLI / Quippy GUI overlay) and a switch between them ([R§1, R§3 "switching is a felt act"]). Currently hardcodes the single-GUI layout, the audit bar, the end overlay (which encodes the obsolete win [R§2]). Flag heavily; this is a major recompose post-§6. The `SCP-41B-000` stub import note (below) lives here too.

### `src/lib/Counter.svelte`
- Vite scaffold leftover, unused. **Safe to delete now** — confirm no imports, remove. (Only unambiguous deletion in this pass.)

### `scripts/build-corpus.ts`, `scripts/lib/parse-entry.ts`, `scripts/lib/validate-corpus.ts`
- The pipeline **survives** ([R§5 preserved]). Two flags:
  - Longer files ([R§3]) mean more anchors/xrefs per file — confirm validators scale and error messages stay legible. Low risk; verify.
  - **Known bug to fix now** (independent of re-frame): the `⟦id⟧` anchor-token regex in `parse-entry.ts` scans the whole body **including HTML comments**, so a literal `⟦...⟧` in a `<!-- -->` comment is parsed as a real token (this already bit entry authoring). Fix: strip HTML comments before token extraction in `parseBody`/`validateTokensResolve`. This is a clean, safe fix — do it.

### `src/lib/__tests__/*` and `scripts/**/__tests__/*`
- 71 tests currently green. Many encode the **obsolete win model** (`game.test.ts` `sessionResult` suite) and the old reveal/onboarding. **Do not delete tests** — flag which suites are pinned to obsolete mechanics so the post-§6 rebuild knows what to rewrite vs. preserve. The propagation, parse, and validation tests are mechanic-stable and should stay green throughout.

---

## Schema/boundary prep you CAN safely do now

1. **Add `via?: 'amber' | 'quippy'` to `OverlayEntry`** (optional, unused) — unblocks the ending redesign without committing to it. [R§6.3]
2. **Thread an optional `via` param through `insert()`** (default preserves current behavior). [R§6.3]
3. **Fix the HTML-comment token bug** in the parser (above). Independent, safe.
4. **Delete `Counter.svelte`** (dead scaffold).
5. **Add in-file flag markers** (below) so the next instance finds the change sites fast.
6. **Quarantine, don't delete,** the obsolete win model (`sessionResult` & constants): a deprecation comment + this handoff reference. Keep tests green.

## In-file flags (add these markers)

At the top of each affected file, add a comment pointing here, e.g.:
```ts
// ⚠ RE-FRAME (planning/reframe_amber_quippy.md §1): this component is the old
// single-interface "Concordance" panel. Splits into AMBER lookup + Quippy panel.
// See planning/handoff_janitor.md "HelpUtility.svelte". Do not rebuild before R§6.
```
Files to mark: `corpus.ts`, `game.svelte.ts`, `progression.svelte.ts`, `HelpUtility.svelte`, `FileWindow.svelte`, `SlotSpan.svelte`, `RippleLog.svelte`, `App.svelte`. (The parser fix and `Counter` deletion need no marker.)

## Carry-over findings (pre-existing, fix independently of the re-frame)

From `sprint_01_vertical_slice.md` decisions log + work this session:
- `OverlayEntry.contradicts_truth` is written by `raiseClearance` but `resolveSlot` derives the contradiction live and never reads it — dead/redundant. Pick one source of truth before IndexedDB persistence.
- `splitRef` silently truncates a `#`-less ref instead of throwing — latent footgun; add a guard.
- `build-corpus.ts` direct-invocation guard (`import.meta.url === file://...`) is always false on Windows; the `endsWith` fallback carries it. Use a `fileURLToPath` comparison.
- The HTML-comment token bug (above) — fix in this pass.

## The build-stub caveat (must address before any commit)

`vault/entries/SCP-41B-000.md` is a **throwaway placeholder** added so `build:corpus` emits `static/corpus.json` (the build throws without exactly one `entity_self: true` file). It is NOT real content. Either:
- delete it and add a `--allow-incomplete` flag to `build-corpus.ts` that writes JSON despite the `entity-self` validation error (recommended; documented as a sprint-time gap), **or**
- leave it only until the real SCP-X/Quippy self-file is authored.
Flag this so it doesn't get committed as if it were content.

## Definition of done (this prep pass)
- Every source file in the tree has either a change-flag marker (pointing here) or a note in this doc explaining why it's unaffected.
- The four safe changes done (provenance field, `via` param, parser comment-bug fix, `Counter` deletion), tests still green.
- Obsolete win model quarantined with deprecation comments, not deleted.
- A short report appended to this doc listing what you flagged, what you changed, and anything you found that this handoff missed.
- **No new mechanic built.** If §6 questions get answered while you work, a *separate* follow-up handoff covers the build.
