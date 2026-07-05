# Concept-Key Registry (v3)

Living index of every `concept:` key in the corpus — the propagation/grounding graph's
backbone. **Reset empty for v3** (2026-07-04, `planning/reset_v3_intake.md`): the v1/v2
keys and their carrier tables retired with the old content; the old registry is preserved
in `archive/concept_key_registry.md` for mining. Keys regrow from the Phase-4 content pass.

**The rule, unchanged: coin a key here first.** Never coin one inside an entry and register
it later.

---

## Conventions

- **Key** — the exact `concept:` string: kebab-case, lowercase.
- **Semantics (v3/v2 single-word model):** anchors sharing a key are **co-carriers** — they
  hold the same truth word, propagate together when one is solved, and can contribute to
  each other's inference grounding. (The old escalating mutation-index semantics died with
  the `mutations[]` model; a key now names one shared word-concept, not a ladder of
  readings.)
- **No-orphan rule:** every key wants **≥2 carriers** — a single-carrier key is a
  propagation dead end. Single-carrier keys are allowed only as flagged, temporary state
  while a batch is mid-authoring.
- **Registry entry format:** key, carriers (`SCP-41B-####aY`, `✎` = authored), which
  collection/day each carrier sits in, orphan risk, notes.
- Once the corpus is large enough, replace the manual table with a Dataview query grouping
  `anchors` by `concept`; until then, edit this file alongside each new entry.

---

## 1. Live keys

*None yet. The first keys land with the Phase-4 content pass (day-2+ batches — day-1
teaching slots may not need concept keys at all; their grounding is the shelf, not a
co-carrier).*

## 2. Candidate keys from surviving canon (non-binding)

Concepts that survived the v3 reset (`site_41b.md` §3) and are likely to want keys when
their carriers are authored. Names here are placeholders, not coinage — re-confirm or
rename at authoring time:

- `the-transfer` — the 1968 custody event; the hinge everything bends around.
- `concordance-program` — Sze's cross-reference experiments; the entity's approach vector.
- `fixative` — the retention-methods thread; citation-as-fixative echoes the transmittal
  model.
- `the-erasure` — new, v3-native: the 4 PM mechanism as it surfaces inside the inbound
  documents themselves (does Site-41B know what it is sending into?).
- `halloran-marginalia` — the predecessor thread across the batch.
- Area-arc seeds (`the-access-road`, `the-claim`, `the-watershed`) — if the area arc
  returns in an inbound batch.

## 3. Sync checklist (per authored entry)

1. Every `concept:` in the new entry exists here already (coined first).
2. Mark the carrier `✎` with its `#aY` suffix, collection, and day.
3. Flag any key left at one carrier; schedule its second carrier in the same batch if
   possible.
