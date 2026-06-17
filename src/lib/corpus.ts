// Corpus schema — the canonical data model.
// Authored in Obsidian frontmatter, parsed to these types by scripts/build-corpus.ts.
// Mirrors technical_document.md §2 exactly. The vault is the source of truth; these
// types are the contract the parser emits and the runtime engine consumes.

export type SlotType = 'object' | 'agent' | 'location' | 'outcome';

/**
 * How a redacted word is grounded — the v2 reset primitive (reset_amber_v2.md §1.3).
 * A slot is recoverable in AMBER because the corpus *grounds* its word, by depth:
 *
 *  - **teaching** (direct co-occurrence): the word appears PLAINLY, unredacted, in
 *    the body of another reachable file. The player follows the xref, sees the word,
 *    cites that file; AMBER commits. The bootstrap route — needs no prior solve and
 *    no clearance (clearance is cut, decision D). `citeIn` lists the file ids whose
 *    bodies hold the word in the clear (a build-time invariant checks they actually do).
 *  - **inference** (parallel-context): NO file states the word outright. The player
 *    assembles grounding across carriers until a visible grounding score clears
 *    `threshold` (decision A — the meter is transparent). The Truth mechanic; the
 *    surface Quippy later shortcuts.
 */
export type Grounding =
  | { kind: 'teaching'; citeIn: string[] }
  | { kind: 'inference'; threshold: number };

/** A redacted slot in a file's prose. One `⟦id⟧` token per anchor. */
export interface Anchor {
  /** unique within the file, e.g. "a1" */
  id: string;
  slot_type: SlotType;
  /**
   * The redacted word (or tight proper-noun phrase) the player must produce —
   * immutable, never shown until solved (reset_amber_v2.md §1.1). The v2 primitive:
   * "produce the exact word," not "pick which rewrite is true." Replaces the old
   * `mutations[]` MadLib candidate set.
   */
  truth: string;
  /** how this slot's word is grounded for AMBER's cited commit (see Grounding). */
  grounding: Grounding;
  /**
   * shared key; anchors with the same concept are co-carriers — they propagate
   * together AND can contribute to each other's inference grounding (registry =
   * the grounding graph). Omitted/"" = local-only (no co-carriers).
   */
  concept?: string;
  /** added to global exposure when a Quippy fill lands here (AMBER commits cost 0) */
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

/** How an unredaction was made: the honest AMBER route, or the costly Quippy one. */
export type Via = 'amber' | 'quippy';

/** A player-inserted or propagated value sitting over a slot. */
export interface OverlayEntry {
  /** "SCP-41B-XXX#a1" */
  anchor_ref: string;
  /** player-inserted or propagated value */
  value: string;
  source: 'inserted' | 'propagated';
  /**
   * HOW this unredaction was made (re-frame R§6.3). The no-Quippy ending reads
   * this across all solved slots: the true ending requires `'amber'` throughout.
   * Propagated entries inherit the originating edit's `via`, so a single Quippy
   * edit that ripples widely is accounted as Quippy reliance everywhere it lands.
   * Orthogonal to `source` — a slot can be inserted-via-amber, inserted-via-quippy,
   * or propagated (inheriting its cause's `via`). Optional for back-compat; the
   * engine threads it through insert() and defaults to 'amber' when omitted.
   */
  via?: Via;
  /** anchor_ref of the edit that propagated here (provenance) */
  caused_by?: string;
  /**
   * set true when this overlay value is known to diverge from the slot's truth
   * word. Clearance-reveal is cut (decision D), so the trigger is now a Quippy fill
   * of the wrong/ungrounded word (reset_amber_v2.md §1.5/§2.2) rather than a tier
   * audit. The four-state grammar's contradiction state survives; its cause changed.
   */
  contradicts_truth?: boolean;
}

// ── Corpus container ───────────────────────────────────────────────────

/** The generated artifact: every entity keyed by item id. Emitted to static/corpus.json. */
export type Corpus = Record<string, ScpFile>;
