---
# ─────────────────────────────────────────────────────────────
#  ENTRY TEMPLATE  —  copy this file, rename to SCP-41B-XXX.md
#  This frontmatter is the machine-readable game data.
#  The body below is the human-readable Foundation page.
#  build-corpus.ts parses both. Keep them consistent.
#
#  ⚠ RE-FRAME (planning/reframe_amber_quippy.md §3): files should be LONG,
#    multi-section, densely cross-referenced dossiers — places to spend time,
#    not three-sentence stubs. This template now models that scale. The
#    frontmatter CONTRACT is unchanged; the body GREW. See §"Longer files" below
#    and planning/handoff_docs_reviser.md → "entry_template.md".
# ─────────────────────────────────────────────────────────────
item: "SCP-41B-XXX"             # site-local accession; see entity_roster.md "Designation scheme"
object_class: "Euclid"          # Safe | Euclid | Keter  (Series-I era; do NOT use ACS)
site: "Site-41B"
clearance: 2                    # baseline tier required to OPEN this file (1–5)
entity_self: false              # true ONLY on the Quippy self-file (SCP-41B-000; exactly one)

# Explicit narrative cross-references. Mirror EVERY one as [[SCP-41B-YYY]] in the body.
# Longer dossiers cross-reference MORE — aim for richer xref density (see §"Longer files").
xrefs: ["SCP-41B-YYY", "SCP-41B-ZZZ"]

# What happens to the terminal if this entity breaches (exposure crosses its threshold).
breach_effect:
  kind: "inject_xrefs"          # inject_xrefs | corrupt_search | lock_tier | randomize_propagation
  # tier: 3                     # required if kind == lock_tier
  # fraction: 0.25              # required if kind == randomize_propagation

# ── ANCHORS ──────────────────────────────────────────────────
# Every ⟦id⟧ token in the body MUST have a matching anchor here, and each anchor
# MUST appear EXACTLY ONCE in the body (one token per anchor — see rule 4).
# truth        = immutable correct value, hidden until clearance >= redaction_level
# concept      = shared key; anchors with the SAME concept across files propagate together,
#                and MUST share the same mutation-set ordering (index-aligned)
# mutations    = bounded MadLib candidate set (keep small: 3–5)
# exposure_weight = how much a QUIPPY-assisted insertion/mutation of this slot raises exposure
#                   (AMBER manual unredaction costs little/none — re-frame [R§6.4], PENDING exact model)
#
# Longer files carry MORE anchors (spread across sections) — see §"Longer files".
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
  # Longer dossiers add a3, a4, a5… across the addenda/logs below. Keep each
  # grounded so it is inferable from MULTIPLE files (the manual-AMBER "a-ha").
---

> [!warning] Authoring rules — read before writing
> 1. **Flavor may resemble canon; solutions may not.** Clinical voice, addendum/incident-log
>    structure, and containment cadence can echo Series I as heavily as you like. The value in
>    every `truth:` field must be original — nothing a Foundation-familiar reader could guess
>    from recognizing a canonical entity. (Binding; unchanged by the re-frame.)
> 2. **No verbatim text.** Paraphrase or invent. Nothing shippable carries CC-BY-SA obligations.
> 3. **Typed slots only.** Redacted spans are anchors with bounded `mutations`. No free-form
>    redaction the propagation engine can't resolve. (AMBER and Quippy both fill *these* slots;
>    they differ in how the player arrives at the value, not in what values exist.)
> 4. **One token per anchor.** Place a `⟦anchor_id⟧` token at the slot in the prose where the
>    redaction appears — and place it **exactly once.** The parser scans the body for tokens; a
>    duplicated `⟦a1⟧` is a build error. (Recent authoring bug.) If you want the same fact to
>    recur across sections, *describe* it in prose around the single token, don't repeat the token.
> 5. **Density target:** share at least two `concept` keys with other entries; for longer files,
>    aim higher (§"Longer files"). Every `[[SCP-41B-YYY]]` in the body must be declared in `xrefs`.
> 6. **Ground each redaction in multiple files** ([R§3]). A careful, well-read player should be
>    able to infer a slot's value by triangulating across the corpus in AMBER — that earned
>    deduction is the alternative to letting Quippy fill it. Write the corroborating mentions
>    into the cross-referenced files. A slot a player can only solve via Quippy is a design miss.

---

# Item #: SCP-41B-XXX

**Object Class:** Euclid  ·  **Site:** Site-41B  ·  **Clearance:** [n]

## Special Containment Procedures

SCP-41B-XXX is to be contained within ⟦a1⟧ at Site-41B. [Write the procedure in clinical Foundation
voice. Reference related anomalies using Obsidian wikilinks, e.g. [[SCP-41B-YYY]], so the cross-
reference graph is legible in the vault and validated at build time.] Access to the full
description is restricted to personnel of clearance [n] or above.

## Description

SCP-41B-XXX is [a paraphrased, original description in Series-I register]. When activated, SCP-41B-XXX
produces ⟦a2⟧. [Continue. Each `⟦id⟧` token is a redaction the player will fill. The surrounding
prose — and the cross-referenced files — are the context they triangulate from in AMBER. Write
enough that a careful, well-read player could infer the slot without making it trivial.]

## Addendum XXX.1 — Recovery / Provenance

[Where the item came from, who logged it, which lot/transfer. This is a natural home for an
`acquisition-lot` / `the-transfer` slot and for cross-mentions of shared concepts. If SCP-41B-XXX
shares a `concept` with [[SCP-41B-ZZZ]], mention that concept here so an edit in one file visibly
propagates here — this is the surface that makes propagation feel causal, not coincidental.]

## Addendum XXX.2 — Incident / Test Log

[A dated log. Clinical, procedural. Logs are excellent grounding surfaces: a test result described
here can corroborate a redaction in *another* file, giving the player the multi-source "a-ha"
(rule 6). Place a higher-tier anchor here if you want raising clearance to reveal something.]

## Addendum XXX.3 — Interview / Recovered Document Fragment

[An interview fragment (cast voices only — Vogel, Halloran, Marsh, Sze, Andrade; site_41b.md §3) or
a recovered in-world document. This is where the human texture and the cast seams live. Halloran's
marginalia, in particular, can read as a warning about the tool (scp_x_bible.md §6) — develop that
where it fits.]

## Addendum XXX.4 — Exploration / Cross-Reference Note

[For spatial/liminal entities, an exploration log. For any entity, a cross-reference note that
explicitly ties this file's concepts to its xref partners — the connective tissue that makes the
corpus feel like one site and gives the manual-unredaction player their evidence trail.]

<!--
  PARSER NOTES (do not render; do NOT put anchor tokens inside HTML comments —
  the parser strips comments before token extraction, but keep them token-free to be safe):
  - exactly one vault file may set entity_self: true (the Quippy self-file, SCP-41B-000)
  - every anchor id above appears EXACTLY ONCE as a token in the body
  - concept groups must have equal-length, index-aligned mutation sets across files
  - every [[SCP-41B-YYY]] in the body is declared in xrefs, and every xref is wikilinked
-->

---

## Longer files — how to scale a dossier ([R§3])

The re-frame wants files that are **places to spend time.** A "full" Site-41B dossier is a
multi-section Foundation page, not a three-sentence stub. Targets and discipline:

- **Sections.** Beyond Containment + Description, use multiple addenda: Recovery/Provenance,
  Incident/Test Logs, Interview/Recovered-Document fragments, Exploration logs, Cross-Reference
  notes. Five to eight sections is a healthy "full" dossier; the deepest Drift files can run longer.
- **Anchors per file.** A short stub had 1–2 anchors; a full dossier carries **3–6**, spread across
  sections so different clearance tiers reveal different parts (stagger `redaction_level`). Keep the
  one-token-per-anchor rule (rule 4): more anchors, each appearing exactly once.
- **Cross-reference density.** Full files cite more partners. Aim for the entity's primary seam
  plus 2–4 secondary cross-references, each a real `[[SCP-41B-YYY]]` + `xrefs` entry. Density is
  the propagation surface and the player's evidence trail — `entity_roster.md` tracks who carries what.
- **Multi-source grounding (the core ask, rule 6).** Each redaction should be inferable from
  *more than one* file. Concretely: when you write a slot here, write a corroborating mention of the
  same fact (in prose, around that concept) into at least one cross-referenced file. The player who
  has read both can deduce the slot in AMBER and feel the "a-ha"; the player who hasn't reaches for
  Quippy. This is what makes the honest tool *possible* and the easy tool *tempting* — it is the
  load-bearing authoring discipline of the whole re-frame.
- **Voice.** Series-I clinical throughout; cast voices (site_41b.md §3) in interview/marginalia
  surfaces only. AMBER's register is the file's *default* voice (clinical, procedural); Quippy never
  appears *in* a file (it's the overlay, not the content) — see scp_x_bible.md §2 for the contrast.
- **What NOT to do.** Don't pad. Length must be *content* — more grounding, more cross-references,
  more legible structure — not filler prose. A long file that doesn't deepen the deduction surface
  is just a slower stub. Every added section should give the manual-unredaction player something to
  triangulate from.

> **Scale note:** longer files mean the 15–30 entity budget may shift toward *fewer, richer* files.
> That trade is flagged for the human in `entity_roster.md`; author to the longer-file scale and let
> the budget re-confirmation follow.

---
---

# ══════════════════════════════════════════════════════════════
#  WORKED EXAMPLE  (original entity — reference only, not a template to copy)
#  NOTE: this is the short-form Sprint-1 example, preserved as-is. Its
#  `the-quiet-exchange` (a1) mutation ordering is LOCKED by the registry and by
#  the authored trio (SCP-41B-001/002/003). Under the re-frame, future entries
#  should be LONGER than this (see §"Longer files"); this stays as the minimal
#  correct reference, not the length target.
# ══════════════════════════════════════════════════════════════

```markdown
---
item: "SCP-41B-003"
object_class: "Euclid"
site: "Site-41B"
clearance: 2
entity_self: false
xrefs: ["SCP-41B-001"]
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

# Item #: SCP-41B-003

**Object Class:** Euclid

## Special Containment Procedures

SCP-41B-003 is to be stored unplugged within ⟦a1⟧ at Site-41B, in a room sharing no power feed with
documented memetic assets. Cross-reference monitoring with [[SCP-41B-001]] is maintained; the two
share recovery provenance. Operation of SCP-41B-003 by personnel below clearance 4 is prohibited.

## Description

SCP-41B-003 manifests as ⟦a1⟧ recovered from a decommissioned exchange building. When a connection is
initiated, SCP-41B-003 completes a call to no traceable line, after which ⟦a2⟧. The effect is
consistent across subjects and persists despite standard retention procedures.

## Addendum 003.1 — Recovery

SCP-41B-003 was recovered alongside materials later catalogued under [[SCP-41B-001]]; both exhibit the
"quiet exchange" provenance, and alterations to one record have historically correlated with
discrepancies in the other.
```

*Why this example is correct:* `a1`'s concept `the-quiet-exchange` is shared with SCP-41B-001, so
editing it propagates across both files. `a2`'s outcome is original — no canonical entity resolves
this way, so foreknowledge gives no advantage. The voice is Series-I clinical; the solution is not
canon. Mutation sets are bounded (3 and 3) and index-aligned for any shared-concept partner. Each
anchor token appears exactly once.

*What a re-frame-scale version would add:* more addenda (a test log grounding `a2`'s amnesia effect
against [[SCP-41B-001]]'s audit drift; an interview fragment in a cast voice), a third or fourth
anchor staggered to a higher tier, and corroborating mentions of `the-quiet-exchange` written into
SCP-41B-001 so the player can infer `a1` in AMBER without Quippy (rule 6). The short form is correct;
the long form is the target.
