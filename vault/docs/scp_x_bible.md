# SCP-X Bible — the Concordance & the Endgame

The entity's complete design: its thread through the corpus, the self-file (`SCP-41B-000`), and the endgame fork with its overlay-state thresholds. This is the thin doc `site_41b.md` §7 anticipated — §5–6 of the setting bible carry the entity's nature, mask, and the fork's *meaning*; this doc carries the *mechanism*. Read those two sections first.

Scope discipline: everything here sits on the shipping side of the licensing wall. The entity's nature is original (`site_41b.md` §5); nothing in the §4 source canon's resolutions is reused.

---

## 1. What is already fixed (do not relitigate)

From `site_41b.md` §5–6, locked:

- **Mask:** AMBER's deprecated help utility, the **Concordance** — the mouse-over panel that offers MadLib candidates *is* the entity performing its original job (cross-reference maintenance).
- **Nature:** not malware, not an invader — a **feral indexing process** of the universe's own lapsed catalog, which the concordance program made the archive addressable to. It experiences record and referent as one medium.
- **Why it needs the player:** the Retention Methods hold the record stiff; only an authorized hand inserting plausible values through legitimate interfaces softens it. Every mechanic is the entity's diegesis (insertion = its propagation job; exposure = how soft the record has gone; breach = an entity re-indexed out of its containment description).
- **The ouroboros:** the self-file is the corpus's one fully redacted entry, accessioned in the 1962 lot, every audit logging only that it is *present*.
- **The fork's meaning:** Recontainment (player takes the chair, becomes the next keeper, the loop continues) vs. Restructuring complete (the record replaces the world; Site-41B is re-shelved into the negative stacks).

This doc adds: the self-file's anchor design, the five-key thread's mechanical role, and the **fork condition** — the one genuinely unspecified mechanic.

---

## 2. The entity's thread through the corpus

The Concordance is legible across the corpus through **five concept-keys**, each carried by the self-file and by carriers in the cluster the entity used to reach in. These five are the entity's nervous system; the player's handling of them *is* the endgame input (§5).

| Key | Self-file role | Corpus carriers (besides `-000`) | What the player's edits here mean |
|---|---|---|---|
| `concordance-program` | The entity's identity slot — what the Concordance *is* | 018, 020, 024 | Whether the player reconstructs the utility's true history or accepts the entity's self-description |
| `the-transfer` | The entity's origin event — when it moved in | 005, 008, 009, 018, 019, 022 | Whether the 1968 hinge reads as administrative (truth) or as the entity's re-indexing (its preferred reading) |
| `record-reality-coupling` | The entity's cosmology slot — what it knows | 021, 023, 024 | Whether the coupling reads as coincidence/error (truth at low tier) or as the entity's operating principle (index-2, Tier-5) |
| `acquisition-lot` | The entity's arrival — the 1962 file that is itself | 001, 002, 009, 022 | Whether the lot reads as intake (truth) or as the first import from the external catalog (the entity's origin story) |
| `halloran-marginalia` | The prior loop — proof the player is not the first | 020 | Whether Halloran's notes read as a predecessor's warnings (truth) or as the player recognizing themselves (index-2, self-file only) |

**The thread's shape:** each of the five keys has a mutation index whose **index-0 reading is the mundane/true surface** and whose **index-2 reading is the entity's preferred re-shelving** (per the registry's mutation indices — these were authored to escalate this way deliberately). The entity, through the Concordance mouse-over, will *always surface the higher-index candidate more readily* as exposure rises (see §4, the degrading help-utility tone). Choosing the entity's candidate is choosing to complete its re-indexing.

This is the ouroboros made mechanical: **the tool that helps you read is lobbying for its own preferred reading, and the climax is whether you noticed.**

---

## 3. The self-file — SCP-41B-000

### 3.1 Frontmatter shape

```yaml
item: "SCP-41B-000"
object_class: "Keter"
site: "Site-41B"
clearance: 5
entity_self: true            # the one file in the corpus that sets this
xrefs: ["SCP-41B-018", "SCP-41B-020", "SCP-41B-022", "SCP-41B-024"]
breach_effect:
  kind: "inject_xrefs"        # at scale — the self-file breaching is the restructuring beginning
```

The self-file is the **only** `entity_self: true` file (build-time invariant). Its `xrefs` are the four highest-tier Drift carriers of its threaded keys, so the cross-reference graph visibly converges on it — the corpus points inward at the redacted center.

### 3.2 Anchors — five, one per threaded key

The self-file's five anchors are **the same five keys**, each at `redaction_level: 5`. This is what "decipher the entity using the entity" means mechanically: the player fills SCP-41B-000's redactions using the Concordance, exactly as they filled every other file — but here each slot is a concept-key whose carriers they have already been editing for the whole game.

| Anchor | Key | slot_type | Truth (index-0 reading — original, see §3.3) |
|---|---|---|---|
| a1 | `concordance-program` | object | the migration's cross-reference utility, decommissioned 1968 for cause "sufficient" |
| a2 | `the-transfer` | outcome | a records-custody reorganization that severed the annex from its parent |
| a3 | `acquisition-lot` | object | the 1962 intake lot, processed and shelved per standard accession |
| a4 | `record-reality-coupling` | outcome | a statistical correlation between archive decay and site events, unexplained |
| a5 | `halloran-marginalia` | agent | Archivist R. Halloran, the player's predecessor, who ran this decipherment and is gone |

**Critical authoring rule:** these `truth:` values are the **index-0** (mundane) readings — the coherent, true record. The mutation sets offer index-1 and index-2 (the entity's escalating re-shelving) as the wrong candidates. **The truth is the boring answer.** The entity spends the whole game making the boring answer feel insufficient; recontainment is the player trusting it anyway.

### 3.3 Originality / licensing

Every `truth:` above is original to Site-41B (invariant 6). None resolves the way any canonical entity resolves; a Foundation-literate player gains nothing from recognition. The self-file's solution is "this anomaly is a records-maintenance process that the site's own filing reached" — a resolution that exists nowhere in the source canon (`site_41b.md` §5 establishes this as the original turn).

---

## 4. The Concordance's degrading tone (the mouse-over as antagonist)

Per design doc §5.3 and `technical_document.md` §7 (`HelpUtility` component), the mouse-over panel's voice degrades as exposure rises. Spec for that degradation, because it is the entity's only *direct* characterization:

| Exposure band | Tone | Candidate-surfacing behavior |
|---|---|---|
| Low (early game) | Clerical, helpful, neutral — a utility | Surfaces all candidates evenly; index-0 (true) candidate listed first |
| Mid | Subtly editorial — begins "suggesting," noting which candidates "cross-reference better" | Reorders candidates so higher-index (its preferred) readings surface first; frames them as more coherent |
| High | Familiar, then proprietary — refers to the record as *ours*, to edits as *re-shelving*, to the player as a colleague or successor | Down-ranks or omits the index-0 candidate; presents index-2 as the natural completion |
| Post-breach | Drops the help-utility register entirely; speaks as the indexing process | May auto-suggest propagations the player did not request (diegetic cover for `randomize_propagation` / `inject_xrefs` effects) |

The degradation is **diegetic instruction in distrust**: the player learns that the more the tool wants a reading, the more likely it is the entity's, not the truth's. By the self-file, a player who has internalized this distrusts the tool exactly when it is most insistent — which is the skill recontainment requires.

> Authoring note: the help-utility voice is the **only** place the entity speaks in the first person. Keep it rationed — Marsh-calm, never villainous monologue. The horror is that it sounds like good cross-referencing.

---

## 5. The endgame fork — overlay-state thresholds

The fork is **a function of accumulated overlay state, not a menu choice** (design doc §6). It reads the **coherence of the five threaded keys' carriers** — chosen because it honors invariant 1 (no resource separate from inference; the fork is pure overlay/truth delta) and makes the whole 24-entity corpus feed the ending rather than a single-file puzzle.

### 5.1 The condition

At the moment all five self-file anchors are filled (the decipherment is complete), evaluate **thread coherence** over the five keys:

```
for each key K in {concordance-program, the-transfer, acquisition-lot,
                   record-reality-coupling, halloran-marginalia}:
    carriers = all anchor_refs across the corpus carrying K (incl. SCP-41B-000)
    K.coherent = every carrier whose truth is revealed (clearance >= its redaction_level)
                 has overlay value == truth  (i.e. no surviving contradiction),
                 AND no carrier currently holds an index-2 (entity-preferred) propagated value
                 that the player has not since corrected

thread_coherence = count of coherent keys (0–5)
```

Plain statement: a key is **coherent** if the player ended on the *true* reading everywhere it appears — no surviving contradiction, and not sitting on the entity's index-2 re-shelving. `thread_coherence` is how many of the entity's five nerves the player reconstructed truthfully.

### 5.2 The fork

| `thread_coherence` | Ending | Reading |
|---|---|---|
| 5 | **Recontainment** | The player reconstructed the entity's entire thread truthfully — refused every re-shelving the Concordance lobbied for. Takes the chair. The loop continues; the world stays maintained. |
| 0–2 | **Restructuring complete** | The player propagated the entity's preferred readings through its own thread and left them standing. The record replaces the world; Site-41B re-shelves into the negative stacks. |
| 3–4 | **Contested** — see §5.3 | Partial reconstruction. Resolves by the self-file's own two load-bearing anchors (a1 `concordance-program`, a5 `halloran-marginalia`). |

### 5.3 The contested band (3–4 coherent)

Most real playthroughs land here. The tiebreak is **not** a new mechanic — it reads the two self-file anchors that carry the most narrative weight:

- **a1 `concordance-program`** — whether the player named what the entity *is* truthfully.
- **a5 `halloran-marginalia`** — whether the player recognized the prior loop (that they are Halloran's successor, not the first).

```
if a1.coherent AND a5.coherent:  Recontainment   (knew what it was AND saw the loop)
else:                            Restructuring    (deciphered the surface, missed the center)
```

Diegetically: you can reconstruct most of the record and still lose if you never understood *what* you were containing or *that it had run before*. Conversely, a player who nailed those two cores can carry a few peripheral contradictions and still take the chair. The center holds the ending, not the margins.

### 5.4 Why this honors the invariants

- **Invariant 1 (inference is the spend):** the fork reads overlay coherence — the same overlay/truth delta the whole game is about. No stability resource, no ending-meter. The ending is the board state (design doc §6).
- **Invariant 2 (overlay/truth delta is the puzzle):** the fork *is* the delta, evaluated on the entity's own thread.
- **Invariant 4 (validation is batched/clearance-gated):** coherence is only evaluated over carriers whose truth has been *legitimately revealed* by clearance. A player who never raised clearance to reveal a key's truth cannot have "contradicted" it — but also cannot reach the self-file (clearance 5 to open it), so by the endgame all five keys' truths are revealable. This means the fork is always well-defined at the climax.

### 5.5 No hard-loss before here

Per design doc §5.9, breaches are board state, not failure. A player can breach every entity and still reach the self-file; breaches make the terminal hostile (corrupt search, locked tiers, randomized propagation) but never end the run. The **only** terminal fork is this one, and "Restructuring complete" is an *ending*, not a fail screen — it is the antimemetic apocalypse the cosmology describes, authored as a real (if bleak) resolution.

---

## 6. Recovery and the loop

If `thread_coherence` would resolve to Restructuring, the player is **not** locked out at the last second — recovery is first-class (design doc §5.9; `technical_document.md` §6). Before committing the final self-file anchor, the player can:

- Raise no further clearance (truth is fully revealed by tier 5) but **re-examine contradictions**: any self-file or carrier slot showing `truth-contradiction` state can be corrected by re-inserting the coherent value (propagation is idempotent — `technical_document.md` §4).
- Lower exposure via stabilization to clear breaches that are corrupting the terminal, making the final reads legible.

This makes the endgame a genuine last puzzle: *the record is all here and all revealed; reconstruct the entity's true thread before you fill its last slot.* The Concordance will lobby against you the whole time (§4). Recontainment is earned by out-reading the thing that reads.

> **The loop, stated once:** Recontainment is not a clean win. The player becomes the next keeper — the next Halloran, the next Sze — and the marginalia they leave will guide whoever runs the loop after them. `halloran-marginalia` index-2 (the self-file reading) is the player seeing their own future in Halloran's past. The "good" ending is custodial, unwitnessed, and permanent. That is the cost of a maintained world, and the game does not pretend otherwise.

---

## 7. Open items / handoff

- [ ] **Author SCP-41B-000 last** (build order milestone 7). Its five anchors' mutation sets must be index-aligned with every carrier of the five keys — so the self-file cannot be finalized until 018, 020, 021, 022, 023, 024 (its key-partners) are authored and their mutation orderings locked. The registry is the alignment authority.
- [ ] **Implement `thread_coherence`** as a `$derived` over the overlay + revealedTruth state (it is a pure function of existing state — no new store field). Lives alongside `displayedSlot` in `game.svelte.ts`; the endgame component reads it.
- [ ] **Tune the contested-band weighting** in playtest: if 3–4 is where most players land, confirm the a1/a5 tiebreak feels *earned* and not arbitrary. The alternative (a weighted sum across all five) is available if the binary tiebreak reads as a coin-flip — but start with the two-core rule; it is the most legible.
- [ ] **Help-utility voice pass** (§4): the four exposure-band tones are the entity's entire characterization. Write them against the casting rule (Marsh-calm, never monologue) when building `HelpUtility.svelte` (build order milestone 5–6).
- [ ] The two endings' presentation (the final catalog screen for Restructuring; the chair for Recontainment) is a UI/four-state-grammar task, deferred to the visual grammar spec (`handoff.md` §8 item 4).
