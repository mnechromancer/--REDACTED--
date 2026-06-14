> **Re-frame note (2026-06-13):** Updated to the AMBER/Quippy split per `planning/reframe_amber_quippy.md`. **§7 (UI)** was rewritten: the "Desktop window manager" becomes an **AMBER CLI** (`AmberTerminal`) with a distinct, refusable **Quippy GUI overlay** (`QuippyPanel`); component names are coordinated with the code track (`planning/handoff_janitor.md`). **§2** gains the `via?: 'amber' | 'quippy'` provenance field on `OverlayEntry` (the shared schema term; [R§6.3], adopted). **§10** build order is reordered (endgame = no-Quippy completion; the "help utility" milestone splits into AMBER tooling + Quippy). The **pipeline (§4, §8) survives unchanged.** Two items are flagged **PENDING** inline: the concrete AMBER manual-unredaction interaction ([R§6.2]) and the prototype's CLI scope ([R§6.6]) — both human decisions that gate the build.

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
  item: string;          // "SCP-41B-XXX" (site-local; see entity_roster.md)
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
  anchor_ref: string;        // "SCP-41B-XXX#a1"
  value: string;             // player-inserted or propagated value
  source: 'inserted' | 'propagated';
  via?: 'amber' | 'quippy';  // HOW this unredaction was made (re-frame [R§6.3]).
                             //   The no-Quippy ending reads this across all solved slots.
                             //   Propagated entries inherit the originating edit's `via`.
                             //   Optional for back-compat; the engine threads it through insert().
  caused_by?: string;        // anchor_ref of the edit that propagated here (provenance)
  contradicts_truth?: boolean; // set true once truth for this slot is revealed and differs
}
```

**On `via` (provenance):** this is the one net-new field the re-frame introduces (`corpus.ts` `OverlayEntry`; shared vocabulary with the code track — keep the name `via` and the literals `'amber' | 'quippy'` identical across spec and code). It records the *route* of each unredaction, not a resource the player spends — so it honors invariant 1 (inference is the spend; provenance is passive). The endgame (§6 design doc; `scp_x_bible.md` §5) reads `via` across every solved slot: the true ending requires `via === 'amber'` throughout. `source` ('inserted' | 'propagated') and `via` ('amber' | 'quippy') are **orthogonal**: a slot can be player-inserted-via-AMBER, player-inserted-via-Quippy, or propagated (inheriting its cause's `via`). Do not conflate the two axes.

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
insert(anchor_ref, chosen_value, via):          // via: 'amber' | 'quippy'  (re-frame [R§6.3])
  1. overlay[anchor_ref] = { value: chosen_value, source: 'inserted', via }
  2. if via == 'quippy':                         // exposure driver re-aimed [R§6.4]
       exposure.value += anchorOf(anchor_ref).exposure_weight
     // AMBER manual unredaction costs little/none — confirm exact model at [R§6.4]
  3. concept = anchorOf(anchor_ref).concept
  4. if concept:
       for every anchor A across corpus where A.concept == concept and A.ref != anchor_ref:
         if overlay[A.ref]?.source == 'inserted': continue   // never clobber a player-owned insert
         mutation = mapMutation(anchor_ref.value -> A.mutations)   // index-aligned or keyed
         overlay[A.ref] = { value: mutation, source: 'propagated', caused_by: anchor_ref, via }
         if via == 'quippy': exposure.value += A.exposure_weight * PROPAGATION_FACTOR
  5. evaluateBreaches()
```

Design constraints:
- **Mutation mapping is index-aligned across an anchor group.** Anchors sharing a concept share a parallel mutation set ordering, so choosing candidate *k* in one yields candidate *k* in all linked anchors. This keeps propagation deterministic and authorable.
- **No free text** ever enters propagation. Typed difficulty maps free input to the nearest authored candidate before this function runs.
- **Propagation is tool-agnostic.** The *mechanism* is identical for AMBER and Quippy edits; they differ only in exposure cost and the `via` tag. Propagated entries **inherit the originating edit's `via`**, so a single Quippy edit that ripples widely is accounted as Quippy reliance for the endgame (§6 design doc).
- **Carrier-clobber guard.** A propagation never overwrites a slot the player has independently *inserted* (step 4's `continue`) — that slot is its own source of truth. (This is the fix already landed in the engine; preserved here so the spec matches the code.)
- **Idempotent re-evaluation.** Re-inserting recomputes from the immutable corpus + current overlay; no accumulated drift.
- **Provenance is mandatory** — both `caused_by` (which edit caused this) and `via` (which tool made it). `caused_by` answers "why did this change?"; `via` feeds the no-Quippy ending. The two are independent (§2).

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

## 7. UI architecture — AMBER CLI + Quippy overlay  *(rewritten for the re-frame)*

The single windowed desktop is **replaced** by two interface modes the player switches between ([R§1]): **AMBER**, a clinical command-line terminal (the honest, hard tool), and **Quippy**, a refusable GUI overlay (the SCP-X entity, the easy/costly tool). The switch between them is a felt, meaningful act ([R§3]; design doc §5a, the aesthetic clash) — it is content, not chrome.

### 7.1 Mode model
A top-level mode the composition reads:
```ts
type InterfaceMode = 'amber' | 'quippy';
export const ui = $state<{ mode: InterfaceMode }>({ mode: 'amber' });
// AMBER is the default and the resting state. Quippy is summoned and dismissed;
// the player can complete the entire game without ever entering 'quippy' (the win).
```
AMBER is always available and is where the player resides by default. Quippy is *opt-in* — summoned over AMBER and dismissable back to it. This is the structural expression of "Quippy is refusable": the mode the player never has to enter is the entity.

### 7.2 Component tree
Names coordinated with the code track (`planning/handoff_janitor.md`) — the prior single `HelpUtility.svelte` splits along the seam the janitor flagged: the **evidence/clue surface** (`conceptClues`) belongs to **AMBER**; the **easy one-click fill + the entity's voice** belongs to **Quippy**.

- **`App.svelte`** — top-level composition; hosts both modes and the `mode` switch; the status/exposure readout; the end-state surface (reads the no-Quippy condition, §6).
- **`AmberTerminal.svelte`** — the CLI shell. Monochrome, keyboard-driven. Owns file traversal, redacted-span jumping, command/keybinding input, and the terminal log. **PENDING [R§6.6]:** how much keyboard-driven traversal ships in the prototype vs. a restyled version of the current interaction — human decision; build this incrementally behind the mode flag.
- **`FileWindow.svelte`** → **`FilePane.svelte`** (rename optional; survives) — renders one `ScpFile`, parses `body` tokens. Restyle from GUI-windowed (rounded panels, gradients, classification banners) to **monochrome-terminal idiom.** Must scale to **long, multi-section dossiers** ([R§3]) — verify `bodyBlocks`/`parseBody` handle many sections without layout break.
- **`SlotSpan.svelte`** — renders one anchor via `displayedSlot(ref)`; owns the four-state CSS, re-rendered in CLI idiom. The `via` provenance may add a **fifth visual distinction** (AMBER-solved vs Quippy-solved; §7.4). CLI traversal needs explicit keybound span-jumping (the current hover/focus model is GUI-shaped; flagged net-new).
- **`AmberLookup.svelte`** *(net-new; the honest half of the old `HelpUtility`)* — AMBER's manual-unredaction tooling surface: cross-reference lookup (`conceptClues`, promoted out of the hover panel), concordance-by-hand, citation tracing. **PENDING [R§6.2]:** the concrete interaction (how the player assembles and commits the case for a value) is unspecced and gates this component. Build the evidence-display first (it's safe and useful regardless); gate the commit-verb on the design answer.
- **`QuippyPanel.svelte`** *(net-new; the costly half of the old `HelpUtility`)* — the Quippy GUI overlay: candidate suggestions, one-click fill, the entity's degrading voice (`scp_x_bible.md` §4 bands). Summoning it sets `ui.mode = 'quippy'`; every fill it commits is tagged `via: 'quippy'` and raises exposure. Renders the paperclip-diamondback presence when Quippy speaks directly.
- **`SearchPane.svelte`** — corpus index; subject to `corrupt_search` breach effects. Restyle to terminal idiom (a CLI query, not a search box).
- **`RippleLog.svelte`** — propagation log; under CLI aesthetic, a terminal log pane. Should log **provenance** (was this ripple AMBER- or Quippy-caused) once `via` lands.
- **`ClearancePanel.svelte`** — progression UI; triggers `raiseClearance`. Terminal idiom.

### 7.3 The mode switch as content
Moving from Quippy's bright overlay back into AMBER's cold terminal should *feel* like turning off a charming voice to do hard work yourself (design doc §5a). Implementation notes:
- The switch is instantaneous and always available — the player is never *trapped* in Quippy; refusal must always be one keystroke away, or the "refusable" thesis breaks.
- AMBER never adopts Quippy's register and vice versa; the two CSS/voice systems are deliberately disjoint. Do not share styling tokens between them except the four-state slot grammar (which both render, in their own idiom).
- Quippy's overlay visibly *sits on top of* AMBER (it is a wrapper, diegetically and visually) — AMBER should remain partly visible behind it, reinforcing that Quippy is a costume over the real tool.

### 7.4 Four-state grammar in CLI idiom (+ provenance distinction)
Four-state CSS tokens (custom properties, themeable + reduced-glitch mode), now monochrome-terminal rather than windowed-GUI:
```css
:root {
  --slot-redacted:      /* solid block, █████ */;
  --slot-inserted:      /* amber — player guess */;
  --slot-propagated:    /* terminal-corruption styling + provenance on hover */;
  --slot-contradiction: /* diff: revealed truth vs amber guess */;
  /* possible fifth distinction (re-frame): AMBER-solved vs Quippy-solved, via `via` */
  --slot-via-amber:     /* e.g. clean amber */;
  --slot-via-quippy:    /* e.g. amber with the entity's tell */;
}
```
`SlotSpan` switches token by `state`; provenance (`caused_by`) renders on hover for `propagated`. The **fifth distinction** lets the player *see their Quippy-reliance accumulate* per file — a glance shows how much of a dossier they earned in AMBER vs. let Quippy fill (design doc §5.9). Whether this is a distinct state or a modifier on the inserted/propagated states is an info-design call. Reduced-motion disables corruption animation, keeping color/strike-through distinctions intact.

## 8. Authoring pipeline (Obsidian → corpus)

The vault is authored using `entry_template.md`. A build-time parser (`scripts/build-corpus.ts`, run by Vite or as a pre-step) does:

```
for each *.md in vault/entries:
  1. parse YAML frontmatter -> ScpFile minus body
  2. take markdown body:
       - extract [[SCP-41B-XXX]] wikilinks -> validate against xrefs
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
    game.svelte.ts        // runes store + displayedSlot; insert(value, via); provenance
    propagation.ts        // insert(), mapMutation()  (propagation is tool-agnostic)
    validation.ts         // raiseClearance()
    breaches.ts           // evaluateBreaches(), applyBreachEffect()
    parseBody.ts          // ⟦token⟧ + [[wikilink]] runtime parsing
  /components
    App.svelte  AmberTerminal.svelte  FilePane.svelte  SlotSpan.svelte
    AmberLookup.svelte    // honest manual-unredaction tooling (was half of HelpUtility)
    QuippyPanel.svelte    // refusable GUI overlay = SCP-X (was the other half)
    RippleLog.svelte  SearchPane.svelte  ClearancePanel.svelte
  /styles  tokens.css     // four-state grammar + AMBER/Quippy disjoint registers
/vault
  /entries  SCP-41B-###.md ...   // Obsidian vault, the source of truth
/scripts  build-corpus.ts
/static   corpus.json        // generated artifact
```

*(Re-frame: `Desktop.svelte` → `AmberTerminal.svelte`; `HelpUtility.svelte` splits into `AmberLookup.svelte` (honest) + `QuippyPanel.svelte` (entity). `FileWindow` → `FilePane` is an optional rename to match the CLI idiom. The current tree still uses the old names with re-frame flag markers; the code track does the actual split post-§6. Pipeline files under `/scripts` are unchanged.)*

## 10. Build order (milestones) — *reordered for the re-frame*

Milestones 1–6 are **mechanic-stable** (the propagation/overlay/clearance/breach core survives the re-frame; much is already built — see the planning docs). Milestones M5+ are **reordered**: the old single "HelpUtility" milestone splits into **AMBER tooling** and **Quippy**, and the endgame becomes **no-Quippy completion.** The two PENDING design questions ([R§6.2] AMBER tooling, [R§6.4] exposure model) **gate M5b/M6**; do not build them before the human answers.

1. **Schema + parser + 3 stub entries.** Obsidian → corpus.json round-trips and validates. *(done)*
2. **Static file viewer.** Render entries, redaction bars, clearance gating. *(done)*
3. **Insertion + overlay + `displayedSlot`.** Single-file guesses; redacted/inserted states. *(done)*
4. **Propagation engine.** Concept-keyed cross-file mutation; propagated state + provenance (`caused_by`). *(done)*
5. **Exposure + batched validation.** Clearance unlocks truth batches; contradiction state; four-state grammar. *(done)*
   - **5a. Provenance prep (safe now).** Add `via?: 'amber' | 'quippy'` to `OverlayEntry`; thread an optional `via` through `insert()`, default-preserving. Don't branch on it yet. *(code-track prep; janitor handoff)*
6. **Breach system.** Thresholds, terminal-mutating effects, stabilization/recovery. *(done; survives — breaches are now "all non-true endings")*
7. **CLI restyle + mode scaffold.** Restyle `FilePane`/`SlotSpan`/`RippleLog`/`SearchPane` to monochrome-terminal idiom; introduce the `InterfaceMode` switch and `AmberTerminal` shell. Keyboard traversal of files and redacted spans. **Scope gated by [R§6.6].**
8. **AMBER manual unredaction (`AmberLookup`).** Promote `conceptClues` into AMBER's evidence tooling; build the manual commit-the-case verb. **GATED on [R§6.2]** — do not build the interaction before it's specced; the evidence-display half is safe to build first.
9. **Quippy (`QuippyPanel`).** The refusable GUI overlay: candidate suggestions, one-click fill tagged `via: 'quippy'`, the degrading-tone bands, the paperclip-diamondback presence. Quippy-assisted insertions drive exposure. **Exposure model gated on [R§6.4].**
10. **The no-Quippy endgame.** Read `via` across all solved slots; the true ending = full restoration with zero Quippy assists; every other outcome is a breach ending. **Replaces** the old `entity_self`/ouroboros-decipher milestone. Enforcement gate (hard/tolerance/spectrum) per `scp_x_bible.md` §5.3.
11. **Dials + accessibility.** Quippy-temptation/AMBER-difficulty dial (the new central one), autofill, set size, exposure decay, reduced-glitch, provenance-visibility toggle.
12. **Content pass.** Scale to the full corpus as **longer, multi-section dossiers** ([R§3]); fold in the area arc and (later) the redactor thread.

Each milestone is playable in isolation, so the loop can be felt before content scales. *(The retired old M7 "ouroboros resolution; fork on overlay state" is superseded by M10; the `entity_self` file `SCP-41B-000` is still authored, but as the entity you starve, not the puzzle you decipher — `scp_x_bible.md` §5.4.)*
