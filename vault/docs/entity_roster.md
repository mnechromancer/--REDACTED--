# Entity Roster / Series Bible

The 25-entity corpus, planned up front for graph density and tier pacing. One line per entity: item #, class, hook, concept-key memberships, clearance tier, breach effect. Drafted from `site_41b.md` §2 clusters and `concept_key_registry.md`; every entity carries ≥2 concept-keys (CLAUDE.md invariant; design doc §7).

**Budget split** (`site_41b.md` §7): 4 / 5 / 5 / 6 / 5 across the five clusters, ouroboros file inside the Drift. **Total: 25.**

**This roster's job over the registry:** the registry defines the keys; the roster guarantees every key gets ≥2 carriers (no orphans), distributes tiers across the four-act arc, and assigns breach effects per cluster affinity. When a discrepancy appears between this file and `concept_key_registry.md`, the registry is authoritative on *mutation-set ordering*; this file is authoritative on *who carries what*.

---

## Designation scheme

Entities use the **site-local accession `SCP-41B-###`** — a Site-41B local catalog code, not a global SCP number. This dodges canonical-number collisions entirely and reinforces the setting thesis: an annex that exists primarily in its own records keeps its own register. The ouroboros self-file is `SCP-41B-000`.

Numbers run as a **clean site-local sequence**, ordered by cluster and, within a cluster, by tier (low→high), so the accession number roughly tracks the descent through the Stacks:

| Range | Cluster |
|---|---|
| 001–004 | 2.1 The Misfiled |
| 005–009 | 2.2 The Quiet Departments |
| 010–014 | 2.3 The Negative Stacks |
| 015–020 | 2.4 The Retention Methods |
| 021–024 | 2.5 The Drift |
| 000 | The ouroboros (Drift, `entity_self`) |

In prose and `xrefs`, write the full `SCP-41B-###`; wikilinks are `[[SCP-41B-###]]`. `SCP-X` remains the design-doc handle for the *entity*; its in-corpus self-file is `SCP-41B-000`.

---

## Reading the roster

- **#** — `SCP-41B-###` site-local accession (see above).
- **Class** — Safe / Euclid / Keter only (no ACS, per `site_41b.md` §1.2).
- **Tier** — baseline clearance to open the file (`clearance:` frontmatter), which also sets the act it belongs to.
- **Keys** — `concept:` memberships. Bold = the entity's *primary* seam (its densest narrative tie); the rest are secondary carries.
- **Breach** — `breach_effect.kind`, matched to cluster affinity (`site_41b.md` §2).
- **Cast** — recurring figures cited in addenda (the propagation voices).

---

## Cluster 2.1 — The Misfiled (4 entities · Tiers 1–2 · Act I)

Anomalies that exist chiefly as records errors. Teaches the player that files lie before teaching them why. Breach affinity: `corrupt_search`, `inject_xrefs`.

| # | Class | Hook | Keys | Tier | Breach | Cast |
|---|---|---|---|---|---|---|
| SCP-41B-001 | Safe | A recovered intake whose description differs in a consistent direction each audit | **audit-cycle**, the-quiet-exchange, acquisition-lot | 1 | corrupt_search | — |
| SCP-41B-002 | Safe | An accession number assigned to nothing that keeps accruing addenda | **acquisition-lot**, audit-cycle | 1 | inject_xrefs | Andrade |
| SCP-41B-003 | Euclid | A switchboard with no external wiring that completes calls to no traceable line | **the-quiet-exchange**, induced-nominal-amnesia | 2 | corrupt_search | Andrade |
| SCP-41B-004 | Euclid | Two items sharing one file that insists it is not a duplicate | **induced-nominal-amnesia**, audit-cycle | 2 | inject_xrefs | — |

**Cluster keys closed:** `audit-cycle` (×3), `acquisition-lot` (×2, bridges to Drift), `the-quiet-exchange` (×2), `induced-nominal-amnesia` (×2 — orphan resolved). Act I stays low-exposure: the player gets first propagations cheaply.

*SCP-41B-003 is the worked example carried in `entry_template.md` (formerly numbered SCP-921); SCP-41B-001 is its cross-reference partner (formerly SCP-917).*

---

## Cluster 2.2 — The Quiet Departments (5 entities · Tiers 2–3 · Act II)

Org-chart holes with payroll. Structured absences the paperwork accretes around. Breach affinity: `lock_tier`. Cast anchor: the Custodian (Marsh).

| # | Class | Hook | Keys | Tier | Breach | Cast |
|---|---|---|---|---|---|---|
| SCP-41B-005 | Euclid | An office drawing supplies though no corridor reaches it | **sublevel-grid**, the-transfer | 2 | lock_tier (3) | Vogel |
| SCP-41B-006 | Safe | Memos issued from a desk that was never installed | **vogel-directive**, shift-roster | 2 | lock_tier (3) | Vogel, Marsh |
| SCP-41B-007 | Euclid | A custodian on every shift roster since 1953, never the same hand twice | **shift-roster**, sublevel-grid | 3 | lock_tier (2) | Marsh |
| SCP-41B-008 | Euclid | A department whose only output is denials that it exists | **the-transfer**, vogel-directive | 3 | lock_tier (3) | Vogel |
| SCP-41B-009 | Safe | A payroll line paying a post-1968 vacancy that audits as occupied | **the-transfer**, shift-roster, acquisition-lot | 3 | lock_tier (2) | Andrade, Marsh |

**Cluster keys closed:** `shift-roster` (×3, Marsh seam), `sublevel-grid` (×2, bridges to Negative Stacks), `the-transfer` (×3, the hinge enters here), `vogel-directive` (×2 — promoted from registry §3 seed). The Transfer surfaces as Act II's structural hinge.

---

## Cluster 2.3 — The Negative Stacks (5 entities · Tiers 3–4 · Act II→III)

Spaces that are the documents' negative space. Breach affinity: `randomize_propagation`. The liminal thread (§4): document-without-space, where the oral record drowns, care for nothing confirmable.

| # | Class | Hook | Keys | Tier | Breach | Cast |
|---|---|---|---|---|---|---|
| SCP-41B-010 | Euclid | A storage level in inventory but absent from every blueprint edition | **sublevel-grid**, standing-order | 3 | randomize_propagation (0.25) | Marsh |
| SCP-41B-011 | Euclid | A corridor that exists only while a description of it is being read aloud | **reading-rota**, the-flood-of-71, sublevel-grid | 3 | randomize_propagation (0.25) | Marsh, Halloran |
| SCP-41B-012 | Keter | The Wet Stacks: a flooded gallery where recordings go quiet track-by-track | **wet-stacks-decay**, the-flood-of-71 | 4 | randomize_propagation (0.33) | Halloran |
| SCP-41B-013 | Keter | The Vivified Wing: sealed enclosures maintained for occupants no form names | **vivified-wing**, standing-order | 4 | randomize_propagation (0.33) | Vogel |
| SCP-41B-014 | Euclid | Audio records that file nominal-amnesia as an acoustic property of the Wet Stacks | **wet-stacks-decay**, induced-nominal-amnesia | 4 | randomize_propagation (0.25) | Halloran |

**Cluster keys closed:** `sublevel-grid` (×2 more), `standing-order` (×2 — promoted from seed), `the-flood-of-71` (×2), `wet-stacks-decay` (×2 — promoted), `reading-rota` (bridges to Retention), `vivified-wing` (×1 here — second carrier is SCP-41B-017, see that cluster). `SCP-41B-014` is the second carrier that moves `induced-nominal-amnesia` off the orphan list permanently.

---

## Cluster 2.4 — The Retention Methods (6 entities · Tiers 1–5 · Act III)

The site's own countermeasures. The corpus's connective tissue — most cross-cluster keys. Breach affinity: mixed. Reversal act: the procedures *are* countermeasures, meaning someone understood the threat decades ago.

| # | Class | Hook | Keys | Tier | Breach | Cast |
|---|---|---|---|---|---|---|
| SCP-41B-015 | Safe | Fixative ink mixed on-site to a recipe with one illegible step | **fixative**, reading-rota | 1 | corrupt_search | Vogel |
| SCP-41B-016 | Euclid | Triplicate forms whose third copies occasionally correct the first two | **triplicate-correction**, fixative, audit-cycle | 2 | inject_xrefs | Vogel |
| SCP-41B-017 | Euclid | The reading rota: texts read aloud weekly to hold their referents — the Vivified Wing's enclosures are on it | **reading-rota**, standing-order, vivified-wing | 3 | lock_tier (2) | Vogel, Marsh |
| SCP-41B-018 | Euclid | Sze's early concordance experiments, decommissioned for cause "sufficient" | **concordance-program**, sze-experiment, the-transfer | 4 | inject_xrefs | Sze |
| SCP-41B-019 | Keter | A standing order whose author pre-dates the directory that could name them | **standing-order**, vogel-directive, the-transfer | 4 | lock_tier (3) | Vogel, Andrade |
| SCP-41B-020 | Euclid | Halloran's reconstruction notes, themselves now exhibiting triplicate-correction | **halloran-marginalia**, triplicate-correction, concordance-program | 4 | randomize_propagation (0.25) | Halloran, Sze |

**Cluster keys closed:** `fixative` (×2 — promoted), `reading-rota` (×3, the bridge key), `triplicate-correction` (×2 — promoted), `concordance-program` (×2, the entity thread begins), `sze-experiment` (×2 with the Drift), `standing-order` (toward the Wing), `vivified-wing` second carrier (SCP-41B-017), `halloran-marginalia` enters. This cluster spans the widest tier band by design (procedures touch everything).

> **`vivified-wing` cross-tie (resolved):** SCP-41B-017 (the reading rota) is the key's second carrier. The tie is diegetic, not bolted on — the Wing's enclosures appear *as line-items on the rota* (the standing order that maintains them is itself a text read aloud weekly to hold its referent, per `reading-rota` index 1). So the same procedure that keeps the corridor (SCP-41B-011) readable also keeps the Wing's occupants "on file." When the player edits `reading-rota` in 017, the Wing entry (013) and the rota's own `vivified-wing` and `standing-order` slots propagate together — three clusters moving off one edit. Author 017's addendum to name the Wing explicitly so the propagation reads as causal, not coincidental.

---

## Cluster 2.5 — The Drift (5 entities · Tiers 4–5 · Act IV) — includes the ouroboros

Archive and territory are coupled. SCP-X's approach vector; the primary arc's evidence trail. Breach affinity: `inject_xrefs` at scale.

| # | Class | Hook | Keys | Tier | Breach | Cast |
|---|---|---|---|---|---|---|
| SCP-41B-021 | Keter | A 1974 resurvey where terrain amended itself to agree with a misprinted map | **misprint-survey**, record-reality-coupling | 4 | inject_xrefs | Sze, Halloran |
| SCP-41B-022 | Keter | The 1962 lot re-read as the first import from an external catalog | **acquisition-lot**, the-transfer, misprint-survey | 5 | inject_xrefs | Andrade, Sze |
| SCP-41B-023 | Keter | Storage-decay statistics that track site-wide events before they occur | **record-reality-coupling**, audit-cycle | 5 | inject_xrefs | Sze |
| SCP-41B-024 | Keter | Sze's terminal finding: a cross-referenced record competes with its subject | **sze-experiment**, concordance-program, record-reality-coupling | 5 | inject_xrefs | Sze, Halloran |
| **SCP-41B-000** | **Keter** | **The ouroboros — fully redacted, accessioned 1962, every audit logging only "present"** | **concordance-program**, acquisition-lot, the-transfer, record-reality-coupling, halloran-marginalia | 5 | inject_xrefs | all five |

**Cluster keys closed:** `misprint-survey` (×2), `record-reality-coupling` (×3 — promoted, Tier-5 only), `acquisition-lot` (closes the Act I→IV loop), `sze-experiment` (×2), `concordance-program` (the entity thread terminates in the self-file). **SCP-41B-000 is the `entity_self: true` file** — the one such file in the corpus. It threads five keys across all five clusters per the locked endgame design.

---

## Key-coverage audit

Every registry key, every carrier, no orphans. (× = carrier count after the full roster.)

| Key | Carriers (`SCP-41B-`) | Count | Cross-cluster? |
|---|---|---|---|
| `acquisition-lot` | 001, 002, 009, 022, 000 | 5 | 2.1↔2.2↔2.5 |
| `audit-cycle` | 001, 002, 004, 016, 023 | 5 | 2.1↔2.4↔2.5 |
| `concordance-program` | 018, 020, 024, 000 | 4 | 2.4↔2.5↔self |
| `fixative` | 015, 016 | 2 | within 2.4 |
| `misprint-survey` | 021, 022 | 2 | within 2.5 |
| `reading-rota` | 015, 011, 017 | 3 | 2.3↔2.4 |
| `shift-roster` | 007, 006, 009 | 3 | within 2.2 |
| `standing-order` | 010, 013, 017, 019 | 4 | 2.3↔2.4 |
| `sublevel-grid` | 005, 007, 010, 011 | 4 | 2.2↔2.3 |
| `the-flood-of-71` | 012, 011 | 2 | within 2.3 |
| `the-transfer` | 005, 008, 009, 018, 019, 022, 000 | 7 | 2.2↔2.4↔2.5↔self |
| `the-quiet-exchange` | 003, 001 | 2 | within 2.1 |
| `induced-nominal-amnesia` | 003, 004, 014 | 3 | 2.1↔2.3 |
| `vivified-wing` | 013, 017 | 2 | 2.3↔2.4 |
| `triplicate-correction` | 016, 020 | 2 | within 2.4 |
| `halloran-marginalia` | 020, 000 | 2 | 2.4↔self |
| `vogel-directive` | 006, 008, 019 | 3 | within 2.2/2.4 |
| `wet-stacks-decay` | 012, 014 | 2 | within 2.3 |
| `sze-experiment` | 018, 024 | 2 | 2.4↔2.5 |
| `record-reality-coupling` | 021, 023, 024, 000 | 4 | within 2.5 |

**All 20 keys have ≥2 carriers. No orphans.** Seven registry §3 seed keys are now promoted (carriers assigned): `vivified-wing`, `triplicate-correction`, `halloran-marginalia`, `vogel-directive`, `wet-stacks-decay`, `sze-experiment`, `record-reality-coupling`. The registry has been updated to fill their Carriers columns and move them out of §3.

---

## Tier-pacing audit (four-act arc, `site_41b.md` §6)

| Tier | Count | Entities (`SCP-41B-`) | Act |
|---|---|---|---|
| 1 | 3 | 001, 002, 015 | I (onboarding) |
| 2 | 5 | 003, 004, 005, 006, 016 | I→II |
| 3 | 6 | 007, 008, 009, 010, 011, 017 | II→III |
| 4 | 7 | 012, 013, 014, 018, 019, 020, 021 | III→IV |
| 5 | 4 | 022, 023, 024, 000 | IV (cosmic) |

Front-loaded toward the low-middle tiers where the loop is learned; the Tier-5 cap is small and entirely within the Drift, so the cosmology stays scarce and earned. The ouroboros (SCP-41B-000) is the deepest file, opened last.

---

## Vertical-slice candidates (sprint one)

The first three entities to author (milestone 4 needs propagation to act on). Recommended trio, all Act I, sharing two keys so propagation is felt immediately:

- **SCP-41B-003** (the worked example — copy-ready from `entry_template.md`) — `the-quiet-exchange`, `induced-nominal-amnesia`
- **SCP-41B-001** — `the-quiet-exchange`, `audit-cycle`, `acquisition-lot`
- **SCP-41B-002** — `acquisition-lot`, `audit-cycle`

Shared keys across the trio: `the-quiet-exchange` (003↔001), `acquisition-lot` (001↔002), `audit-cycle` (001↔002). Three propagation seams inside three files — enough to feel the mechanic without authoring deeper tiers. None requires a breach effect more complex than `corrupt_search` / `inject_xrefs`.

---

## Open items before content lock

- [x] ~~Finalize SCP numbers~~ — resolved: site-local `SCP-41B-###`, clean sequence, ouroboros `-000`. Propagated to `entry_template.md`, `handoff.md`, `agents.md`, `concept_key_registry.md`.
- [x] ~~Promote the seven seed keys in `concept_key_registry.md`~~ — done.
- [x] ~~Confirm `vivified-wing`'s second carrier~~ — resolved: SCP-41B-017 (reading rota) carries it via the Wing's enclosures appearing on the rota. See the cluster 2.4 note.
- [x] ~~**SCP-X bible:** assign the overlay-state thresholds that fork SCP-41B-000's two endings~~ — done in `scp_x_bible.md`. Fork = `thread_coherence` (0–5) over the five threaded keys' carriers; 5 → Recontainment, 0–2 → Restructuring, 3–4 → contested (tiebroken by the self-file's `concordance-program` + `halloran-marginalia` anchors). The self-file's five anchors are the five keys at `redaction_level: 5`, truths = the index-0 mundane readings.
- [ ] **When writing entries:** per-entity mutation sets are *not* in this roster — they live in each entry's frontmatter, ordered per the registry's mutation index. The roster fixes carriers and keys; the entry fixes the candidate strings. Author against `entry_template.md`; register every new carrier back in `concept_key_registry.md` per its §5 checklist before committing. For SCP-41B-017 specifically, write the addendum so the Vivified Wing is named on the rota explicitly (see cluster 2.4 note) — otherwise the three-cluster propagation off one edit reads as coincidence, not cause.
