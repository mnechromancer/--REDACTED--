# Entry Authoring — the contract, the spine, the craft

How to author game entries (`vault/entries/SCP-41B-###.md`). Merges the old
`entry_template.md` + `planning/handoff_authoring.md` (both in `archive/`), updated to the
**v3 frame** (`planning/reset_v3_intake.md`): two collections — the **local shelf**
(unredacted reference library) and the **inbound batch** (the redacted Site-41B documents).

**Schema authority is `src/lib/corpus.ts`** (the type contract the parser emits). This doc
is the authoring-side reading of it. The v3 fields (`collection`, `day`) are live in the
parser (Phase 1) and exercised by the shipping corpus (Phase 2: the REF shelf + the day-1
batch).

Tooling: author in Obsidian (`vault/` is the vault root); the **Site-41B authoring plugin**
(`plugins/site41b-authoring/`, `npm run plugin:install`) wraps the validate loop in-vault.
Or run it by hand: `npm run build:corpus` then `npm run test`.

---

## 1. The contract (per file)

One markdown file per holding in `vault/entries/`; `_`-prefixed files are ignored. The
build (`npm run build:corpus` → `static/corpus.json`) parses every `*.md` and **fails
loudly** on any violation.

**Frontmatter:**
- `item` — inbound documents: `"SCP-41B-###"`, numbered by batch (day 1 = 101–104; day N
  takes the N×100 block; `000` is the self-file). Shelf volumes: `"REF-##"`.
- `object_class` — Safe | Euclid | Keter (no ACS; period rule). Presentation nuances:
  shelf files carry `"Safe"` but render a REFERENCE VOLUME header, no class line; an
  inbound file whose *own class field is the puzzle* carries `"withheld"` so the pane
  header cannot leak the truth (see `SCP-41B-101`).
- `site` — `"Site-41B"` for inbound documents; `"Site-81C"` for shelf volumes.
- `entity_self` — boolean; **exactly one file in the corpus is `true`** (the self-file
  `SCP-41B-000`). Never add another.
- `collection` — `local` (shelf: unredacted, always reachable, persistent) or
  `inbound` (batch: redacted, mounted by day).
- `day` — which 4 AM mount delivers an inbound file. Local files have none.
- `xrefs` — array of item ids. **Every xref must also appear as a `[[wikilink]]` in the
  body** (rule `xref-linked`) — the wikilink is the player's traversal.
- `breach_effect` — `{kind: inject_xrefs | corrupt_search | lock_tier(+tier) |
  randomize_propagation(+fraction)}`.
- `anchors` — the redacted slots (below). **Local files have zero anchors** — the shelf
  is in the clear; that is its job (build-enforced).

**An anchor (per redacted word):**
- `id` — unique in the file (`a1`); a matching `⟦a1⟧` token must appear in the body,
  **exactly once** (a recurring fact is described in prose, not re-tokened).
- `slot_type` — object | agent | location | outcome.
- `truth` — **the single redacted word** (or tight proper-noun phrase). Immutable.
  **Every truth is original** (the licensing wall) — flavor may echo canon; resolutions
  may not.
- `grounding` —
  - `{kind: teaching, citeIn: [<item ids>]}` — the word stands **in the clear** in those
    files' prose. `citeIn` is a build-time winnability guarantee, not the play gate; at
    play any reachable span carrying the word grounds it. The normal kind.
  - `{kind: inference, threshold: N}` — no file states the word; the player assembles N+
    distinct grounding spans to a visible meter. Winnable inference content starts in
    Phase 4; until then only the self-file uses it.
- `concept` (optional) — a shared key from `concept_key_registry.md`. Co-carriers
  propagate together. **Coin keys in the registry first**, never in an entry.
- `exposure_weight` — what a Quippy fill here costs (~2 early, ~3 deeper).
- `lure` (optional) — Quippy's escalatory WRONG word; build-enforced `lure !== truth`.
  Give lures to **deeper** files so distrust is taught as the player descends; keep the
  on-ramp truth-only. A good lure is the entity's signature inversion: erase the human
  author, flip a countermeasure into its opposite, promote the interesting reading over
  the true one.

**Body prose:**
- Foundation paperwork, period register. Header block, sectioned addenda, dry transmittal
  language. The record is in-world paperwork that merely *contains* the grounding word —
  **never narrate how to cite**; the method belongs to AMBER's `man` pages, not the record.
- `⟦id⟧` at each slot; `[[SCP-41B-###]]` per cross-reference; a `> ` blockquote renders as
  a **margin note** in the gutter (Halloran's marginalia). A margin note lands beside
  wherever it sits in the source flow — to place one beside a paragraph, put the `> ` line
  directly after that paragraph.

## 2. The winnability spine (the one discipline that must hold)

The whole corpus must be solvable in AMBER alone — `real-corpus-winnable.test.ts` proves it
drives to `loop-broken` at exposure 0. Two build-enforced invariants make it true:

1. **Grounding-before-reachability.** Every teaching slot's truth word stands in the clear
   in a file **reachable before** it. Under the day model, reachable = the shelf + every
   batch mounted so far, so the chain bottoms out at the shelf. Author a topological
   chain: day-1 inbound files ground in the shelf; later files ground in earlier-solved
   vocabulary. A `citeIn` that mounts after its citing file is a build error.
2. **No dead traversal edges.** Every declared xref is a body wikilink the player can
   follow (`open <n>` follows the Nth reference; keep the numbering sensible).

**Per-file loop — do not batch:** author the file → `npm run build:corpus` → `npm run test`
(or just the winnable test). A broken grounding or traversal edge surfaces immediately
rather than cascading. This cadence caught real breaks in every batch authored so far.

Escape hatch: `npm run build:corpus -- --allow-incomplete` relaxes only the
"exactly one self-file" rule, for the gap while the self-file is being re-authored.

## 3. The v3 teaching shape

- **Shelf files** exist to ground specific inbound vocabulary. Each is a mundane,
  readable reference: a primer, a directory, a taxonomy, a practice manual, a blank form.
  Boring on purpose — and each carries, in the clear, the exact words the day's batch
  redacts.
- **Day-1 inbound files** ramp by *word kind*: an object class (grounded in the primer) →
  a staff name (the directory) → a term of art (the taxonomy) → a procedure word (the
  manual). One obvious grounding each. The last file xrefs the day's others.
- **Day 2+** shifts the grounding source from shelf → solved batch vocabulary (the context
  puzzles). Contradiction pairs (shelf copy vs. inbound copy of "the same" record) enter
  here; inference slots enter in Phase 4.
- **Cast discipline:** recurring names only from `site_41b.md` §4; 41B cast in documents,
  receiving cast in mail, never crossed.

## 4. Worked example (shipping — the Phase-2 on-ramp)

The real first pair: `REF-01` (the primer) grounds `SCP-41B-101` (the cover slip).
Abridged; the full files are in `vault/entries/`.

```markdown
---
item: "REF-01"
collection: "local"
object_class: "Safe"              # never rendered — shelf files show a REF header
site: "Site-81C"
entity_self: false
xrefs: []
breach_effect: { kind: "corrupt_search" }
anchors: []                       # the shelf is in the clear — zero anchors
---
# REF-01 — Object Classification Primer
...An object is classed **Euclid** when it is insufficiently understood for its
containment to be presumed reliable... [the truth word stands here in the clear,
inside a definition whose language the slip's posture prose will match]
```

```markdown
---
item: "SCP-41B-101"
collection: "inbound"
day: 1
object_class: "withheld"          # the slip's own class field IS the puzzle — no leak
site: "Site-41B"
entity_self: false
xrefs: []                         # shelf cites need no xref; 104 is the day's link hub
breach_effect: { kind: "corrupt_search" }
anchors:
  - id: "a1"
    slot_type: "object"
    truth: "Euclid"
    grounding: { kind: "teaching", citeIn: ["REF-01"] }
    exposure_weight: 2
---
# Intake Transfer Slip — Consignment 41B/108
**6. CLASS OF RECORD:** ⟦a1⟧
**7. POSTURE DURING TRANSIT:** ...its behaviour in transit is not sufficiently
understood for the enclosed documentation to be presumed reliable... [free text
that only fits one class; the slip also names the erasure schedule and carries
the manifest — including the untitled self-file]
```

Authoring hazards this pair demonstrates: the slot's own file must **not** hold its truth
word in the clear (101 never says "Euclid"; 102 never says "Halloran" — mind margin-note
attributions); the pane header renders `object_class`, so a class-word puzzle needs
`"withheld"`; posture/definition language must be echoed tightly enough that the shelf
file is findable by reading, not by luck.

## 5. One-line summary

Author single-word, original, teaching-grounded entries in a topological chain that bottoms
out at the shelf; every xref a followable wikilink; build + winnable-test per file; lures on
the deep files, none on the on-ramp; the method stays out of the prose and the cast stays
tiny. The build fails loud on every rule that matters.
