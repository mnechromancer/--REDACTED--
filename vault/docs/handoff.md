# Handoff — ⟦REDACTED⟧ (SCP terminal decipherment game)

Purpose: bring a fresh session to full context and stand up the development + authoring environment for Claude Code and Obsidian. Read this first; the docs alongside it in `vault/docs/` are the detailed references. The compressed always-loaded version of this context is `CLAUDE.md` at the repo root.

---

## 1. What this is

A text/document game. The player is a low-clearance archivist on a decaying Foundation site OS. Files are partly redacted by access tier; a deprecated OS "help utility" (SCP-X) fills the gaps, but it *is* an intelligent informational entity that has already caused a localized CK-class restructuring by hiding in the records and is trying to scale it into a site-wide breach. Filling redactions rewrites the record and propagates the change across cross-referenced files; the more the record diverges from contained reality, the closer the breach.

Core loop in one line: **guess to see, but every guess corrupts, and corruption is what lets the thing in the walls out.**

## 2. Repo contents

```
redacted/
├── CLAUDE.md                         # Claude Code auto-loaded context (root)
├── .gitignore
└── vault/                            # open THIS folder as the Obsidian vault
    ├── docs/
    │   ├── handoff.md                # this file
    │   ├── design_document.md        # authority on mechanics
    │   ├── technical_document.md     # authority on stack, schema, algorithms, build order
    │   ├── entry_template.md         # dual-purpose entry template + worked example (SCP-41B-003)
    │   ├── agents.md                 # agentic dev methodology (lore QA pipeline, sprint roles)
    │   ├── site_41b.md               # setting bible — Site-41B original canon
    │   ├── concept_key_registry.md   # propagation-graph backbone — every concept-key + carriers
    │   ├── entity_roster.md          # the 25 entities; SCP-41B-### scheme; coverage/tier audits
    │   ├── scp_x_bible.md            # the Concordance: entity thread, self-file, endgame fork
    │   ├── planning/                 # EXECUTION LAYER — sprint runbook, current sprint, roadmap
    │   │   ├── README.md             # methodology (agents.md) vs. application (here) split
    │   │   ├── sprint_process.md     # the repeatable sprint runbook
    │   │   ├── sprint_01_vertical_slice.md  # current sprint
    │   │   └── roadmap.md            # epics→sprints horizon
    │   └── discovery/
    │       ├── 01_lore_discovery.md  # Series I themes, K-class taxonomy
    │       ├── 02_design_discovery.md# comparable games and borrowed mechanics
    │       ├── 03_technical_discovery.md # engine landscape, the Svelte decision
    │       └── 04_site41_antimemetics.md # Antimemetics Division research (internal, never ships)
    └── entries/                      # game entities ONLY (parsed into the corpus)
```

If a question is about *what the game does*, read `design_document.md`. About *how it's built*, `technical_document.md`. About *how to author an entity*, `entry_template.md`. About *the setting, clusters, cast, or arc*, `site_41b.md`. About *how agents divide the work*, `agents.md`. About *concept-keys and the propagation graph*, `concept_key_registry.md`. About *the entity list, numbering, or coverage*, `entity_roster.md`. About *the Concordance, the self-file, or the endgame fork*, `scp_x_bible.md`. About *current work, sprints, or the roadmap*, `planning/`. Code and the source-code tree get added by the scaffold step below.

## 3. Locked decisions — do not relitigate

- **Stack:** Svelte 5 (runes) + Vite + TypeScript. Deliverable is a repo, not a single-file artifact.
- **Two protected invariants:**
  1. *Inference is the spend.* The deduction tool and the risk meter are one mechanism. Never add a stability resource separate from inference.
  2. *Overlay/ground-truth delta is the puzzle.* The player edits a mutable overlay that propagates; the immutable truth leaks in via clearance; the gap is the puzzle. The player never edits truth.
- **Resolved contradiction:** decipherment of a *fixed* truth and *authoring* via MadLib are reconciled by the overlay being a parallel layer, not a rewrite of truth.
- **Insertion is typed-slot only**, never free text. Bounded, hand-authored mutation sets per anchor.
- **Validation is batched** (clearance-gated), never per-guess.
- **Breaches are board state, not a fail screen.** They mutate terminal behavior; recovery is first-class.
- **Endgame is the ouroboros:** SCP-X's own file is fully redacted; decipher the entity using the entity; the ending forks on accumulated overlay state.
- **Licensing line:** Series I *flavor* may resemble canon as heavily as wanted; *ground-truth resolutions* must be original. Nothing verbatim ships → CC-BY-SA clear.
- **Content scope:** 15–30 entities, curated for graph density (≥2 shared concept-keys each), anchored on information/memetic/perceptual anomalies, avoiding famous canon entries.

## 4. Schema quick-reference (full version in technical_document.md §2)

Per anchor: `id`, `slot_type` (object|agent|location|outcome), `truth` (immutable), `redaction_level` (1–5), `concept` (shared key for propagation; optional), `mutations` (bounded set), `exposure_weight`.

Per file (frontmatter): `item`, `object_class`, `site`, `clearance` (baseline to open), `anchors[]`, `xrefs[]`, `breach_effect`, `entity_self`.

Body markup: `⟦anchor_id⟧` token at each slot; `[[SCP-41B-YYY]]` Obsidian wikilink per cross-reference.

**Cross-file invariants (build-time validation errors):**
- Exactly one file sets `entity_self: true` (the SCP-X self-file).
- Anchors sharing a `concept` must have **equal-length, index-aligned** mutation sets across all files.
- Every `⟦id⟧` in a body has a matching anchor; every `xref` resolves to a real file.

## 5. Environment setup

### Claude Code (the code repo)

1. Unzip and `cd` into the project root. Git is already initialized with an initial commit; run `git log --oneline` to confirm, or delete `.git` and re-init if you prefer a clean history.
2. Launch Claude Code in the directory. It auto-loads `CLAUDE.md`, so it starts with the invariants, schema, and layout already in context.
3. Scaffold the Svelte app in place. When create-vite warns the directory is non-empty, choose **Ignore and continue** — it adds its files alongside `vault/` and `CLAUDE.md` without touching them:
   ```
   npm create vite@latest . -- --template svelte-ts
   npm install
   npm install idb
   ```
   Alternative (official Svelte CLI, scaffolds SvelteKit with optional prettier/eslint/vitest in one pass — use only if you later want routing/SSR, which this game does not): `npx sv create`. Stay on the plain Vite template unless there's a reason; the repo layout in technical_document.md §9 assumes plain Vite (`src/lib`, `src/components`, `static/`), not SvelteKit's `src/routes`.
4. First code is the schema types + `scripts/build-corpus.ts` parser (milestone 1), not UI.

A VS Code workflow still works identically; install the **Svelte for VS Code** (`svelte.svelte-vscode`) and **YAML** (`redhat.vscode-yaml`) extensions if using it instead of or alongside Claude Code.

### Obsidian (the authoring vault)

1. **Open the repo's `vault/` folder as an Obsidian vault** (Open folder as vault → select `vault`). Entries live at `vault/entries/`; the reference docs are readable at `vault/docs/`. Because the vault root is `vault/`, Obsidian never sees `node_modules/` or source code at the repo root.
2. Core features:
   - **Properties** renders the YAML frontmatter, but its UI handles *flat* fields only — it mangles the nested `anchors:` list-of-objects. **Edit anchors in Source mode** as raw YAML. Expect to live in Source mode for anchor work.
   - **Graph view** visualizes `[[wikilinks]]`, i.e. your `xrefs` graph. An unresolved link flags a missing or mistyped cross-reference — a useful authoring signal.
3. Recommended community plugins:
   - **Templater** — apply `entry_template.md` automatically on new-entry creation.
   - **Dataview** — query frontmatter to audit the graph: list every anchor carrying a given `concept`, find orphan concepts (carried by only one file → propagation dead end), check clearance-tier distribution, verify the ≥2-shared-concept density target. This is how the propagation graph stays coherent as the corpus grows.
4. The build parser ignores files in `vault/entries/` whose names begin with `_` (e.g. the `_README.md` placeholder), so they won't fail validation. Author entities by copying `vault/docs/entry_template.md` to `vault/entries/SCP-41B-###.md` (designations per `entity_roster.md`).

## 6. Where we are now

**Planning lives in `vault/docs/planning/`** — sprint runbook, current sprint, roadmap. That folder is the source of truth for active work; this section is just the pointer.

- **Current: Sprint 1 — Vertical Slice** (`planning/sprint_01_vertical_slice.md`). Full playable loop on three entities (SCP-41B-003/001/002): Vite scaffold + M1–M5 on the code track, the trio on the lore track, converging at propagation (M4). No breaches yet. Goal: *read → hover → insert → propagate → batched-validate, felt on three files.*
- **Process:** `planning/sprint_process.md` — the repeatable cycle (two tracks, phases, done-gates), applied to every sprint hereafter.
- **Horizon:** `planning/roadmap.md` — epics→sprints, content-scaling order, the endgame sequencing constraint.

**Code-track status (as of 2026-06-10):** scaffolded; the entire Sprint 1 **code track C0–C8 + C5t/C6t/C7t is implemented and verified** — 61 tests pass (`npm run test`), `npm run check` is clean, `vite build` is green. The engine is in: `scripts/build-corpus.ts` (parser + cross-file validators), `src/lib/corpus.ts` (schema), `src/lib/parseBody.ts` (runtime tokenizer reusing the build-time regexes), `src/lib/game.svelte.ts` (rune store: overlay, concept-keyed propagation, batched `raiseClearance`, the four-state `resolveSlot` ladder, exposure), and the components (`FileWindow`, `SlotSpan`, `HelpUtility`) + four-state CSS tokens. `src/App.svelte` is a slice harness wiring the loop on an inline fixture.

Two deliberate deviations from the spec snippets, both settled with the collaborator — **do not revert:** (1) `resolveSlot` is a pure function, not `$derived.by` returned from a function (Svelte 5 forbids the latter; the branch *order* is verbatim and callers wrap it in `$derived`); (2) exposure is recomputed from the overlay (`recomputeExposure`), not `+=` accumulated, because §4's *stated* invariant is "no accumulated drift" and the literal `+=` pseudocode drifts on re-insertion. C6's `randomize_propagation` breach path was intentionally not stubbed (breaches are Sprint 2). `tsconfig.app.json` gained `allowImportingTsExtensions` to match `tsconfig.scripts.json`.

**Still parked / what's next:** `vault/entries/` is intentionally empty — the trio (lore stories L1–L3) is a deliberate **model-switch** track (swap to the strongest model for prose + mutation sets; `agents.md` §5.4). So `npm run build:corpus` failing the entity-self rule is *correct*, not a bug. Remaining Sprint 1 work: **CR** (`/code-review`; invariant violations are merge-blockers), **CV** (play the M5 loop end-to-end), and **LV** (verify the authored trio forms the three propagation edges, after L1–L3 land). Author entries via the §2 lore pipeline, not by hand into the parser.

## 7. Working with this collaborator

Direct, analytically rigorous, low tolerance for filler, hedging, or false consolation. Wants dense substantive engagement. Catches redundancy and over-completeness fast — do not pad. State decisions rather than asking permission for obvious ones; flag genuine forks. Lead with the load-bearing point.

## 8. Planning artifacts — status

The five "recommended additional documents" this section used to track are now built or scoped:

- **Concept-Key Registry** → `concept_key_registry.md` (done — propagation backbone, all keys ≥2 carriers).
- **Entity Roster / Series Bible** → `entity_roster.md` (done — 25 entities, `SCP-41B-###`, coverage/tier audits).
- **SCP-X Bible** → `scp_x_bible.md` (done — entity thread, self-file, `thread_coherence` endgame fork).
- **Vertical Slice Definition** → `planning/sprint_01_vertical_slice.md` (done — the trio + M1–M5 with a played definition of done).
- **Four-State Visual Grammar Spec** → **implemented** in Sprint 1 (C8): `src/styles/tokens.css` (the four custom-property states + a reduced-motion path that keeps colour/strike distinctions) and `SlotSpan.svelte` (state switching), per `design_document.md` §5.8 and `technical_document.md` §7. A richer presentation pass before the endgame's two-ending screen remains on the roadmap; the functional grammar is done.

New planning work is tracked in `planning/` (roadmap + sprints), not here. This section stays a one-glance status; detail lives in those docs.
