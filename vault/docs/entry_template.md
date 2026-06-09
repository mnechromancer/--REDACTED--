---
# ─────────────────────────────────────────────────────────────
#  ENTRY TEMPLATE  —  copy this file, rename to SCP-XXX.md
#  This frontmatter is the machine-readable game data.
#  The body below is the human-readable Foundation page.
#  build-corpus.ts parses both. Keep them consistent.
# ─────────────────────────────────────────────────────────────
item: "SCP-XXX"
object_class: "Euclid"          # Safe | Euclid | Keter  (Series-I era; do NOT use ACS)
site: "Site-██"
clearance: 2                    # baseline tier required to OPEN this file (1–5)
entity_self: false              # true ONLY on the SCP-X self-file (there must be exactly one)

# Explicit narrative cross-references. Mirror these as [[SCP-YYY]] in the body.
xrefs: ["SCP-YYY", "SCP-ZZZ"]

# What happens to the terminal if this entity breaches (exposure crosses its threshold).
breach_effect:
  kind: "inject_xrefs"          # inject_xrefs | corrupt_search | lock_tier | randomize_propagation
  # tier: 3                     # required if kind == lock_tier
  # fraction: 0.25              # required if kind == randomize_propagation

# ── ANCHORS ──────────────────────────────────────────────────
# Every ⟦id⟧ token in the body MUST have a matching anchor here.
# truth        = immutable correct value, hidden until clearance >= redaction_level
# concept      = shared key; anchors with the SAME concept across files propagate together,
#                and MUST share the same mutation-set ordering (index-aligned)
# mutations    = bounded MadLib candidate set (keep small: 3–5)
# exposure_weight = how much inserting/mutating this raises global exposure
anchors:
  - id: "a1"
    slot_type: "object"         # object | agent | location | outcome
    truth: "ORIGINAL VALUE — must NOT match any canonical SCP solution"
    redaction_level: 3
    concept: "shared-concept-key"
    mutations: ["candidate one", "candidate two", "candidate three"]
    exposure_weight: 2
  - id: "a2"
    slot_type: "outcome"
    truth: "ORIGINAL VALUE"
    redaction_level: 4
    concept: ""                 # empty = local only, does not propagate
    mutations: ["candidate one", "candidate two"]
    exposure_weight: 3
---

> [!warning] Authoring rules — read before writing
> 1. **Flavor may resemble canon; solutions may not.** Clinical voice, addendum/incident-log
>    structure, and containment cadence can echo Series I as heavily as you like. The value in
>    every `truth:` field must be original — nothing a Foundation-familiar reader could guess
>    from recognizing a canonical entity.
> 2. **No verbatim text.** Paraphrase or invent. Nothing shippable carries CC-BY-SA obligations.
> 3. **Typed slots only.** Redacted spans are anchors with bounded `mutations`. No free-form
>    redaction that the propagation engine can't resolve.
> 4. **Place a `⟦anchor_id⟧` token at each slot in the prose** where the redaction appears.
> 5. **Density target:** share at least two `concept` keys with other entries.

---

# Item #: SCP-XXX

**Object Class:** Euclid

## Special Containment Procedures

SCP-XXX is to be contained within ⟦a1⟧ at Site-██. [Write the procedure in clinical Foundation
voice. Reference related anomalies using Obsidian wikilinks, e.g. [[SCP-YYY]], so the cross-
reference graph is legible in the vault and validated at build time.] Access to the full
description is restricted to personnel of clearance 3 or above.

## Description

SCP-XXX is [a paraphrased, original description in Series-I register]. When activated, SCP-XXX
produces ⟦a2⟧. [Continue. Each `⟦id⟧` token is a redaction the player will fill via SCP-X. The
surrounding prose is the context they triangulate from — write enough that a careful reader could
infer the slot, but not so much that it is trivial.]

## Addendum XXX.1 — [Incident / Interview / Recovery]

[Optional. Addenda are where cross-mentions of shared concepts live. If SCP-XXX shares a
`concept` with [[SCP-ZZZ]], mention that concept here so an edit in one file visibly propagates
here. This is the surface that makes propagation feel real.]

<!--
  PARSER NOTES (do not render):
  - exactly one vault file may set entity_self: true
  - every ⟦id⟧ above resolves to an anchor in frontmatter
  - concept groups must have equal-length, index-aligned mutation sets across files
-->

---
---

# ══════════════════════════════════════════════════════════════
#  WORKED EXAMPLE  (original entity — reference only, not a template to copy)
# ══════════════════════════════════════════════════════════════

```markdown
---
item: "SCP-921"
object_class: "Euclid"
site: "Site-44"
clearance: 2
entity_self: false
xrefs: ["SCP-917"]
breach_effect:
  kind: "corrupt_search"
anchors:
  - id: "a1"
    slot_type: "object"
    truth: "a brass switchboard with no external wiring"
    redaction_level: 3
    concept: "the-quiet-exchange"
    mutations:
      - "a brass switchboard with no external wiring"
      - "a rotary handset sealed in resin"
      - "a punch-card reader missing its feed tray"
    exposure_weight: 2
  - id: "a2"
    slot_type: "outcome"
    truth: "the caller forgets the name of the person they intended to reach"
    redaction_level: 4
    concept: "induced-nominal-amnesia"
    mutations:
      - "the caller forgets the name of the person they intended to reach"
      - "the caller is connected to a conversation from the prior day"
      - "the caller hears their own voice answering"
    exposure_weight: 3
---

# Item #: SCP-921

**Object Class:** Euclid

## Special Containment Procedures

SCP-921 is to be stored unplugged within ⟦a1⟧ at Site-44, in a room sharing no power feed with
documented memetic assets. Cross-reference monitoring with [[SCP-917]] is maintained; the two
share recovery provenance. Operation of SCP-921 by personnel below clearance 4 is prohibited.

## Description

SCP-921 manifests as ⟦a1⟧ recovered from a decommissioned exchange building. When a connection is
initiated, SCP-921 completes a call to no traceable line, after which ⟦a2⟧. The effect is
consistent across subjects and resists standard mnestic countermeasures.

## Addendum 921.1 — Recovery

SCP-921 was recovered alongside materials later catalogued under [[SCP-917]]; both exhibit the
"quiet exchange" provenance, and alterations to one record have historically correlated with
discrepancies in the other.
```

*Why this example is correct:* `a1`'s concept `the-quiet-exchange` is shared with SCP-917, so
editing it propagates across both files. `a2`'s outcome is original — no canonical entity resolves
this way, so foreknowledge gives no advantage. The voice is Series-I clinical; the solution is not
canon. Mutation sets are bounded (3 and 3) and index-aligned for any shared-concept partner.
