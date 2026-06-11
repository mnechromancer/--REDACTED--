# Concept-Key Registry

Living index of every `concept:` key in the corpus. **This is the propagation graph's backbone.** When two anchors share a concept-key they must have equal-length, index-aligned mutation sets — this document is where you enforce that before writing begins. Authoring rule: coin a key here first; never coin it inside an entry and register it later.

Maintainability: once ≥8 entries exist, replace the manual tables with a Dataview query that groups `anchors` by `concept` and lists carriers. Until then, edit this file alongside each new entry.

---

## Key conventions

| Column | Meaning |
|---|---|
| **Key** | The exact string used in `concept:` frontmatter — kebab-case, lowercase |
| **Clusters** | Which §2 clusters carry this key (2.1–2.5 shorthand) |
| **Carriers** | `SCP-41B-###` refs (with `#aY` anchor suffix where a file carries the key in a specific slot); count in parens |
| **Mutation index** | The shared ordering — what index 0, 1, 2 … mean across all carriers |
| **Tier band** | Approximate clearance range of carrying anchors |
| **Orphan risk** | Flagged if only one file currently carries this key (propagation dead end) |

Keys are grouped by origin: §1 named in `site_41b.md` §2 seams (the graph's seed strands); §2 from the worked example; §3 promoted from seed once the roster assigned carriers. All carriers are *planned* in `entity_roster.md` — they become *authored* as entries land in `vault/entries/`. The §5 checklist keeps this file in sync as that happens.

---

## 1. Keys named in `site_41b.md` §2 seams

### `acquisition-lot`
| | |
|---|---|
| Clusters | 2.1 (Misfiled), 2.2 (Quiet Departments), 2.5 (Drift) — the connective strand that pins Act I to Act IV |
| Carriers | `SCP-41B-001`, `SCP-41B-002`, `SCP-41B-009`, `SCP-41B-022`, `SCP-41B-000` (×5) |
| Mutation index | 0 = the 1962 lot as administrative intake event; 1 = as anomalous import from an external record set; 2 = as the first successful re-indexing by the Concordance-entity |
| Tier band | 1–2 (surface reading), 5 (true reading) — same key, two clearance-dependent meanings |
| Orphan risk | No (5 carriers) |
| Sibling keys | `concordance-program`, `the-transfer` |
| Notes | The 1962 lot re-reads under this key as Drift evidence. Anchors should be typed `outcome` at low tier (bureaucratic import) and `object` at high tier (the lot *is* the first import from the external catalog). Ensure the mutation-set ordering makes the Tier-5 reading feel like recognition, not retcon. |

---

### `audit-cycle`
| | |
|---|---|
| Clusters | 2.1 (Misfiled), 2.4 (Retention Methods), 2.5 (Drift) |
| Carriers | `SCP-41B-001`, `SCP-41B-002`, `SCP-41B-004`, `SCP-41B-016`, `SCP-41B-023` (×5) |
| Mutation index | 0 = regular annual audit finds no discrepancy; 1 = audit finds consistent directional drift in description; 2 = audit log itself exhibits drift between filing copies |
| Tier band | 1–2 |
| Orphan risk | No (5 carriers) |
| Sibling keys | `the-transfer`, `fixative` |
| Notes | Low-stakes teaching key. Good for the first playable trio — gives the player their first propagation in a low-exposure context. Mutation index 2 (the audit log itself drifts) plants the seed for the §6 cosmology without naming it. |

---

### `concordance-program`
| | |
|---|---|
| Clusters | 2.4 (Retention Methods), 2.5 (Drift), SCP-X self-file |
| Carriers | `SCP-41B-018`, `SCP-41B-020`, `SCP-41B-024`, `SCP-41B-000` (×4) |
| Mutation index | 0 = concordance as automated cross-reference utility; 1 = concordance as Dr. Sze's active experiment; 2 = concordance as the access point (what the entity moved through) |
| Tier band | 3–5 — this key escalates; low-tier anchors carry index 0, high-tier anchors carry index 2 |
| Orphan risk | No (4 carriers) |
| Sibling keys | `acquisition-lot`, `the-transfer`, `fixative` |
| Notes | This is the entity's thread through the corpus — the key that makes the Concordance's history legible. Must appear in the SCP-X self-file. The mutation-index meaning escalates with clearance: a player who fills this early (index 0) and then raises clearance sees `contradiction` state on the high-tier reading. That contradiction is a design intention, not an authoring error — document it here so future authors don't "fix" it. |

---

### `fixative`
| | |
|---|---|
| Clusters | 2.4 (Retention Methods) — spans all tiers as connective tissue |
| Carriers | `SCP-41B-015`, `SCP-41B-016` (×2) |
| Mutation index | 0 = fixative ink as a standard preservation compound; 1 = fixative ink as an on-site formula with one illegible step; 2 = fixative ink as an active retention countermeasure (the illegible step is the mechanism) |
| Tier band | 1–4 (procedure-layer key, touches almost everything) |
| Orphan risk | No (2 carriers) |
| Sibling keys | `reading-rota`, `concordance-program`, `audit-cycle` |
| Notes | Mutation index 1 is the canonical onboarding version. Index 2 is the Tier-4 reveal that the ritual *works* — players who filed it as bureaucratic color see the contradiction state when the mechanism is revealed. Vogel's memos are signed in fixative ink; at least one Vogel-voice addendum should carry this key. |

---

### `misprint-survey`
| | |
|---|---|
| Clusters | 2.5 (Drift) |
| Carriers | `SCP-41B-021`, `SCP-41B-022` (×2) |
| Mutation index | 0 = survey error (mundane cartographic mistake); 1 = terrain amended to match the misprint post hoc; 2 = amendment confirmed in triplicate with all three copies in agreement, dating the change to before the survey was filed |
| Tier band | 4–5 |
| Orphan risk | No (2 carriers) |
| Sibling keys | `acquisition-lot`, `sublevel-grid` |
| Notes | The Drift cluster's clearest statement of record/reality coupling. The mutation index should be strictly ordered so the player who guesses index 0 early has a satisfying contradiction reveal at Tier 4–5. Index 2 is the cosmological punchline — it only lands if the prior indexing was coherent. |

---

### `reading-rota`
| | |
|---|---|
| Clusters | 2.3 (Negative Stacks), 2.4 (Retention Methods) |
| Carriers | `SCP-41B-011`, `SCP-41B-015`, `SCP-41B-017` (×3) |
| Mutation index | 0 = reading rota as scheduled staff review procedure; 1 = reading rota as mnemonic maintenance (text read aloud weekly holds its referent); 2 = reading rota as the primary reason a given entity has not yet breached |
| Tier band | 2–4 |
| Orphan risk | No (3 carriers) |
| Sibling keys | `fixative`, `standing-order` |
| Notes | Good bridge key: appears in Retention Methods entries but can cross into Quiet Departments (entities that exist *because* they are on the rota). The jump from index 1 to index 2 is where the game tells the player that their reading is load-bearing — excellent for a Tier-3 contradiction moment. |

---

### `shift-roster`
| | |
|---|---|
| Clusters | 2.2 (Quiet Departments) — Marsh anchor key |
| Carriers | `SCP-41B-006`, `SCP-41B-007`, `SCP-41B-009` (×3) |
| Mutation index | 0 = shift-roster entry as a normal personnel record; 1 = roster entry persisting unchanged across decades with no HR amendment; 2 = roster entry appearing in handwriting styles that do not match any on-file staff signature |
| Tier band | 2–3 |
| Orphan risk | No (3 carriers) |
| Sibling keys | `sublevel-grid`, `the-transfer` |
| Notes | The Custodian (Marsh) is the anchor figure here. Mutation set deliberately withholds Marsh's nature — index 2 is the last authored candidate, not a resolution. Authoring rule: no entry in this key's mutation set should definitively answer "staff or anomaly." That question is load-bearing ambiguity. |

---

### `standing-order`
| | |
|---|---|
| Clusters | 2.3 (Negative Stacks), 2.4 (Retention Methods) — Vivified Wing seam |
| Carriers | `SCP-41B-010`, `SCP-41B-013`, `SCP-41B-017`, `SCP-41B-019` (×4) |
| Mutation index | 0 = standing order as procedural directive with named author; 1 = standing order with author field blank or redacted; 2 = standing order pre-dating the site's current directory structure by enough years that no author could exist on file |
| Tier band | 3–4 |
| Orphan risk | No (4 carriers) |
| Sibling keys | `reading-rota`, `sublevel-grid`, `the-transfer` |
| Notes | The Vivified Wing is this key's home. The mutation escalation mirrors `fixative` and `reading-rota` — procedure whose origin dissolves under scrutiny. Index 0 should feel mundane; index 2 should feel like the site's infrastructure pre-existing any named person's authority. |

---

### `sublevel-grid`
| | |
|---|---|
| Clusters | 2.2 (Quiet Departments), 2.3 (Negative Stacks) — the cross-cluster bridge between these two |
| Carriers | `SCP-41B-005`, `SCP-41B-007`, `SCP-41B-010`, `SCP-41B-011` (×4) |
| Mutation index | 0 = sublevel designation as a standard archive floor (matches blueprints); 1 = sublevel present in inventory/personnel records but absent from physical blueprints; 2 = sublevel present in blueprints from one date, absent from a later edition, inventory unchanged |
| Tier band | 2–4 |
| Orphan risk | No (4 carriers) |
| Sibling keys | `shift-roster`, `standing-order`, `misprint-survey` |
| Notes | The structural analog of `misprint-survey` — where that key handles terrain, this one handles interior architecture. Mutation index 1 is the Negative Stacks' defining condition; sharing it with Quiet Departments (index 1 variant: the office with no corridor) makes both clusters feel like instances of the same problem. |

---

### `the-flood-of-71`
| | |
|---|---|
| Clusters | 2.3 (Negative Stacks) — the Wet Stacks seam |
| Carriers | `SCP-41B-011`, `SCP-41B-012` (×2) |
| Mutation index | 0 = the 1971 flood as a documented infrastructure event (water ingress, damage log); 1 = the flood as the condition that created the Wet Stacks' acoustic properties; 2 = the flood as a retrocontinuous event — damage logs pre-dating 1971 already document the post-flood state |
| Tier band | 3–4 |
| Orphan risk | No (2 carriers) |
| Sibling keys | `sublevel-grid`, `standing-order` |
| Notes | Index 2 is another record/reality coupling instance — different register than `misprint-survey` (temporal rather than cartographic). The two keys should appear in adjacent entries so the player sees the pattern. Mutation set must not resolve what caused the flood — that is not in scope; the flood is setting color, not content. |

---

### `the-transfer`
| | |
|---|---|
| Clusters | 2.2 (Quiet Departments), 2.4 (Retention Methods), 2.5 (Drift) — the corpus's primary hinge |
| Carriers | `SCP-41B-005`, `SCP-41B-008`, `SCP-41B-009`, `SCP-41B-018`, `SCP-41B-019`, `SCP-41B-022`, `SCP-41B-000` (×7) |
| Mutation index | 0 = the Transfer as a records-custody reorganization (administrative); 1 = the Transfer as the event after which Site-41 stopped acknowledging correspondence; 2 = the Transfer as the moment the Concordance-entity completed its initial re-indexing (Tier-5 reading only) |
| Tier band | 2–5 — appears everywhere; low-tier carriers hold index 0 or 1, high-tier carriers hold index 2 |
| Orphan risk | No (7 carriers — the highest-traffic key) |
| Sibling keys | `concordance-program`, `acquisition-lot`, `shift-roster` |
| Notes | The single most cross-cluster key in the corpus. Every cluster should have at least one anchor carrying this key (Misfiled as background, Quiet Departments as the hinge, Retention Methods as the thing the Transfer ended, Drift as the thing it began). Sze and Andrade are the human carriers. Index 2 should feel like the whole game snapping into focus — reserve it for Tier 5. |

---

## 2. Keys from the worked example

### `the-quiet-exchange`
| | |
|---|---|
| Clusters | 2.1 (Misfiled) — communication/connection anomalies |
| Carriers | `SCP-41B-003#a1`, `SCP-41B-001` (×2) |
| Mutation index | 0 = communication device with no external wiring; 1 = device completing connections with no traceable line; 2 = device completing connections to the party who cannot be reached |
| Tier band | 2–3 |
| Orphan risk | No (2 carriers) |
| Sibling keys | `induced-nominal-amnesia`, `the-transfer` |
| Notes | The worked example's cross-file seam (SCP-41B-003 is the template entity, formerly SCP-921; SCP-41B-001 its partner, formerly SCP-917). SCP-41B-001 must share index-aligned mutations with SCP-41B-003 for this key. The connection-to-an-unreachable-party concept (index 2) rhymes with Andrade / Site-41 — consider an Andrade-voice addendum so `the-quiet-exchange` resonates with `the-transfer`. |

---

### `induced-nominal-amnesia`
| | |
|---|---|
| Clusters | 2.1 (Misfiled), 2.3 (Negative Stacks) |
| Carriers | `SCP-41B-003#a2`, `SCP-41B-004`, `SCP-41B-014` (×3) |
| Mutation index | 0 = subject forgets the name of the person they intended to reach; 1 = subject connected to a conversation from the prior day; 2 = subject hears their own voice answering |
| Tier band | 3–4 |
| Orphan risk | No (3 carriers — resolved; SCP-41B-014 is the Wet Stacks carrier) |
| Sibling keys | `the-quiet-exchange`, `reading-rota` |
| Notes | The amnesia-of-names concept resonates with the Wet Stacks (recordings go quiet) and with the Retention Methods (reading rota keeps a text's referent alive). SCP-41B-014 carries it as an *acoustic* property of the Wet Stacks — that is the second carrier that moved this key off the orphan list (resolved in `entity_roster.md`). |

---

## 3. Keys promoted from seed (carriers assigned in `entity_roster.md`)

These seven were anticipated by the setting and have now had carriers assigned by the roster. Full tables below; mutation indices are the canonical ordering all carriers must share.

### `vivified-wing`
| | |
|---|---|
| Clusters | 2.3 (Negative Stacks), 2.4 (Retention Methods) |
| Carriers | `SCP-41B-013`, `SCP-41B-017` (×2) |
| Mutation index | 0 = a maintained habitat enclosure with a named (if absent) occupant; 1 = an enclosure whose intake form names no occupant; 2 = an enclosure whose maintenance order is the only record that it has an occupant at all |
| Tier band | 3–4 |
| Orphan risk | No (2 carriers) |
| Sibling keys | `standing-order`, `reading-rota` |
| Notes | Care-without-referent, the §4 vivarium thread. SCP-41B-013 is the Wing itself; SCP-41B-017 (the reading rota) is the cross-tie — the Wing's enclosures appear *as line-items on the rota*, so editing `reading-rota` in 017 propagates to the Wing. Author 017's addendum to name the Wing explicitly (see roster cluster 2.4 note) so the propagation reads as causal. |

---

### `triplicate-correction`
| | |
|---|---|
| Clusters | 2.4 (Retention Methods) |
| Carriers | `SCP-41B-016`, `SCP-41B-020` (×2) |
| Mutation index | 0 = third copies are routine redundancy; 1 = third copies occasionally diverge from the first two; 2 = third copies *correct* the first two — the record amending itself toward an unseen original |
| Tier band | 2–4 |
| Orphan risk | No (2 carriers) |
| Sibling keys | `fixative`, `concordance-program` |
| Notes | The moment a retention method turns anomalous. Index 2 prefigures the Drift cosmology (a record maintained toward an original no one holds). SCP-41B-020 (Halloran's notes) carries it reflexively — his own reconstruction now self-corrects, which is the prior-loop horror made mechanical. |

---

### `halloran-marginalia`
| | |
|---|---|
| Clusters | 2.4 (Retention Methods), SCP-X self-file — but Halloran's voice may annotate any file |
| Carriers | `SCP-41B-020`, `SCP-41B-000` (×2) |
| Mutation index | 0 = marginalia as a predecessor's filing annotations; 1 = marginalia as increasingly urgent warnings; 2 = marginalia as evidence Halloran ran this exact decipherment before and is gone in a way no file states |
| Tier band | 4 |
| Orphan risk | No (2 carriers) |
| Sibling keys | `concordance-program`, `record-reality-coupling` |
| Notes | The prior-loop seam. Distinct from the *ambient* Halloran annotations that may appear in any file's prose (those are voice, not anchors); this key marks the **anchored** slots where the marginalia's meaning is itself the puzzle. Index 2 lands only at the self-file — it is the player recognizing themselves in Halloran. |

---

### `vogel-directive`
| | |
|---|---|
| Clusters | 2.2 (Quiet Departments), 2.4 (Retention Methods) |
| Carriers | `SCP-41B-006`, `SCP-41B-008`, `SCP-41B-019` (×3) |
| Mutation index | 0 = a directive from the site director of record; 1 = a directive from a director with no staff file or office number; 2 = a directive whose authority pre-dates any directory that could seat its author |
| Tier band | 2–4 |
| Orphan risk | No (3 carriers) |
| Sibling keys | `shift-roster`, `standing-order`, `the-transfer` |
| Notes | Vogel as the institutional register — procedural authority from a person who may not be at the site, or be the site's administrative voice (held open, per `site_41b.md` §3). Memos signed in fixative ink; the key can sibling with `fixative` where a directive's signature is the anchor. Never resolve whether Vogel exists. |

---

### `wet-stacks-decay`
| | |
|---|---|
| Clusters | 2.3 (Negative Stacks) |
| Carriers | `SCP-41B-012`, `SCP-41B-014` (×2) |
| Mutation index | 0 = audio records degrading through normal tape decay; 1 = recordings going quiet track-by-track in storage; 2 = recordings going quiet *when listened to* — attention as the erasure mechanism |
| Tier band | 4 |
| Orphan risk | No (2 carriers) |
| Sibling keys | `the-flood-of-71`, `induced-nominal-amnesia` |
| Notes | Attention-as-violence, the §4 pools thread relocated into the oral record's grief organ. Index 2 is the cruel inversion — the player learns that *reading* (their core verb) is what kills the Wet Stacks, rhyming the local mechanic with the §6 genre thesis (every guess is an act of unreading). |

---

### `sze-experiment`
| | |
|---|---|
| Clusters | 2.4 (Retention Methods), 2.5 (Drift) |
| Carriers | `SCP-41B-018`, `SCP-41B-024` (×2) |
| Mutation index | 0 = the concordance work as a cataloguing efficiency project; 1 = as an experiment in making the archive self-cross-referencing; 2 = as the experiment that found a sufficiently cross-referenced record competes with its subject |
| Tier band | 4–5 |
| Orphan risk | No (2 carriers) |
| Sibling keys | `concordance-program`, `record-reality-coupling` |
| Notes | Sze the Cataloguer's Promethean thread. Sibling-but-distinct from `concordance-program`: that key is the *utility/entity*; this key is the *person's findings*. Index 2 is the terminal finding that the whole Drift cluster is evidence for — reserve it for Tier 5 (SCP-41B-024). |

---

### `record-reality-coupling`
| | |
|---|---|
| Clusters | 2.5 (Drift), SCP-X self-file |
| Carriers | `SCP-41B-021`, `SCP-41B-023`, `SCP-41B-024`, `SCP-41B-000` (×4) |
| Mutation index | 0 = archive and territory correlate by coincidence/error; 1 = the archive describes a territory that has begun to agree with it; 2 = the archive does not describe its subject but competes with it — reality as a maintained record whose maintenance lapsed |
| Tier band | 5 (cosmic — Tier-5 only) |
| Orphan risk | No (4 carriers) |
| Sibling keys | `misprint-survey`, `sze-experiment`, `concordance-program` |
| Notes | The §6 cosmology made explicit. **Tier-5 only** — never expose an index-2 reading below clearance 5; the cosmology must stay scarce and earned. This key, with `concordance-program` and `the-transfer`, is the intersection the SCP-41B-000 endgame fork reads (see roster open items). |

---

## 4. Cross-cluster propagation map

Which keys bridge which clusters. A cluster with no bridging key is an island — the propagation graph should have none.

```
2.1 Misfiled ────── acquisition-lot ──────── 2.5 Drift
                 └── audit-cycle (light)

2.2 Quiet Depts ─── sublevel-grid ─────────── 2.3 Negative Stacks
                 └── the-transfer (heavy) ─── 2.4 Retention Methods ─── 2.5 Drift
                 └── shift-roster (Marsh)

2.4 Retention ─── concordance-program ──── 2.5 Drift ─── SCP-X self-file
              └── fixative
              └── reading-rota ────────────── 2.3 (standing-order sibling)

All clusters ─── halloran-marginalia (the prior-loop seam: 020 ↔ self-file)
             └── the-transfer (the hinge key, touches 4 of 5 clusters + self-file)
```

No cluster is an island. `the-transfer` is the highest-traffic key; keep its mutation index consistent and well-documented.

---

## 5. Authoring checklist (per new entry)

- [ ] Every new `concept:` value appears in this registry before the entry is committed
- [ ] Every new carrier is added to the registry's **Carriers** column
- [ ] If a key now has exactly one carrier, it is flagged **Orphan risk: Yes**
- [ ] If a key gains its second carrier, confirm mutation-set length and index alignment before the entry ships
- [ ] Keys that bridge clusters are noted in §4
- [ ] Planned keys that have been authored are moved from §3 to §1 or §2
