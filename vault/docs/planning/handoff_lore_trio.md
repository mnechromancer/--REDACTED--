> **⚠ Completed under the prior design (historical).** This handoff authored the Sprint 1 trio (`SCP-41B-001/002/003`) **before** the 2026-06-13 re-frame (`reframe_amber_quippy.md`). It is kept as history — **do not rewrite it.** The trio's frontmatter contract, concept-key seams, and propagation wiring are mechanic-stable and survive the re-frame untouched. Two things changed *around* it: (1) the "help utility offers to fill the redactions" framing in §0 is superseded — that helper is now **Quippy**, refusable, separate from the honest AMBER tooling; and (2) the re-frame wants **longer, multi-section dossiers** ([R§3], `entry_template.md` §"Longer files"), so the trio's short three-section form **may want expansion** by a future lore-author (more addenda, more anchors, multi-source grounding of each redaction so it's solvable in AMBER). The trio is correct as authored; it is just *short* relative to the new scale.

# Handoff — Author the Sprint 1 Trio (L1–L3)

**To:** Fable (lore-authoring; strongest-model role per `agents.md` §5.4)
**Task:** Write the three game entries `SCP-41B-003`, `SCP-41B-001`, `SCP-41B-002` as `vault/entries/*.md` files.
**Then:** a separate verification pass (Sonnet) checks your output against the gates in §6 below.

This is the lore track of Sprint 1. The code engine is built and verified; it is waiting on these three entries to make propagation act on real content. **You are writing the content the whole slice was built to run.** Get the three propagation seams right and the slice is playable end to end.

---

## 0. The one-paragraph "what this game is"

The player is a low-clearance archivist on a decaying SCP Foundation site OS (Site-41B). Files are redacted by clearance tier. A deprecated "help utility" — actually an informational entity mid-restructuring — offers to fill the redactions. Filling one **rewrites the record and propagates the change to every cross-referenced file that shares that slot's concept**, and the growing gap between record and reality is what drives toward a breach. Core loop: *guess to see, but every guess corrupts.* You are writing clinical Foundation pages whose redacted slots are the guessing surface and whose shared concepts are the propagation wiring.

Full setting is `vault/docs/site_41b.md`; mechanics `design_document.md`; **the authoring contract is `entry_template.md` — read it in full before writing.** This handoff is the compressed, trio-specific brief.

---

## 1. Deliverable

Three files, authored by copying `vault/docs/entry_template.md` and filling it:

```
vault/entries/SCP-41B-003.md
vault/entries/SCP-41B-001.md
vault/entries/SCP-41B-002.md
```

Each file is YAML frontmatter (the machine-readable game data) + a Foundation-page body (clinical prose) with `⟦anchor_id⟧` tokens at each redacted slot and `[[SCP-41B-YYY]]` wikilinks at each cross-reference. The build parser (`scripts/build-corpus.ts`) reads both halves and enforces consistency — §6 is the exact gate list.

**SCP-41B-003 is the worked example** already drafted in `entry_template.md` (lines 98–152). Adapt it into the real file — you may refine the prose, but its `the-quiet-exchange` mutation set (`a1`) is effectively locked by the registry index, so **001 must align to 003**, not the reverse. Treat 003's `a1` mutations as the fixed reference ordering.

---

## 2. The three entities and their seams

From `entity_roster.md` (Act I, low-exposure — the player's first propagations, cheap):

| File | Class | Hook | Concept keys | Open tier | breach_effect |
|---|---|---|---|---|---|
| **SCP-41B-003** | Euclid | A switchboard with no external wiring that completes calls to no traceable line | `the-quiet-exchange`, `induced-nominal-amnesia` | 2 | `corrupt_search` |
| **SCP-41B-001** | Safe | A recovered intake whose description differs in a consistent direction each audit | `the-quiet-exchange`, `audit-cycle`, `acquisition-lot` | 1 | `corrupt_search` |
| **SCP-41B-002** | Safe | An accession number assigned to nothing that keeps accruing addenda | `acquisition-lot`, `audit-cycle` | 1 | `inject_xrefs` |

**The three propagation seams** (this is the point of the trio — each must be a real, index-aligned shared concept):

- `the-quiet-exchange` — **003 ↔ 001** (2 carriers)
- `acquisition-lot` — **001 ↔ 002** (2 carriers)
- `audit-cycle` — **001 ↔ 002** (2 carriers)

So **001 is the hub**: it shares one key with 003 and two with 002. `induced-nominal-amnesia` (003's `a2`) has no partner *in this trio* — its other carriers (004, 014) are out of sprint, so author it as a **local-only** slot here: give it `concept: "induced-nominal-amnesia"` is fine, but since no other trio file carries it, it simply won't propagate this sprint. (It will when 004 lands. Equal-length rule only bites between co-present carriers — a single carrier is always trivially "aligned.")

---

## 3. Mutation-set ordering — the load-bearing constraint

This is the part the verifier scrutinizes hardest. When two anchors share a `concept`, their `mutations` arrays must be **equal length and index-aligned**: index *k* in one means the same "reading" as index *k* in the other, because the engine propagates positionally (pick candidate *k* in 003 → engine writes candidate *k* into 001). The shared meaning of each index is **already fixed in `concept_key_registry.md`** — do not invent your own ordering; realize the registry's.

The three trio keys, with their canonical index meanings (from the registry — quote these as your spec):

**`the-quiet-exchange`** (003#a1 ↔ 001) — tier band 2–3
- 0 = communication device with no external wiring
- 1 = device completing connections with no traceable line
- 2 = device completing connections to the party who cannot be reached

**`acquisition-lot`** (001 ↔ 002) — tier band 1–2 surface / 5 true
- 0 = the 1962 lot as an administrative intake event
- 1 = as an anomalous import from an external record set
- 2 = as the first successful re-indexing by the Concordance-entity

**`audit-cycle`** (001 ↔ 002) — tier band 1–2 (low-stakes teaching key)
- 0 = regular annual audit finds no discrepancy
- 1 = audit finds consistent directional drift in description
- 2 = audit log itself exhibits drift between filing copies

Each shared mutation set should have **3 candidates** (indices 0/1/2), matching these meanings, written as in-world noun/clause phrases (see 003's example phrasing). Keep them bounded (3–5; use 3 here). The *prose* of each candidate is yours to write in Series-I voice; the *meaning at each index* is the registry's.

> The registry tables for these keys (and the full set) are in `vault/docs/concept_key_registry.md` §1–§2 — read the **Notes** rows: `audit-cycle` index 2 deliberately plants a cosmology seed; `acquisition-lot` has a clearance-dependent double meaning. You don't need to resolve those here, but your candidate phrasings shouldn't contradict them.

---

## 4. The licensing line — non-negotiable, and the easiest way to fail review

**Flavor may resemble canon as much as you like; ground-truth resolutions must be original.** The clinical voice, addendum/incident-log structure, containment cadence — echo Series-I SCP as heavily as you want. But every `truth:` field (the immutable correct answer hidden behind each redaction) must be **original** — nothing a Foundation-familiar reader could guess by recognizing a canonical entity, and nothing verbatim from any existing SCP. 003 and 001 were *loosely* numbered after real entries (921, 917) — do **not** reproduce those entities' solutions; the resemblance stops at flavor. Nothing shippable may carry CC-BY-SA obligations.

Concretely: the `truth` value at each anchor is a real answer the player is meant to deduce. Make it specific, in-world, and not a canon solution. The `mutations` are the bounded wrong-or-right guesses; the `truth` should be one of them **only if you want the player able to guess correctly** — and per the worked example, the truth IS mutation index 0 for `the-quiet-exchange` (003's `a1` truth = "a brass switchboard with no external wiring" = candidate 0). Follow that pattern unless you have a reason: truth is among the candidates, usually but not necessarily at a fixed index.

---

## 5. Per-file authoring notes

**SCP-41B-003** — adapt the worked example (`entry_template.md` lines 98–152). `a1` = the switchboard (`the-quiet-exchange`, redaction_level 3, the locked reference ordering). `a2` = the call's effect (`induced-nominal-amnesia`, redaction_level 4, local-only this sprint). `xrefs: ["SCP-41B-001"]`, body wikilinks `[[SCP-41B-001]]`. breach `corrupt_search`. Keep the Recovery addendum that names the shared "quiet exchange" provenance with 001 — that addendum is the surface where the propagation reads as causal.

**SCP-41B-001** — the hub. Carries three keys across (at least) three anchors:
- one anchor `the-quiet-exchange` (index-aligned to 003#a1 — **3 candidates, same index meanings**),
- one anchor `acquisition-lot` (aligned to 002),
- one anchor `audit-cycle` (aligned to 002).
Hook: an intake whose description drifts in a consistent direction each audit — so the `audit-cycle` slot is the natural anchor for that drift, and the prose should make the audit-drift legible. `xrefs: ["SCP-41B-003", "SCP-41B-002"]`; body must wikilink **both** (the wikilink-declared gate, §6). Open tier 1, breach `corrupt_search`. Cast: none required, but an Andrade-voice note resonates (see registry `the-quiet-exchange` notes) — optional.

**SCP-41B-002** — Safe; an accession number assigned to nothing that keeps accruing addenda. Carries `acquisition-lot` and `audit-cycle`, both aligned to 001. `xrefs: ["SCP-41B-001"]`, wikilink `[[SCP-41B-001]]`. Open tier 1, breach `inject_xrefs`. Cast: Andrade is the listed figure — an Andrade addendum fits the "addenda accruing on an empty accession" hook.

**Redaction levels:** keep them within the open tier's reach for at least one slot per file so the slice is playable at low clearance, but stagger a couple higher (3–4) so raising clearance has something to reveal — that's how CV exercised the truth-contradiction state. 003's `a2` at level 4 is the example.

---

## 6. The gates your output must pass (the verifier runs these)

The build pipeline (`scripts/build-corpus.ts` → `parse-entry.ts` + `validate-corpus.ts`) will mechanically reject malformed entries. Every rule below is enforced in code — passing them is the floor, not the bar; the bar is §3/§4 (correct index meanings, original solutions, good prose).

**Per-file (parse-entry.ts):**
- Frontmatter present and well-formed; `item`, `object_class`, `site`, `clearance` (int 1–5), `entity_self` (bool), `breach_effect` (valid kind), `anchors[]`, `xrefs[]` all present and typed.
- Every anchor has `id`, valid `slot_type` (object|agent|location|outcome), `truth` (string), `redaction_level` (1–5), non-empty `mutations` (array of strings), numeric `exposure_weight`. `concept` optional (`""` = local).
- Anchor ids unique within the file.
- **Every `⟦id⟧` token in the body resolves to a declared anchor** (and conversely, place a token for every anchor you want rendered).

**Cross-file (validate-corpus.ts):**
- **`concept-alignment`** — anchors sharing a concept have **equal-length** mutation sets. (This is §3 made mechanical. It only fires between co-present carriers, so the three seams are what's checked here.)
- **`xref-resolves`** — every `xref` points to an existing trio file; no self-reference.
- **`wikilink-declared`** — every `[[SCP-41B-YYY]]` in a body is declared in that file's `xrefs`. (So 001's body must wikilink both 003 and 002, and both must be in its `xrefs`.)

**⚠️ One expected "failure" — do not try to fix it:**
- **`entity-self` will fail.** Exactly one corpus file must set `entity_self: true`, and that's the SCP-X self-file `SCP-41B-000`, which is **out of scope this sprint**. So a `npm run build:corpus` over just these three will report `[entity-self] no file sets entity_self: true`. **That is correct and expected** — all three trio files set `entity_self: false`. The verifier confirms *every other* gate passes and that entity-self is the *only* remaining error. Do not invent a self-file to silence it.

**To self-check before handing off:** `npm run build:corpus` and read the error list — it should contain **only** the single `entity-self` line. If concept-alignment, xref, wikilink, or any parse error appears, that's a real defect to fix. (`npm run check` and `npm run test` cover the code, not your entries; the corpus build is your gate.)

---

## 7. Definition of done (lore track)

1. Three files exist at `vault/entries/SCP-41B-00{1,2,3}.md`, each copied from and conforming to `entry_template.md`.
2. `npm run build:corpus` yields **only** the expected `entity-self` error — every per-file and cross-file rule otherwise passes.
3. The three seams are real and index-aligned per §3: `the-quiet-exchange` (003↔001), `acquisition-lot` (001↔002), `audit-cycle` (001↔002), each 3 candidates with the registry's index meanings.
4. Every `truth:` is original (§4) — no canon solution, nothing verbatim.
5. Voice is Series-I clinical; redaction-bearing prose gives a careful reader enough to infer each slot without making it trivial.
6. `concept_key_registry.md` §1–§2 Carriers columns updated if needed (003/001/002 are already listed as planned carriers; mark them authored per the §5 checklist).

When done, the next pass is **LV** (lore↔code convergence): load the trio in `npm run dev` and confirm each shared key propagates across its file pair in the running app — that's the Sonnet verifier's job, against §6/§7 here plus playing the loop.

---

## 8. Quick reference — where the detail lives

- **Authoring contract + worked example:** `vault/docs/entry_template.md` (read fully)
- **Concept-key index meanings (your mutation-ordering spec):** `vault/docs/concept_key_registry.md` §1 (`acquisition-lot`, `audit-cycle`), §2 (`the-quiet-exchange`, `induced-nominal-amnesia`)
- **The trio's roster row + rationale:** `vault/docs/entity_roster.md` (Act I table; "first playable trio" section)
- **Setting/canon/cast (Andrade, the quiet exchange):** `vault/docs/site_41b.md`
- **Mechanics (why propagation/overlay/clearance work as they do):** `vault/docs/design_document.md`
- **The gates, in code:** `scripts/lib/parse-entry.ts`, `scripts/lib/validate-corpus.ts`
- **The sprint this completes:** `vault/docs/planning/sprint_01_vertical_slice.md` (lore stories L1–L3, LV)
