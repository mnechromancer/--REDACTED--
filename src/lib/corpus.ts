// ⚠ RE-FRAME (vault/docs/planning/reframe_amber_quippy.md §6.3): add optional
//   `via?: 'amber' | 'quippy'` to OverlayEntry to track HOW each unredaction was
//   made (the no-Quippy win, R§2). entity_self framing changes (self-file = Quippy).
//   See planning/handoff_janitor.md → "corpus.ts".
//
// Corpus schema — the canonical data model.
// Authored in Obsidian frontmatter, parsed to these types by scripts/build-corpus.ts.
// Mirrors technical_document.md §2 exactly. The vault is the source of truth; these
// types are the contract the parser emits and the runtime engine consumes.

export type SlotType = 'object' | 'agent' | 'location' | 'outcome';

/** A redacted slot in a file's prose. One `⟦id⟧` token per anchor. */
export interface Anchor {
  /** unique within the file, e.g. "a1" */
  id: string;
  slot_type: SlotType;
  /** immutable correct value; never shown until clearance >= redaction_level */
  truth: string;
  /** clearance required to legitimately reveal */
  redaction_level: 1 | 2 | 3 | 4 | 5;
  /** shared key; anchors with the same concept propagate together (omitted/"" = local only) */
  concept?: string;
  /** bounded, hand-authored MadLib candidate set (keep small: 3–5) */
  mutations: string[];
  /** added to global exposure on insertion/mutation */
  exposure_weight: number;
}

/** What happens to the terminal when an entity breaches (exposure crosses its threshold). */
export type BreachEffect =
  | { kind: 'inject_xrefs' }
  | { kind: 'corrupt_search' }
  | { kind: 'lock_tier'; tier: number }
  | { kind: 'randomize_propagation'; fraction: number };

/** One game entity, parsed from one `vault/entries/*.md` file. */
export interface ScpFile {
  /** "SCP-41B-XXX" (site-local; see entity_roster.md) */
  item: string;
  /** Safe | Euclid | Keter | ... */
  object_class: string;
  site: string;
  /** baseline tier to open the file at all */
  clearance: 1 | 2 | 3 | 4 | 5;
  anchors: Anchor[];
  /** explicit narrative cross-references (item ids) */
  xrefs: string[];
  breach_effect: BreachEffect;
  /** true only for the SCP-X self-file (endgame); exactly one file in the corpus */
  entity_self: boolean;
  /** prose with inline ⟦anchor_id⟧ tokens and [[wikilinks]] */
  body: string;
}

// ── Runtime overlay state ──────────────────────────────────────────────
// Separate from the immutable corpus. The player edits this; truth never moves.

/** A player-inserted or propagated value sitting over a slot. */
export interface OverlayEntry {
  /** "SCP-41B-XXX#a1" */
  anchor_ref: string;
  /** player-inserted or propagated value */
  value: string;
  source: 'inserted' | 'propagated';
  /** anchor_ref of the edit that propagated here (provenance) */
  caused_by?: string;
  /** set true once truth for this slot is revealed and differs */
  contradicts_truth?: boolean;
}

// ── Corpus container ───────────────────────────────────────────────────

/** The generated artifact: every entity keyed by item id. Emitted to static/corpus.json. */
export type Corpus = Record<string, ScpFile>;
