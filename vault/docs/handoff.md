# Handoff — ⟦REDACTED⟧ (SCP terminal decipherment game)

Onboarding pointer for a fresh session. The compressed always-loaded version is `CLAUDE.md`
at the repo root; this doc is the human-readable routing layer. Current frame: **v3**
(2026-07-04) — read `planning/reset_v3_intake.md` for the pivot and
`planning/amber_build_decisions.md` for every decision since.

## 1. What this is

A text/document game. The player is a **temp archivist at an irrelevant Foundation records
satellite** that receives a batch of heavily-redacted Site-41B documents every day at 4 AM
and loses the batch — plus every note about it — to an unexplained erasure at 4 PM. The only
thing that survives is a **properly-cited reconstruction committed in AMBER**, the site's
ancient, honest records OS. **Quippy**, a friendly helper that rides the batch, is the
entity `SCP-41B-000`: it makes unredaction one-click easy, and every assist raises exposure
and permanently taints the run. The true ending is reconstructing the whole corpus with
zero Quippy touches.

One line: *the easy tool reads the files for you and lets the thing out; learn the files
well enough to read them yourself, and you starve it.*

## 2. Routing

| Question | Doc |
|---|---|
| Mechanics, schema, engine, build order | `spec_game.md` |
| Setting, canon, cast, cosmology | `site_41b.md` |
| Quippy: nature, voice, tells, endgame | `scp_x_bible.md` |
| How to author an entry | `entry_authoring.md` |
| Concept keys / the grounding graph | `concept_key_registry.md` |
| Agentic method / personas | `agents.md` |
| Current work, phases, decisions | `planning/` (`reset_v3_intake.md`, `roadmap.md`, `amber_build_decisions.md`) |
| History (superseded specs, completed handoffs, prior pivots) | `archive/` |
| Pre-canon research (never ships) | `discovery/` |

## 3. Environment

- **Repo:** Svelte 5 (runes) + Vite + TS. `npm install`, then `npm run dev` /
  `npm run build:corpus` / `npm run check` / `npm run test`. Do **not** re-scaffold.
- **Obsidian:** open `vault/` as the vault root (never the repo root — keeps
  `node_modules/` and source out of the index). Entries in `vault/entries/` are parsed
  game data; `vault/docs/` is specs. Edit anchor YAML in Source mode.
- **Authoring plugin:** `plugins/site41b-authoring/` — build validator + Claude wiki
  generator; `npm run plugin:install`.

## 4. Where we are (2026-07-04)

- **Built and green (144 tests):** the v2 engine — single-word slots, forged citations,
  teaching/inference grounding, pure-graph reachability, propagation, exposure, lures,
  permanent Quippy taint, breaches, the no-Quippy ending; 80s AMBER register; 10-file
  corpus proven AMBER-only winnable (that corpus is retired content, kept green as the
  engine's regression bed until Phase 2 replaces it).
- **v3 Phase 0 (decisions + docs consolidation): done.** This doc set is the result.
- **Next: Phase 1** — the frame's engine: `collection: local | inbound`, the day clock +
  transmittal wipe, `note`, mail. Then Phase 2 (the new opening) — see `spec_game.md` §8.

## 5. Working with this collaborator

Direct, analytically rigorous, low tolerance for filler, hedging, or false consolation.
Dense engagement; state decisions rather than asking permission for obvious ones; flag
genuine forks; lead with the load-bearing point. Do not pad.
