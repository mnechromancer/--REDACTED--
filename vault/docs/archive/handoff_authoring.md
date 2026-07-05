# Handoff — authoring entries (Phase 4+ content, in Obsidian)

> ### ✂ For the claude.ai instance building the Obsidian + Claude Code plugin
> *(Copy this block over to that project — it's tooling context, not authoring.)*
>
> You're wiring an Obsidian vault to Claude Code to author entries for a Svelte text-game.
> The vault is `vault/` in the game repo; **author only in `vault/entries/*.md`** (the parsed
> game data) — `vault/docs/*` is specs, not game content. Each entry is markdown + YAML
> frontmatter; `_`-prefixed files are ignored. The repo's build (`npm run build:corpus`) parses
> entries → `static/corpus.json` and **fails loudly** on schema/winnability violations, so the
> useful plugin loop is: edit an entry → run `npm run build:corpus` and `npm run test` → surface
> the (precise, rule-named) errors back into Obsidian. The hard authoring rules the build checks
> live in `handoff_authoring.md` (this file) and `amber_build_decisions.md` §"Phase 4"; the
> schema contract is `src/lib/corpus.ts` (the `Anchor`/`ScpFile` types — the source of truth) and
> `entry_template.md`. Don't have the plugin invent schema; have it read those. There are good
> existing references online for Obsidian-plugin + Claude-Code/MCP wiring — lean on them; the
> game-specific part is just "respect the entry schema and run the two build commands."
>
> ---


**To:** the instance authoring new game entries (`vault/entries/SCP-41B-###.md`), likely
through an Obsidian + Claude Code setup.
**From:** the Phase-4 build (first content batch + playtest fixes), 2026-06-17.
**Branch state:** `feat/phase4-content-spine`, 3 commits ahead of `main`. The corpus is
**10 files** (`SCP-41B-000`…`009`). `check` 0/0, 144 tests, build green.

Read this, then `amber_build_decisions.md` §"Phase 4" (the discipline these entries follow)
and `entry_template.md` (the schema banner). The setting canon is `site_41b.md` (clusters,
cast, the area arc, the redactor) and `concept_key_registry.md` (the concept-key graph).
`scp_x_bible.md` carries Quippy's voice and the lure semantics.

---

## What the game needs from a new entry (the contract)

An entry is markdown with YAML frontmatter, one file per holding, in `vault/entries/`.
Files prefixed `_` are ignored (e.g. `_README.md`). The build is
`npm run build:corpus` → `static/corpus.json`; it parses every `*.md` and **fails loudly**
on a violation. Author against the LIVE v2 schema — NOT the stale tables in the roster:

**Frontmatter (per file):** `item`, `object_class` (Safe|Euclid|Keter — no ACS),
`site`, `entity_self` (boolean; exactly one file in the whole corpus is `true`, the
self-file `SCP-41B-000` — do not add another), `xrefs` (array of item ids),
`breach_effect` (`{kind: inject_xrefs|corrupt_search|lock_tier(+tier)|randomize_propagation(+fraction)}`),
and `anchors` (the redacted slots).

**An anchor (per redacted word):**
- `id` (unique in the file, e.g. `a1`) — and a matching `⟦a1⟧` token must appear in the body.
- `slot_type`: object | agent | location | outcome.
- `truth`: **the single redacted word** (or tight proper-noun phrase). Immutable. This is
  the v2 primitive — produce the exact word, not pick from a set. **Every `truth` is
  original** (the licensing wall, `scp_x_bible.md` §8): flavour may echo canon, resolutions
  may not; nothing verbatim ships.
- `grounding`: how AMBER lets the player recover it. Two kinds:
  - `{kind: teaching, citeIn: [<item ids>]}` — the word appears IN THE CLEAR in those
    files' prose. This is the normal, winnable kind.
  - `{kind: inference, threshold: N}` — no file states it; assembled from N+ spans. Only
    the self-file uses this today; **don't author inference slots into the winnable corpus**
    unless you also intend the deeper grounding work (it's under-exercised — see decisions log).
- `concept` (optional): a shared key from `concept_key_registry.md`. Anchors sharing a key
  are co-carriers — they propagate together. Reuse existing keys; coin new ones in the
  registry FIRST (the registry's own rule).
- `exposure_weight`: a number; what a Quippy fill here costs. ~2 early, ~3 deeper.
- `lure` (optional): Quippy's escalatory WRONG word (Phase-4 Question F). When present it
  must differ from `truth` (build-enforced). Quippy offers it as exposure rises (the §4 tell).
  Give lures to DEEPER files so distrust is taught as the player descends; leave the on-ramp
  truth-only. A lure is the entity's signature inversion — erase the human author, flip a
  countermeasure into its opposite (see 006–009 for the pattern: person→directive,
  fixative→solvent, flood→rota, Sze→Concordance).

**Body prose:**
- One `⟦id⟧` token per anchor, EXACTLY ONCE (a recurring fact is described in prose, not
  re-tokened — a duplicate renders a second redaction bar).
- A `[[SCP-41B-###]]` wikilink for every cross-reference. **The body wikilink is the
  player's clickable/keyboard traversal — see the winnability spine below.**
- A `> ` blockquote line renders as a MARGIN NOTE (Halloran's marginalia, in the gutter).
- **Do NOT narrate how to cite.** The method belongs to AMBER's `help`, never the record
  (`design_note_forged_citations.md` §Companion principle). The record is in-world paperwork
  that merely *contains* the grounding word, unaware it teaches anything.

---

## The winnability spine (the one discipline that must hold)

The whole corpus must be solvable in AMBER alone — `real-corpus-winnable.test.ts` proves it
drives to `loop-broken` at exposure 0. Two invariants make that true; the build enforces both:

1. **Grounding-before-reachability.** For every teaching slot, its `truth` word must stand
   in the clear in a file that is **reachable before** this one. Reachability flows from the
   seed (`SCP-41B-001`, set in `App.svelte`) outward along xrefs. So author a **topological
   chain**: file N grounds in file <N. (`checkGroundingCiteable` fails the build if a `citeIn`
   file doesn't hold the word, isn't a declared xref, or is the file itself.)
2. **No dead traversal edges.** Every declared `xref` must also appear as a `[[wikilink]]` in
   the body — otherwise the file is graph-reachable but the player has no link to click/`open`
   (this stranded a playtester at 005). `checkXrefs` rule `xref-linked` fails the build on this.
   Cross-references are numbered in the prose; `open <n>` follows the Nth — keep them sensible.

**Practical loop (do this per file, don't batch):** author the file → `npm run build:corpus`
→ `npm run test` (or just `npx vitest run src/lib/__tests__/real-corpus-winnable.test.ts`).
A broken grounding or traversal edge surfaces immediately rather than cascading. This is how
the first batch was built; it paid off (a broken 003→004 edge caught at file 5, not file 9).

Build flags: `npm run build:corpus -- --allow-incomplete` relaxes the "exactly one self-file"
rule (only needed if the self-file is temporarily absent). Normal authoring needs no flag.

---

## What to author next (canon directions, not commissioned)

The first batch (003–009) seeded one file per arc. The roster (`entity_roster.md`) sketches a
25-entity plan, but it predates v2 (its `clearance`/tier columns are retired — read it for
*cluster/hook intent only*, and the decisions log for ground truth). Good next directions:
- **Deepen an arc** — the Misfiled (`audit-cycle`, `the-quiet-exchange`), the Quiet Departments
  (Marsh, `shift-roster`), the Negative Stacks (the corridor, the Vivified Wing).
- **Second carriers for the area-arc keys** — `the-access-road`/`the-claim` each have only one
  carrier now; the no-orphan rule wants ≥2 (registry §3b has `the-watershed` reserved too).
- **Cast under heavy reuse** — Vogel/Halloran/Marsh/Sze/Andrade only; a small recurring cast is
  what makes it feel like one site. Halloran's marginalia are the prior-loop warning thread.
- **The redactor stays unwritten** (`site_41b.md` §3.1) — seed it via redacted *surface*
  records in the area arc; do not name it or give it a file.

Whenever you add a carrier, register it back in `concept_key_registry.md` (mark `✎`).

## A note on margin placement (small, but you'll hit it)

A `> ` margin note renders in the right gutter aligned to **where it sits in the source flow**.
The batch puts marginalia in a trailing "Archivist's note" addendum, so they land low rather
than beside the passage they comment on. If you want a note *beside a specific paragraph*, put
the `> ` line right after that paragraph in the markdown. The CSS handles it either way; this is
just placement craft.

## One-line summary
Author single-word, original, teaching-grounded entries in a topological chain (each word
stands in the clear in an earlier reachable file; each xref is also a body wikilink); build +
winnable-test per file; give deeper files a `lure`; keep the method out of the prose and the
cast tiny. The build fails loud on every rule that matters.
