# AMBER/Quippy build — decisions record

Companion to `handoff_amber_build.md`. Records the decisions made executing the
seven build steps (branch `feat/amber-quippy-mechanic`), so the watch items the
handoff flagged each have an explicit, documented answer — not a default the code
fell into. Cross-references the inline code comments that enforce each.

## The four watch items (handoff §"Watch items")

### 1. AMBER-onto-Quippy-touched slot — **redemption: YES**
A slot filled `via:'quippy'` and later correctly re-solved in AMBER is **redeemed**:
the AMBER commit re-writes the entry to `via:'amber'`, its exposure drops to zero,
and the no-Quippy ending counts it as clean. Implemented via *via-aware
idempotency* — `insert()` treats a same-value re-insert with a different `via` as a
real write (`game.svelte.ts` `alreadyInserted`). This makes recovery meaningful
and the hard gate humane: a tainted run is recoverable by honest re-work.
Tests: `game.test.ts` "WATCH ITEM 1", `game.test.ts` redemption case in the
idempotency block.

### 2. Propagation provenance — **ripples inherit the cause's route**
A single Quippy edit rippling to N carriers counts as Quippy reliance at all N: the
propagated entry inherits the originating edit's `via` (`game.svelte.ts` insert
step 2). An AMBER edit propagating onto an untouched slot marks those ripples
`via:'amber'` — they are consequences of honest work. `boardState.viaQuippy` tallies
over *every* live entry (inserted + propagated), so the ending sees the full
reliance footprint. Tests: `provenance.test.ts` "Step 1".

### 3. The orphan-slot AMBER path — **clearance-reveal fallback**
An orphan slot (`concept:""` or single-carrier) has no co-carrier to cite. Decided
fallback: it is **AMBER-soluble only once its own truth is clearance-revealed, and
only to that truth** (`game.svelte.ts` `commitWithCitations` orphan branch). So an
orphan can't be pre-empted by AMBER guessing, but is always AMBER-soluble once the
player climbs to its tier — the no-Quippy win stays reachable for any corpus with
one, and no leak is introduced (truth must already be on screen). Tests:
`citation-gate.test.ts` "orphan-slot fallback".

### 4. The temptation must be real but escapable — **the central dial**
`CITATIONS_REQUIRED` (`game.svelte.ts`, default **1**) is the
Quippy-temptation/AMBER-difficulty dial: 1 = any single corroborating co-carrier
commits; 2+ = the player must assemble a multi-source case (harder AMBER, more
tempting Quippy early). Clamped to a slot's co-carrier count so raising it never
makes a slot unsolvable. Quippy's cheapness/curdle is the other half
(`quippy.svelte.ts` `QUIPPY_MID/HIGH_THRESHOLD`, `game.svelte.ts`
`BREACH_THRESHOLD`). **Tuning note:** the earliest tier must have slots
corroboratable from clearance-1/2 reveals or the moral inverts — see the reveal
model below and the content finding.

## The keystone enforcement — **HARD GATE**
The no-Quippy ending uses the hard gate: **any** Quippy assist forecloses the true
ending (`game.svelte.ts` `endState`, `loop-broken` requires `quippyAssists === 0`).
Started hard for design clarity (the no-Quippy run is a clean mastery expression);
relax to a tolerance band only if playtest shows it inhumane. The hard gate is
humane *because redemption exists* (watch item 1), not because the gate is soft.

## The self-file's role in the ending — **excluded from the restoration target**
`endState` excludes the `entity_self` file from the restoration numerator/denominator
(`game.svelte.ts` `endState`, `if (isSelf) continue`), per `scp_x_bible.md` §5.4:
the self-file is the entity you *starve*, not the puzzle you *solve* — you win by
reconstructing everything **else**. This also means the placeholder `SCP-41B-000`
does not block the win. A Quippy assist landing on the self-file would still count
as taint (defensive), but the player never reaches it.

## Reveal model — **"spec reveal, scoped to open files"** (user decision, 2026-06-13)
The Sprint-1 `raiseClearance` revealed truth for *filled* slots only. The citation
gate cannot bootstrap under that rule (to cite a co-carrier you need its truth
revealed; truth only revealed for filled slots; player-solving is itself circular).
Reconciled to the `technical_document.md` §5 pseudocode, scoped to accessible files:
**reaching a tier reveals in-tier truth for slots in files open at that tier**
(`game.svelte.ts` `raiseClearance`). This seeds the gate (a clearance-revealed
co-carrier is the only non-circular evidence). Invariant #4 holds in its
load-bearing sense — the reveal writes **no overlay entry** (never volunteers a
value into the player's guess layer); and a not-yet-met file (gated by its baseline
clearance) is not pre-revealed. Tests: `validation.test.ts` (rewritten),
`endgame-integration.test.ts`.

## SCP-41B-000 placeholder — **`--allow-incomplete` flag added**
`SCP-41B-000.md` is still the placeholder stub (the only `entity_self:true` file,
holding `build:corpus` green). Rather than delete it (which would break the
"exactly one self-file" invariant) or author the real Quippy self-file (lore work,
out of this build's scope), `build-corpus` gained `--allow-incomplete`
(`scripts/build-corpus.ts`, `validate-corpus.ts` `checkEntitySelf`): it relaxes the
rule to "at most one self-file" so the placeholder can be removed in the gap before
the real one is authored. `npm run build:corpus -- --allow-incomplete`. More than
one self-file is still always an error.

## OPEN — content finding for the lore track (watch item 4, content × mechanic)
**The authored trio is not fully AMBER-winnable as written**, because two concept
groups are not *truth-index-aligned*:
- `acquisition-lot`: SCP-41B-001#a2 truth at index 0, SCP-41B-002#a1 truth at
  index **1**.
- `audit-cycle`: SCP-41B-001#a3 truth at index 1, SCP-41B-002#a2 truth at index **2**.

The citation gate (and propagation) assume a known correct value at one carrier
fixes the *truth index* at every co-carrier (`concept_key_registry.md`: index 0 =
the mundane truth; same-tier carriers should share it). When co-carriers' truths
sit at different indices, the high carrier cannot be corroborated by citing the low
one — so it is AMBER-unsolvable to its truth, and the no-Quippy win is unreachable
on the real corpus. (Note: tier-*escalating* keys like `concordance-program` and
`the-transfer` intentionally hold different indices across tiers — those are
**not** a bug; the contradiction-on-reveal is by design. The problem is only
same-tier teaching keys whose truths drifted off index 0.)

This is a content fix (entry ground-truth / mutation ordering), owned by the lore
track — the engine is correct and is proven AMBER-winnable end to end on an aligned
corpus (`endgame-integration.test.ts`). **Action for the lore author:** align the
same-tier teaching keys' truths to a common index (index 0 per the registry), or
re-coin them as escalating keys if the divergence is intended. A build-time
truth-index-alignment validator was *considered but not added*, because it would
falsely flag the intentionally-escalating keys; the right check is per-key (aligned
vs escalating), which needs the registry's per-key intent encoded first.

**Superseded by the v2 reset (2026-06-17):** this finding is moot under the new
primitive. The `mutations[]`/truth-index model that produced the misalignment is
being replaced by single-word + citation-grounding; the trio is **retired** (see the
§6 decisions below). No content fix is owed; the regression-guard *intent* (AMBER-only
solve → loop-broken at exposure 0) carries forward, its assertions rewritten in Phase 1.

---

## v2 reset — §6 decisions (user, 2026-06-17)

`reset_amber_v2.md` §6 posed four blocking questions (A–D) that gate Phase 1 of the
single-word/traffic-jam reset. All four answered by the user; each landed on the doc
author's recorded lean. These are the schema-and-scope decisions Phase 1 builds on.

### A. Grounding legibility — **TRANSPARENT METER**
Deep (inference) slots show a numeric/▮▮▯ grounding meter that fills as the player
adds citations and commits at a **visible threshold**. Easier to learn and tune;
the opaque accept/reject register is reserved as a **later difficulty dial**, not the
prototype default. *Schema impact:* the citeability/grounding model must carry a
per-slot threshold and expose accumulated grounding as a readable quantity (not just
a boolean accept/reject). Drives `AmberLookup`'s render and the engine's commit return.

### B. Renumbering — **FREE HAND**
The corpus may be renumbered/reordered so file numbers ≈ chronology ≈ difficulty
(teaching pair takes the lowest numbers). The registry, roster, and the self-file's
`entity_self` wiring are all rewritten accordingly. No numbering constraint to
preserve. *Scope impact:* Phase 1's teaching pair are net-new files at the low
numbers; the self-file (`SCP-41B-000`) keeps its designation as the entity but is
re-authored.

### C. The trio + self-file — **RETIRE, MINE THE LORE**
The current 4 entries are retired as playable content. The audit-drift and
Halloran-degradation arcs are **mined into fresh chronological entries**; the
self-file's *concept* survives, re-authored. *Scope impact:* Phase 1 builds on a
**clean teaching pair**, not a conversion of the old trio. The old-primitive fixtures
and the trio-specific tests are rewritten with the schema (the winnable-regression
guard's intent survives; assertions change).

### D. Clearance — **CUT ENTIRELY (PURE-GRAPH)**
Clearance is removed as both the per-slot reveal gate **and** the coarse flow-lock.
The citation graph is the only gate: a file is reachable iff its inbound citations are
reachable. No `clearance`/`redaction_level` reveal mechanism, no flow-lock safety
valve. *Schema impact (largest of the four):*
- `ScpFile.clearance` and `Anchor.redaction_level` are **removed** from the schema.
- `revealedTruth` / `raiseClearance` / `ClearancePanel` are **removed** — clearance
  no longer reveals truth, so the "spec reveal, scoped to open files" bootstrap
  (decisions record above) no longer applies. The citation gate bootstraps instead
  from **teaching-depth co-occurrence** (the word appears plainly in a reachable
  file), which is the non-circular evidence that replaces clearance-revealed truth.
- The orphan-slot "clearance-reveal fallback" (watch item 3) is **gone**; orphan
  handling under pure-graph is an open Phase-1 sub-question — see `handoff_reset_build.md`.

**E and F (non-blocking)** — arc list / first-batch size, and exact Quippy-fill
distinctness — deliberately left open per the handoff; content/polish calls that trail
Phase 1, not gates on it.

## Redemption REVERSED — no redemption; Quippy taint is permanent (user, 2026-06-17)

Phase-1 playtest surfaced a win-logic hole: the player used Quippy to *learn* a word,
then AMBER-cited the same slot, and reached `loop-broken`. The old watch-item-1
redemption (an AMBER re-solve clears Quippy taint) couldn't distinguish honest re-work
from **laundering** — using Quippy to read the file, then citing in AMBER to wash it.

**Decision (user): any Quippy touch ever permanently forecloses the true win. No
redemption.** Chosen over "redeem only by independent re-derivation" and "keep current"
as the strongest, least-gameable expression of the no-Quippy thesis — and the most
thematically honest (you cannot launder the entity's help; the help already happened).

**Implements as** a permanent `quippyTouched` set (`game.svelte.ts`): any slot ever
filled OR rippled via Quippy is recorded and never cleared; `loadCorpus` resets it for a
fresh run. `endState.quippyAssists` now reads this set's size (monotonic), not live
`via`. An AMBER re-solve still drops *exposure* to zero (exposure reads live `via`), but
the win-taint stands. **Supersedes watch item 1** above (redemption) — that earlier
decision is void. Tests: `game.test.ts` "NO REDEMPTION", "LAUNDER GUARD".

## Phase 2 — the opening (built 2026-06-17)

`reset_amber_v2.md` §3 / `handoff_reset_build.md` §5 Phase 2: the playable opening,
on the proven teaching pair. Built and green (`check` clean, tests 120→123). Scope was
the **onboarding flow** — NOT the citation-UI rebuild (`design_note_forged_citations.md`
is Phase 2/3 citation-verb work, still pending; it rides with the aesthetic/CLI rebuild,
not the onboarding reset).

- **Scripted onboarding removed.** `progression.svelte.ts` (the `SCRIPT`
  boot→restore→audit→link→open→free staging, the file-unlock gating, `advanceProgression`)
  is **deleted**. It taught the retired clearance/raise loop, front-loaded an
  unactionable mechanic, and — the §0.2 violation — **named Quippy in AMBER's own voice**.
  The unlock gating was already dead under decision D (pure-graph reachability); only the
  boot screen still consumed it.
- **New `session.svelte.ts`** — the minimal survivor: two booleans, `booting` (on the
  bootup screen vs. in session) and `quippyMet` (has Quippy made first contact). No file
  gating, no truth/overlay touch. `resetSession()` re-arms both for a fresh run; App calls
  it beside `loadCorpus`/`seedReach`.
- **Bootup states the source-less premise** (§1.4, §3.1) in AMBER's clinical voice and
  **never names Quippy** (§0.2): the originals were lost in the Transfer, the only route
  back is triangulation across surviving cross-references; follow the reference, find the
  word in the clear, cite it. The teaching verb is then learned by *doing* it on 001,
  whose body already narrates it — no tutorial overlay.
- **Quippy's uninvited first contact** (§3.3) — trigger **locked (user): on opening the
  second file via the link.** Generalized faithfully as "the first `openFile` of a
  non-seed (reachable-via-xref) file," since that is the only way a linked file becomes
  openable. Fires once per run; `ui.quippyReason: 'first-contact' | 'summon'` distinguishes
  the entrance from later summons. A new **`QUIPPY_FIRST_CONTACT`** line replaces the old
  low-band "you came back" greeting (the §0.3 confusion) — a real introduction: it caught
  the player doing the honest work and offers to spare them it. The recurring low-band
  greeting was reworded off "came back." Tests: `ui.test.ts` "Quippy's uninvited first
  contact (§3.3)".

### Phase 2 first-contact refinements (user feedback, 2026-06-17)
Three changes after first review of the entrance:
- **Paced intro.** `QUIPPY_FIRST_CONTACT` went from one block to a 5-beat SEQUENCE the
  player advances through (notice → introduce → name the honest work → reframe it as
  needless → offer). The panel withholds the fill offer until the last beat
  (`QuippyPanel` `inIntro`/`introStep`/`offering`). Slower, more dialogue.
- **Route-back target (user).** First contact no longer pitches a slot in the just-opened
  (unread) file — it routes the cursor BACK to the blank the player left to follow the
  link (`ui.openFile` captures `priorSpan`; `maybeFirstContact` restores it if still
  redacted) and offers THAT. "You don't need to be over here; I already know what goes
  back there." Generalizes to any file via the prior-span capture. Test:
  `ui.test.ts` "routes the cursor BACK to the blank the player left".

**Deferred to Phase 3 (unchanged):** the 80s aesthetic, the real CLI, document-as-paperwork
rendering, and the forged-citation UI (`design_note_forged_citations.md`). **E/F still open**
(arc list / first-batch size; exact Quippy-fill distinctness).

## Phase 3 — the forged-citation verb + the 80s aesthetic (built 2026-06-17)

`reset_amber_v2.md` §2 (aesthetic) + `design_note_forged_citations.md` (the verb), per
`handoff_phase3.md`. Built in one pass (user decision); `check` 0/0, tests 124→133, corpus
+ prod build clean. **Verb before paint** (the handoff hazard) — the engine landed and went
green before any restyle.

**The verb — forged citations.** AMBER no longer SURFACES where a word lives; the player
FINDS it. To restore a field: type the recovered word, then SELECT the span in a reachable
record where the word stands and FORGE a citation from it; COMMIT judges. Decisions actually
taken at the build (the note left them "to the build"):
- **Citation unit = `(file, span-text)`** — `ForgedCitation { item; text }` (`corpus.ts`).
  The commit check is `spanContainsWord(span, truth)` (`game.svelte.ts`), span-scoped,
  replacing the old whole-file/citeIn gate. `corroborates` now takes a `ForgedCitation`; the
  teaching/inference split collapses at PLAY time (both just forge spans), the threshold still
  gates inference (distinct grounding spans counted, de-duped by (item, lowercased text)).
- **"Any span links, commit judges"** (the note's load-bearing rule) — the link always draws;
  no validation on forge. A wrong/partial case is staked and the COMMIT rejects it
  (`E2x — no forged citation carries this word`), which is the teaching signal.
- **`citeIn` DEMOTED to a build-time winnability guarantee** — `validate-corpus.ts`
  `checkGroundingCiteable` is unchanged in logic but its role moved (gate → guarantee): it
  proves at least one reachable grounding exists per teaching slot, keeping the no-Quippy win
  reachable. Play accepts ANY reachable span carrying the word, not only `citeIn` files.
- **Selection model = native DOM selection** scoped to a file pane (`FilePane` reads
  `window.getSelection()` on `selectionchange`, claims it only if anchored in its own body) →
  `captureSelection` → a per-slot **citation buffer** (`ui.svelte.ts`, a `SvelteMap`) that
  **persists** on the slot (the note's lean — the player sees the case they built). No
  per-word tokenization needed; the redaction bar renders `█████`, so a drag across a slot
  picks up no letters of the hidden word (the honesty rule holds structurally — a propagated
  value lives behind a bar, never in selectable prose, so it can't be staked).
- **`groundingClues` REMOVED** (`game.svelte.ts`) — that was the hand-holding surface. The
  `c`/`cite`/`forge` command + `c` hotkey forge the live selection; `AmberLookup` is rebuilt
  as the forge panel (typed word + the buffer + the inference meter + commit; no clue list).
- **Inference NOTE:** the only inference slots today are on the SELF-FILE (excluded from the
  restoration target, never reached — you STARVE it). So the inference path is structurally
  present but not exercised by any winnable slot; the per-span check is uniform
  (`spanContainsWord` against truth) and will be refined when authored inference content lands.

**Entry prose stripped** — `SCP-41B-001`/`002` no longer narrate how to cite ("follow the
link, find the word, cite it" / "Cite that note and the cover sheet fills itself"). The
records read as paperwork that merely CONTAINS the grounding word; the method belongs to AMBER
(`help`), not the record (`design_note_forged_citations.md` §"Companion principle"). The
grounding words (`Concordance`, `Halloran`) remain in the clear (validator-enforced). Halloran's
marginalia converted to a `> ` blockquote → renders in the new margin GUTTER.

**Aesthetic.** AMBER repainted in an 80s institutional register (`tokens.css` `--amber-*`
amber-phosphor palette + a `.crt-scan` scanline): the command line made primary, boxed status
regions, dossier-style record headers, and **margin notes in an actual gutter** (`bodyBlocks`
gained a `margin` block kind; `FilePane` renders a two-column document). Quippy untouched —
still the violet GUI intruder, deliberately un-AMBER.

**Watch items honored:** corruption (Phase 6) NOT built — but the grounding prose is rendered
from the (immutable) body each frame, so nothing here blocks a future mutable per-run truth-
facing prose layer. Winnable-regression guard kept in intent, assertions rewritten to forge a
real span (`real-corpus-winnable.test.ts`, `endgame-integration.test.ts`,
`citation-gate.test.ts`); new `ui.test.ts` block covers the buffer plumbing.

**Still open (trail Phase 4):** E (arc list / first-batch size), F (exact Quippy-fill render
distinctness). The forged-citation note's own sub-questions (span granularity = containment,
chosen; persist the buffer, chosen) are resolved; inference per-span grounding is the one
deferred to when authored inference content exists.

### New mechanic spec'd, build deferred — Quippy reference-corruption (user, 2026-06-17)
User: "Quippy's replacements AREN'T the grounded word — and when the archivist uses Quippy
to unredact, the references of that text become corrupted and change. Keep it in mind as a
mechanic." Spec'd as **`design_note_quippy_corruption.md`** and slotted as **roadmap Phase 6**
(after the citation verb exists — it needs mutable per-run truth-facing prose, the largest
engine change). Not built now per the user's "later" framing. It is the mechanical teeth
behind §1.5/§6-F and the dark mirror of forged citations: the player forges TRUE citations
from real spans; Quippy fabricates FALSE ones and edits the spans so the corpus agrees with
the lie. Leans recorded in the note (permanent corruption; winnability forfeit on destroyed
grounding, consistent with no-redemption).

## Phase 4 — the content spine, first batch (built 2026-06-17)

`reset_amber_v2.md` §3.4 / roadmap Phase 4: the first real batch of entries, so the loop runs
past the two-file teaching pair. Built and green: corpus 4→**10 files**, `check` 0/0, tests
133→140, the winnable guard solves the whole batch AMBER-only to `loop-broken` at exposure 0.

**E (batch size / arc list) — RESOLVED: broad, one per arc** (user). Seven new files, each
seeding a different arc, authored in a **chronological ≈ difficulty grounding chain**:
- `SCP-41B-003` (Misfiled) — the dead switchboard whose triplicate register drifts forward
  (`audit-cycle`; truth `triplicate`, grounded in 001).
- `SCP-41B-004` (area arc — the road) — the access survey, mileage shrinking edition by edition
  (`the-access-road`; truth `adit`, grounded in 003).
- `SCP-41B-005` (area arc — the claim) — the deed bundle that owns the ground before anyone
  reaches it (`the-claim`; truth `molybdenum`, grounded in 004).
- `SCP-41B-006` (Quiet Departments) — the unreachable office drawing supplies (`sublevel-grid`;
  truth `Vogel`, grounded in 005; **lure** `directive`).
- `SCP-41B-007` (Retention Methods) — the fixative ink, a countermeasure with one illegible step
  (`fixative`; truth `fixative`, grounded in 006; **lure** `solvent`).
- `SCP-41B-008` (Negative Stacks) — the Wet Stacks going quiet (`the-flood-of-71`; truth `flood`,
  grounded in 007; **lure** `rota`).
- `SCP-41B-009` (Drift) — Sze's terminal concordance finding (`sze-experiment`; truth `Sze`,
  grounded in 008; **lure** `Concordance`).

**Numbering (decision):** the v2 reset's "file # ≈ chronology ≈ difficulty" is realized by
**extending outward from the proven teaching pair** — 000/001/002 are NOT renumbered (000 is
`entity_self`, 001/002 the proven seed); the new batch takes 003–009 in difficulty order. The
old roster's cluster-ordered numbering (`entity_roster.md`) is superseded by this; the roster is
bannered, not rewritten (a full roster rewrite is a later docs pass).

**Winnability spine (the load-bearing discipline):** every new file's truth word stands in the
clear in a file reachable *before* it, and each file is xref-reachable from the seed (001) — a
strict topological chain 001→003→004→005→006→007→008→009 (plus 001↔002). Verified by
`build:corpus` (the `checkGroundingCiteable` guarantee) + `real-corpus-winnable.test.ts` after
*each* file; one broken reachability edge (004/005 unreachable until 003 xref'd 004) surfaced at
authoring time, not at the end — the per-file cadence paid off.

**F (Quippy-fill distinctness) — PARTIALLY BUILT, the wrong-word OFFER** (user: "do what you can
of the wrong-word portion now, solidify later in Quippy corruption"):
- **Schema:** optional `Anchor.lure` (`src/lib/corpus.ts`) — Quippy's escalatory WRONG word.
  Parser parses it; a build-time check enforces `lure !== truth`. Absent ⇒ Quippy offers only the
  truth (current behaviour). Never an AMBER answer (no winnability impact).
- **Offer (`quippy.svelte.ts` `quippySuggestions`):** the §4 band table, now backed by content —
  **low** surfaces both (lure plain, truth dull); **mid** recommends the lure, down-ranks the
  truth; **high/post-breach** OMIT the truth, offer only the lure. A slot with no lure only ever
  offers the truth.
- **Consequence (already in the engine):** accepting a lure is a wrong `via:'quippy'` fill →
  `contradicts_truth` + `STRUCK_PENALTY` exposure + permanent `quippyTouched` taint + the
  escalating AMBER corruption. So Quippy can now plant a *wrong* word, and the deeper files
  (006–009) carry lures so distrust is taught as the player descends; the on-ramp (003–005) is
  truth-only (early Quippy is merely costly).
- **Phase-6 boundary:** the wrong-word *offer* lands now; Quippy then **rewriting the cited
  references** so the lie is self-consistent is Phase 6 (`design_note_quippy_corruption.md`) —
  NOT built here. The lure is the seam that mechanic will grow from.

**Lore discipline:** every `truth:` original (licensing wall, `scp_x_bible.md` §8); cast reused
under heavy constraint (Vogel/Halloran/Sze, no new recurring names); Halloran's marginalia run
as the prior-loop warning thread across the batch (method → caution → the lure-naming warnings),
each `> ` blockquote rendering in the sideways gutter. The self-file `SCP-41B-000` is untouched
(still excluded from the restoration target).

**Still open (trail to later phases):** the area-arc keys (`the-access-road`, `the-claim`) now
have one authored carrier each — a second carrier is owed when the batch grows (no-orphan rule);
flagged in the registry. The full `entity_roster.md` / `concept_key_registry.md` rewrite to v2
(drop clearance/mutation-index tables, re-confirm the budget under the new numbering) is a
dedicated docs pass, not folded in here. A `lure` on an *inference* slot is untested (no authored
inference content outside the self-file).

---

## v3 reset — §7 decisions (user, 2026-07-04)

`reset_v3_intake.md` §7 posed four questions gating Phase 1 of the v3 frame (the receiving
site / daily batch / 4 PM erasure). All four answered by the user; each landed on the doc's
recorded lean.

### A. Persistence — **TRANSMITTAL MODEL**
Properly-cited AMBER commits transmit before the wipe and persist; the erasure takes the raw
batch, all notes (`note` contents, forge buffers), and all uncommitted work. Diegetic
reading: a grounded reconstruction is the one artifact the erasure cannot claim — citation
is the fixative; the seniors failed because they produced annotation (wipes), not
re-derivation (transmits). Days are content pacing + theme. The full-roguelike variant
(board wipes daily; win = one perfect window) is reserved as a possible late
difficulty/NG+ mode; schema decisions are compatible either way. *Engine impact (Phase 1):*
day clock, batch mounting by `day`, the 4 PM wipe (clears notes/uncommitted/breach effects;
preserves transmitted commits, exposure, and taint), mail cadence.

### B. Canon — **CONCEPTS SURVIVE, DETAILS REDONE**
The Site-41B sender-side canon survives at concept level (the mine, the Transfer, the
Concordance, the retention methods, the cosmology, the five-figure cast, the redactor
reservation, the genre statement); every entry-level detail written against it is retired
and re-authored in the content pass. The 10 authored entries (000–009) retire as playable
content (mined for prose); the concept-key registry resets empty; the roster is archived
and regrows with v3 content. *Docs impact:* `site_41b.md` rewritten to concept altitude
with "detail owed" markers; `concept_key_registry.md` reset with a non-binding candidate
list.

### C. Quippy's arrival — **RIDES THE BATCH; TRIGGER = FIRST HONEST COMMIT**
Quippy is Site-41B contamination arriving with the inbound batch (AMBER has no record of
it — the OS's amnesia becomes diegetic fact). First contact fires on day 1 after the
player's **first forged-and-committed citation**, and routes back to a blank the player
left (preserving the built Phase-2 first-contact beat). Day 1 up to that point belongs to
AMBER, mail, and exploration.

### D. Docs consolidation — **APPROVED AND EXECUTED (Phase 0, 2026-07-04)**
The §8 disposition ran: `vault/docs/` collapsed to one live spec per concern.
- **New/rewritten live set:** `spec_game.md` (merges design_document + technical_document,
  v3), `site_41b.md` (concept altitude + receiving-site frame), `scp_x_bible.md` (v3: batch
  vector, wipe-memory tell, hard gate recorded as settled), `entry_authoring.md` (merges
  entry_template + handoff_authoring; v3 worked example; Phase-1-pending fields flagged),
  `concept_key_registry.md` (reset), `handoff.md` (thin), `planning/roadmap.md` (v3
  ledger), `planning/README.md` (thin), root `CLAUDE.md` (rewritten).
- **Archived (one flat `vault/docs/archive/`, absorbing `planning/archive/`):**
  design_document, technical_document, entry_template, entity_roster, the old
  concept_key_registry, reframe_amber_quippy, reset_amber_v2, design_note_forged_citations
  (BUILT), handoff_authoring, and the nine completed handoffs/sprint docs.
- **Unchanged:** `agents.md` (banner refreshed), `sprint_process.md`,
  `design_note_quippy_corruption.md` (Phase 7 spec, live), `discovery/`.
- **Code note:** the authoring plugin's context assembler read
  `docs/planning/handoff_authoring.md`; repointed to `docs/entry_authoring.md` and rebuilt.
  The v2 corpus (`vault/entries/000–009`) is **not** touched in Phase 0 — it stays green as
  the engine's regression bed until Phase 2 lands the replacement content.
