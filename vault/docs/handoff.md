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
    │   ├── entry_template.md         # dual-purpose entry template + worked example (SCP-921)
    │   ├── agents.md                 # agentic dev methodology (lore QA pipeline, sprint roles)
    │   ├── site_41b.md               # setting bible — Site-41B original canon
    │   └── discovery/
    │       ├── 01_lore_discovery.md  # Series I themes, K-class taxonomy
    │       ├── 02_design_discovery.md# comparable games and borrowed mechanics
    │       ├── 03_technical_discovery.md # engine landscape, the Svelte decision
    │       └── 04_site41_antimemetics.md # Antimemetics Division research (internal, never ships)
    └── entries/                      # game entities ONLY (parsed into the corpus)
```

If a question is about *what the game does*, read `design_document.md`. About *how it's built*, `technical_document.md`. About *how to author an entity*, `entry_template.md`. About *the setting, clusters, cast, or arc*, `site_41b.md`. About *how agents divide the work*, `agents.md`. Code and the source-code tree get added by the scaffold step below.

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

Body markup: `⟦anchor_id⟧` token at each slot; `[[SCP-YYY]]` Obsidian wikilink per cross-reference.

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
4. The build parser ignores files in `vault/entries/` whose names begin with `_` (e.g. the `_README.md` placeholder), so they won't fail validation. Author entities by copying `vault/docs/entry_template.md` to `vault/entries/SCP-XXX.md`.

## 6. Immediate next steps (first sprint)

Parallel tracks, both small:

- **Code:** technical_document.md milestones 1–3 — schema types, `build-corpus.ts` round-tripping 3 stub entries with validation, static file viewer with redaction bars and clearance gating, then single-file insertion + overlay + `displayedSlot`.
- **Content:** write the first 3 entities, deliberately sharing 2 concept-keys so propagation has something to act on at milestone 4. SCP-921 in the template is a copy-ready model for one of them.

Get the loop felt on 3 entities before scaling content.

## 7. Working with this collaborator

Direct, analytically rigorous, low tolerance for filler, hedging, or false consolation. Wants dense substantive engagement. Catches redundancy and over-completeness fast — do not pad. State decisions rather than asking permission for obvious ones; flag genuine forks. Lead with the load-bearing point.

## 8. Recommended additional documents

Ranked by value, with what each unblocks.

1. **Concept-Key Registry** *(before serious writing)* — the propagation graph's backbone. A living table: every `concept-key` → which entries/anchors carry it → the shared mutation-set ordering. Without it, authors coin orphan concepts and the graph silently fails to cohere. Maintainable as a Dataview query once enough entries exist; seed it manually now. **Highest leverage.**
2. **Entity Roster / Series Bible** *(before writing)* — the 15–30 entities planned up front, one line each: item #, class, one-line hook, concept memberships, clearance tier, breach effect. Curate the graph for density and tier pacing deliberately rather than emergently. *Partially covered:* `site_41b.md` now fixes the setting, five entry clusters with concept-key seams, the recurring cast, and the cluster-level budget split; the roster itself (per-entity lines) remains to be drafted from it.
3. **SCP-X Bible** *(before the endgame is buildable)* — the entity's arc: which concepts it threads through the corpus, the self-file design, and the two endgame fork conditions with the overlay-state thresholds that select them. The least-specified part of the design doc. *Partially covered:* `site_41b.md` §5–6 fix the entity's local incarnation (the Concordance), its self-file placement, and what the fork means; only the overlay-state thresholds remain.
4. **Four-State Visual Grammar Spec** *(before UI polish)* — the hardest unscoped surface per design_document.md §5.8. Color tokens, motion, provenance-hover, reduced-glitch mode. Pull in the frontend-design skill when building it.
5. **Vertical Slice Definition** *(to scope sprint one)* — the exact 3 entities, 2 shared concepts, and milestones 1–5 that constitute the first playable proof, and what "done" means.

Start 1 and 2 alongside the first three entries; they are the same curation work done deliberately. 3 before the endgame. 4 before UI polish. 5 if sprint scope needs a fence.
