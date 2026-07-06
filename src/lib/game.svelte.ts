// Win/loss model (re-frame R§2, built & shipped — reframe_amber_quippy.md §6/§7):
//   the win is "unredact the whole corpus WITHOUT Quippy." endState() reads that
//   from per-overlay `via: amber|quippy` provenance — any Quippy assist or surviving
//   contradiction forecloses the true ending (scp_x_bible.md §5). The self-file is
//   EXCLUDED from the restoration target (§5.4). BREACH_THRESHOLD (the exposure line
//   a breach crosses) and STRUCK_PENALTY (contradiction exposure weight) are the
//   LIVE exposure model — only Quippy spends; AMBER commits cost zero (R§6.4).
//   (The old single-interface win symbols `sessionResult` / `CONTAINMENT_TARGET`
//   were removed when the mechanic landed; do not reintroduce a thread_coherence-style
//   win checker — the win reads provenance, not key coherence.)
//
// The single rune-based game store: immutable corpus + mutable, propagating
// overlay, with the one display function derived over both. Mirrors
// technical_document.md §3. The keystone invariant (design_document.md §3):
// inference is the only spend — exposure rises on insertion, and there is no
// separate stability resource. Truth never moves; the player edits only `overlay`.

import type { Corpus, OverlayEntry, Anchor, Via, ForgedCitation } from './corpus.ts';

// ── State ──────────────────────────────────────────────────────────────
// `corpus` is immutable after load; everything else is the mutable board state.

import { SvelteSet } from 'svelte/reactivity';
import { session } from './session.svelte.ts';

export const corpus = $state<Corpus>({});            // immutable after load
export const overlay = $state<Record<string, OverlayEntry>>({}); // mutable, propagating
export const exposure = $state({ value: 0 });
// SvelteSet (not a plain Set in $state): mutation via .add()/.has() must be
// reactive, so derivations and effects that read these recompute when a breach
// fires. A plain Set in $state only reacts to whole reassignment.
export const breaches = new SvelteSet<string>();      // breached item ids

// PERMANENT Quippy taint (user decision 2026-06-17): any slot EVER filled or rippled
// via Quippy is recorded here and never cleared — no redemption. The no-Quippy true
// ending requires this set be empty (you cannot launder Quippy's help into a clean
// record by AMBER-re-citing a word Quippy taught you; the help already happened). This
// supersedes the old watch-item-1 redemption, where an AMBER re-solve cleared taint.
export const quippyTouched = new SvelteSet<string>(); // anchor_refs ever touched by Quippy

// ── Reachability (v3 frame — the day is the gate) ──────────────────────────
// The v2 seed-plus-xref-closure gate is RETIRED (Phase 1, decision v3-A/§4.4): the
// tray is open. A file is reachable iff it is on the SHELF (collection 'local' —
// always here) or MOUNTED (an inbound file whose `day` has arrived). Within a day's
// mount everything is openable; the xref graph is navigation and grounding-
// discovery, not the opening gate — and a reference to a not-yet-mounted file is a
// dead letter until its 4 AM (the tease is deliberate). The traffic jam lives in
// what you can GROUND, not what you can open; pacing lives in days.

/** A file's collection, defaulted: absent ⇒ 'inbound' (the v2 corpus/back-compat). */
export function collectionOf(file: { collection?: 'local' | 'inbound' }): 'local' | 'inbound' {
  return file.collection ?? 'inbound';
}

/**
 * The 4 AM mount that delivers a file: local ⇒ 0 (always here, before any batch);
 * inbound ⇒ its `day`, defaulting to 1 (the v2 corpus is all day-1 inbound).
 */
export function dayOf(file: { collection?: 'local' | 'inbound'; day?: number }): number {
  return collectionOf(file) === 'local' ? 0 : (file.day ?? 1);
}

/** True if `item` is reachable now: on the shelf, or mounted by the current day. */
export function isReachable(item: string): boolean {
  const file = corpus[item];
  if (!file) return false;
  return dayOf(file) <= session.day;
}

/** The set of reachable file ids under the current day. */
export function reachableFiles(): Set<string> {
  const reached = new Set<string>();
  for (const file of Object.values(corpus)) {
    if (dayOf(file) <= session.day) reached.add(file.item);
  }
  return reached;
}

/** Replace the corpus in place (the store is a module singleton). Call once at load. */
export function loadCorpus(data: Corpus): void {
  for (const key of Object.keys(corpus)) delete corpus[key];
  Object.assign(corpus, data);
  quippyTouched.clear(); // a fresh corpus is a fresh run — no inherited taint
}

// ── Ref helpers ────────────────────────────────────────────────────────
// An anchor_ref is "SCP-41B-XXX#a1": item id and anchor id joined by '#'.

export function makeRef(item: string, anchorId: string): string {
  return `${item}#${anchorId}`;
}

export function splitRef(ref: string): { item: string; anchorId: string } {
  const hash = ref.indexOf('#');
  return { item: ref.slice(0, hash), anchorId: ref.slice(hash + 1) };
}

/** Resolve a ref to its immutable anchor. Throws on a malformed/dangling ref. */
export function anchorOf(ref: string): Anchor {
  const { item, anchorId } = splitRef(ref);
  const file = corpus[item];
  if (!file) throw new Error(`anchorOf: no file "${item}" for ref "${ref}"`);
  const anchor = file.anchors.find((a) => a.id === anchorId);
  if (!anchor) throw new Error(`anchorOf: no anchor "${anchorId}" in "${item}"`);
  return anchor;
}

// ── Concept cross-mentions (the grounding graph) ───────────────────────
// Every OTHER anchor across the corpus sharing a given anchor's concept key —
// the co-carriers. Under the v2 reset these are the inference-grounding contributors
// and the propagation targets. Restricted to REACHABLE files: an unreachable carrier
// is not yet evidence (you haven't followed the link to read it). An anchor with no
// concept (local-only) has no co-carriers.

export function crossMentions(ref: string): string[] {
  const anchor = anchorOf(ref);
  if (!anchor.concept) return [];
  const reached = reachableFiles();
  const out: string[] = [];
  for (const file of Object.values(corpus)) {
    if (!reached.has(file.item)) continue; // unreachable carrier is not yet evidence
    for (const a of file.anchors) {
      const other = makeRef(file.item, a.id);
      if (other !== ref && a.concept === anchor.concept) out.push(other);
    }
  }
  return out;
}

// ── Grounding by span (the forged-citation surface — Phase 3) ──────────
// Under the forged-citation verb (design_note_forged_citations.md) AMBER no longer
// SURFACES where a word lives — the player FINDS it by reading, selects the span, and
// stakes the citation. So there is no clue-enumeration function anymore (the old
// `groundingClues` was the hand-holding this phase removes). What survives is the
// containment check the commit adjudicates against.

/**
 * Does `body` hold `word` as plain prose (outside any `⟦anchor⟧` redaction bar)?
 * Used by the BUILD-TIME winnability guarantee's runtime mirror; the play gate now
 * checks the player's SELECTED span (spanContainsWord), not the whole body. Kept so
 * "citeable at build" stays defined the same way both sides see it.
 */
export function bodyContainsWord(body: string, word: string): boolean {
  return body.replace(/⟦[^⟧]+⟧/g, ' ').toLowerCase().includes(word.toLowerCase());
}

/**
 * Does the player's SELECTED span carry the word? The forged-citation commit check
 * (design_note_forged_citations.md §"any span links, commit judges"): a citation
 * grounds the word iff its span literally contains it (case-insensitive, loose span
 * fine — the test is containment, not exact-word selection). The redaction bar a slot
 * renders is `█████`, so a selection dragged across a slot picks up no letters of the
 * hidden word — a propagated/redacted value can never be selected as grounding, which
 * is what keeps the gate honest without a special case (§7.5).
 */
export function spanContainsWord(spanText: string, word: string): boolean {
  return spanText.toLowerCase().includes(word.toLowerCase());
}

// ── The citation-cost gate (AMBER's manual unredaction — forged citations) ─
//
// AMBER's honest verb under the single-word primitive: to commit a slot's word the
// player FORGES citations and CITES where the corpus grounds it. The player FINDS the
// grounding (Phase 3 — AMBER no longer surfaces it): they read a reachable record,
// SELECT the span where the word stands, and stake it. The link always draws; AMBER
// judges only at commit. A forged citation grounds the word iff its file is reachable
// AND its selected span literally carries the word (spanContainsWord). Two depths:
//   TEACHING  — one such span grounds it; AMBER commits. The bootstrap (no prior
//               solve, no clearance — decision D). citeIn no longer gates play (it is
//               the build-time winnability guarantee); any reachable span carrying the
//               word grounds. The non-circular seed that replaced clearance-reveal.
//   INFERENCE — no single file states the word; the player forges several spans of
//               partial context. Each distinct grounding span contributes; AMBER
//               commits once the count meets the slot's threshold (decision A: the
//               total is returned so the UI can render a ▮▮▯ meter). NOTE: the only
//               inference slots in the current corpus are on the SELF-FILE, which is
//               EXCLUDED from the restoration target and never reached (you STARVE it,
//               you don't solve it). So the inference path is structurally present but
//               not exercised by any winnable slot today; the per-span check (here, the
//               same spanContainsWord as teaching) is uniform and will be refined when
//               authored inference content lands (a later phase), not now.
// A good commit calls insert(ref, value, 'amber') (exposure +0); a short/wrong one is
// rejected with no write. This GUARDS insert(); Quippy bypasses it entirely by
// calling insert(ref, value, 'quippy') directly.

/**
 * Grounding contributed by one valid forged citation: 1 per distinct grounding span.
 * For inference slots the threshold counts these. The dial surface: per-citation
 * weight could later vary by author intent; for the prototype each grounding span is
 * worth 1 toward the threshold.
 */
export const GROUNDING_PER_CITE = 1;

export type CommitReason =
  | 'wrong-word'      // value is not the slot's truth word (single-word primitive)
  | 'uncited'         // no forged citation's span carries the word (teaching)
  | 'insufficient'    // inference slot, but grounding spans are below threshold
  | 'ungroundable';   // no reachable grounding exists yet (read more, or a content gap)

export interface CommitResult {
  ok: boolean;
  reason?: CommitReason;
  /** the forged citations whose spans actually grounded the word (AMBER's accept line) */
  citedBy?: ForgedCitation[];
  /** accumulated grounding vs the slot's threshold (decision A — drives the meter) */
  grounded?: number;
  threshold?: number;
  /** refs the accepted commit propagated to */
  propagatedTo?: string[];
}

/**
 * Does a forged `citation` ground the truth word at `ref` right now? The same check
 * for both depths (the teaching/inference split collapses at PLAY time — the player
 * just forges spans): the citation's file must be reachable AND its selected span
 * must literally carry the word. The honesty rule holds structurally — a propagated
 * or redacted value sits behind a `█████` bar, never in selectable prose, so it can
 * never be staked as grounding (§7.5). citeIn is NOT consulted here (it is the
 * build-time winnability guarantee, not the play gate).
 */
export function corroborates(citation: ForgedCitation, ref: string): boolean {
  const anchor = anchorOf(ref);
  if (!isReachable(citation.item)) return false; // can't cite a record you haven't reached
  if (citation.item === splitRef(ref).item) return false; // a slot's own file can't ground it
  return spanContainsWord(citation.text, anchor.truth);
}

/**
 * True if `ref` has no reachable grounding at all yet — a teaching slot whose
 * citeIn files (the authored winnability sources) aren't reachable, or an inference
 * slot with no reachable co-carriers. The player has nothing to read yet; reject with
 * 'ungroundable' rather than 'uncited' so the message routes them to open more, not to
 * forge a span that cannot exist. (A genuinely sourceless slot is a CONTENT error the
 * build catches, not an engine fallback — clearance-reveal is gone, decision D.)
 */
export function isUngroundable(ref: string): boolean {
  const anchor = anchorOf(ref);
  const reached = reachableFiles();
  if (anchor.grounding.kind === 'teaching') {
    return !anchor.grounding.citeIn.some((c) => reached.has(c));
  }
  return crossMentions(ref).length === 0;
}

/**
 * AMBER commit. The honest unredaction verb. Under the single-word primitive the
 * only admissible value is the slot's truth word; the player must GROUND it with
 * forged citations (spans they selected and staked). Accepts → insert(ref,
 * anchor.truth, 'amber') (exposure +0) and propagate.
 *
 * The word match is case-insensitive (trim + lowercase both sides) — a play
 * barrier, not a puzzle element; the player has recovered the word, and rejecting
 * "euclid" for "Euclid" teaches nothing. On success the CANONICAL `anchor.truth`
 * is written to the overlay (never the player's typed casing), so the
 * reconstructed record always reads in its authored form.
 *
 *  - TEACHING: accept iff ≥1 forged span carries the word (from a reachable file).
 *    Otherwise 'uncited' (go read and forge a real span).
 *  - INFERENCE: count the distinct grounding spans; accept iff the total meets the
 *    slot's threshold. Otherwise 'insufficient' (with the running total for the meter).
 *
 * Distinct grounding spans are de-duplicated by (item, lowercased text) so the same
 * span staked twice can't inflate an inference meter.
 */
export function commitWithCitations(
  ref: string,
  value: string,
  citations: ForgedCitation[],
  canPropagateTo?: (item: string) => boolean,
): CommitResult {
  const anchor = anchorOf(ref);
  // Single-word primitive: the only correct value is the truth word, matched
  // case-insensitively (recall, not a spelling drill — see the doc comment above).
  if (value.trim().toLowerCase() !== anchor.truth.trim().toLowerCase()) {
    return { ok: false, reason: 'wrong-word' };
  }

  if (isUngroundable(ref)) return { ok: false, reason: 'ungroundable' };

  // Keep only citations whose span actually grounds the word, de-duplicated so a
  // span staked twice counts once toward an inference threshold.
  const seen = new Set<string>();
  const good: ForgedCitation[] = [];
  for (const c of citations) {
    if (!corroborates(c, ref)) continue;
    const key = `${c.item} ${c.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    good.push(c);
  }

  if (anchor.grounding.kind === 'teaching') {
    if (good.length === 0) return { ok: false, reason: 'uncited' }; // go find and forge the span
    const propagatedTo = insert(ref, anchor.truth, 'amber', canPropagateTo);
    return { ok: true, citedBy: good, propagatedTo };
  }

  // inference: assemble grounding to threshold (decision A — transparent meter)
  const threshold = anchor.grounding.threshold;
  const grounded = good.length * GROUNDING_PER_CITE;
  if (grounded < threshold) return { ok: false, reason: 'insufficient', grounded, threshold, citedBy: good };
  const propagatedTo = insert(ref, anchor.truth, 'amber', canPropagateTo);
  return { ok: true, citedBy: good, grounded, threshold, propagatedTo };
}

// ── Display ────────────────────────────────────────────────────────────
// The four-state grammar resolved per slot (v2 reset §2.2): redacted / inserted /
// propagated / contradiction, plus the `via` provenance so the renderer can mark a
// Quippy fill distinctly (the fifth distinction — a Quippy-filled word looks unlike
// an AMBER commit). Clearance-reveal is cut (decision D), so there is no 'revealed'
// state; truth-contradiction is now driven by `contradicts_truth` on the overlay
// entry (a Quippy fill of the wrong word), not by a tier audit. The ORDER of the
// branches IS the state precedence and is load-bearing. Svelte 5 only allows
// `$derived` as a declaration initializer, so the ladder lives in this pure
// `resolveSlot` and reactive callers wrap it (`$derived(resolveSlot(ref))`); the
// reads of `overlay` and the anchor are tracked as if inlined.

export interface DisplayedSlot {
  text: string;
  state: 'redacted' | 'inserted' | 'propagated' | 'truth-contradiction';
  /** the route that filled this slot, so the renderer can mark a Quippy fill. */
  via?: Via;
  guess?: string;
  caused_by?: string;
}

export function resolveSlot(ref: string): DisplayedSlot {
  const o = overlay[ref];
  const anchor = anchorOf(ref);
  if (o && o.contradicts_truth)
    return { text: o.value, state: 'truth-contradiction', via: o.via, guess: anchor.truth };
  if (o?.source === 'propagated') return { text: o.value, state: 'propagated', via: o.via, caused_by: o.caused_by };
  if (o?.source === 'inserted')  return { text: o.value, state: 'inserted', via: o.via };
  return { text: '█████', state: 'redacted' };
}

// ── Propagation (§4 — v2 reset) ────────────────────────────────────────
// Under the single-word primitive, propagation copies the solved WORD to every
// co-carrier of its concept that holds the SAME word — a fact stated once need not
// be re-entered by hand everywhere it recurs (SCP-41B-002's "honest threading").
// A co-carrier whose truth is a DIFFERENT word is a narrative-thread sibling, not
// the same fact, and is never written by propagation — so a ripple can never land a
// wrong value (the old index-aligned mutation mapping is gone with `mutations[]`).

/** Factor applied to a propagated carrier's exposure weight (§4 step 4). */
export const PROPAGATION_FACTOR = 1;

/**
 * The word a source slot propagates: its overlay value. A co-carrier receives it
 * only if its own truth IS that word (checked at the call site) — propagation
 * carries a confirmed word to where the same word belongs, never a guess.
 */
function propagatedWord(sourceRef: string): string {
  return overlay[sourceRef]?.value ?? '';
}

// ── Insertion (single-file write + propagation) ────────────────────────
// Commit a player's chosen candidate into the overlay, charge exposure, then
// propagate across every other carrier of the slot's concept. Recomputed from
// the immutable corpus each call, so re-inserting the same value is a no-op and
// no drift accumulates (§4 "idempotent re-evaluation").

/**
 * True when the overlay already holds exactly this inserted value at this slot,
 * via the same route. A re-insert of the same value but a *different* route (e.g.
 * an AMBER re-solve of a Quippy-tainted slot — watch item 1) is NOT idempotent:
 * it must re-write so the `via` is updated and the ripples re-stamped.
 */
function alreadyInserted(ref: string, value: string, via: Via): boolean {
  const o = overlay[ref];
  return o?.source === 'inserted' && o.value === value && o.via === via;
}

/**
 * Insert a candidate at `ref` and propagate it to the index-aligned slot of
 * every co-carrier of its concept.
 *
 * `via` records the route (re-frame R§6.3): `'amber'` (the honest cited commit,
 * exposure +0) or `'quippy'` (the one-click fill that carries all the exposure,
 * R§6.4). It is stamped on the inserted entry AND inherited by every propagated
 * ripple, so a single Quippy edit that ripples widely is accounted as Quippy
 * reliance everywhere it lands (watch item 2). Defaults to `'amber'` so existing
 * call sites and the no-cost route are the default.
 *
 * `canPropagateTo`, when given, gates which target items may receive the ripple —
 * the onboarding uses it to keep propagation inside the files the player has
 * actually unlocked, so an edit never ripples to a record that isn't on screen
 * yet. Omitted ⇒ propagate to all carriers (normal play). Returns the refs
 * propagated to.
 */
export function insert(
  ref: string,
  value: string,
  via: Via = 'amber',
  canPropagateTo?: (item: string) => boolean,
): string[] {
  // Single-word primitive: the only value that may enter the overlay for a slot is
  // its truth word (CLAUDE.md invariant 3 — bounded, never free text; the set is now
  // the single truth). A wrong word reaches insert() only via Quippy (which fills the
  // wrong/escalatory word by design, reset §1.5/§F) — flagged contradicts_truth so the
  // renderer marks it, but still written, since the player must be able to see it. An
  // AMBER commit never reaches here with a wrong word (the gate rejects it first).
  const anchor = anchorOf(ref);
  const wrong = value !== anchor.truth;

  if (alreadyInserted(ref, value, via)) return []; // idempotent re-insert: no recompute, no new ripples

  // 1. Write the inserted value, stamped with its route; mark a wrong fill. A Quippy
  //    fill ALSO marks the ref permanently tainted (user decision: no redemption — the
  //    true win requires the slot was NEVER Quippy-touched, even if later AMBER-cited).
  overlay[ref] = { anchor_ref: ref, value, source: 'inserted', via, ...(wrong ? { contradicts_truth: true } : {}) };
  if (via === 'quippy') quippyTouched.add(ref);

  // 2. Propagate the WORD to every co-carrier of this concept whose own truth IS
  //    that word — a confirmed fact threaded to where it recurs. We never overwrite
  //    a slot the player has independently *inserted* (it's its own source of truth,
  //    not a sink), and never write a co-carrier whose truth differs (a sibling-thread
  //    carrier, not the same fact) — so a ripple can only ever carry a right word to a
  //    right place. A wrong (Quippy) value propagates to nothing, since no co-carrier's
  //    truth equals it. Returns the refs propagated to, for the UI's ripple log.
  const propagatedTo: string[] = [];
  if (anchor.concept && !wrong) {
    const word = propagatedWord(ref);
    for (const targetRef of crossMentions(ref)) {
      if (overlay[targetRef]?.source === 'inserted') continue; // player-owned: never clobber
      if (canPropagateTo && !canPropagateTo(splitRef(targetRef).item)) continue; // not yet unlocked
      if (anchorOf(targetRef).truth !== word) continue; // different fact: never propagate a word it doesn't hold
      overlay[targetRef] = {
        anchor_ref: targetRef,
        value: word,
        source: 'propagated',
        via, // a ripple inherits its cause's route (R§6.3; watch item 2)
        caused_by: ref,
      };
      if (via === 'quippy') quippyTouched.add(targetRef); // a Quippy ripple taints permanently too
      propagatedTo.push(targetRef);
    }
  }

  // 3. Exposure is the sum of every live edit's weight, recomputed from the
  //    overlay — never incrementally accumulated. This is the §4 no-drift
  //    guarantee made structural: re-inserting or changing a value can only
  //    move exposure to whatever the current overlay implies, never ratchet it.
  recomputeExposure();
  // 4. Fire/clear breaches against the new exposure (Quippy reliance can push the
  //    board into a breached state; an AMBER re-solve dropping exposure clears it).
  evaluateBreaches();

  return propagatedTo;
}

// ── Batched validation (C7, §5) ────────────────────────────────────────
// Raising clearance unlocks ground-truth in BATCHES keyed to the tier — never
// one slot at a time, never per-guess. This is the rule-of-three anti-brute-
// ── Board-state readouts (UI guidance + progress) ──────────────────────
// Pure summaries of the current board the UI reads to guide the player and show
// progress. None of these reveal truth or change state — they describe what the
// player has done, so the Concordance can prompt the right next move.

/** Every anchor ref in the corpus, in stable file/anchor order. */
export function allRefs(): string[] {
  const refs: string[] = [];
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) refs.push(makeRef(file.item, a.id));
  }
  return refs;
}

export interface BoardState {
  totalSlots: number;
  filled: number;          // slots the player inserted into (not propagated)
  propagated: number;      // slots changed by propagation from an insert
  confirmed: number;       // inserted slots reading the correct word (a coherent read)
  struck: number;          // inserted slots reading the WRONG word (a Quippy mistake)
  hasInserted: boolean;
  // Provenance counts across ALL live overlay entries (inserted + propagated), so
  // a single Quippy edit rippling to N carriers counts as N Quippy-tainted slots
  // (watch item 2). The no-Quippy ending reads viaQuippy === 0.
  viaAmber: number;        // overlay entries routed through AMBER (the honest tool)
  viaQuippy: number;       // overlay entries routed through Quippy (the costly tool)
}

export function boardState(): BoardState {
  let totalSlots = 0;
  let filled = 0;
  let propagated = 0;
  let confirmed = 0;
  let struck = 0;
  let viaAmber = 0;
  let viaQuippy = 0;
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) {
      totalSlots++;
      const ref = makeRef(file.item, a.id);
      const o = overlay[ref];
      // Correctness is known directly under the single-word primitive: an inserted
      // value either equals the truth word or it doesn't. No clearance audit needed —
      // the engine holds truth immutably; it just never SHOWS it unless solved.
      if (o?.source === 'inserted') {
        filled++;
        if (o.value === a.truth) confirmed++;
        else struck++;
      } else if (o?.source === 'propagated') {
        propagated++;
      }
      // Provenance tally over every live entry (inserted + propagated alike), so
      // Quippy reliance is counted wherever it rippled. Default-via ('amber' when
      // unset) keeps untagged entries on the honest side.
      if (o) {
        if (o.via === 'quippy') viaQuippy++;
        else viaAmber++;
      }
    }
  }
  return {
    totalSlots,
    filled,
    propagated,
    confirmed,
    struck,
    hasInserted: filled > 0,
    viaAmber,
    viaQuippy,
  };
}

// ── Breach line (exposure consequence; drivers re-aimed to Quippy) ──────────
// Exposure (now driven ONLY by Quippy reliance, R§6.4) still has a consequence:
// cross the line and an entity breaches, mutating terminal behaviour (and forcing
// Quippy's post-breach band). A perfect no-Quippy run never approaches it — the
// breach line is reached only by leaning on Quippy. Tuned against the trio
// (total possible Quippy exposure ~15): a few escalating Quippy assists reach it.
/** Exposure at or above this and an entity re-indexes out of containment — breach. */
export const BREACH_THRESHOLD = 10;

/**
 * Fire any breach whose threshold the current exposure now meets. Wired into the
 * insert path so Quippy reliance can actually push the board into a breached
 * state (which the no-Quippy ending and Quippy's post-breach band read). Breach
 * EFFECTS (terminal-mutating) are applied by the presentation layer reading the
 * `breaches` set; this only records that a breach has occurred. Recovery is
 * first-class: drop exposure back under the line and the breach can clear.
 */
export function evaluateBreaches(): void {
  for (const item of Object.keys(corpus)) {
    if (exposure.value >= BREACH_THRESHOLD) {
      if (!breaches.has(item)) breaches.add(item);
    } else if (breaches.has(item)) {
      breaches.delete(item); // recovery — exposure fell back under the line
    }
  }
}

// ── The ending — the loop breaks (no-Quippy completion) ─────────────────────
// design_document.md §6, scp_x_bible.md §5. The win INVERTS from the old model:
// the true ending is the corpus fully restored to truth AND every solved slot via
// AMBER — zero Quippy assists, no surviving contradictions. Read from provenance
// (the `via` field) across all solved slots, not a counter. Every other outcome is
// a breach ending (recovery-first; breaches are board state).
//
// ENFORCEMENT (watch item, scp_x_bible.md §5.3): the HARD GATE — ANY Quippy assist
// forecloses the true ending. Started hard for design clarity (the no-Quippy run
// is a clean mastery expression); relax to a tolerance band only if playtest shows
// it inhumane. Watch item 1, decided: an AMBER re-solve REDEEMS a Quippy-tainted
// slot (the entry re-stamps via=amber), so a tainted run is recoverable by honest
// re-work — the hard gate is humane because redemption exists, not because the gate
// is soft.

export type EndOutcome = 'playing' | 'loop-broken' | 'breach';

export interface EndState {
  outcome: EndOutcome;
  /** total slots in the restoration target (corpus minus the excluded self-file) */
  total: number;
  /** slots reading their truth word via an insert (the win numerator) */
  restored: number;
  /** slots whose inserted value is the wrong word (a Quippy mistake; must be re-solved) */
  contradictions: number;
  /** slots still showing redacted (un-restored) */
  redacted: number;
  /** Quippy-routed entries across the board (the hard-gate disqualifier) */
  quippyAssists: number;
  /** true once an entity has breached (board state) */
  breached: boolean;
}

/**
 * Read the ending from board state + the PERMANENT Quippy-taint record. A slot counts
 * as RESTORED iff it currently reads its truth word (an overlay value equal to truth).
 * Clearance is cut (decision D), so there is no reveal gate on the win: a slot is
 * restored the moment it holds the right word.
 *
 * The no-Quippy gate reads `quippyTouched` (every ref EVER Quippy-filled or -rippled),
 * NOT live `via` — so AMBER-re-citing a Quippy-touched slot does NOT clear it (user
 * decision 2026-06-17: no redemption; the help already happened). `quippyAssists` is
 * therefore the size of the permanent taint set, monotonic over the run.
 *
 * - loop-broken (true): every target slot restored, no contradictions, and ZERO slots
 *   ever Quippy-touched. The record reconstructed entirely by hand, start to finish.
 * - breach: an entity has breached.
 * - playing: otherwise (work remains). A once-tainted run can no longer reach
 *   loop-broken, but is not itself a loss until a breach — it just can't be the TRUE win.
 */
export function endState(): EndState {
  let total = 0;
  let restored = 0;
  let contradictions = 0;
  let redacted = 0;
  // Permanent taint: any slot ever touched by Quippy, regardless of later AMBER work.
  const quippyAssists = quippyTouched.size;

  for (const file of Object.values(corpus)) {
    // The self-file (Quippy) is the entity you STARVE, not the puzzle you solve
    // (scp_x_bible.md §5.4): you win by reconstructing everything ELSE by hand, at
    // which point Quippy, having gotten no assists, cannot complete itself. So its
    // anchors are excluded from the restoration target.
    const isSelf = file.entity_self;
    for (const a of file.anchors) {
      const ref = makeRef(file.item, a.id);
      const o = overlay[ref];
      if (isSelf) continue; // excluded from the restoration numerator/denominator

      total++;
      if (o && o.value === a.truth) {
        restored++;
      } else if (o && o.value !== a.truth) {
        contradictions++; // a wrong word sitting in the slot (Quippy fill)
      } else {
        redacted++; // untouched
      }
    }
  }

  const breached = breaches.size > 0;
  // total > 0 guards the degenerate empty-target case (a corpus that is only the
  // excluded self-file is not a win the instant it loads).
  const complete = total > 0 && restored === total && contradictions === 0;

  let outcome: EndOutcome = 'playing';
  if (complete && quippyAssists === 0) {
    outcome = 'loop-broken'; // the true ending: full restoration, never a Quippy touch
  } else if (breached) {
    outcome = 'breach'; // an entity completed its re-shelving
  }
  // A once-tainted record (quippyAssists > 0) can never reach loop-broken — there is
  // no redemption. It stays 'playing' until/unless a breach; the true win is foreclosed.

  return { outcome, total, restored, contradictions, redacted, quippyAssists, breached };
}

/**
 * Multiplier on a slot's exposure when a Quippy fill is the WRONG word. A wrong fill
 * is a value diverging from contained reality — the corruption that drives the breach
 * in the fiction — so a wrong Quippy fill costs more than a right one. Under the
 * single-word primitive wrongness is known immediately (no clearance audit), so the
 * penalty applies as soon as the wrong word is filled.
 */
export const STRUCK_PENALTY = 2.5;

export function recomputeExposure(): void {
  let total = 0;
  for (const [ref, entry] of Object.entries(overlay)) {
    // Exposure re-aimed (R§6.4, the design's keystone — design_document.md §3):
    // ONLY Quippy reliance spends. An AMBER edit (the honest cited commit, or a
    // ripple inheriting an AMBER cause) costs zero, full stop. A perfect no-Quippy
    // run never breaches; the exposure curve is a pure measure of Quippy reliance.
    // NEVER make an `'amber'` edit cost exposure: that collapses the two routes back
    // into one and breaks the design. (`via` defaults to 'amber' when unset.)
    if (entry.via !== 'quippy') continue;
    const anchor = anchorOf(ref);
    let weight = entry.source === 'propagated' ? anchor.exposure_weight * PROPAGATION_FACTOR : anchor.exposure_weight;
    // A wrong Quippy fill weighs more — the divergence from truth is the corruption.
    if (entry.value !== anchor.truth) {
      weight *= STRUCK_PENALTY;
    }
    total += weight;
  }
  exposure.value = total;
}
