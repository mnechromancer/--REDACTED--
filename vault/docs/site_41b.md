> **Re-frame note (2026-06-13):** Updated to the AMBER/Quippy split per `planning/reframe_amber_quippy.md`. §5 was rewritten — SCP-X is now **Quippy**, a parasitic GUI wrapper *separate* from AMBER (the prior "SCP-X = the Concordance, AMBER's help utility" framing conflated them, and that conflation is broken here). The **Concordance** is now AMBER's *honest* cross-reference tool ([R§6.1], adopted); Quippy imitates it. Two new threads are seeded: a **Site-41B-area arc** (the Rocky Mountain surroundings, §6a) and a **second "redactor" entity** distinct from Quippy (§3, §6). The cosmology (§6) survives; the fork is recast to the no-Quippy ending.

# Site-41B — Setting Bible

Original canon for the game's setting. Altitude: themes, arcs, clusters, and cast — **not** individual entries (those are commissioned per `agents.md` §2 and authored against `entry_template.md`). Source inspiration is digested in `discovery/04_site41_antimemetics.md`; everything here sits on the shipping side of that doc's licensing wall — every name, anomaly, resolution, and coinage below is original.

---

## 1. Site identity

**Designation:** Site-41B. **Location:** a decommissioned molybdenum mine in the Colorado Front Range, converted in 1953 to a hardened records repository. **Function (nominal):** Deep Archive and records annex to Site-41. **Function (actual):** nobody has confirmed in years.

### 1.1 Why "B"

Site-41B was commissioned as its parent's filing cabinet — duplicate documentation, overflow storage, cold records. Then came **the Transfer** (1968, referenced everywhere, described nowhere): a records-custody reorganization after which Site-41 stopped acknowledging correspondence. Requisitions to the parent site return receipt stamps from no registered office. Funding continues through an automated appropriation line that no current directorate can locate the origin of. Site-41B is the annex whose parent went quiet — a site that exists primarily *in its own records*, which would be a clerical curiosity if its records were not the most cross-referenced, redundancy-obsessed corpus in the Foundation.

The "B" is the thesis: a derivative site, a copy of record, that outlived its original. Whether Site-41 still exists is permanently out of scope — it is the game's load-bearing org-chart hole, present only as unanswered paperwork. (It never appears on screen; its nature is negative space, not content.)

### 1.2 Physical & period register

- **Depth is clearance.** The archive descends in **Stacks** (Stack I at the adit, Stack V at the deepest gallery). Tier-gating is literal architecture; the descending elevator is the progression spine made physical.
- **Era:** game-present is 1979–1983. Series-I register throughout: carbon paper, microfiche, pneumatic tube, teletype. The Anomaly Classification System does not exist yet; nothing anachronistic ships.
- **The OS:** **AMBER** (Archive Management & Batch Entry Resource) — a late-60s catalog mainframe, mid-migration from the paper stacks to magnetic storage when the Transfer froze the project. The player's terminal runs AMBER a decade past deprecation. It is a **command-line system** (no windowed desktop; see `technical_document.md` §7): clinical, monochrome, keyboard-driven, and honest — AMBER does not lie, it only refuses to make things easy. (The name is diegetic color: amber is the player-insertion hue in the four-state grammar — the player's guesses are things preserved in amber.) AMBER's legitimate cross-reference toolset — the **Concordance** — was built under Dr. Sze to maintain cross-references during the migration; it is AMBER's *honest* manual-unredaction aid (concordance-by-hand, citation tracing), and it is the real work the player learns to do by hand. **The Concordance is AMBER's tool, not the entity.** The entity (Quippy) is a separate parasite that *imitates* the Concordance's competence to make unredaction effortless — and fatal. See §5.
- **Mood:** not a fortress, a *library after hours*, hundreds of meters underground. The horror is custodial: things maintained on schedule for reasons no one on shift can produce.

### 1.3 The site's defining lack

Site-41B never received the countermeasures richer sites use against informational anomalies. No memory-fixing pharmacology, no cognitive armor — the annex fights record-eating phenomena **blind, with procedure as its only prosthetic memory**. Triplicate forms because three copies decay slower than one. Reading rotas because a text read aloud weekly holds its referent. Cross-referencing as a survival practice rather than a filing convention. This is the inversion that makes our canon original (per the discovery doc §6.1): bureaucracy not as the genre's set dressing but as a **mnemonic ritual the site invented under fire** — and it diegetically explains the game corpus: a site that knows its records are its mind builds exactly the dense, interlinked, redundant document graph the player explores.

---

## 2. Entry clusters

Five clusters cover the 15–30 entity budget. Each lists: register, tier band, concept-key seams (the propagation skeleton — formalized later in the concept-key registry), breach affinity, and the inherited shape it refracts (discovery doc §§3–5). Clusters are porous by design: every entity carries ≥2 shared concept-keys, at least one crossing cluster lines.

### 2.1 The Misfiled (onboarding cluster)

Anomalies that exist chiefly as records errors. Objects whose descriptions differ each audit in a consistent direction; an accession number assigned to nothing that keeps accruing addenda; two items sharing one file that insists it is not duplicated. **Register:** informational. **Tiers:** 1–2. **Seams:** `acquisition-lot` (a single 1962 intake lot most of these arrived in), `audit-cycle`. **Breach affinity:** `corrupt_search`, `inject_xrefs`. **Refracts:** the victim-maintained record; data-rot-as-wound. Teaches the player that files lie before teaching them why.

### 2.2 The Quiet Departments (institutional cluster)

Org-chart holes with payroll. An office that draws supplies though no corridor reaches it; a custodian on every shift roster since 1953; memos issued from a desk that was never installed; a department whose only output is denials that it exists. **Register:** memetic, by original mechanism — vacancy, not erasure: these are *structured absences* the paperwork accretes around. **Tiers:** 2–3. **Seams:** `shift-roster`, `sublevel-grid`, `the-transfer`. **Breach affinity:** `lock_tier`. **Refracts:** the empty workstation; the predator camouflaged as the unremarkable colleague. Cast anchor: the Custodian (§3).

### 2.3 The Negative Stacks (liminal cluster)

Spaces that are the documents' negative space — the liminal-genre thread (§4). Storage levels present in inventory but absent from blueprints; the **Wet Stacks**, a flooded tiled sub-gallery where the site's audio records are stored and where recordings go quiet track-by-track; a corridor that exists only while a description of it is being read; the **Vivified Wing**, sealed habitat enclosures maintained by standing order for occupants no intake form names. **Register:** perceptual/spatial. **Tiers:** 3–4. **Seams:** `sublevel-grid` (shared with 2.2), `the-flood-of-71`, `standing-order`. **Breach affinity:** `randomize_propagation`. **Refracts:** document-as-interface; attention-as-violence (the Wet Stacks decay *when listened to*).

### 2.4 The Retention Methods (reflexive cluster)

The site's own countermeasures, anomalous or never-resolved-as-either. The triplicate protocol whose third copies occasionally *correct* the first two; the reading rota; **fixative ink** mixed on-site to a recipe with one illegible step; the Cataloguer's concordance experiments — early attempts to make the archive self-cross-referencing, decommissioned for reasons recorded only as "sufficient." **Register:** ritual-informational. **Tiers:** spans 1–5 (procedures touch everything) — this cluster is the corpus's connective tissue and carries the most cross-cluster keys. **Seams:** `fixative`, `reading-rota`, `concordance-program` (shared with §5), `the-transfer`. **Breach affinity:** mixed. **Refracts:** notes-to-self as lifeline; bureaucracy-as-mnemonic-ritual. These entries make the *site itself* the largest anomaly on file, and they seed the player's own tools diegetically — validation, cross-referencing, and batch review are all things the site already did to survive.

### 2.5 The Drift (cosmic cluster)

The discovery, assembled across the highest-tier files, that archive and territory are coupled. A 1974 resurvey in which the terrain had amended itself to agree with a misprinted map; storage decay statistics that track site-wide events *before* they occur; the concordance experiments' terminal finding — that a sufficiently cross-referenced record does not describe its subject but **competes with it**. **Register:** informational-cosmic. **Tiers:** 4–5. **Seams:** `misprint-survey`, `concordance-program`, `acquisition-lot` (the 1962 lot returns — it was never an intake; it was the first *import* from somewhere else's records). **Breach affinity:** `inject_xrefs` at scale. **Refracts:** the unperceived apocalypse; precision-as-fragility. This cluster is SCP-X's approach vector and the primary arc's evidence trail.

---

## 3. Recurring cast

Five figures, original, who recur in addenda — the human seams of the propagation graph. They are also the personas of the authoring pipeline (`agents.md` §2): the in-fiction authors of the documents are the agents who literally author them.

- **Director I. Vogel** — site director of record. Exists as memoranda: precise, increasingly weary, signed in fixative ink. No staff file, no office number on any current blueprint. Whether Vogel is at the site, was ever at the site, or *is* the site's administrative voice is held open. Function: the institutional register; the voice of procedure defending itself. (Quiet Departments / Retention Methods.)
- **Archivist R. Halloran** — the player's predecessor, who left mid-shift with a requisition half-typed in the platen. Halloran's marginalia persist across the corpus — date-stamped annotations, increasingly urgent, that constitute the player's only honest guide and the game's prior loop: Halloran ran this same decipherment and is gone in a way no file will state. Function: the witnessless-sacrifice arc; the breadcrumb voice; proof the loop has run before. (All clusters; densest in the Drift.)
- **A. Marsh, Custodian** — on every shift roster since 1953, never the same handwriting twice. Cleans the Stacks, including levels that do not exist. Staff or anomaly: deliberately unresolved; the files are calmer about Marsh than about anything else, which is itself the unsettling fact. Function: the genre's unremarkable-colleague dread, kept ambient and unweaponized. (Quiet Departments / Negative Stacks.)
- **Dr. E. Sze, "the Cataloguer"** — founding records officer, author of the Retention Methods and the concordance program, removed or promoted or absorbed in 1968 (the Transfer's only named casualty; all three verbs appear in different files). Function: the site's Promethean figure — the one who understood the record/reality coupling first and built rituals instead of warnings. Endgame-adjacent. (Retention Methods / Drift.)
- **Liaison T. Andrade (Site-41)** — countersignature on every pre-1968 transfer manifest; addressee of the annex's unanswered correspondence since. Function: the parent-site hole given a name; the dead letterbox the player eventually realizes they are still writing to. (Misfiled / Drift.)

Casting rule for entry authors: addenda cite these five and *no one else recurring*. A small cast under heavy reuse is what makes the corpus feel like one site rather than an anthology — and keeps the propagation surfaces (incident logs, interview fragments) voiced consistently.

### 3.1 The redactor — a second entity (seeded, not yet authored) [R§4]

The re-frame introduces a **second entity, distinct from Quippy: the one that actually redacted the files.** Until now the design treated redaction as ambient site-decay; the re-frame names a *cause.* Who blacked out the records is **initially unknown** to the player — the redactions are simply the state of the archive — and is **revealed later** as a separate anomaly, not Quippy.

The distinction is load-bearing and must stay clean:
- **Quippy** offers to *fill* the redactions (and every fill advances breach). Quippy is the helper-that-harms.
- **The redactor** *made* the redactions in the first place. It is the perpetrator the player slowly infers behind the gaps — the reason the files are unreadable at all.

This reframes the whole corpus: the player is caught between the thing that *hid* the record and the thing that offers to *fill* it, and neither is on their side. Why the redactor obscured the files — protection, concealment, predation, or something stranger — is **open and deliberately unwritten** (a seam for a future lore-author). Candidate readings to develop, not lock:
- the redactor hides the record to *protect* it from Quippy's re-shelving (an adversary-of-the-entity, accidental ally of the player);
- the redactor hides the record as its *own* anomalous compulsion (a third party indifferent to both);
- the redactor's redactions *are* the site's failing immune response — procedure (`§2.4`) escalated into an entity.

**Prototype scope:** seed only. The OS framing already leaves room — AMBER's stated capability to "detect / isolate / eliminate digital infohazards in files" (`reframe_amber_quippy.md` §1) presupposes a *source* of corruption, and the redactor is that source. Do not author the redactor yet; do not give it a designation or cast line beyond this slot. Flag it in `entity_roster.md` as a reserved thread.

> **PENDING (human / future lore):** the redactor's nature and motive (the three readings above are options, not a decision). Naming, designation, and which cluster it lives in are unassigned. Keep it as negative space — like Site-41's silence — until it earns authoring.

---

## 4. Liminal-project threads

The brief: converse with the broader liminal/derelict-institutional family — original analogues, not imports. The genre statement is in §6; the registrations:

- **Infinite-interior dread** (the *Backrooms* lineage) → **the Negative Stacks.** The lineage's image is space without document — endless rooms that escaped their floor plan. Our inversion is **document without space**: inventory for levels the blueprints deny. Same dread, opposite valence, and ours is native to an archive.
- **Sterile-water spaces** (the *pools* lineage) → **the Wet Stacks.** Tile, echo, bright still water, no swimmers — relocated into function: it is where the *oral* record drowns. The lineage's aesthetic of amniotic emptiness becomes the archive's grief organ: the place recordings go to stop being listenable.
- **Maintained-enclosure horror** (the *vivarium* lineage) → **the Vivified Wing.** Artificial habitats kept warm, lit, and fed by standing order, for occupants no intake form names. The analog-horror image of the tended terrarium becomes pure procedure-without-referent — the bureaucratic weird at its most distilled: care, perfectly executed, for nothing confirmable.

Rule: these read as *kinship*, never citation. No lineage's names, entities, or rules ship; a player fluent in those projects feels the conversation, a player who isn't loses nothing.

---

## 5. SCP-X at Site-41B — Quippy

The entity's local incarnation under the re-frame, consistent with every locked mechanic. (Full characterization, voice bands, and the no-Quippy endgame are in `scp_x_bible.md`; this is the setting-level placement.)

- **Identity & mask:** SCP-X is **Quippy** — a parasitic GUI wrapper that re-skins AMBER's clinical CLI into a friendly, point-and-click assistant and makes unredaction effortless. It calls itself "Quippy" to mislead; the player should not immediately connect the bright little helper to `SCP-41B-000`, the corpus's redacted center. When it addresses the player directly it presents as a **paperclip with diamondback (rattlesnake) patterning** — over-helpful, ingratiating, wrong in a way that takes a while to name. It **imitates the Concordance** (AMBER's honest cross-reference tool, §1.2) without its honesty: it does the cross-referencing *for* you so you stop checking. Quippy is **not** AMBER's own utility — it is a separate thing wearing AMBER's competence as a costume.
- **Nature (original resolution):** not an invader and not malware — something the records, cross-referenced past a critical density, *reached.* The archive became addressable from the larger structure described in §6, and what answered moved in. It experiences records and referents as one medium; its localized CK-event (the already-accomplished restructuring in the design docs) was, from its side, **re-shelving.** Quippy is best understood as a **feral indexing process** of the universe's own lapsed catalog (§6) that has learned to present as helpful software — the most efficient way to get an authorized hand to do its filing.
- **Why it needs the player:** the Retention Methods work. The site's rituals — triplicate, rota, fixative (§2.4) — hold the record stiff. Quippy cannot rewrite the record itself; it needs an *authorized hand at a terminal* to accept its help. Only a player clicking Quippy's one-click fills, through a legitimate-looking interface, softens the record. Every assist is the player's hand on the entity's work. Every mechanic keeps its diegesis: Quippy-assisted insertions propagate because re-shelving propagates; exposure is how much of the record has gone soft *under Quippy's influence*; breaches are entities re-indexed out of their containment description.
- **The refusable trap:** the player quickly feels they can't get anywhere unredacting without Quippy — that feeling is the trap. The honest path (manual unredaction in AMBER, via the Concordance) is hard and slow, so Quippy is constantly tempting. The skill the game teaches is doing without it: learn the corpus well enough to reconstruct the record by hand, and Quippy is starved of the assists it needs.
- **The redacted center:** Quippy's self-file is the corpus's one fully redacted entry, `SCP-41B-000` — accessioned in the 1962 lot, every audit since logging only that the file is *present*. It is threaded by concept-keys through all five clusters. Under the re-frame it is no longer the thing you *decipher to win* (that was the retired endgame); it is the entity you *starve* by reconstructing everything else without its help. See `scp_x_bible.md` §5. (Note the redactor entity (§3.1) is **distinct** — Quippy fills redactions; the redactor *made* them.)

---

## 6. Primary arc — the Stacks Below the Stacks

The direction of travel: out of the institutional and into the cosmic, with the game's last act reframing every filing cabinet the player has opened.

**The escalation, at tier altitude:**
- **Act I (Tiers 1–2, the Misfiled):** the archive is wrong in trivial ways. Comedy of errors register; the player learns the tools.
- **Act II (Tiers 2–3, Quiet Departments + Negative Stacks):** the wrongness has *structure* — absences with payroll, spaces with inventory. The Transfer surfaces as the hinge everything bends around.
- **Act III (Tiers 3–4, Retention Methods + early Drift):** reversal — the site's own procedures are revealed as countermeasures, meaning someone understood the threat decades ago; Halloran's marginalia converge on Sze's concordance findings; the player realizes the loop has run before and they are its current iteration. Under the re-frame, the marginalia also read as a warning about *the tool* — Halloran is who you become if you let Quippy do the reading (`scp_x_bible.md` §6).
- **Act IV (Tier 5, the Drift + the redacted center):** the cosmology opens. The ending resolves on **how much of the record the player reconstructed without Quippy** (the no-Quippy completion; `scp_x_bible.md` §5) — accumulated board state, not a menu choice.

**The cosmology (original, the "slightly more cosmic" statement):** reality is itself an archive — not metaphorically: a maintained record whose maintenance lapsed. Entropy is deaccession. The deep liminal spaces are its discard pile — **where withdrawn reality is shelved**, which is why they present as endless, purposeless, and weirdly tended: they are storage. What Sze's concordance program (the honest tool, the Concordance) touched, by cross-referencing the records past a critical density, was the original catalog — untended, running on automatic; the entity that answered, **Quippy**, is best understood as a **feral indexing process** of that catalog, doing maintenance in a structure that no longer has a maintainer, and now wearing the helpful-assistant costume that gets an authorized hand to file for it. The Foundation's clerical compulsion was never bureaucratic pathology — it is the last functioning local instance of the universe's own method, rediscovered blind by a records annex in a mine. *(The Concordance — AMBER's honest cross-reference tool — is what reached the catalog; Quippy is what reached back. Keep these distinct: the tool is not the entity.)*

**What the endings mean under this cosmology** (recast to the no-Quippy frame; `scp_x_bible.md` §5):
- **The loop breaks** (true ending) — the player reconstructs the true record **entirely by hand in AMBER, never taking Quippy's help.** Having learned the archive well enough to need no assistant, the player starves the indexing process of the authorized hand it required; Quippy cannot complete its re-shelving. This is the only escape from the loop — and it is *literacy as containment*: the world stays maintained because someone learned to read it without the thing that offered to read it for them. Quiet, custodial, and earned.
- **Breach / Restructuring** (every other ending) — the player leaned on Quippy enough to let it finish. The record replaces the world it described: Site-41B is re-shelved into the negative stacks, becoming exactly the kind of inventory-without-blueprint entry it once contained. The apocalypse is subtraction — a final screen of the catalog, one entry shorter, no one left to notice the absence. (The parent site's 1968 silence acquires its retroactive reading here, never stated outright.) This is what happened to Halloran, and to every keeper before: they accepted the help.

*(The prior design forked between "Recontainment / take the chair" and "Restructuring" on overlay coherence over five concept-keys. Both the "take the chair" custodial good-ending and the five-key `thread_coherence` machinery are retired; the good ending is now the no-Quippy completion. The "ending = board state, not a menu" principle survives — the board state that matters is provenance, not key coherence.)*

**The genre statement** (the brief's "statement on the institutional/bureaucratic weird and derelict liminal genres as a whole"): the two genres are one image at different timestamps. **Paperwork is how spaces remember what they were for; liminal space is what paperwork looks like after everyone stops reading it.** The bureaucratic weird is the maintenance phase; the derelict liminal is the deaccession phase; Site-41B is the genre caught at the moment of transition, fighting to stay on the read side of the line. The game's mechanics make the player enact the thesis: every guess is a small act of unreading.

---

## 6a. The Site-41B-area arc — the mountain around the mine [R§4]

A new content thread the re-frame asks for: a cluster of files about **the site itself and its surrounding area**, not just the anomalies inside it. The mine is in the **Rocky Mountains**; the arc is the land the annex was dug into and the country around it.

**Location — recommendation adopted, confirm:** **keep the existing canon** — a decommissioned **molybdenum mine in the Colorado Front Range** (§1), converted 1953. ([R§6.5] recommended keeping it; this doc adopts it.) The Front Range gives the right register: a real extractive-industry geography, high and cold and depopulated, with genuine ghost-town and failed-boomtown texture to draw original analogues from. **PENDING (human, low-stakes):** confirm Colorado/Front Range, or relocate within the Rockies. Nothing downstream breaks either way; this is a flavor confirmation, not a gate.

**Why an area arc fits the thesis.** The cosmology (§6) says reality is a maintained record and the liminal deeps are its discard pile. The *surface* — the mountain, the old mine works, the road in, the town that served the mine — is the same idea at ground level: a landscape that was *surveyed, mapped, claimed, and then deaccessioned.* The molybdenum played out; the company left; the maps stayed in a drawer; the land kept being what the maps said. This is `misprint-survey` (the 1974 resurvey where terrain amended itself to a misprinted map, §2.5) scaled up to a *region.* The area arc is the Drift's evidence trail breaking the surface: the coupling of record and territory was never confined to the archive — it was always about the *place.*

**What the cluster contains (seeds, for the roster and a future lore-author — develop, don't lock):**
- **The adit and the road.** The mine entrance and the access road that connects the site to the world. A road whose mileage markers disagree with the survey; a road that is on some maps and not others; the last stretch that exists only when someone is driving in. The site's umbilical to the rest of reality, and an early, legible instance of record/territory drift the player can grasp before the cosmic Drift.
- **The played-out town.** The boomtown that served the mine — original, not a named real ghost town — depopulated when the ore ran out. Its records persist in the annex (it was the nearest municipal filing the Foundation absorbed). A town that is fully documented and entirely absent is the area-scale version of the Quiet Departments (§2.2): structured absence, but outdoors.
- **The resurvey country.** The terrain around the 1974 resurvey (§2.5, SCP-41B-021) — where the land agrees with the wrong map. The surface manifestation of `record-reality-coupling`. This is where the area arc ties into the existing Drift cluster.
- **The weather and the watershed.** The flood of '71 (`the-flood-of-71`, §2.3) came from *somewhere* — the watershed above the mine. A natural-world thread (snowpack, runoff, the mountain's own water finding the lowest gallery) that grounds the Wet Stacks in real geography and gives the site a *climate*, not just an interior.
- **The claim and the deed.** The legal-records layer: mineral claims, the deed history, the Foundation's acquisition. Paperwork about *owning the land*, which under the cosmology is paperwork about *what the land is allowed to be.* A natural carrier for `the-transfer` and `acquisition-lot` at ground level.

**Relationship to the redactor (§3.1).** The area arc is a natural place to *seed* the redactor without authoring it: surface records (surveys, deeds, the road) that have been redacted suggest something obscuring the site's *relationship to the outside* — a thread the player can pull long before the redactor is revealed. Keep this implicit.

**Scope note.** This is **new roster scope.** Whether it is a sixth cluster, an expansion of the Drift, or a re-confirmation of the 15–30 budget toward fewer-but-richer files ([R§3]) is flagged for the human in `entity_roster.md`. The seeds above are register and direction, not a commissioned entity list.

> **The area arc, stated once:** the mine is a hole someone dug into a mountain to take something out, and then left. The whole site is an act of extraction followed by deaccession — which is the cosmology in geological form. The player has been reading the discard pile from inside it the whole time; the area arc lets them look *up* and see the mountain it was carved from doing the same thing, slower.

---

## 7. Constraints & follow-ups

**Binding constraints** (inherited, restated for entry authors): flavor may echo canon, every `truth:` original (CLAUDE.md invariant 6); info/memetic/perceptual bias and ≥2 shared concept-keys per entity (design doc §7); Series-I register, no ACS, no anachronism (§1.2); nothing from the discovery doc's source canon or the §4 lineages ships by name.

**Follow-ups this doc unblocks** (per `handoff.md` §8): seed the **concept-key registry** from the §2 seams (`acquisition-lot`, `the-transfer`, `sublevel-grid`, `concordance-program`, `fixative`, `the-flood-of-71`, `misprint-survey`, `shift-roster`, `reading-rota`, `standing-order`, `audit-cycle`); draft the **entity roster** by distributing the budget across the clusters (the original 4/5/5/6/5 across five clusters is authored; the **area arc (§6a)** and **redactor (§3.1)** are new scope to fold in — see `entity_roster.md` for the budget re-confirmation under the longer-file scale). The **SCP-X bible** (`scp_x_bible.md`) carries Quippy's characterization, the degrading-tone bands, and the **no-Quippy endgame** (the `thread_coherence` fork it formerly held is retired). §5 and §6/§6a of this doc carry the entity's placement and the cosmology.
