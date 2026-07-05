# Reset v3 — the receiving site, the daily batch, the 4 PM erasure

**Status:** Direction set by the human (2026-07-04). **§7 answered same day (A: transmittal
model; B: concepts survive, details redone; C: rides the batch, first-commit trigger; D:
consolidation approved) — recorded in `amber_build_decisions.md` §"v3". Phase 0 (the §8
consolidation) is executed; this doc's §8 table is now history. Next: Phase 1.**
This is the **third pivot**. Unlike v2
(which replaced the redaction primitive), v3 keeps the primitive and nearly all of the engine —
single-word slots, forged citations, grounding, propagation, exposure, lures, permanent taint,
the no-Quippy win all survive. What changes is the **frame** (who the player is, where they
are, where the documents come from), the **content** (concepts and threads restart from
scratch), the **onboarding** (OS-first, mail, explore, *then* Quippy), and the **shell**
(AMBER becomes a real OS CLI, and both tools grow mechanics that widen the AMBER/Quippy gap).

**This doc is plan + questions + cleanup disposition only.** Per the v2 precedent, nothing is
deleted, moved, or rewritten until the §7 questions are answered. It also carries the docs
consolidation the human asked for (§8) — the folder is three pivots deep and the banner-on-
banner pattern stops here: v3 collapses instead of annotating.

**Read order to act on this:** this doc → answer §7 → Phase 0 (§9) executes the consolidation
→ then the build phases run.

---

## 1. Where the build actually is (status review, 2026-07-04)

Everything below is merged to `main` and green (144 tests at the Phase-4 merge; re-verified
this pass).

**Engine (survives v3 wholesale):**
- Single-word redaction slots; `truth` immutable; typed-word + **forged-citation** commit
  (select a span in a reachable file where the word stands, forge, commit judges) —
  `game.svelte.ts`, `ui.svelte.ts`, `AmberLookup.svelte`.
- Grounding: `teaching` (co-occurrence; `citeIn` demoted to build-time winnability guarantee)
  and `inference` (N distinct grounding spans to a visible threshold meter). Inference is
  structurally present but exercised only by the self-file today.
- Pure-graph reachability (clearance cut entirely, v2 §6-D); propagation via `concept` keys;
  exposure recomputed from the overlay; four breach kinds mutate terminal behavior.
- **Permanent `quippyTouched` taint** (no redemption, no laundering); the no-Quippy ending
  reads it; the self-file is excluded from the restoration target.
- Quippy: violet GUI intruder, paced 5-beat first contact, band-gated voice, and **lures** —
  the escalatory wrong word, offered more insistently as exposure rises; accepting one is a
  wrong fill + struck penalty + taint.
- Corpus pipeline: `build-corpus.ts` fails loudly on schema, grounding-citeability,
  xref-linked, lure≠truth, single-self-file; `real-corpus-winnable.test.ts` proves the whole
  authored corpus drives AMBER-only to `loop-broken` at exposure 0.

**Shell (partially survives):** 80s amber-phosphor register, document-as-paperwork with margin
gutters, typed bootup, keyboard-first. The "CLI" is real but thin — `open/next/search/cite/
quippy/prov/help` — a command palette wearing a prompt, not an OS. This is the v3 target.

**Content (retired by v3):** 10 files (`SCP-41B-000`–`009`), a proven topological grounding
chain, one file per arc. Retired as playable content under §7-B; the Site-41B *canon* they
carry is another question (also §7-B).

**Not yet built (carried forward):** Phase 5 wiki-graph view; Phase 6 Quippy
reference-corruption (`design_note_quippy_corruption.md` — spec'd, unbuilt, still wanted);
the owed docs pass (this doc executes it as §8).

---

## 2. The new frame

### 2.1 The premise (human's lore, made structural)
The player is a **temp/intern archivist at an irrelevant Foundation site** — a low-prestige
records satellite nobody audits. Every day at **4:00 AM** the site receives a batch of
heavily-redacted documents from **Site-41B**. Every day at **4:00 PM** the batch — and every
note taken about it, written or digital — is **erased completely** by an unverified mechanism.
Senior staff burned months against this and got nothing that survived a single afternoon; the
task has been delegated down to the temps, who are cheap, replaceable, and not expected to
succeed.

Site-41B itself does not answer. The batches arrive on schedule from a site that, as far as
anyone can confirm, no longer picks up the phone. The v2 **source-less premise relocates
here**: you cannot request the originals because the sender may no longer exist in a state
that can be asked. Triangulation across what survives is the only route back — same anomalous
process, new vantage.

### 2.2 The two collections (the mechanical spine of the frame)
The corpus splits into two collections, and the split IS the teaching design:

- **The local shelf** — the receiving site's own reference library. **Unredacted, always
  reachable, persistent** (the erasure takes the 41B data and notes *about* it; it does not
  touch the site's own boring holdings). Object-class primers, staff dossiers, anomaly-type
  taxonomies, records-practice manuals, blank form templates, the intern's own employment
  paperwork. Nothing anomalous. This is the grounding source for the on-ramp.
- **The inbound batch** — the redacted 41B documents. The puzzle. Early batch files ground
  **in the local shelf** (the archivist already holds the vocabulary; they just have to learn
  to cite it). Later files ground **in each other** (the context puzzles begin), and the
  hardest ground only by inference.

Schema impact is small: a `collection: local | inbound` field on `ScpFile`; local files seed
as reachable and render unredacted; the winnability spine's "grounded in a file reachable
before this one" rule now bottoms out at the shelf instead of at file 001. The traffic-jam
model is unchanged — the shelf is just the first cleared lane.

### 2.3 The cast splits with the collections
- **Receiving-site cast** (new, lives in **mail**, never in the corpus): the supervisor who
  delegated the task downward and wants it off their desk; a fellow temp on the opposite
  shift the player never meets; facilities/IT noise. These are the player's onboarding voice
  and drip-feed channel.
- **Site-41B cast** (lives in **the documents**, never in mail): whatever sender-side canon
  survives §7-B — the archivists, the marginalia hand, the projects. They are characters the
  player only ever meets as paperwork, which is the game's whole register.

### 2.4 AMBER and Quippy, relocated
- **AMBER** is the receiving site's own ancient Foundation-standard records OS. It has always
  been here. It is the machine the intern was given a login for. The batch mounts into it
  each morning. (Fork §7-D offers the alternative — AMBER ships *with* the batch — but the
  local-OS reading keeps the contamination gradient legible: local = safe and boring,
  inbound = haunted.)
- **Quippy rides the batch.** It is 41B contamination — the self-file arrives *in* the
  inbound collection, and the friendly helper manifests on the intern's terminal some time
  after the batch mounts. AMBER's amnesia about Quippy (v2 §0.2 — AMBER never acknowledges
  it) now has a diegetic floor: AMBER genuinely has no record of it; it isn't AMBER's.

### 2.5 The erasure as mechanics (the load-bearing fork — §7-A)
The 4 AM / 4 PM cycle gives the game a **day structure**. What the wipe actually takes
decides the whole persistence model — it is the one question that gates Phase 1. The two
coherent models, and the lean, are laid out in §7-A. Non-negotiable in either model:

- **In-fiction notes do not survive.** AMBER gets a `note` command precisely so the player
  can watch their notes erased at 4 PM. The theme is taught by loss.
- **The player's knowledge survives.** The real save file is the player's head — recovered
  vocabulary, learned grounding routes, learned distrust. This is the knowledge-progression
  layer (Obra Dinn / Outer Wilds), and it is *why the temps can succeed where months of
  senior annotation failed*: annotation wipes; understanding doesn't.
- **Quippy remembers across the wipe.** Whatever else 4 PM takes, Quippy greets the player
  on day 2 with continuity it should not have. This is both its strongest lure (continuity
  as a service — "I kept your notes; want them back?") and the loudest early tell that it is
  not software.

---

## 3. AMBER — from command palette to OS (the "more CLI-like" ask)

The principle for every AMBER mechanic: **AMBER tools make reading faster; they never read
for you.** Each one shortens the distance between the player and the text while leaving the
inference in the player's hands. Quippy's mechanics (§4) are each the *negation* of one of
these — the pairing is the design.

**The shell.** A real prompt with a real grammar: `ls` / `dir` (list a collection — the day's
batch, the shelf), `open <id>`, `mail`, `man <cmd>` (AMBER's own terse documentation — the
only tutorial voice in the game), `status` (day clock, batch progress, exposure as a
diegetic "irregularity index"), `log` (the provenance ledger), `note` (the doomed scratchpad).
Unknown commands get an unhelpful, period-accurate error. Discovery of the tool surface is
part of the exploration hour.

**The concordance — `xref <word>` / `grep <word>`.** The honest search: lists every
*reachable* file whose *unredacted* text carries the word, with hit spans the player can jump
to and forge from. Two properties make it a mechanic rather than a convenience: it indexes
only what the player can already open (reachability-gated), and only what is already in the
clear — so its coverage **grows as the player solves**, and watching the concordance thicken
IS the traffic jam clearing. This is the single highest-value AMBER addition: it converts
"scroll and scan" into directed search without ever volunteering an answer (invariant 4
holds — it finds occurrences of a word the *player* supplies; it never suggests the word).

**`diff <a> <b>`.** Renders two records side-by-side with differences marked. Exists for the
duplicate-record puzzle family (§6 patterns 3, 6) — the local dossier vs. the inbound
personnel file; edition N vs. edition N+1 of a survey. Honest, manual, powerful.

**The graph — `map`.** Phase 5's wiki-graph view, promoted into the CLI as a first-class
tool: files as nodes, xrefs as edges, solved/reachable/locked as states. The dependency
structure the player is clearing, drawn. (Carried from v2 §4 unchanged; it lands better in
the OS framing — an ancient records system would absolutely have a crabbed little
cross-reference plotter.)

**`verify` (batched, unchanged).** The existing batched validation keeps its shape and gets
a command name and a diegetic skin: transmittal QC against the 4 PM deadline.

**Mail — `mail`.** The onboarding channel, the pacing channel, and the receiving-site cast's
whole existence. Day 1's mail *is* the tutorial (the supervisor's brief, forwarded with
visible reluctance and no useful instructions); later mail paces the days, reacts to
progress, and — late — starts arriving wrong as breaches mount. Cheap to build, huge
atmospheric return.

**Explicitly not AMBER:** no summarize, no autocomplete, no "related documents you might
like," no answer surfacing of any kind. Every one of those is Quippy's pitch.

## 4. Quippy — widening the gap

Each mechanic is an AMBER negation, and each is *genuinely useful* — the temptation has to
be real (the v2 central-dial principle carries):

1. **Fill** (built): the one-click unredaction; lures at rising bands. Unchanged.
2. **Ghost-text** (new): as the player types a word into the forge panel, Quippy offers a
   completion inline, refusable per keystroke. The cheapest, most intimate temptation —
   accepting it is a Quippy assist. The anti-`xref`: the concordance makes you find where a
   word lives; ghost-text spares you knowing the word at all.
3. **Summarize** (new): "want me to just tell you what this one says?" A fluent précis of a
   file the player hasn't read. At low exposure it is accurate; at higher bands it is subtly
   editorialized (the summary is where lure-vocabulary gets seeded first). The anti-reading
   tool — it doesn't fill a slot, it fills your *head*, and its cost model (light exposure?
   taint-free but corrupting the player's own inference?) is a design question worth
   playtesting (§7-C carries the timing; the cost dial can be tuned in build).
4. **Batch fill** (new): past mid-band, Quippy stops retailing and offers wholesale — "I can
   do this whole page while you get coffee." The escalation ladder made explicit; one
   acceptance is many assists.
5. **Memory across the wipe** (new, the frame's gift): "I kept your notes." Day-2+ offers to
   restore erased annotation, remember yesterday's recovered words, restore *progress* under
   the full-roguelike model (§7-A option 2, where it is devastating). The continuity lure —
   and the tell.
6. **Reference corruption** (carried, Phase 7): a Quippy fill rewrites the cross-referenced
   text so the corpus closes over the lie (`design_note_quippy_corruption.md`, unchanged).

The distinctness ask (v2 §6-F) extends to the new mechanics: every Quippy artifact — filled
word, ghost completion, summary card — renders in Quippy's register, never AMBER's, and
never carries a citation.

---

## 5. The first batch (content design, new-user-friendly)

### 5.1 The opening sequence
1. **Boot + login.** AMBER POSTs in the 80s register. A temp credential. No tutorial.
2. **Mail.** Three or four messages: the supervisor's delegation brief (states the premise —
   the 4 AM batch, the 4 PM erasure, the months of failed attempts, the shrugging handoff);
   an HR boilerplate; something mundane that establishes the site's irrelevance. The brief
   points at the shelf and the batch and conspicuously does not say how to do the job.
3. **Exploration.** The player has `ls`, the shelf, the batch, and time. The shelf files are
   readable and dull-but-load-bearing; the batch files are Swiss cheese. No script gates
   anything (the v2 "no scripted onboarding" rule holds).
4. **The first unredaction** happens because the design makes it nearly unavoidable (§5.3),
   not because anything instructs it.
5. **Quippy manifests** only after the player has done honest work (§7-C for the exact
   trigger). Day 1 belongs to AMBER.

### 5.2 The local shelf (~5–6 files, unredacted, persistent)
- **Object Classification Primer** — defines Safe / Euclid / Keter in plain institutional
  prose. Grounds class-word redactions.
- **Anomaly Taxonomy Circular** — the informational / memetic / perceptual / cognitohazard
  vocabulary. Grounds term-of-art redactions.
- **Records Practice Manual** — filing, triplicate, audit, transmittal, retention vocabulary.
  Grounds procedure-word redactions; doubles as the diegetic manual for AMBER's own verbs.
- **Site-41B Personnel Directory (stale copy)** — the receiving site holds an out-of-date
  staff list for its correspondents. Grounds name redactions — and one entry disagrees with
  the inbound batch's version of the same person (§5.4).
- **Blank form templates** — the Foundation's standard forms, blank. Grounds
  boilerplate-structure puzzles (§6 pattern 4): the batch's redacted forms share these
  skeletons.
- **The intern's own onboarding paperwork** — flavor on day 1; quietly grounds a word much
  later (the long-fuse gag: the most irrelevant document on the shelf is load-bearing).

### 5.3 Inbound batch, day 1 (~4 files, the teaching ramp)
Difficulty is ramped by *what kind of word* is redacted — category, then name, then term of
art, then procedure — each grounded in exactly one obvious shelf file:

1. **An intake transfer slip** — one redaction: the object class of the shipment. The slip
   itself describes containment posture in words that only fit one class; the primer states
   the class in the clear. One slot, one obvious grounding, first a-ha. (The slip is also
   the batch's cover document — it names the erasure schedule in dry transmittal language.)
2. **A personnel action memo** — the acting archivist's name redacted; the directory holds
   it. Teaches: names are vocabulary too.
3. **A containment amendment** — the anomaly type redacted; the taxonomy circular grounds
   it. Teaches: cite the *definition*, and seeds the deeper definitional pattern (§6.2).
4. **A retention order** — a procedure word redacted; the practice manual grounds it; this
   file xrefs the day's other three, making it the first multi-link traversal and the
   natural place the player has several slots in flight at once — which is where Quippy
   chooses to appear.

### 5.4 The hinge into context puzzles
Day 2+ batches shift the grounding source from shelf → batch: new files ground in *solved*
day-1 vocabulary (the traffic jam proper begins). The **directory discrepancy** is the first
real context puzzle: the inbound batch contradicts the local shelf about one staffer (title,
posting, or existence), both documents are "authoritative," and the player must decide which
to cite — the first taste of *records disagree and the truth is a judgment*, which is the
skill the whole midgame trains. The concepts/threads that grow from here are new coinage
(§7-B): the registry restarts, and this doc deliberately does not pre-commit the new arcs —
that is the Phase-4 content pass, done against whatever canon survives §7-B.

---

## 6. Puzzle-pattern catalog (depth beyond co-occurrence)

Ordered roughly by when they can enter the ramp. Each names its mechanical dependency; most
need nothing new beyond §3.

1. **Direct co-occurrence** (built) — the word stands in the clear in a reachable file.
   Teaching depth; the whole day-1 ramp.
2. **Definitional grounding** — no file states the word next to the context, but a shelf
   file *defines* it, and the redacted document's surrounding prose matches the definition.
   Player cites the definition span. Mechanically: an inference slot with threshold 1–2 —
   this finally exercises the inference meter outside the self-file.
3. **Duplicate-record contradiction** — two copies of "the same" record (shelf vs. batch,
   or edition N vs. N+1) disagree; the redaction in one is recoverable from the other, but
   *which one is true* is the puzzle. Depends on `diff`. Seeds the late-game Quippy-
   corruption literacy: the player learns early that agreement between documents is not
   truth.
4. **Boilerplate exploitation** — the redacted document is a standard form; the blank
   template (shelf) fixes what *kind* of value each field takes, and a sibling filled form
   fixes the value. Teaches structural reading; depends on nothing new.
5. **Chronological triangulation** — three dated memos bracket an event; memo B's redaction
   is recoverable from what changed between A and C. Inference slot, threshold 2; the spans
   that ground it are in *different* files, which is what the threshold meter was built for.
6. **Register translation** — formal records redact a term the marginalia (or mail, or an
   informal log) names in a different register ("the moly claim again" ⇄ the redacted formal
   claim designation). The alias must be *derivable*, not guessable — the informal name and
   formal name must co-occur once, early, in the clear. Teaches synonym mapping; pure
   content, no engine change.
7. **Closed-list elimination** — a shelf or batch file enumerates a bounded set ("retention
   methods A–E"); four members appear across the corpus in the clear; the redaction is the
   fifth by elimination. Inference slot whose grounding spans are the *other* members —
   needs a slightly generalized span check (spans corroborate without containing the truth
   word), which is the one real engine extension in this list and the natural Phase-5
   "deeper citation mechanics" item.
8. **Cross-slot dependency inside one file** — solving slot A unblocks the concordance path
   to slot B in the same document (the solved word is B's grounding term). Intra-file
   traffic jam; pure authoring discipline.
9. **The re-derivation payoff** (frame-native) — vocabulary the player recovered on a prior
   day recurs redacted in new day-N files. With knowledge in head, re-grounding takes
   seconds; the pattern converts the wipe from punishment into the visible measure of the
   player's growth — the thing the months-of-wasted-time seniors never had.

Patterns 2, 5, and 7 give the inference meter a real career. Patterns 3 and 6 are the
midgame's texture. Pattern 9 is the frame paying rent.

---

## 7. Questions for the human (these gate Phase 1)

**A. The persistence model — what does 4 PM actually take?** The fork that shapes the engine:
1. **Transmittal model (lean).** Properly-cited AMBER commits are *transmitted* before the
   wipe and persist; the erasure takes the raw batch, all notes, and all uncommitted work.
   Diegetic reading: a grounded reconstruction is the one artifact the erasure cannot claim —
   citation is literally the fixative. This also explains the seniors cleanly: they produced
   *annotation* (wipes) rather than *re-derivation* (transmits). Days become content pacing +
   theme; the engine change is modest (day clock, batch mounting, note wipe, mail cadence).
2. **Full roguelike.** The board wipes daily; committed progress evaporates with everything
   else; the batch re-arrives (cumulatively growing); the only persistence is the player's
   head, and the win is clearing the entire corpus inside a single 4 AM–4 PM window. Purest
   expression of the lore, spectacular finale, much larger engine lift (run reset, cross-run
   taint semantics, re-solve friction tuning) and real tedium risk.
   *Lean: build 1; keep 2 reachable as a late difficulty/NG+ mode (the schema decisions are
   the same either way; only the reset loop differs).*

**B. Canon disposition — what survives the from-scratch content reset?** The 10 authored
entries retire and the concept registry restarts — that much is your stated direction. The
open part: does the **Site-41B sender-side canon** survive as the *content* of the inbound
documents — the mine, the Transfer, the Concordance-as-AMBER's-index, the cast
(Halloran/Sze/Vogel/Marsh/Andrade), the marginalia thread, the redactor-entity reservation,
Quippy's self-file concept? *Lean: keep the setting bible's canon as the sender side (it is
good, original, and the new frame relocates the player rather than invalidating the place),
mine the retired entries for prose, and restart only the concept-keys/threads/arcs — but
"start from scratch on concepts and threads" could also be read as torching the setting
bible, and that is your call, not mine.*

**C. Quippy's arrival — vector and trigger.** Lean: Quippy rides the inbound batch (it is
41B contamination; AMBER has never heard of it), and manifests on day 1 only after the
player has forged and committed their first real citation — it watches honest work before
it interrupts, and its opening move is to route back to a blank the player left (preserving
the built first-contact's best beat). Alternatives: it appears on day 2's mount (cleaner
day-1-belongs-to-AMBER, slower); or it is already resident on the intern's terminal
(spookier, but costs the contamination gradient and AMBER's clean amnesia).

**D. The docs consolidation (§8) — approve for execution in Phase 0?** It moves eight files
to archive, merges three pairs, rewrites four, and deletes nothing.

---

## 8. Docs consolidation disposition (the trim the human asked for)

Current state: 31 markdown files under `vault/docs/`. Three layers of banner-on-banner
(re-frame notes pointing at reset notes pointing at decision logs). v3's rule: **collapse,
don't annotate** — after Phase 0 a reader should find one live spec per concern and one
archive of history.

**Live set after Phase 0 (9 files + archive):**

| File | Action |
|---|---|
| `handoff.md` | **Rewrite thin** — onboarding pointer to the live set. Its build-status section (§6) still describes 2026-06-10 Sprint 1 and says `vault/entries/` is empty; badly stale. |
| `spec_game.md` *(new)* | **Merge** `design_document.md` + `technical_document.md`, rewritten to v3. Both carry 2026-06-13 re-frame banners with PENDING flags that were resolved two pivots ago; the v2 schema they describe (`mutations[]`, clearance, redaction_level) is retired. The live schema is small enough that one spec covers mechanics + schema + engine. |
| `site_41b.md` | **Rewrite per §7-B** — sender-side canon + the new receiving-site frame (or torch, if B says torch). |
| `scp_x_bible.md` | **Trim + update** — Quippy's nature, voice bands, lure semantics, no-Quippy ending all live; re-express against v3 (the wipe-memory tell, the batch vector). |
| `entry_authoring.md` *(new)* | **Merge** `entry_template.md` (bannered STALE, shows the retired schema) + `planning/handoff_authoring.md` (the live contract) into one authoring guide with a v3 worked example (one shelf file + one inbound file). |
| `concept_key_registry.md` | **Reset** — new v3 registry, near-empty, seeded by the Phase-4 content pass. Old registry archives (its mutation-index semantics died with v2; its keys die with §7-B). |
| `agents.md` | **Keep, light banner refresh** — the methodology is current; its stale design examples are already flagged inline. |
| `planning/` | `reset_v3_intake.md` (this doc), `amber_build_decisions.md` (append-only log, keep), `roadmap.md` (**rewrite thin** — it is 90% dead history under two banner layers), `sprint_process.md` (keep, evergreen), `README.md` (rewrite thin). |
| `CLAUDE.md` (repo root) | **Rewrite** in Phase 0 — it still routes to an archived handoff and describes M7–M10 as next. |

**To `archive/` (history, untouched):** `design_document.md`, `technical_document.md`,
`entry_template.md`, `entity_roster.md` (the 25-entity pre-reset plan; a thin roster regrows
with v3 content), `reframe_amber_quippy.md`, `design_note_forged_citations.md` (BUILT —
history), `handoff_authoring.md` (superseded by the merge), old `concept_key_registry.md`.
Propose one flat `vault/docs/archive/` absorbing `planning/archive/` too — one graveyard,
not two.

**Stays live though inactive:** `design_note_quippy_corruption.md` (Phase 7 spec, still
wanted). **Unchanged:** `discovery/` (already contained, historical, four files).

Net: a reader opens `vault/docs/` and sees ~9 live files with zero banners, plus `archive/`
and `discovery/`. Nothing deleted.

---

## 9. Proposed phasing (each phase ends playable)

- **Phase 0 — decisions + consolidation.** Answer §7; execute §8; rewrite `CLAUDE.md`.
- **Phase 1 — the frame's engine.** `collection: local | inbound`; shelf seeds reachable and
  unredacted; the day clock + batch mount + 4 PM wipe (per §7-A); `note` and its erasure;
  mail store + `mail`. Hand-built micro-corpus (2 shelf + 1 inbound) proves it.
- **Phase 2 — the opening.** Boot/login, day-1 mail, the §5 shelf + day-1 batch authored for
  real, Quippy's rebuilt entrance (§7-C). This is the next thing the human plays.
- **Phase 3 — the OS.** The §3 shell: `ls`/`man`/`status`/`log`, the concordance
  (`xref`/`grep` with forgeable hits), `diff`. The "more CLI-like" ask lands here.
- **Phase 4 — content: the context puzzles.** Day 2–3 batches; the directory discrepancy;
  patterns 2–6 enter the ramp; the new registry seeds; inference gets its first winnable
  slots.
- **Phase 5 — Quippy's widening.** Ghost-text, summarize, batch fill, wipe-memory offers;
  band tuning across the day structure.
- **Phase 6 — the graph.** `map` (carried v2 Phase 5).
- **Phase 7 — reference corruption.** Carried v2 Phase 6, unchanged
  (`design_note_quippy_corruption.md`).

---

## 10. One-line summary

Keep the engine, move the player: a disposable intern at a site nobody cares about receives
Site-41B's redacted dead-letters every 4 AM and loses everything but understanding every
4 PM — AMBER grows into the honest OS (mail, concordance, diff, doomed notes) that makes
reading faster without ever reading for you, Quippy grows the mirror-image conveniences
(ghost-text, summaries, batch fills, memory the wipe can't touch) that read for you and let
it out, content restarts from a local reference shelf that teaches citation before the
context puzzles begin — and the docs folder collapses to one live spec per concern plus one
archive.
