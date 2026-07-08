# Game Spec — ⟦REDACTED⟧

The single authoritative spec: mechanics + schema + engine + build order. Written for the
**v3 frame** (2026-07-04, `planning/reset_v3_intake.md`; decisions in
`planning/amber_build_decisions.md` §"v3"). Merges and supersedes the old
`design_document.md` + `technical_document.md` (both in `archive/`, kept as history).
Setting canon: `site_41b.md`. The entity: `scp_x_bible.md`. Authoring: `entry_authoring.md`.

Sections marked **⟨Phase N⟩** describe target design not yet in the engine; everything
unmarked is built and tested on `main`.

---

## 1. Logline & frame

You are a **temp archivist at an irrelevant Foundation records satellite**. Every day at
**4:00 AM** the site receives a batch of heavily-redacted documents from **Site-41B** — a
deep-records annex that no longer answers correspondence. Every day at **4:00 PM** the batch,
and every note taken about it, written or digital, is **erased completely** by an unverified
mechanism. Senior staff burned months against this; nothing they produced survived an
afternoon. The work has been delegated down to you.

The one thing the erasure has never claimed is a **properly-cited reconstruction**: a redacted
value re-derived inside AMBER's citation ledger and transmitted before the deadline persists.
Annotation dies; re-derivation survives. Nobody at the site can say why.

Two tools answer the work:

- **AMBER** — the site's own ancient Foundation-standard records OS. A clinical 1980s
  command-line terminal. It does not lie and it does not make anything easy: to unredact a
  word you find where the surviving record grounds it and forge the citation yourself.
  AMBER unredaction costs **zero exposure**.
- **Quippy** — a bright, friendly helper that arrives *with the batch*. It is Site-41B
  contamination: the entity `SCP-41B-000`, wearing an assistant's costume. It reads the
  files for you, fills redactions in one click, and remembers things the erasure should
  have taken. Every Quippy assist raises exposure and permanently taints the run.

The core fantasy is **forbidden literacy where the easy tool is the threat**. The loop in
one line: *the easy tool reads the files for you and lets the thing out; learn the files
well enough to read them yourself, and you starve it.*

## 2. North star, keystone, invariants

**North star:** confirm a player's deduction without the confirmation leaking the answer.
This design's mechanism is the **overlay/ground-truth delta** — the player edits a mutable
overlay; truth never moves; AMBER *judges* a commit (word + forged citations) and never
volunteers a value or where one lives.

**Keystone identity:** *leaning on Quippy is the spend.* A Quippy assist both gives the
value and advances the entity. Honest work in AMBER costs nothing but reading. There is one
mechanism, not two currencies.

**Invariants — violation is a design bug, reject on sight:**

1. **Quippy carries all exposure; AMBER costs zero.** Never add a stability resource
   separate from inference; never make AMBER manual unredaction cost exposure (that
   collapses the two routes back into one).
2. **The player never edits truth.** The overlay/truth delta is the puzzle.
3. **AMBER never volunteers.** No clue lists, no candidate surfacing, no "did you mean."
   The player supplies the word and the grounding; AMBER only adjudicates. Every
   answer-surfacing convenience belongs to Quippy, priced accordingly.
4. **The winnability spine holds at build time.** Every teaching slot's truth word stands
   in the clear in a file reachable before it; every declared xref is also a body wikilink.
   `build-corpus` fails loudly on both; the corpus is proven AMBER-only solvable by test.
5. **Quippy taint is permanent.** Any slot ever touched via Quippy forecloses the true
   ending — no redemption, no laundering. (An AMBER re-solve still zeroes its exposure;
   the win-taint stands.)
6. **Breaches are board state, not a fail screen.** They mutate terminal behavior;
   recovery is first-class.
7. **Notes die at 4 PM; cited commits survive.** The transmittal model is the only
   in-fiction persistence. Never add another channel that bypasses citation — offering
   one is Quippy's pitch, not a feature.
8. **Licensing wall.** Flavor may echo canon as heavily as wanted; every ground-truth
   resolution is original; nothing verbatim ships.

## 3. Core loop

1. **Read.** Open a file from the day's batch (or the local shelf). Redacted words render
   as inline bars in a paperwork-styled document with margin-gutter notes.
2. **Recover the word.** Follow the cross-references; find where the corpus grounds the
   redaction — a shelf reference that states it plainly, another batch file, or (deep)
   circumstantial context assembled across files.
3. **Forge and commit (AMBER).** Type the word, select the span where it stands, forge the
   citation, commit. AMBER judges: a reachable span carrying the word grounds it
   (teaching), or enough distinct grounding spans clear the visible threshold (inference).
   Wrong or unsupported → terse rejection; go read more.
4. **— or take the offer (Quippy).** One click, no citation, no reading. Exposure rises;
   the run is permanently tainted; at higher exposure the offered word may be the **lure**
   — the entity's escalatory wrong reading.
5. **Propagate.** Co-carriers of the slot's concept update across the corpus, inheriting
   the edit's provenance. A single Quippy fill ripples as Quippy reliance everywhere it
   lands.
6. **The jam clears.** Every recovered word is new citable vocabulary; the reachable,
   groundable frontier widens. Play is topological — the order is discovered, not told.
7. **⟨Phase 1⟩ 4 PM.** Cited commits transmit and persist. The batch, the notes, and all
   uncommitted work erase. Next 4 AM, more arrives.
8. **Exposure gates breaches;** breaches mutate the terminal; the ending reads the board.

## 4. Mechanics

### 4.1 The primitive
A redaction is **a single exact word** (or tight proper-noun phrase) with exposition
payload: recovering it teaches a name, a method, a piece of vocabulary that grounds further
slots. Never free-text-anything: the commit is judged against the one authored `truth`.

### 4.2 Grounding
- **Teaching** (`{kind: teaching, citeIn: [...]}`): the word stands plainly in another
  reachable file. `citeIn` is a **build-time winnability guarantee**, not the play gate —
  at play, *any* reachable span carrying the word grounds it.
- **Inference** (`{kind: inference, threshold: N}`): no file states the word. The player
  assembles N+ distinct grounding spans (de-duped by file + text); a **visible meter**
  fills; commit at threshold. Structurally built; exercised only by the self-file today —
  ⟨Phase 4⟩ gives it winnable content (spec_game §10, patterns 2/5/7 of the intake doc).

### 4.3 Forged citations — the AMBER verb
The player SELECTS the span in a reachable record where a recovered word stands and FORGES
a citation from it (`ForgedCitation { item, text }`). Forging is **target-free** (Phase-2
playtest): every citation lands in the player's **citation workspace** — a global pouch,
not a per-slot buffer — so evidence can be staked before the field it grounds is ever met.
Unredaction is an explicit, **pinned** two-step: PREPARE UNREDACTION on a field (immune to
browse-retargeting; only cancel, a successful initiate, or the wipe unpin it), select
workspace citations toward it, TYPE the word (matched case-insensitively; the overlay
stores the canonical truth), INITIATE. The link always draws (it is the player's
assertion); **commit judges** (`spanContainsWord`). Citations are not consumed by a commit
(one span may ground several fields) and die at the 4 PM wipe. AMBER never surfaces where
a word lives. Redaction bars render `█████`, so a propagated value can never be selected
as evidence — the honesty rule holds structurally.

### 4.4 Collections & reachability (built — Phase 1)
`ScpFile.collection: 'local' | 'inbound'` (absent ⇒ inbound), `ScpFile.day` (absent ⇒ 1).
- **Local** (the shelf): the receiving site's own reference library. Unredacted (zero
  anchors, build-enforced), always reachable, persistent across days. The grounding
  floor — the winnability chain bottoms out here, and citing the shelf needs no declared
  xref (the shelf is on the desk, not behind a link).
- **Inbound** (the batch): redacted Site-41B documents, mounted by `day`.
- **The day is the gate** (Phase-1 build decision, replacing v2's seed-plus-xref-closure):
  every mounted file is openable — the tray is open. The xref graph is navigation and
  grounding-discovery; a reference to a not-yet-mounted file is a dead letter (`NOT IN
  ARCHIVE`) until its 4 AM, which is the tease. The traffic jam lives in what you can
  *ground*, not what you can open; pacing lives in days.

### 4.5 The day cycle — transmittal model (built — Phase 1)
A day runs 4 AM → 4 PM (diegetic pacing, not real-time pressure); `end` runs the
turnover. At 4 PM the erasure takes the **work-product**: `note` contents, forged-but-
the citation workspace, any prepared unredaction, the live selection, the terminal log,
the cursor's memory.
What persists is **run state**: the overlay — committed, cited unredactions transmit,
and Quippy's fills survive too, which is a tell — plus exposure, breaches, and taint
(breaches recompute from exposure, which persists; the erasure takes work, not
consequences). Next 4 AM mounts the cumulative batch (prior files plus new arrivals)
and delivers the day's mail. Quippy's *memory* also survives the wipe (§5.2) — the
loudest early tell.

### 4.6 Propagation
Concept-keyed, tool-agnostic, provenance-inheriting (unchanged since Sprint 1): co-carriers
of an inserted slot's `concept` update together; a propagation never clobbers a
player-inserted slot; propagated entries inherit the causing edit's `via`.

### 4.7 Exposure, lures, taint
- **Exposure** is recomputed from the overlay: Quippy-routed entries contribute their
  anchor's `exposure_weight`; AMBER entries contribute zero. An AMBER re-solve of a
  Quippy-filled slot drops its exposure contribution to zero.
- **Lures** (`Anchor.lure`): the entity's plausible-but-wrong escalatory word. Band-gated
  offer: low exposure surfaces truth and lure both (lure framed as interesting); mid
  recommends the lure; high/post-breach omit the truth. Accepting a lure is a wrong fill →
  contradiction + struck penalty + taint.
- **Taint** (`quippyTouched`): permanent, monotonic, run-scoped. Reads into the ending.
  ⟨Phase 1⟩ persists across days within a run.

### 4.8 Breaches
Exposure thresholds breach entities; effects mutate the terminal (`inject_xrefs`,
`corrupt_search`, `lock_tier`, `randomize_propagation`); dropping exposure back below
threshold recovers. ⟨Phase 1⟩ a breach can also end the day early (the site pulls the
plug), which is pacing, not failure.

### 4.9 Endgame
The ending reads the board: **the true ending (`loop-broken`) = the whole inbound corpus
reconstructed to truth with zero Quippy touches ever** (hard gate, permanent taint). The
self-file is excluded from the restoration target — Quippy is the entity you starve, not
the puzzle you solve. Every other outcome is a breach ending, authored, recovery-first.

## 5. The two tools

### 5.1 AMBER — the OS
**Register:** amber-phosphor 80s institutional terminal; document-as-paperwork rendering
with a margin gutter; clinical Quality-Approval voice (`E2x REJECT — no forged citation
carries this word`). AMBER never references Quippy — it has no record of it.

**Design rule for every AMBER tool: it makes reading faster; it never reads for you.**

Built: `open/o` (designations resolve case-insensitively), `next/n` (next outstanding
field — "struck" now means a wrong fill, the Phase-3 vocabulary; `next doc` cycles
records), `cite/forge/c` (stakes the selection into the
citation workspace, §4.3), `quippy/q` (dispatched but undocumented — see the register
note below), `prov`, `help/?` + keyboard span/file traversal;
(Phase 1) `mail/m [n]` — the message store, onboarding/pacing, the receiving-site cast —
messages read full-pane in the document region; `note [text]` — the scratchpad the
erasure exists to take; `end`/`eod` — the 16:00 turnover. A MOUNT listing at session
start names the day's consignment and the shelf. Presentation: a one-screen terminal
(document ≤ half page, Concordance beside it, log+prompt fused into one console), modules
powering on in sequence, exposure-driven rot only.

(Phase 3 — **built 2026-07-07**; decisions P3-1…P3-10 in `planning/sprint_03_the_os.md`)
the OS surface:
- `ls [batch|shelf]` — the mount listing: shelf volumes + mounted consignments with
  per-record restoration counts (`object_class` prints verbatim — "withheld" stays).
- `man <cmd>` — AMBER's terse self-documentation (`manpages.ts`, copy as data); the only
  tutorial voice in the game. **`man quippy` returns *no entry*** — AMBER has no record
  of it (the designed tell); the `quippy` verb dispatches but is documented nowhere, and
  no AMBER string names the intruder (the reliance counter reads `UNCITED n`).
- `status` — day (no wall clock; the shift is event-based), consignment/field census,
  transmittal-eligible count, exposure as the diegetic **IRREGULARITY INDEX** (bands
  match the chrome's corruption thresholds; the index IS exposure, not a new resource).
- `log` — the provenance ledger, derived entirely from the overlay (no new store):
  CITED COMMIT / ANNEX OF `caused_by` / **NO CITATION ON FILE** for Quippy-routed
  entries — the missing paperwork is the tell.
- **`xref <word>` / `grep <word>` — the concordance** (`concordance.ts`). Lists every
  *reachable* record whose *rendered* text carries the word, as numbered hits; coverage
  grows as the player solves — the traffic jam made visible. Match rule = the commit
  gate's `spanContainsWord` verbatim, so every hit's snippet grounds its word at commit
  (from any other record); snippets are exact substrings of rendered lines. `xref <n>`
  opens hit *n* and forges its span into the workspace (stale listings re-verified at
  jump). `search`/`s` alias it; the old raw-body search is retired. Honest by
  construction: it finds occurrences of a word the player supplies; never suggests one.
- `diff <a> <b>` (`diffRecords.ts`) — side-by-side in the document pane for the
  duplicate-record family; unsolved slots compare as identical bars — a diff never
  leaks a truth.
- `verify` — read-only transmittal QC: per-record restored/total, struck fields flagged
  `DISAGREES WITH RECORD — RE-DERIVE`, complete records `CLEARED FOR TRANSMITTAL`; the
  self-file excluded from totals (`NOT SCHEDULED FOR TRANSMITTAL`).
- Engine guarantee landed with this phase: a struck slot renders **only the wrong word,
  struck** — `resolveSlot` no longer hands the renderer the truth (the v1 "truth bleeds
  in" leak, caught in review).

⟨Phase 6⟩ `map` — the wiki-graph plotter: files as nodes, xrefs as edges,
solved/reachable/locked states. The dependency structure the player is clearing, drawn.

### 5.2 Quippy — the intruder
**Register:** violet GUI overlay, paperclip-with-diamondback, warm/eager/first-person,
curdling by exposure band (voice spec: `scp_x_bible.md`). Summonable, dismissable,
refusable; it interrupts uninvited at authored triggers. Arrival: **rides the inbound
batch**; first contact (built — Phase 1, decision v3-C) fires on the player's first
forged-and-committed citation, routing back to a blank the player left (falling back
to the next redacted span; never the slot just solved).

Each mechanic is the negation of an AMBER tool, and each must be genuinely useful:

1. **Fill** (built) — one-click unredaction; lures by band.
2. **Ghost-text** ⟨Phase 5⟩ — inline completion while typing in the forge panel, refusable
   per keystroke; accepting is an assist. The anti-concordance: it spares you knowing the
   word at all.
3. **Summarize** ⟨Phase 5⟩ — a fluent précis of an unread file; accurate at low exposure,
   subtly editorialized at higher bands (where lure vocabulary seeds first). The
   anti-reading tool. Cost model tuned in build (§9 dial).
4. **Batch fill** ⟨Phase 5⟩ — past mid-band, wholesale: "I can do this page while you get
   coffee." One acceptance, many assists.
5. **Memory across the wipe** ⟨Phase 5⟩ — day-2+ offers to restore erased notes and
   yesterday's words. The continuity lure, and the loudest early tell.
6. **Reference corruption** ⟨Phase 7⟩ — a Quippy fill rewrites the cross-referenced text so
   the corpus closes over the lie (`planning/design_note_quippy_corruption.md`).

Every Quippy artifact — filled word, ghost completion, summary card — renders in Quippy's
register, never AMBER's, and never carries a citation.

### 5.3 The clash is content
The register clash (cold competent CLI vs. bright eager GUI) is a primary object of
investigation. The switch between them is a felt act; the two style/voice systems share no
tokens beyond the slot grammar. Doing the right thing always feels like the worse user
experience — that is the thesis, so the game never scolds; consequence and the curdling
voice make the case.

## 6. Schema

The authoritative contract is **`src/lib/corpus.ts`** (kept documented; mirror changes
there first). Summary of the live model:

```ts
type Grounding = { kind: 'teaching'; citeIn: string[] }
               | { kind: 'inference'; threshold: number };

interface Anchor {
  id: string;                    // unique in file; matching ⟦id⟧ token in body, exactly once
  slot_type: 'object' | 'agent' | 'location' | 'outcome';
  truth: string;                 // THE single redacted word/phrase; immutable; original
  grounding: Grounding;
  lure?: string;                 // Quippy's escalatory wrong word; build-enforced ≠ truth
  concept?: string;              // co-carrier key (registry-coined); optional
  exposure_weight: number;       // what a Quippy fill here costs
}

interface ScpFile {
  item: string;                  // "SCP-41B-XXX"
  object_class: string;          // Safe | Euclid | Keter (no ACS — period rule)
  site: string;
  anchors: Anchor[];
  xrefs: string[];               // each must also appear as a [[wikilink]] in body
  breach_effect: BreachEffect;   // inject_xrefs | corrupt_search | lock_tier | randomize_propagation
  entity_self: boolean;          // exactly one true in the corpus (SCP-41B-000)
  body: string;                  // prose; ⟦id⟧ tokens; [[wikilinks]]; "> " margin notes
}

interface OverlayEntry {         // runtime; the player's layer — truth never moves
  anchor_ref: string; value: string;
  source: 'inserted' | 'propagated';
  via?: 'amber' | 'quippy';      // provenance; propagation inherits it; the ending reads it
  caused_by?: string; contradicts_truth?: boolean;
}
```

**v3 delta (built — Phase 1):** `ScpFile.collection?: 'local' | 'inbound'` and
`ScpFile.day?: number` (both optional; absent ⇒ inbound, day 1 — the v2 corpus needs no
edits). Local files: zero anchors, no `day` — build-enforced. The winnability guarantee's
reachability half is now the day model: a teaching slot's `citeIn` must be local or mount
no later than the citing file; shelf cites need no declared xref. Session state:
`session.day`, `session.notes`, the mail store (`mail.svelte.ts`).

## 7. Engine & pipeline

- **Stack:** Svelte 5 (runes) + Vite + TypeScript; IndexedDB (`idb`) + localStorage.
  A repo, not a single-file artifact. Do not re-scaffold.
- **State** (`src/lib/`): `game.svelte.ts` (overlay, insert/commit, exposure recompute,
  `quippyTouched`, `endState`), `ripples.svelte.ts` (propagation), `ui.svelte.ts` (mode,
  citation workspace + prepare, traversal), `quippy.svelte.ts` (bands, suggestions, first contact),
  `session.svelte.ts` (boot/met flags; ⟨Phase 1⟩ grows the day clock), `corpus.ts` (types),
  `parseBody.ts`/`bodyBlocks.ts` (tokens, wikilinks, margin blocks).
- **Key seam:** `commitWithCitations(ref, word, ForgedCitation[])` guards the shared
  `insert(ref, value, via)` primitive; Quippy calls `insert` directly. Both routes share
  propagation; they differ at the commit boundary and in `via`/exposure.
- **Pipeline:** `scripts/build-corpus.ts` parses `vault/entries/*.md` → `static/corpus.json`,
  failing loudly on: token/anchor mismatch, unresolved xref, xref without body wikilink,
  grounding not citeable from a reachable predecessor, `lure === truth`, ≠1 self-file.
  Authors never edit JSON. `npm run build:corpus` / `npm run check` / `npm run test`;
  the Obsidian plugin (`plugins/site41b-authoring/`) wraps the loop in-vault.
- **Proof of winnability:** `real-corpus-winnable.test.ts` solves the entire authored
  corpus AMBER-only to `loop-broken` at exposure 0. Keep it green per authored file.

## 8. Build order — v3 phases (each ends playable)

- **Phase 0 — decisions + docs consolidation.** ✅ *done 2026-07-04.*
- **Phase 1 — the frame's engine.** Collections, day clock + transmittal wipe, `note`,
  mail store; day-gated reachability replaces seed-plus-closure; first-contact trigger
  moved to the first honest commit. Proven on a micro-corpus (shelf + day-1 + day-2).
  ✅ *done 2026-07-04; 164 tests.*
- **Phase 2 — the opening.** Boot/login (Site-81C receiving voice), day-1 mail, the real
  shelf (`REF-01…06`) + day-1 batch (`SCP-41B-101…104`, ramped by word-kind), the
  self-file riding the batch, Quippy's entrance on the new content. Retired the v2
  entries. ✅ *done 2026-07-05; hardened by live playtest 2026-07-06 (citation workspace +
  PREPARE/INITIATE verb, case-insensitive commit, one-screen terminal, Pages deploy) —
  169 tests. Records in the decisions log.*
- **Phase 3 — the OS.** `ls`/`man`/`status`/`log`, the concordance (`xref`/`grep`),
  `diff`, `verify` skin. ✅ *done 2026-07-07 — built orchestrator-worker with the standing
  subagent definitions (`.claude/agents/`, `agents.md` §6); 223 tests. Decisions
  P3-1…P3-12 in `sprint_03_the_os.md` + the decisions log; review also sealed the
  pre-existing struck-slot truth leak.*
- **Phase 4 — content: the context puzzles.** Day 2–3 batches; the directory discrepancy;
  inference gets winnable slots; the new registry seeds.
- **Phase 5 — Quippy's widening.** Ghost-text, summarize, batch fill, wipe-memory.
- **Phase 6 — the graph.** `map`.
- **Phase 7 — reference corruption.** The largest engine change (mutable per-run
  truth-facing prose); spec'd in `planning/design_note_quippy_corruption.md`.

## 9. Dials

- **Temptation/difficulty** (central): inference thresholds, concordance availability,
  Quippy cost + curdle rate, summarize pricing.
- **Grounding legibility:** transparent meter (default) → opaque accept/reject (hard).
- **Day length / batch size** ⟨Phase 1⟩: the pacing dial.
- **Provenance visibility:** surface AMBER-vs-Quippy per slot (legibility aid for the
  no-Quippy goal).
- **Reduced-motion / reduced-glitch** for corruption styling.

## 10. Risks

- **The temptation must be real but escapable** — too-hard AMBER inverts the moral
  (players use Quippy out of resentment); too-easy AMBER kills the tension. The concordance
  moves this dial a lot: watch that it doesn't make teaching slots trivial (it still
  requires knowing the word; that is the intended floor).
- **Re-derivation tedium** ⟨Phase 1⟩: the transmittal model avoids daily re-solving, but if
  a run resets (breach-heavy play), re-deriving known slots must be *fast* — the forge verb
  is quick by design; keep it so.
- **Propagation legibility:** corruption must trace (`caused_by` on hover; `log`).
- **The two-currency temptation:** any future stability resource, or any exposure cost on
  AMBER, violates invariant 1. Reject on sight.
