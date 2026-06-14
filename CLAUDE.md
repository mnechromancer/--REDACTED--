# CLAUDE.md — ⟦REDACTED⟧

Operating context for Claude Code. Full specs live in `vault/docs/`. **Read first: `vault/docs/planning/reframe_amber_quippy.md`** (the 2026-06-13 re-frame, all §6 questions now resolved) — it supersedes the old single-help-utility design; then `vault/docs/handoff.md` for onboarding. This file is the compressed always-loaded version. Routing: mechanics → `design_document.md`, build → `technical_document.md`, authoring → `entry_template.md`, setting/canon → `site_41b.md`, agentic method → `agents.md`, concept-keys/propagation graph → `concept_key_registry.md`, entity list/numbering → `entity_roster.md`, entity (Quippy)/self-file/endgame → `scp_x_bible.md`, current work/sprints/roadmap → `vault/docs/planning/`, **the mechanic-build steps → `vault/docs/planning/handoff_amber_build.md`**.

## Project
Text/document game. Setting: **Site-41B**, a Foundation deep-records annex in a decommissioned Colorado mine, orphaned from its parent site — original canon in `vault/docs/site_41b.md`. The player is a low-clearance archivist on a decaying Foundation site OS; files are redacted by clearance tier, and the player must unredact them. **Two tools:** **AMBER**, the honest archival CLI, where unredaction is hard, manual, and safe — you cite the corroborating cross-references to commit a value (the citation-cost gate); and **Quippy** (SCP-X, the self-file `SCP-41B-000`), a friendly, *refusable* GUI wrapper that makes unredaction one-click-easy and *fun*, but is an informational entity mid-CK-class restructuring: every Quippy-assisted fill rewrites the record, propagates across cross-referenced files, raises exposure, and drives toward a site-wide breach. AMBER unredaction costs zero exposure; Quippy carries it all.

Core loop: **the easy tool reads the files for you and lets the thing out; learn the files well enough to read them yourself, and you starve it.** The win = unredact the whole corpus in AMBER, **without ever using Quippy.** Every other outcome is a breach.

## Stack
Svelte 5 (runes) + Vite + TypeScript. A repo, not a single-file artifact. Persistence: IndexedDB (`idb`) + localStorage for settings.

**Already scaffolded and built** — the repo has the Vite/Svelte/TS setup, the corpus pipeline, and the Sprint-1 engine (insertion, propagation, clearance reveal, four-state grammar, breaches). `npm install` then `npm run dev` / `npm run build:corpus` / `npm run check` / `npm run test`. Do **not** re-scaffold. Next work is the AMBER/Quippy mechanic build — see `vault/docs/planning/handoff_amber_build.md`.

## Invariants — do not violate
1. **Inference is the spend** (re-framed): leaning on **Quippy** is the spend — a Quippy assist both gives the value and raises exposure. Inference in **AMBER** (citing cross-references) is the safe path, costing ~zero exposure. Never add a stability resource separate from inference, and **never make AMBER manual unredaction cost exposure** (that collapses the two routes back into one and breaks the design).
2. **Overlay/ground-truth delta is the puzzle.** The player edits a mutable, propagating overlay; immutable truth leaks in via clearance; the gap is the puzzle. The player never edits truth.
3. **Typed-slot insertion only** — never free text. Bounded, hand-authored mutation sets per anchor.
4. **Validation is batched and clearance-gated** — never per-guess. It confirms inserted guesses; it never volunteers an untouched slot's value.
5. **Breaches mutate terminal behavior** — board state, not a fail screen. Recovery is first-class.
6. **Licensing:** Series I flavor may resemble canon; ground-truth resolutions must be original. Nothing verbatim ships.

## Corpus schema (full in technical_document.md §2)
Anchor: `id`, `slot_type` (object|agent|location|outcome), `truth` (immutable), `redaction_level` 1–5, `concept` (shared key, optional), `mutations[]` (bounded), `exposure_weight`.
File frontmatter: `item`, `object_class`, `site`, `clearance`, `anchors[]`, `xrefs[]`, `breach_effect`, `entity_self`.
Body markup: `⟦anchor_id⟧` at each slot; `[[SCP-41B-YYY]]` wikilink per xref. Entities use site-local designations `SCP-41B-###` (roster + scheme in `entity_roster.md`); the SCP-X self-file is `SCP-41B-000`.

Cross-file invariants (enforce as build-time errors in build-corpus.ts):
- Exactly one file has `entity_self: true`.
- Anchors sharing a `concept` have equal-length, index-aligned mutation sets.
- Every `⟦id⟧` resolves to an anchor; every `xref` resolves to an existing file.

## Layout
- `vault/` — open THIS as the Obsidian vault. Authoring source of truth.
  - `vault/entries/` — game entities ONLY. `scripts/build-corpus.ts` parses every `*.md` here. Files prefixed `_` are ignored.
  - `vault/docs/` — specs, discovery passes, handoff. NOT parsed. Readable in Obsidian.
- `CLAUDE.md`, source code, and `node_modules/` sit at repo root, outside the vault, so Obsidian never indexes them.

Pipeline: `scripts/build-corpus.ts` reads `vault/entries/*.md` → emits `static/corpus.json`. The vault is authoritative; authors never edit JSON.

## Build order
`technical_document.md` §10 (reordered for the re-frame). **Done:** M1–M6 (pipeline, viewer, insertion+overlay, propagation, batched validation, breaches) — Sprint 1, committed, tests green. **Next:** M7–M10 — full AMBER CLI, the citation-cost unredaction gate, the Quippy overlay, the no-Quippy ending — stepped out in `vault/docs/planning/handoff_amber_build.md`. Each milestone is independently playable; the loop is felt on the Sprint-1 trio before content scales.

## Collaborator
Direct, rigorous, low tolerance for filler, hedging, or false consolation. Dense engagement; state decisions rather than asking permission for obvious ones; flag genuine forks; lead with the load-bearing point. Do not pad.
