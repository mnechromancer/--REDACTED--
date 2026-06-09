# Technical Development Document — ⟦REDACTED⟧

Architecture spec for the Svelte build. Aligns with `design_document.md` and `entry_template.md`. The Obsidian vault is the single source of truth; a parser converts entries into the runtime corpus.

---

## 1. Stack & rationale

- **Framework:** Svelte 5 (runes).
- **Build:** Vite.
- **Language:** TypeScript (the corpus schema and propagation engine benefit materially from static types; mistyped anchor keys are the most likely class of authoring bug).
- **Styling:** scoped component CSS + CSS custom properties for the four-state grammar tokens.
- **Persistence:** IndexedDB (via `idb`) for save state; localStorage for settings. This is a Vite-built repo, not a single-file artifact, so browser storage is available without restriction.
- **Deliverable:** a project repo, not a pasteable single file. This is what clears Svelte — it requires a compiler and cannot run uncompiled. The build's scope (corpus, propagation engine, breach states) already warranted a repo regardless.

Why Svelte over React here: the displayed state of every slot is a pure function of `(groundTruth, overlay, propagationFlags, corruptionState)`. Svelte's `$derived` expresses that function once and recomputes it with value-level dependency tracking when any input mutates — which is exactly "mutate one anchor, recompute every linked file." React would require manual `useMemo`/dependency management to stop the cross-reference graph from thrashing on every edit. Svelte's fine-grained reactivity is the native geometry for this propagation model.

## 2. Data model

The canonical schema. Authored in Obsidian frontmatter, parsed to these TypeScript types.

```ts
type SlotType = 'object' | 'agent' | 'location' | 'outcome';

interface Anchor {
  id: string;            // unique within the file, e.g. "a1"
  slot_type: SlotType;
  truth: string;         // immutable correct value (never shown until cleared)
  redaction_level: 1|2|3|4|5;  // clearance required to legitimately reveal
  concept?: string;      // shared key; anchors with the same concept propagate together
  mutations: string[];   // bounded, hand-authored MadLib candidate set
  exposure_weight: number;     // added to global exposure on insertion/mutation
}

interface ScpFile {
  item: string;          // "SCP-XXX"
  object_class: string;  // Safe | Euclid | Keter | ...
  site: string;
  clearance: 1|2|3|4|5;  // baseline tier to open the file at all
  anchors: Anchor[];
  xrefs: string[];       // explicit narrative cross-references (item ids)
  breach_effect: BreachEffect;
  entity_self: boolean;  // true only for the SCP-X self-file (endgame)
  body: string;          // prose with inline ⟦anchor_id⟧ tokens and [[wikilinks]]
}

type BreachEffect =
  | { kind: 'inject_xrefs' }
  | { kind: 'corrupt_search' }
  | { kind: 'lock_tier'; tier: number }
  | { kind: 'randomize_propagation'; fraction: number };
```

Runtime overlay state, separate from the immutable corpus:

```ts
interface OverlayEntry {
  anchor_ref: string;        // "SCP-XXX#a1"
  value: string;             // player-inserted or propagated value
  source: 'inserted' | 'propagated';
  caused_by?: string;        // anchor_ref of the edit that propagated here (provenance)
  contradicts_truth?: boolean; // set true once truth for this slot is revealed and differs
}
```

## 3. Reactive state architecture

A single rune-based store module, e.g. `game.svelte.ts`:

```ts
export const corpus = $state<Record<string, ScpFile>>({});   // immutable after load
export const overlay = $state<Record<string, OverlayEntry>>({}); // mutable, propagating
export const clearance = $state({ tier: 1 });
export const exposure = $state({ value: 0 });
export const revealedTruth = $state<Set<string>>(new Set()); // anchor_refs whose truth has leaked
export const breaches = $state<Set<string>>(new Set());      // breached item ids
```

The display function is derived, defined once:

```ts
export function displayedSlot(ref: string) {
  return $derived.by(() => {
    const o = overlay[ref];
    const truthShown = revealedTruth.has(ref);
    const anchor = anchorOf(ref);
    if (truthShown && o && o.value !== anchor.truth)
      return { text: anchor.truth, state: 'truth-contradiction', guess: o.value };
    if (truthShown) return { text: anchor.truth, state: 'revealed' };
    if (o?.source === 'propagated') return { text: o.value, state: 'propagated', caused_by: o.caused_by };
    if (o?.source === 'inserted')  return { text: o.value, state: 'inserted' };
    return { text: '█████', state: 'redacted' };
  });
}
```

Components read `displayedSlot(ref)` and re-render only when that slot's inputs change. No manual memoization.

## 4. Propagation engine

Pure function over the corpus + overlay. Triggered on insertion.

```
insert(anchor_ref, chosen_value):
  1. overlay[anchor_ref] = { value: chosen_value, source: 'inserted' }
  2. exposure.value += anchorOf(anchor_ref).exposure_weight
  3. concept = anchorOf(anchor_ref).concept
  4. if concept:
       for every anchor A across corpus where A.concept == concept and A.ref != anchor_ref:
         mutation = mapMutation(anchor_ref.value -> A.mutations)   // index-aligned or keyed
         overlay[A.ref] = { value: mutation, source: 'propagated', caused_by: anchor_ref }
         exposure.value += A.exposure_weight * PROPAGATION_FACTOR
  5. evaluateBreaches()
```

Design constraints:
- **Mutation mapping is index-aligned across an anchor group.** Anchors sharing a concept share a parallel mutation set ordering, so choosing candidate *k* in one yields candidate *k* in all linked anchors. This keeps propagation deterministic and authorable.
- **No free text** ever enters propagation. Typed difficulty maps free input to the nearest authored candidate before this function runs.
- **Idempotent re-evaluation.** Re-inserting recomputes from the immutable corpus + current overlay; no accumulated drift.
- **Provenance is mandatory** (`caused_by`) so the UI can answer "why did this change?" — the fix for propagation reading as noise.

## 5. Validation system (batched, anti-leak)

```
raiseClearance(toTier):
  clearance.tier = toTier
  batch = all anchor_refs where anchorOf(ref).redaction_level <= toTier
          and ref not already in revealedTruth
  for ref in batch: revealedTruth.add(ref)
  for ref in batch:
    if overlay[ref] and overlay[ref].value != anchorOf(ref).truth:
        overlay[ref].contradicts_truth = true   // surfaces as 'truth-contradiction'
```

Truth unlocks **in batches keyed to clearance tier**, never per-guess, implementing the rule-of-three anti-brute-force logic. The system confirms coherence/contradiction of *already-inserted* guesses; it never volunteers the truth value of an untouched slot. The signal is "you are wrong here," not "here is the answer."

## 6. Breach / stability system

```
evaluateBreaches():
  for each entity E with an exposure threshold T_E:
    if exposure.value >= T_E and E.id not in breaches:
        breaches.add(E.id)
        applyBreachEffect(E.breach_effect)
```

`applyBreachEffect` mutates terminal behavior, not a health bar:
- `inject_xrefs` — push false entries into the cross-reference index.
- `corrupt_search` — degrade the search component's ranking/return noise.
- `lock_tier` — temporarily revoke a clearance tier's file access.
- `randomize_propagation` — for a fraction of subsequent propagations, apply a wrong-index mutation.

Stabilization play (reducing exposure via reconstructing coherent reads) can clear a breach if exposure drops back below `T_E`, restoring normal terminal behavior. Recovery is a first-class state.

## 7. UI architecture

Component tree:
- `Desktop` — window manager, taskbar, clearance indicator, stability readout.
- `FileWindow` — renders one `ScpFile`; parses `body` tokens.
- `SlotSpan` — renders one anchor via `displayedSlot(ref)`; owns the four-state CSS; hosts the mouse-over.
- `HelpUtility` (SCP-X) — the mouse-over panel: slot type, cross-mentions, MadLib candidate buttons. Tone degrades as exposure rises.
- `SearchPane` — index over the corpus; subject to `corrupt_search` breach effects.
- `ClearancePanel` — progression UI; triggers `raiseClearance`.

Four-state CSS tokens (custom properties, themeable + reduced-glitch mode):
```css
:root {
  --slot-redacted: /* solid bar */;
  --slot-inserted: /* amber */;
  --slot-propagated: /* teal + glitch */;
  --slot-contradiction: /* red diff */;
}
```
`SlotSpan` switches token by `state`. Provenance (`caused_by`) renders on hover for `propagated`. Reduced-motion disables glitch animation, keeping color/strike-through distinctions intact.

## 8. Authoring pipeline (Obsidian → corpus)

The vault is authored using `entry_template.md`. A build-time parser (`scripts/build-corpus.ts`, run by Vite or as a pre-step) does:

```
for each *.md in vault/entries:
  1. parse YAML frontmatter -> ScpFile minus body
  2. take markdown body:
       - extract [[SCP-XXX]] wikilinks -> validate against xrefs
       - leave ⟦anchor_id⟧ tokens in place for runtime SlotSpan parsing
  3. validate:
       - every ⟦id⟧ in body has a matching anchor in frontmatter
       - every anchor.concept group has consistent mutation-set length
       - every xref resolves to an existing item
       - exactly one file has entity_self: true
  4. emit corpus.json
```

Validation failures are build errors. This makes the wiki authoritative: write entries as readable Foundation pages in Obsidian, and the corpus regenerates deterministically. Authors never touch JSON.

## 9. Repo layout

```
/src
  /lib
    game.svelte.ts        // runes store + displayedSlot
    propagation.ts        // insert(), mapMutation()
    validation.ts         // raiseClearance()
    breaches.ts           // evaluateBreaches(), applyBreachEffect()
    parseBody.ts          // ⟦token⟧ + [[wikilink]] runtime parsing
  /components
    Desktop.svelte  FileWindow.svelte  SlotSpan.svelte
    HelpUtility.svelte  SearchPane.svelte  ClearancePanel.svelte
  /styles  tokens.css
/vault
  /entries  SCP-XXX.md ...   // Obsidian vault, the source of truth
/scripts  build-corpus.ts
/static   corpus.json        // generated artifact
```

## 10. Build order (milestones)

1. **Schema + parser + 3 stub entries.** Prove Obsidian → corpus.json round-trips and validates.
2. **Static file viewer.** Render entries, redaction bars, clearance gating. No propagation yet.
3. **Insertion + overlay + `displayedSlot`.** Single-file guesses, two states (redacted/inserted).
4. **Propagation engine.** Concept-keyed cross-file mutation; add propagated state + provenance.
5. **Exposure + batched validation.** Clearance unlocks truth batches; add contradiction state. Four-state grammar complete.
6. **Breach system.** Thresholds, terminal-mutating effects, stabilization/recovery.
7. **Endgame.** `entity_self` file; ouroboros resolution; fork on overlay state.
8. **Dials + accessibility.** Autofill, set size, exposure decay, reduced-glitch.
9. **Content pass.** Scale from stubs to 15–30 densely interlinked entities.

Each milestone is playable in isolation, so the loop can be felt before content scales.
