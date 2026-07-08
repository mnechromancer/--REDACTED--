# Sprint 03 — the OS (v3 Phase 3)

**Goal (one sentence):** AMBER grows from a command palette into an OS — `ls`/`man`/`status`/`log`, the concordance (`xref`/`grep` with jumpable, forgeable hit spans), `diff`, and `verify` as transmittal QC — with every new surface honest by construction.
**Milestones:** v3 Phase 3 (`spec_game.md` §5.1 ⟨Phase 3⟩, §8; `reset_v3_intake.md` §3).  **Convergence point:** none — code-track only; Phase 4 brings the content these tools were built for.
**Status:** Closed (2026-07-07 — 223 tests, check/corpus/prod-build green)

## Stories

| ID | As the archivist, I… | Track | Owner role | Files owned | Done-check | Status |
|----|----------------------|-------|------------|-------------|-----------|--------|
| S0 | (infrastructure) read any record's in-the-clear text as one string | code | orchestrator | `src/lib/renderedText.ts` | concordance/diff consume it | Done |
| S1 | type `xref <word>` and see every reachable record whose readable text carries the word, as numbered hits I can jump to and forge from | code | amber-implementer | `src/lib/concordance.ts` + tests | every hit's snippet grounds the word at the commit gate; coverage grows as slots solve | Done |
| S2 | type `diff <a> <b>` and read two records side-by-side with differences marked | code | amber-implementer | `src/lib/diffRecords.ts` + tests | redacted slots render as bars — a diff never leaks a truth | Done |
| S3 | type `man <cmd>` and get AMBER's terse self-documentation — the only tutorial voice in the game | copy | amber-voice | `src/lib/manpages.ts` + tests | every shell command has a page; no page mentions Quippy; `man quippy` → no entry | Done |
| S4 | type `ls` / `status` / `log` / `verify` and read the shelf+consignment, the day's state, the provenance ledger, and transmittal QC | code | amber-implementer | `src/lib/os.ts` + tests | readouts never name a truth for an unsolved slot; self-file excluded from QC totals | Done |
| S5 | use all of it from the one-screen terminal — hits, the diff pane, the man pages, the legend | code | amber-implementer | `src/components/AmberTerminal.svelte` | all commands dispatch; 169 pre-existing tests still green | Done |
| S6 | (review) trust the new surfaces — end-of-phase invariant audit over the whole diff | code | invariant-reviewer | (read-only) | findings triaged; blocking findings fixed; gates re-green | Done |

## Decisions log

| # | Fork | Resolution | Rationale (invariant ref) |
|---|------|-----------|---------------------------|
| P3-1 | What does the concordance index? | The **rendered** text — prose plus solved overlay values; redaction bars contribute no letters. Wrong Quippy fills are indexed too (the lie becomes findable). | Spec: "coverage grows as the player solves." Honest by construction (inv. 3): it searches what is on screen. Quippy's lie entering the index is the Phase-7 seed, deliberate. |
| P3-2 | Hit-match rule | Case-insensitive **substring**, identical to `spanContainsWord` — so every hit snippet is guaranteed to ground the word at commit. No regex, no wildcards, literal only. | A search stricter than the gate can never mislead; looser would offer hits that fail at commit. Player supplies the literal (inv. 3). |
| P3-3 | Hit-jump grammar | `xref <word>` lists numbered hits; `xref <n>` opens hit *n*'s record AND forges its snippet into the citation workspace (same `forgeCitation` path — dedup, auto-select toward a prepared field). | One verb, two arities, mirroring `open <n>`. Direct-forge because the pane's selectionchange listener would clobber a programmatic live selection; the workspace pouch is stable. Honest: the player supplied the word; the span is real reachable prose. |
| P3-4 | Old `search` command | **Folded into the concordance** — `search`/`s` alias `xref`; the raw id/body substring lister is retired. | One honest search surface; the old one searched raw bodies (token noise) and returned file lists without spans. `corrupt_search` (breach effect) will target the concordance when it lands. |
| P3-5 | `status` clock | No wall clock — the shift is event-based (`end` turns it over). `status` renders day, mount, restoration counts, transmittal-eligible records, and exposure as an **IRREGULARITY INDEX** with bands (thresholds reuse the corruption bands: 0 nominal, <0.3 minor, <0.7 elevated, ≥0.7 severe, breach). | No second resource invented (inv. 1) — the index IS exposure, skinned. Bands match the visual rot the player already sees. |
| P3-6 | `log` (the ledger) vs `prov` | `log` prints the provenance ledger **derived from the overlay** (inserted/propagated, `caused_by`); no new store, no stored citation history. Quippy-routed entries print as `NO CITATION ON FILE` — AMBER has no record of Quippy, so the absence of paperwork IS the tell. `prov` keeps its per-span toggle. | Inv. 7 (no new persistence channel — a derived readout persists nothing). Register rule: AMBER never references Quippy; the missing citation says it diegetically. |
| P3-7 | `verify` semantics | Read-only transmittal QC over mounted inbound records: per record restored/outstanding counts, struck fields flagged `DISAGREES WITH RECORD — RE-DERIVE`, complete records `CLEARED FOR TRANSMITTAL`. The self-file is excluded from totals and marked not scheduled. | Inv. 3 (reports state, names no words); matches `endState`'s exclusion of `entity_self` — QC must not demand a record the win doesn't count. |
| P3-8 | `man quippy` | Returns *no entry*, same as an unknown command. | AMBER has no record of it (`spec_game.md` §5.1). The designed tell. |
| P3-9 | Snippet shape | An **exact substring** of the rendered line (word-boundary window when the line runs long, no ellipsis inside the span) — because the snippet doubles as the staked citation text. | The forged citation must be real prose the record contains, byte for byte. |
| P3-10 | Diff pairing | Line-level LCS anchors equal lines; between anchors, leftover left/right lines pair index-wise so a one-word edition change reads as one marked row. Renders in the document pane (like mail), ESC/nav returns. | Presentation choice for the duplicate-record family (patterns 3/6); no engine impact. |
| P3-11 | (review) AMBER strings still named Quippy (help/legend/header) | AMBER text never names the intruder: help/KEYS lines stripped; the header reliance counter reads **`UNCITED n`** (the ledger's vocabulary); the `quippy` verb dispatches but is documented nowhere; the violet ◇ button (the entity's own chrome) carries discoverability. Also: the redacted sense of "struck" renamed **outstanding** everywhere (boot, MOUNT, help, `man next`) — *struck* now means only a wrong fill. | Register rule (§5.1: AMBER has no record of it) + P3-8's tell must not be contradicted on the same screen. One word, one meaning — the tutorial voice cannot document a false mechanic. |
| P3-12 | (review, pre-existing, blocking) a struck slot rendered the truth word struck-through beside the lie (`resolveSlot`'s `guess: anchor.truth` → SlotSpan) | Sealed: a contradiction renders ONLY the wrong word, struck; `guess` removed from `DisplayedSlot`; test asserts the truth appears nowhere on the displayed slot. Plus hardening: `xref <n>` re-verifies the stored snippet against the current rendered line before staking. | Inv. 2/3 (truth never shows unless solved) and §7.5 (grounding can never be lifted from an unsolved slot) — the re-derive flow `verify` teaches would have marched players into the leak. |

## Model-switch points

- None flagged — no story touches the inference/exposure economy or the overlay/truth boundary; all new engine surfaces are read-only derivations. (The Architect gate was exercised at Phase 0; P3-1..P3-10 were statable from the spec.)

## Definition of done (this sprint)

Playable loop: mount day 1 → `man man` → `ls` → `xref euclid` → jump a hit → forge → PREPARE/INITIATE a field → `log` shows the cited reconstruction → `verify` shows the record's QC state → `status` reads nominal on a clean run — all without Quippy, all without AMBER ever proposing a word.

## Retro (fill at close)

- **Worked:** disjoint-file wave dispatch — four parallel implementers, zero merge
  conflicts, because the orchestrator wrote the one shared helper (`renderedText.ts`)
  *before* the wave and pinned exact API signatures in every work order. The standing
  agent definitions (`.claude/agents/`, new this sprint — `agents.md` §6) worked as
  operating contracts via the general-purpose fallback. The end-of-phase
  `invariant-reviewer` earned its keep: it caught a pre-existing blocking truth leak
  (P3-12) that every earlier phase had shipped over, plus a vocabulary collision the
  new tutorial voice would have taught as fact (P3-11).
- **Change:** wave agents killed mid-run (session interrupt) had already written their
  files but never reported — the orchestrator should treat "files exist + scoped suite
  green" as the recoverable state and re-verify rather than re-dispatch. Also: voice
  copy that documents behavior (man pages) should land *after* or *with* the behavior
  owners' reports, or state claims only from the pinned decisions table — one `ls` page
  line overclaimed and needed a post-hoc tighten.
- **Runbook amendment:** none — §2's shape held; the reviewer slot in Phase 2
  (Integrate & verify) is now concretely `invariant-reviewer` per `agents.md` §6.
- **Known roughness (Phase-4 candidates):** concordance snippets carry raw markdown
  sigils and rendered-line numbers that don't match the pane's visual lines (gate-safe,
  cosmetic); `verify` clears on completeness while `log` shows missing citations
  (intended, watch for player misread); designation shape ("no spaces") is corpus
  convention, not build-enforced.
