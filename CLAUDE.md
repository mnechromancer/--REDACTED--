# CLAUDE.md — ⟦REDACTED⟧

Operating context for Claude Code. Full specs live in `vault/docs/`. Read `vault/docs/handoff.md` for complete onboarding; this file is the compressed always-loaded version. Routing: mechanics → `design_document.md`, build → `technical_document.md`, authoring → `entry_template.md`, setting/canon → `site_41b.md`, agentic method → `agents.md`, concept-keys/propagation graph → `concept_key_registry.md`, entity list/numbering → `entity_roster.md`, entity/self-file/endgame fork → `scp_x_bible.md`.

## Project
Text/document game. Setting: **Site-41B**, a Foundation deep-records annex in a decommissioned Colorado mine, orphaned from its parent site — original canon in `vault/docs/site_41b.md`. The player is a low-clearance archivist on a decaying Foundation site OS; files are redacted by clearance tier. A deprecated OS "help utility" (SCP-X) — actually an informational entity mid-CK-class restructuring — offers to fill the redactions. Filling rewrites the record and propagates the change across cross-referenced files; rising divergence between record and contained reality drives toward a site-wide breach.

Core loop: **guess to see, but every guess corrupts, and corruption is what lets the thing in the walls out.**

## Stack
Svelte 5 (runes) + Vite + TypeScript. A repo, not a single-file artifact. Persistence: IndexedDB (`idb`) + localStorage for settings.

First command — scaffold in place, choose "Ignore and continue" / keep existing files when prompted (this adds package.json, index.html, src/, vite.config.ts, etc. alongside the existing vault/ and CLAUDE.md):
```
npm create vite@latest . -- --template svelte-ts
npm install
npm install idb
```
Then build out the layout in `vault/docs/technical_document.md` §9. Git is already initialized with an initial commit.

## Invariants — do not violate
1. **Inference is the spend.** The deduction tool and the risk meter are one mechanism. Never add a stability resource separate from inference.
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
`technical_document.md` §10. Start at milestone 1: schema types + build-corpus.ts round-tripping 3 stub entries with validation. Each milestone is independently playable; get the loop felt on 3 entities before scaling content.

## Collaborator
Direct, rigorous, low tolerance for filler, hedging, or false consolation. Dense engagement; state decisions rather than asking permission for obvious ones; flag genuine forks; lead with the load-bearing point. Do not pad.
