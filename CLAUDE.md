# CLAUDE.md — ⟦REDACTED⟧

Operating context for Claude Code. Full specs live in `vault/docs/`. **Current frame: v3
(2026-07-04)** — read `vault/docs/planning/reset_v3_intake.md` (the pivot; §7 decisions
answered) and `vault/docs/handoff.md` (onboarding). This file is the compressed
always-loaded version. Routing: mechanics/schema/engine/build order → `spec_game.md`,
setting/canon → `site_41b.md`, entity (Quippy)/voice/endgame → `scp_x_bible.md`,
authoring an entry → `entry_authoring.md`, concept keys → `concept_key_registry.md`,
agentic method → `agents.md`, current work/decisions → `vault/docs/planning/`
(`roadmap.md`, `amber_build_decisions.md`), history/superseded specs → `vault/docs/archive/`.

## Project
Text/document game. The player is a **temp archivist at an irrelevant Foundation records
satellite**. Every day at **4 AM** a batch of heavily-redacted documents arrives from
**Site-41B** — a deep-records annex in a decommissioned Colorado mine whose parent site
went silent in 1968 and which no longer answers anything (canon: `site_41b.md`). Every day
at **4 PM** the batch and every note about it erases completely. The one exception — the
transmittal model — is a **properly-cited reconstruction committed in AMBER**: annotation
dies, re-derivation survives. **Two tools:** **AMBER**, the site's honest, ancient
records-OS CLI — to unredact a word the player finds where the corpus grounds it, forges
the citation from a real span, and commits (zero exposure); and **Quippy** (SCP-X, the
self-file `SCP-41B-000`), a friendly GUI intruder that *rides the batch* — one-click fills,
summaries, completions, and a memory the 4 PM wipe never touches. Every Quippy assist
raises exposure and **permanently taints the run** (no redemption, no laundering).

Core loop: **the easy tool reads the files for you and lets the thing out; learn the files
well enough to read them yourself, and you starve it.** The win (`loop-broken`) = the whole
inbound corpus reconstructed in AMBER with **zero Quippy touches ever**. Every other
outcome is a breach.

## Stack
Svelte 5 (runes) + Vite + TypeScript. A repo, not a single-file artifact. Persistence:
IndexedDB (`idb`) + localStorage. **Already scaffolded and built** — pipeline, viewer,
forged-citation engine, propagation, exposure/lures/taint, breaches, endings, 80s AMBER
register; 144 tests green. `npm install`, then `npm run dev` / `npm run build:corpus` /
`npm run check` / `npm run test`. Do **not** re-scaffold. Obsidian authoring plugin:
`plugins/site41b-authoring/` (`npm run plugin:install`).

## Invariants — do not violate (full list: `spec_game.md` §2)
1. **Quippy is the spend.** AMBER unredaction costs zero exposure; Quippy carries it all.
   Never add a separate stability resource; never make AMBER cost exposure.
2. **The player never edits truth.** The overlay/truth delta is the puzzle.
3. **AMBER never volunteers** — no clue lists, no candidates, no "did you mean." The
   player supplies the word and the grounding; AMBER only judges. Answer-surfacing
   conveniences are Quippy's, priced accordingly.
4. **The winnability spine holds at build time:** every teaching slot's truth word stands
   in the clear in a file reachable before it; every xref is a body wikilink; the corpus
   is proven AMBER-only solvable by test (`real-corpus-winnable.test.ts`).
5. **Quippy taint is permanent** — any touch ever forecloses the true ending.
6. **Breaches are board state**, not a fail screen; recovery is first-class.
7. **Notes die at 4 PM; cited commits survive** (built). The whole overlay persists the
   wipe (Quippy's fills surviving is a tell); exposure/breaches/taint are run state.
   Never add another in-fiction persistence channel — offering one is Quippy's pitch.
8. **Licensing:** flavor may echo canon; every ground truth original; nothing verbatim.

## Corpus schema (authority: `src/lib/corpus.ts`; authoring view: `entry_authoring.md`)
Anchor: `id`, `slot_type` (object|agent|location|outcome), `truth` (the ONE redacted
word/phrase, immutable, original), `grounding` (`teaching{citeIn[]}` | `inference{threshold}`),
`lure?` (Quippy's wrong word, ≠ truth), `concept?` (registry-coined co-carrier key),
`exposure_weight`. File: `item`, `object_class` (no ACS), `site`, `anchors[]`, `xrefs[]`
(each must also be a body `[[wikilink]]`), `breach_effect`, `entity_self` (exactly one
`true`: `SCP-41B-000`), `collection?: local|inbound` (shelf = unredacted, zero anchors,
always reachable, cites need no xref; batch = redacted, mounted by `day?`; both default
inbound/day-1). Reachability = the day gate: every mounted file is openable; xrefs are
navigation. Body: one `⟦id⟧` per anchor; `> ` blockquote = margin note. Build
(`scripts/build-corpus.ts`) fails loudly on every rule above.

## Layout
- `vault/` — open THIS as the Obsidian vault. `vault/entries/` = parsed game data
  (`_`-prefixed ignored); `vault/docs/` = specs (not parsed); `vault/docs/archive/` =
  superseded history — do not treat as current.
- `CLAUDE.md`, source, `plugins/`, `node_modules/` sit at repo root, outside the vault.
- Pipeline: `vault/entries/*.md` → `static/corpus.json`. Authors never edit JSON.

## Build order (v3 phases — `spec_game.md` §8, status in `planning/roadmap.md`)
**Done:** the v2 engine (everything above) + Phase 0 (v3 decisions + docs consolidation)
+ Phase 1 (collections, day-gated reachability, the 4 PM transmittal turnover `end`,
`note`, `mail`, first contact on the first honest commit — 164 tests).
**Next: Phase 2** — the new opening (shelf + day-1 batch content, boot/mail rewrite —
retires the current `entries/000–009`, which until then stay green as the engine's
regression bed). Then:
Phase 3 the OS commands (`ls`/`man`/`status`/`log`, the concordance `xref`/`grep`, `diff`);
Phase 4 context-puzzle content; Phase 5 Quippy's widening (ghost-text, summarize, batch
fill, wipe-memory); Phase 6 the `map` graph; Phase 7 reference corruption. Each phase ends
playable.

## Collaborator
Direct, rigorous, low tolerance for filler, hedging, or false consolation. Dense
engagement; state decisions rather than asking permission for obvious ones; flag genuine
forks; lead with the load-bearing point. Do not pad.
