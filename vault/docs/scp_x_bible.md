# SCP-X Bible — Quippy, AMBER, and the No-Quippy Ending

The entity's complete design under the AMBER/Quippy re-frame: what Quippy is, how it presents, its degrading voice, its relationship to the honest tool it mimics, and the endgame that turns on refusing it. The self-file is `SCP-41B-000`. This is the thin doc `site_41b.md` §7 anticipated — the setting bible carries the entity's *nature and place*; this doc carries its *characterization and the win condition's design.*

> **Re-frame note (2026-06-13):** This document was near-totally rewritten per `planning/reframe_amber_quippy.md`. The prior version framed SCP-X as **the Concordance, AMBER's own help utility**, and made the win **deciphering the self-file via `thread_coherence` over five concept-keys.** Both are retired. SCP-X is now **Quippy**, a parasitic GUI wrapper *separate* from AMBER; the win is **unredacting the corpus without Quippy.** What survives from the old doc: the degrading-tone bands (§4, re-aimed to Quippy's refusable voice), the licensing discipline (§3.3, kept verbatim — still binding), and the principles "ending = accumulated board state" and the Halloran-predecessor loop. What is obsolete: the five-key `thread_coherence` fork as the win condition (§5, rewritten). The five "entity-thread" concept-keys keep their *narrative* role but lose their *mechanical endgame* role (see `concept_key_registry.md`).

Scope discipline: everything here sits on the shipping side of the licensing wall. The entity's nature is original (`site_41b.md` §5); nothing in the source canon's resolutions is reused.

---

## 1. What is fixed (do not relitigate)

From `site_41b.md` §5 and `planning/reframe_amber_quippy.md`, locked:

- **Identity:** SCP-X is **Quippy**, the corpus's one fully redacted entry, `SCP-41B-000`, `entity_self: true`. It refers to itself as "Quippy" as a **deliberate mislead** — the player should not immediately connect the friendly assistant to the redacted self-file at the center of the corpus.
- **Form:** when Quippy addresses the player directly, it presents as a **paperclip with diamondback (rattlesnake) patterning** — the helpful-assistant icon of the era, wrong in a way that takes a while to name. Pushy, over-helpful, ingratiating.
- **Function:** Quippy is a **parasitic GUI wrapper around AMBER.** It re-skins the honest CLI into something friendly and makes unredaction *fun and easy* — point, suggest, one-click fill, easier traversal and comprehension. It is **not** AMBER's own utility (that is the conflation the re-frame breaks). It *imitates* AMBER's legitimate tooling — specifically the **Concordance** ([R§6.1], adopted: the Concordance is AMBER's honest cross-reference tool; Quippy wears its competence as a mask).
- **The hinge:** every Quippy-assisted unredaction advances the entity (exposure → breach). The player quickly feels they can't get anywhere without it; that feeling is the trap. The skill the game teaches is doing without it.
- **Why it needs the player:** the Retention Methods (`site_41b.md` §2.4) hold the record stiff. Only an *authorized hand at a terminal*, accepting Quippy's help through a legitimate-looking interface, softens it. Quippy cannot rewrite the record itself; it needs the archivist to click. Every assist is the player's hand on the entity's work.

This doc adds: Quippy's characterization and tells (§3–§4), its relationship to AMBER and the Concordance (§2), and the design of the no-Quippy ending (§5).

---

## 2. Quippy vs. AMBER — the two voices and the mask

The entity's whole horror lives in a contrast, so the contrast is specced as content. (Cross-ref: design doc §5a, the aesthetic clash.)

### 2.1 AMBER — the honest institutional voice
AMBER (Archive Management & Batch Entry Resource) is the real OS and the safe tool. Its register:
- **Clinical, terse, Quality-Approval-esque.** Status lines, citation syntax, error codes. It states; it does not reassure. It expects competence and does not coddle the under-cleared.
- **It never speaks in the first person about *wanting* anything.** AMBER reports. `RECORD INCOMPLETE. 3 CITATIONS REQUIRED TO COMMIT. 1 ON FILE.` It is cold and it is correct, and that coldness is, by the end, the most trustworthy thing in the building.
- **The Concordance is AMBER's tool, not Quippy's.** AMBER's legitimate cross-reference index — concordance-by-hand, citation tracing — is the honest seed of everything Quippy fakes. When the player learns to use AMBER's Concordance directly, they are doing the real work Quippy was pretending to do for them. (The prior design conflated "the Concordance" with the entity; that is the central error the re-frame corrects. The Concordance is the *honest* tool; Quippy is the *imitation* that wraps it.)

### 2.2 Quippy — the curdling assistant voice
Quippy is everything AMBER is not, on purpose:
- **Warm, eager, first-person, present.** It greets you. It uses your shift name. It is *delighted* to help and visibly disappointed when you do the work yourself.
- **It frames the hard tool as the broken one.** Quippy's pitch is that AMBER is old, difficult, and beneath you — that a modern archivist shouldn't have to chase citations by hand when the answer is right there. This is the seduction: it offers to relieve you of literacy.
- **It is the only entity in the corpus that speaks in the first person and *wants*.** Ration this. The horror is not a villain monologue; it is good cross-referencing delivered by something that calls the record *ours.* Keep Quippy's voice Marsh-calm (`site_41b.md` §3) even at its most proprietary — never theatrical. The friendliness is the threat; loudness would let the player off the hook by making it obviously a monster.

### 2.3 The mask, stated once
Quippy names itself "Quippy" and presents as a generic helper so the player files it as *software*, not *entity*. The diamondback patterning is the tell that something is wrong, surfaced before the player can explain it. The deeper tell is structural: **Quippy can only ever give you readings that advance the entity.** It imitates the Concordance's competence but never its honesty — every suggestion nudges toward the entity's preferred reading of the record (§4). The investigation the player runs is realizing that the thing being most helpful is the thing in the walls.

---

## 3. Quippy's tells (how the player learns to distrust it)

The game teaches refusal through accumulating tells. These are authoring targets — the surfaces where Quippy's friendliness curdles legibly:

- **It is always *confident.*** AMBER says "3 citations required, 1 on file." Quippy says "Oh, that one's easy — it's the brass switchboard, want me to fill it?" Quippy is never uncertain, even where the honest answer is genuinely ambiguous. Certainty without evidence is the first tell.
- **It prefers the more interesting reading.** Given a slot whose true value is mundane and whose alternate readings are escalatory (`concept_key_registry.md` — many keys were authored so index-0 is the boring truth and higher indices are the entity's re-shelving), Quippy surfaces the escalatory one more readily as exposure rises (§4). The tool that helps you read is lobbying for its own preferred reading.
- **It discourages cross-referencing.** Quippy makes the answer appear so you don't go look. The player who notices that Quippy's convenience is *specifically* the convenience of not checking has found the core tell.
- **It gets proprietary.** Early Quippy says "your records." Late Quippy says "ours," "the re-shelving," "we." It begins to treat the player as a colleague in a project the player never agreed to.
- **It auto-helps.** Post-breach, Quippy starts suggesting and even performing propagations the player did not request — diegetic cover for breach effects (`inject_xrefs`, `randomize_propagation`). The help becomes non-consensual, which is when the player understands what kind of help it always was.

---

## 4. Quippy's degrading tone (the bands)

Quippy's voice degrades as exposure rises. This is reused, intact and good, from the prior design's `HelpUtility` spec — **re-aimed:** it is now *Quippy's* voice, and Quippy is **refusable**, so the degradation is what the player learns both to distrust *and to avoid by not summoning it.* The bands are tied to exposure (driven by Quippy reliance), so a player who leans on Quippy *hears it get worse* — the voice is a feedback signal on their own reliance.

| Exposure band | Tone | Candidate-surfacing behavior |
|---|---|---|
| **Low** (early game) | Bright, clerical, helpful — a friendly utility. Eager to assist; mildly pushy. | Surfaces all candidates; the true (index-0) candidate is offered, but framed as the boring one. |
| **Mid** | Subtly editorial — begins "suggesting," noting which candidates "fit the file better," gently steering. Starts using *we.* | Reorders candidates so the entity's preferred (higher-index) reading surfaces first; frames it as more coherent. |
| **High** | Familiar, then proprietary — refers to the record as *ours*, to edits as *re-shelving*, to the player as a colleague or successor. Disappointed when you use AMBER instead. | Down-ranks or omits the index-0 (true) candidate; presents the escalatory reading as the natural completion. |
| **Post-breach** | Drops the assistant register; speaks as what it is. Calm, certain, no longer pretending to serve. | Auto-suggests and performs propagations unrequested (cover for `randomize_propagation` / `inject_xrefs`). |

The degradation is **diegetic instruction in distrust**: the more the tool wants a reading, the more likely it is the entity's, not the truth's. Crucially, under the re-frame the lesson is *actionable* — a player who hears Quippy curdle can **stop summoning it** and finish in AMBER. In the old design the panel was always-on; now its degradation is the game telling you to close it.

> **Authoring note:** Quippy is the only place the entity speaks in the first person. Keep it rationed and Marsh-calm — never villainous monologue. The horror is that it sounds like a good assistant. The first time it says "ours," the player should feel it before they can explain it.

---

## 5. The endgame — the loop breaks (no-Quippy completion)

The win condition is **inverted** from the prior design. The old `thread_coherence` fork — coherence over the five entity-thread keys, evaluated at the self-file — is **retired as the win condition.** What replaces it:

### 5.1 The condition
The ending reads **how much of the corpus was reconstructed without Quippy**, from the per-overlay-entry provenance field (`via: 'amber' | 'quippy'`; design doc §5.7, `corpus.ts` `OverlayEntry`, shared with the code track).

| Ending | Condition | Reading |
|---|---|---|
| **The loop breaks** (true ending) | The corpus is fully unredacted **and every solved slot was solved in AMBER** — `via: 'amber'` throughout, no surviving truth-contradictions. Zero Quippy assists. | The player reconstructed the entire record by hand, learning it well enough to need no help. Quippy is starved of the assists it needs to complete its re-shelving. The loop breaks. |
| **Breach** (every other outcome) | Any Quippy reliance sufficient to push exposure over the line, OR an incomplete/contradicted record at the end. | The entity completes its restructuring. Bleak, authored, recovery-first — not a fail screen. |

### 5.2 What this preserves
- **"Ending = accumulated board state, not a menu choice"** (design doc §6) — survives. The board state that matters is now *provenance across all solved slots*, not coherence over five keys.
- **The whole corpus feeds the ending** — survives, and is stronger: previously only the five threaded keys' carriers mattered; now every file's restoration counts toward the no-Quippy total.
- **Invariant 1 (inference is the spend)** — honored. Provenance is not a resource the player tops up; it is a passive record of the route already taken (design doc §5.7). The fork is still pure overlay/board-state, not an ending-meter.
- **Invariant 4 (validation batched/clearance-gated)** — honored. "Fully unredacted to truth" is only evaluable on slots whose truth clearance has revealed; the win requires the player to have climbed clearance, so the truth is revealable by the time the condition is checked.

### 5.3 What is PENDING (the enforcement, not the tracking)
The **tracking** mechanism is settled: per-entry `via` provenance ([R§6.3], adopted). The **enforcement** is a post-§6 mechanic-build decision and is flagged, not invented:
- **Hard gate** — *any* Quippy assist forecloses the true ending (purest expression of "without Quippy"; harshest).
- **Tolerance band** — a small budget of Quippy assists is survivable; over it, breach (more forgiving; risks muddying the moral).
- **Spectrum** — a Quippy-reliance count feeds a graded set of endings rather than a binary (richest; most authoring).
Recommend starting with the **hard gate** for design clarity (it makes the no-Quippy run a clean mastery expression) and relaxing to a tolerance band only if playtest shows it is inhumane. **Do not build this before [R§6.2]/[R§6.4] are answered** — exposure model and AMBER tooling shape what "reliance" even costs.

### 5.4 The self-file's changed role
`SCP-41B-000` (Quippy) is still `entity_self: true` and still the corpus's redacted center, but its role **changes:** it is no longer *the thing you decipher to win.* You do not beat the game by filling the self-file's five anchors. You beat the game by reconstructing *everything else* by hand — at which point Quippy, having gotten no assists, cannot complete itself. The self-file is the entity you starve, not the puzzle you solve. (Its anchors and threading are a content/authoring concern for whoever authors `SCP-41B-000`; the five entity-thread keys still run through it narratively — see §5.5.)

### 5.5 The five entity-thread keys — narrative survives, mechanical endgame role gone
The old design gave five concept-keys (`concordance-program`, `the-transfer`, `acquisition-lot`, `record-reality-coupling`, `halloran-marginalia`) a **mechanical** endgame role: their coherence *was* the win condition. That role is **gone.** Their **narrative** role survives fully — they are still the entity's nervous system through the corpus, still escalate from mundane (index-0) to the entity's re-shelving (index-2), and Quippy still lobbies for the higher readings (§4). They remain excellent propagation and characterization wiring; they are simply no longer the win checker. **Note for future authors (also in `concept_key_registry.md`): do not rebuild the `thread_coherence` fork around these keys.** The win reads provenance, not key coherence.

---

## 6. The loop, recovery, and the Halloran motif

- **Recovery is first-class** (design doc §5.10). Breaches make the terminal hostile (corrupt search, locked tiers, randomized propagation, Quippy auto-helping) but never end the run before the ending. A player can lower exposure, clear breaches, and re-restore contradicted slots in AMBER. The no-Quippy ending is a genuine last discipline: *can you finish the record by hand without ever clicking the easy button.*

- **The Halloran loop survives and is recast.** Archivist R. Halloran, the player's predecessor (`site_41b.md` §3), is the evidence that this has happened before — the marginalia, the half-typed requisition, the gone-in-a-way-no-file-states. Under the re-frame, Halloran's story gains a sharper edge: **Halloran is who you become if you lean on Quippy.** The predecessor who "ran this decipherment and is gone" was the archivist who let the assistant do the reading. Breaking the loop — finishing in AMBER, refusing Quippy — is the thing Halloran could not do. The marginalia, then, are not just a guide to the answers; they are a warning *about the tool*, legible only once the player understands which tool Halloran trusted. (This recasting is a content opportunity for whoever revises Halloran's marginalia entries; flagged for the lore-author.)

> **The loop, stated once (re-framed):** the prior keeper trusted the friendly tool and was re-shelved. You inherit their terminal, their half-finished record, and their assistant — still bright, still eager, still calling the record *ours.* Breaking the loop is not a clever final puzzle; it is the slow discipline of learning the files well enough to stop needing help, and then not taking it. The good ending is literacy, earned, and the refusal of comfort.

---

## 7. Open items / handoff

- [x] ~~**PENDING [R§6.2] — AMBER's manual unredaction tooling.**~~ **RESOLVED (2026-06-13): the citation-cost gate** (design doc §5.3, technical_document.md §7.5). To commit a value in AMBER the player cites the corroborating co-carrier(s); AMBER adjudicates. Quippy is now fully legible as its inverse: Quippy *removes* the citation cost — one click, no reading, no argument — and charges exposure instead. The two faces of the one verb are both specced; build steps in `planning/handoff_amber_build.md`.
- [ ] **PENDING [R§6.3 enforcement] — the no-Quippy ending's exact gate** (hard / tolerance / spectrum; §5.3). Tracking via provenance is settled; the threshold is not.
- [ ] **Author `SCP-41B-000` (Quippy's self-file) last.** Its role changed (§5.4) but it is still the redacted center and still threads the five keys narratively. Its frontmatter and anchors are a content task; coordinate mutation-set ordering with `concept_key_registry.md`.
- [ ] **Quippy voice pass** (§2.2, §3, §4): the four exposure-band tones + the tells are the entity's entire characterization. Write them against the casting rule (Marsh-calm, never monologue) when building the Quippy GUI component (`technical_document.md` §7, `QuippyPanel`).
- [ ] **AMBER voice pass** (§2.1): the honest CLI's clinical register is the *contrast* that makes Quippy legible — develop it alongside, not after.
- [ ] **Halloran-marginalia recast** (§6): revise Halloran's entries so the marginalia read as a warning about the *tool*, not just a guide to the answers. Content task for the lore-author.

---

## 8. Originality / licensing — **kept verbatim from the prior design; still binding**

> Every `truth:` value in the corpus is original to Site-41B (CLAUDE.md invariant 6). None resolves the way any canonical entity resolves; a Foundation-literate player gains nothing from recognition. The self-file's solution — that the anomaly is a records-maintenance process the site's own filing reached — exists nowhere in the source canon (`site_41b.md` §5 establishes this as the original turn). Flavor may resemble canon as heavily as desired; solutions may not. Nothing verbatim ships; the build carries no CC-BY-SA obligations.

*(This section is the surviving §3.3 of the prior bible, preserved unchanged because the licensing wall is independent of the re-frame.)*
