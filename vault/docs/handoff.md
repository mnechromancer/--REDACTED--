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

- **Built and green (164 tests):** the engine — single-word slots, forged citations,
  teaching/inference grounding, propagation, exposure, lures, permanent Quippy taint,
  breaches, the no-Quippy ending; 80s AMBER register; **and the v3 frame (Phase 1):**
  collections (`local` shelf / `inbound` batch), day-gated reachability (the tray is
  open; the day is the gate), the 16:00 transmittal turnover (`end` — notes/buffers/log
  erase, overlay/exposure/taint persist), `note`, the mail store + `mail`, and Quippy's
  first contact on the player's first honest commit. The 10-file v2 corpus is retired
  *content* kept green as the engine's regression bed until Phase 2 replaces it.
- **v3 Phases 0–1 done** (decisions + consolidation; the frame's engine) — records in
  `planning/amber_build_decisions.md` §"v3" and §"Phase 1".
- **Next: Phase 2 — the opening.** The real shelf (~5–6 reference files), the four-file
  day-1 batch ramped by word kind, the boot/login + mail rewrite to the receiving-site
  voice (the boot screen still speaks the v2 annex framing — a known seam Phase 2
  closes), Quippy's entrance beats on the new content, and the retirement of
  `entries/000–009`. Design: `planning/reset_v3_intake.md` §5; authoring contract:
  `entry_authoring.md`; phase list: `spec_game.md` §8.

## 5. Working with this collaborator

Direct, analytically rigorous, low tolerance for filler, hedging, or false consolation.
Dense engagement; state decisions rather than asking permission for obvious ones; flag
genuine forks; lead with the load-bearing point. Do not pad.
