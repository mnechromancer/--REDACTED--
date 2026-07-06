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

## 4. Where we are (2026-07-06)

- **Built and green (169 tests):** the engine — single-word slots, forged citations,
  teaching/inference grounding, propagation, exposure, lures, permanent Quippy taint,
  breaches, the no-Quippy ending; 80s AMBER register; the v3 frame (Phase 1): collections,
  day-gated reachability, the 16:00 transmittal turnover, `note`, `mail`, first contact on
  the first honest commit; **and the v3 opening (Phase 2):** the shipping corpus — the
  Site-81C reference shelf (`REF-01…06`) and the day-1 batch (`SCP-41B-101…104`, truths
  ramped class → name → term of art → procedure, each grounded in one shelf volume), the
  self-file re-authored to ride the batch ("title withheld" on the cover slip's manifest),
  boot/login in the receiving-station voice, day-1 mail pointing at the slip and the
  shelf, and the v2 corpus (001–009) retired.
- **Playtest-hardened (2026-07-06, first live pass):** the **citation workspace** (forging
  is target-free; evidence-first play works) + the pinned **PREPARE/INITIATE
  UNREDACTION** verb; case-insensitive word commit (canonical casing stored); the
  one-screen terminal (document ≤ half page, log+prompt fused console, amber scrollbars);
  sequential module power-on; Quippy's forced-entry glitch; mail read full-pane; MOUNT
  listing + `next doc`. Full record: decisions log §"Phase 2 follow-up" and §"Phase 2
  playtest hardening".
- **Deployed:** GitHub Pages via Actions on every push to `main` —
  `.github/workflows/deploy.yml` rebuilds the corpus from the vault and gates the publish
  on the test suite; `vite.config.ts` derives `base` in CI. The live build is the current
  test surface (note: truths ship in the client bundle — accepted for the prototype).
- **v3 Phases 0–2 done** — records in `planning/amber_build_decisions.md` §"v3",
  §"Phase 1", §"Phase 2". Content decisions of record: the receiving site is **Site-81C**;
  the batch arrives on tape at 0400; receiving cast P. Redding (supervisor) + L. Ferro
  (opposite shift, reserved) — `site_41b.md` §1.1/§4.2.
- **Next: Phase 3 — the OS.** `ls`/`man`/`status`/`log`, the concordance (`xref`/`grep`
  over reachable unredacted text, forgeable hit spans), `diff`, the `verify` transmittal-QC
  skin. Design: `reset_v3_intake.md` §3; phase list: `spec_game.md` §8.

## 5. Working with this collaborator

Direct, analytically rigorous, low tolerance for filler, hedging, or false consolation.
Dense engagement; state decisions rather than asking permission for obvious ones; flag
genuine forks; lead with the load-bearing point. Do not pad.
