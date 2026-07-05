# Reset — single-word redaction, the semantic traffic jam, 80s-OS aesthetic

**Status:** Direction set by the human (2026-06-17), after the first end-to-end manual test of the Sprint-1 trio + self-file. This is a **second pivot**, narrower in spirit than the 2026-06-13 AMBER/Quippy re-frame but deeper in mechanic: it keeps the AMBER/Quippy split and the no-Quippy win, and **replaces the redaction primitive itself** — from "pick which sentence-fragment is true" to **"unredact an exact word by citing where the corpus grounds it."** It also resets onboarding, file-flow, exposition order, and the visual register.

**This doc is plan + questions + cleanup proposal only.** Per the human's call ("plan first, then decide"), nothing is deleted or rewritten until this is read and the §6 questions are answered. It supersedes nothing yet; it *proposes* what to supersede.

**Read order to act on this:** this doc → answer §6 → then we phase the work per §5.

---

## 0. What the manual test exposed (the why)

The first real playthrough of the trio surfaced problems that are not bugs — they are the design showing its seams. Faithfully, what broke:

1. **Aesthetic.** The UI does not read as an 80s institutional OS. Target is **Deluxe Paint + institutional-80s / VMware-console** for AMBER, with **Quippy as a visually and behaviorally distinct intruder** — an annoying OS plugin that pops up unbidden, not a panel that shares AMBER's chrome. The two must not look like one program.
2. **The OS over-remembers Quippy.** AMBER's own copy references Quippy. Wrong: **AMBER should behave as if it keeps forgetting Quippy exists** (no onboarding mention, no chrome acknowledgment). Quippy's intrusion is *uninvited*; AMBER never introduces it.
3. **Onboarding voices a retired loop and front-loads nothing learnable.** The `SCRIPT` teaches a mechanic the player can't yet act on, and Quippy's first contact ("Oh good, you're back") is confusing because the player has no prior relationship with it. **Remove scripted onboarding.** Give the player time alone with AMBER first; introduce Quippy diegetically at a specific trigger (§3).
4. **The redactions don't read as a word puzzle.** Slots are multi-clause propositions (`"the 1962 intake of cold records the item was logged against"`) chosen from 3 sentence-rewrites. That is "which rewrite is true," not "what is the redacted word." The human's intended centerpiece is **a single redacted word** the player recovers by citing parallel context. The current mutation-set model is the wrong primitive for that.
5. **No source-less framing.** The intrigue — *AMBER unredacts without the original source* — is never stated. It must be **exposition before play**: the archivist is told, in-world, that the originals are gone and the only route back is triangulation across surviving cross-references. This is the anomaly of the *process*, and the player should feel it as the premise, not infer it.
6. **Flow is broken and pedagogically backwards.** Every trio anchor is `redaction_level: 3` but files open at `clearance: 1`, so 002/003 are effectively unreachable and nothing can be solved at start. And 001 — the most anomaly-dense, most margin-noted file — is the *first* thing shown. A new low-clearance archivist should not open the corpus on its hardest, latest-chronology file.
7. **No CLI element, weak file navigation.** The "full AMBER CLI" (R§6.6) is not felt; there is no command surface and traversal is opaque.
8. **Clearance levels aren't earning their place.** As a *progression spine* they add ceremony without payoff right now. Human's call: **remove clearance as the core gate**; keep a notion of hard access-locking in reserve for *flow control* (block specific files until the graph opens), not as the per-slot reveal mechanism.

None of these are engine defects. They are design-primitive and content-order problems. The fix is a reset of the primitive + onboarding + content spine, reusing the engine where it still fits.

---

## 1. The new mechanic — the semantic traffic jam

### 1.1 The redaction primitive (replaces typed-slot mutation sets)
A redaction is **a single exact word** (or tight proper-noun phrase — a name, a site-specific memory technique, a piece of canon vocabulary). Not a sentence fragment, not a multiple-choice rewrite. The player's job at a slot is to **produce the exact word**, and the word is recoverable because the corpus *grounds* it elsewhere.

Every redacted word carries **exposition payload**: recovering it teaches the player a proper noun, a method, a name — a piece of canon they now hold and can use to ground *further* redactions. The vocabulary the player unlocks is the same vocabulary that unlocks the next slot.

### 1.2 The traffic jam (the loop's shape)
This is the human's framing, kept verbatim in spirit: **a semantic traffic jam.** Early, very few words are citeable — most slots have no reachable grounding yet, so the corpus is gridlocked. Each unredaction adds a now-readable word/reference to the player's pool, which makes *new* citations possible, which clears *new* slots. Play is the progressive widening of what you can cite — clearing the jam lane by lane. The corpus is a dependency graph of words; the player solves it in topological order, and the order is discovered, not told.

This **replaces clearance-as-reveal.** Truth doesn't leak in by tier; it becomes *recoverable* as the citation graph opens. (Clearance survives only as optional hard flow-gating — §1.6.)

### 1.3 Grounding — "both, by depth" (human's call)
What AMBER checks when it adjudicates a citation runs on a curve:

- **Teaching depth (direct co-occurrence).** The word appears **plainly, unredacted, in another file the player can reach.** Citing that file grounds the word; AMBER commits it. This is the onboarding mechanic and the first-file experience (§3). Cheap to author, legible, citeable.
- **Deep depth (parallel-context inference / the Truth mechanic).** **No file states the word outright.** The player assembles enough partial, circumstantial context across multiple files that a **grounding score** clears a threshold. AMBER commits when grounded ≥ threshold; below it, rejects with "insufficient grounding." This is the human's "Truth mechanic" and is the *manual citation-linking* surface Quippy later offers to shortcut.

The curve is the difficulty ramp: a slot starts the game ungroundable, becomes citeable-by-co-occurrence once one neighbor is solved, and the *hardest* slots are only ever inference-grounded.

### 1.4 The source-less premise (exposition before play)
Stated to the player up front, diegetically: **the original records are gone.** What survives is the cross-reference web. AMBER cannot fetch a source of truth because there is no longer a source — it can only *reconstruct* a redacted word from the corroborating shape the rest of the corpus still holds. This is why unredaction is triangulation, not lookup, and it is the quiet anomaly of the process the player is performing. (Where this premise is delivered: the bootup/new-archivist intro, §3.1.)

### 1.5 Quippy, against this primitive
Quippy's offer becomes sharp and legible under the new model: **it does the citation-linking for you.** Where AMBER makes you find and cite the grounding (or assemble inference to threshold), Quippy just *fills the word* — one click, no citation, no reading. It is the "skip the traffic jam" button. Its fills are **visually and semantically distinct** from AMBER's (human's explicit ask): a different render for a Quippy-filled word, and — the tell — Quippy will fill words that *aren't yet grounded*, giving the player a value the corpus can't yet justify. Every Quippy fill still raises exposure; AMBER citations still cost zero. The no-Quippy win is unchanged.

### 1.6 What happens to clearance
Removed as the per-slot reveal/progression gate. **Optionally retained** as a coarse, content-driven **access lock**: specific files may be sealed until the player has cleared enough of the jam to "earn" them, purely for flow pacing (so the area-arc / deep-lore files don't all open at once). This is flow control, not the mechanic. (Open question §6-D: keep even this, or cut clearance entirely?)

---

## 2. The aesthetic reset

### 2.1 AMBER — the OS
- **Register:** Deluxe Paint + institutional-80s. Think a monochrome/limited-palette console (VMware-console / DOS-era catalog mainframe), chunky bitmap type, boxed status regions, a real command line. Clinical, cold, *competent.*
- **Bootup screen** (§3.1) is the first thing the player sees: AMBER POSTs, identifies itself, greets the new archivist briefly, states the source-less premise, hands over the terminal. No tutorial overlay.
- **CLI is real and felt** (R§6.6, currently unmet): command input for traverse / open xref / look up concordance / cite / commit; hotkeys for span-to-span and file-to-file. File navigation is **explicit and legible** — the player always knows where they are in the graph.
- **No tips, no pointers, no Quippy mentions.** Affordances are discovered. **Hover popups** carry contextual info (this is also where Quippy's later hover behavior contrasts — keep the hover-info plan).
- AMBER **never references Quippy.** It forgets it between intrusions.

### 2.2 Entries — they must look like bureaucratic documents
- Rendered as **Foundation paperwork**: header block (item #, class, site), sectioned addenda, monospace/typewriter body, **margin notes in the actual margins** (Halloran's marginalia render in a gutter, not inline — current biggest visual miss).
- A redacted word is a **single inline redaction bar** sized to a word, not a sentence. The four-state grammar (redacted / inserted / propagated / contradiction) now applies at *word* granularity, plus the new **Quippy-filled** distinction (§1.5).

### 2.3 Quippy — the uninvited plugin
- **Visually distinct from AMBER entirely** — it is not AMBER chrome. A bright, wrong, GUI intruder (the paperclip-with-diamondback, scp_x_bible §1) that **pops up unprompted**, trying to make itself necessary.
- It **interrupts**; AMBER never summons it. Dismissable, refusable. Its fills look different from AMBER's commits.
- First contact is a real introduction at a defined trigger (§3.3) — not "Oh good, you're back" to a player who's never met it.

---

## 3. The new opening sequence (replaces scripted onboarding)

The human's requested beat sheet, made concrete:

### 3.1 Bootup
AMBER POSTs and boots in its 80s register. Brief new-archivist greeting. **States the source-less premise** (§1.4) as the job: the originals are gone; your work is to reconstruct the redacted record from what cross-references survive. Hands over the terminal. The player is alone with AMBER.

### 3.2 First document — *not* 001
The first file shown is an **early-chronology, nearly-clear entry** with **a single, easily-inferred redaction**. Entries should be **written in chronological order**, and the first file the beginner sees should be early both in chronology and in difficulty — it is strange for a low-level archivist to open on the most-redacted, latest file. (This means renumbering/reordering the corpus so file order ≈ chronology ≈ difficulty ramp; see §5 and §6-B.)

- The first redaction is **one word**, grounded by **direct co-occurrence** in a **second file that is explicitly linked from the first** (a real, followable xref).
- Following that link reveals the second document; the word sits there plainly; the player cites it; AMBER commits. First "a-ha" with zero exposure. The player has now learned: *follow the links, find the word, cite it.*
- The recovered word should **deliver a bit of worldbuilding** — a proper noun or method that plants curiosity and will be reused to ground a later slot.

### 3.3 Quippy's entrance
Quippy introduces itself **when the second entry is first opened via the link** (or on the player's return to the first entry) — a defined, motivated trigger, *with* a real first-contact introduction. Its first demonstrated feature is the **easy alternative to AMBER's citation work**: it offers to just fill the word. This is the first time the player sees the two routes side by side — and the first chance to refuse.

### 3.4 The first batch of files — one arc each
After the teaching pair, the player is granted a small batch, **each file seeding one arc**, all relatively self-contained but cross-linked to enable exploration. Proposed arcs (from existing canon + human's list):

- **Site-41B origin / setting / surrounds** — the site itself, the Transfer, the Colorado mine, the area arc (already seeded: `the-access-road`, `the-claim`, `the-watershed`, concept_key_registry §3b).
- **Origin of the redactions** — one of the first entities secured at the site; the **redactor** thread (the *second* entity that made the redactions, distinct from Quippy; `the-redactor`, reserved-dormant). This arc is where the source-less premise gets its in-world cause.
- **Origin of Quippy** — seeded carefully; the player should not yet connect Quippy to the self-file.
- **Origin of AMBER** — the OS's own history (late-60s catalog mainframe, the Concordance built under Sze, the migration the Transfer froze; site_41b §1.2).
- **External-literature references, twisted to new canon** — Backrooms/liminal, New Weird (VanderMeer, Miéville), popular SCP themes refracted into original resolutions. (Licensing wall holds: flavor may echo, solutions original.)
- **Staff profiles** — character exposition for the cast (Vogel, Halloran, Marsh, Sze, Andrade; site_41b §3).
- (Open to additions — §6-E.)

Each arc self-contained but **linked to other arcs** so the whole base is explorable. This is also where the **wiki-graph visualization** (§4) earns its place.

---

## 4. Surviving asks that are already on the roadmap

- **Wiki-graph visualization** — the human still wants a graph view of document linkages. With the traffic-jam model this is *especially* load-bearing: the graph **is** the dependency structure the player is clearing, so visualizing citeable-vs-locked edges turns the abstract jam into a readable map. Propose building it as a first-class AMBER tool, not a debug view.
- **Heavier citation mechanics** — the human is open to leaning further into citation as the core verb (manual citation-linking, grounding score). The §1.3 deep-depth threshold mechanic is the place that lives.
- **Progression-gated later mechanics for both AMBER and Quippy** — explicitly deferred ("discuss later"). Reserve design space; don't build yet.

---

## 5. Proposed phasing (nothing starts until §6 is answered)

A reset this size wants to be sequenced so each phase is independently testable, the way the milestones were.

- **Phase 0 — this doc + decisions.** Answer §6. Decide reset scope (the human already leaned "greenfield the content, keep the engine where it fits," but confirm against §6 answers).
- **Phase 1 — the primitive.** Re-spec the corpus schema for single-word slots + grounding (co-occurrence citation vs inference threshold). This is the load-bearing engine question: does the current `mutations[]` / `concept` / `redaction_level` model bend to single-word + citation-graph, or do we replace the slot model? (My read: `concept`/co-carrier propagation **survives and is reused** as the grounding graph; `mutations[]` collapses to a single truth word + an authored citeability map; `redaction_level` is demoted from reveal-gate to optional access-lock.) Land it in the schema + parser first, with one hand-built teaching pair, before any content scales.
- **Phase 2 — the opening.** Bootup screen, source-less exposition, first-document teaching pair, Quippy's motivated entrance. Remove the scripted onboarding. This is the next thing the human should be able to *play*.
- **Phase 3 — aesthetic.** AMBER 80s register + real CLI + document-as-paperwork rendering with margin gutters; Quippy as the distinct uninvited intruder.
- **Phase 4 — content spine.** Renumber/author entries in chronological order; the first-batch arcs (§3.4); rebuild the trio (or retire it) to the new primitive.
- **Phase 5 — graph view + deeper citation mechanics.**

Each phase ends playable. We do **not** scale content before Phase 1's primitive is proven on the teaching pair.

---

## 6. Questions for the human (these change the plan; answer before Phase 1)

**A. Grounding score — how legible is the "Truth mechanic" to the player?**
For deep (inference) slots, does the player see a **numeric/▮▮▯ grounding meter** that fills as they add citations and commits at a threshold (transparent, gamey, teachable) — or is it **opaque** (AMBER just accepts or rejects "insufficient grounding," and the player learns the feel)? Transparent is easier to learn and to tune; opaque is more immersive and more in AMBER's cold register. *(I lean transparent for the prototype, opaque-as-a-difficulty-dial later.)*

**B. Renumbering — can I reorder/renumber the corpus to chronological order?**
The chronological-order ask implies file numbers ≈ chronology ≈ difficulty. The current `SCP-41B-001/002/003` are mid-chronology and hard. May I **renumber freely** (e.g. the teaching pair becomes the lowest numbers), accepting that the registry, roster, and self-file's `entity_self` wiring all get rewritten? Or is there a numbering constraint to preserve? *(I'd like a free hand here; it's the cleanest path and the corpus is only 4 files.)*

**C. The trio + self-file — rebuild or retire?**
The current 4 entries are built on the old propositional primitive. Do I **rebuild** them to single-word slots (preserving the Halloran/audit-drift lore), or **retire** them as history and author fresh teaching content? *(I lean: retire the trio as playable content but mine their lore — the audit-drift and Halloran-degradation arcs are good — into new chronological entries. Keep the self-file's *concept* but re-author it.)*

**D. Clearance — reserve it or cut it?**
§1.6 proposes keeping clearance only as optional coarse file-locking for flow. Do you want even that, or **cut clearance entirely** and let the citation graph be the *only* gate (files open when their inbound citations are reachable)? *(Pure-graph is more elegant and matches the traffic-jam framing; coarse-lock is a safety valve for pacing. I lean pure-graph, clearance fully cut, unless we find we need pacing brakes.)*

**E. Arc coverage — is the §3.4 arc list complete, and how many files in the first batch?**
Anything to add/drop from {site origin, redactions origin, Quippy origin, AMBER origin, external-lit refs, staff profiles}? And how big is the first post-teaching batch — 3, 5, 7 files? *(I lean: one file per arc for the first batch = ~6, plus the 2-file teaching pair = ~8 to first milestone.)*

**F. Quippy fill distinctness — how different, exactly?**
"Visually and semantically distinct" — is a distinct **render + an unmistakable tell** (Quippy fills ungrounded words; the word appears in Quippy's color and never carries a citation) enough, or do you want Quippy fills to be **semantically suspect** too (it sometimes fills the *escalatory* reading, per the old degrading-bands tell, so a Quippy word can be subtly *wrong*)? *(I lean: yes to both — distinct render AND Quippy can fill the wrong/escalatory word, which is the diegetic case for distrust.)*

---

## 7. Docs cleanup proposal

`vault/docs/` has accreted three layers (discovery → reference specs → planning/handoffs) plus two pivots' worth of re-frame notes. 25 markdown files, ~3,300 lines. After this reset some are authoritative, some are superseded-but-historical, some are stale. Proposed disposition — **no deletions until approved:**

**Reference specs (`vault/docs/*.md`) — rewrite to v2 after §6:**
- `design_document.md` — §4 loop, §5.3 citation gate, §5.1 clearance, §5.4 typed-slot, §6 endgame all need the single-word/traffic-jam/no-clearance rewrite. Keep §2 north-star, §3 keystone, §7 licensing, §5a aesthetic clash (sharpen, don't replace).
- `entry_template.md` — heaviest rewrite: the whole anchor/mutation-set model changes to single-word + citation-map. The "longer files" guidance survives; the worked example must be re-authored.
- `concept_key_registry.md` — **survives structurally** (it becomes the grounding/citation graph), but mutation-index semantics change from "escalating readings" to "the word + where it's grounded." Big edit, not a delete.
- `site_41b.md` — mostly survives; clearance-as-depth (§1.2) and the reveal-by-tier framing need reconciling with the citation-graph gate; the area/redactor arcs (§6a) get promoted into the first-batch plan.
- `scp_x_bible.md` — Quippy's nature/voice survives; §5 endgame survives; the "candidate-surfacing behavior" bands (§4) need re-expressing against single-word fills (Quippy fills the wrong *word*, not reorders candidates).
- `technical_document.md` (322 lines, unread this pass) — §2 schema and §7 UI/CLI need the largest technical rewrite; flag for a dedicated pass.
- `agents.md`, `entity_roster.md` — roster renumbers with §6-B; agents/method survives.

**Discovery (`vault/docs/discovery/*`) — archive as-is.** Historical provenance of the canon; don't rewrite, don't delete. Propose a one-line banner: "pre-reset; historical."

**Planning (`vault/docs/planning/*`) — the messiest layer. Proposed:**
- **Keep live:** this doc (`reset_amber_v2.md`), `roadmap.md` (update), `sprint_process.md` (method, evergreen), `amber_build_decisions.md` (decisions log, append to it).
- **Archive as completed history (move to `planning/archive/` or banner):** `reframe_amber_quippy.md` (still the *prior* north star — keep readable, mark superseded-in-part by this), `handoff_amber_build.md`, `handoff_janitor.md`, `handoff_docs_reviser.md`, `handoff_lore_trio.md`, `handoff_lore_after_amber_build.md`, `handoff_after_lore_authoring.md`, `sprint_01_vertical_slice.md`. These are done-work handoffs; they're history now.
- **Net effect:** `planning/` drops from ~12 active files to ~4 live + an `archive/` folder. Much easier to see "what's current."

*(Recommendation: a `planning/archive/` subfolder beats deletion — the handoffs are a useful record of how we got here, and the re-frame doc especially is still partly load-bearing.)*

## 8. Code cleanup proposal (high-level; detailed after §6)

The engine splits cleanly into "survives the reset" and "is built on the old primitive":

**Likely survives (overlay/propagation/exposure/provenance core):**
- `corpus.ts` `OverlayEntry`, `Via`, propagation-by-`concept` — the grounding graph reuses this.
- `game.svelte.ts` exposure model, provenance-based ending (no-Quippy win is unchanged).
- `ripples.svelte.ts` propagation, the four-state grammar's engine.

**Needs rework for single-word + citation:**
- `corpus.ts` `Anchor` — `mutations[]` → single truth word + citeability; `redaction_level` demoted.
- The citation gate (`AmberLookup.svelte` + engine) — from "cite a co-carrier confirming index *k*" to "cite where the word is grounded / assemble inference to threshold."
- `parseBody.ts` / `SlotSpan.svelte` — word-granularity slots, the new Quippy-filled render state.
- `progression.svelte.ts` — the `SCRIPT` onboarding is **removed** (Phase 2); clearance progression demoted/cut (§6-D).

**Likely replaced/retired:**
- `AmberTerminal.svelte` / the GUI interaction layer — rebuilt for the real CLI (Phase 3) and the 80s register; this is the R§6.6 "rebuilt, not restyled" debt finally paid.
- The Sprint-1 fixtures/tests that assert the old propositional primitive — rewritten with the schema (Phase 1). **The winnable regression guard's *intent* survives** (AMBER-only solve → loop-broken at exposure 0); its *assertions* change.

Detailed file-by-file lands as a `handoff_reset_build.md` once §6 is answered and scope is locked.

---

## 9. One-line summary

Keep the AMBER/Quippy split and the no-Quippy win; **replace the redaction primitive with single-word, citation-grounded unredaction played as a semantic traffic jam**; reset onboarding to a bootup + source-less premise + a followable teaching pair; make AMBER an 80s institutional OS with a real CLI and document-as-paperwork rendering; make Quippy a visually distinct, uninvited intruder; reorder content to chronological/difficulty order; demote or cut clearance; and archive the two pivots' worth of completed handoffs so the planning layer is legible again.
