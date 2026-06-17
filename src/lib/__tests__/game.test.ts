// Single-slot insertion logic (v2 reset): idempotent re-insert, the four-state
// display precedence, and the no-Quippy endState. The store is a rune module; vitest
// runs it through the Svelte plugin. Single-slot behaviour uses F2#a1 (sole carrier
// of key-b, so no propagation confounds the exposure math).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  seedReachable,
  seedReach,
  makeRef,
  insert,
  resolveSlot,
  crossMentions,
  endState,
  evaluateBreaches,
  breaches,
  quippyTouched,
  BREACH_THRESHOLD,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';
import type { Corpus } from '../corpus.ts';

// F2#a1 'beta' — sole carrier of key-b, so inserting here touches only itself.
const SOLO = makeRef('SCP-41B-002', 'a1');
const SOLO_TRUTH = 'beta';
const SOLO_WEIGHT = 2;
const SOLO_WRONG = 'WRONG';

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  seedReachable.clear();
  breaches.clear();
  quippyTouched.clear();
  exposure.value = 0;
  seedReach('SCP-41B-001');
});

describe('insert — single-slot overlay', () => {
  it('writes an inserted overlay entry stamped with its route (default amber)', () => {
    insert(SOLO, SOLO_TRUTH);
    expect(overlay[SOLO]).toMatchObject({ value: SOLO_TRUTH, source: 'inserted', via: 'amber' });
  });

  it('an AMBER insert charges ZERO exposure (the safe route)', () => {
    insert(SOLO, SOLO_TRUTH, 'amber');
    expect(exposure.value).toBe(0);
  });

  it('a Quippy insert of the right word charges its exposure weight', () => {
    insert(SOLO, SOLO_TRUTH, 'quippy');
    expect(overlay[SOLO]).toMatchObject({ via: 'quippy' });
    expect(exposure.value).toBe(SOLO_WEIGHT);
  });

  it('does not propagate from a sole-carrier slot', () => {
    insert(SOLO, SOLO_TRUTH);
    expect(Object.keys(overlay)).toEqual([SOLO]);
    expect(crossMentions(SOLO)).toEqual([]); // key-b has no other carrier
  });

  it('a wrong Quippy fill is written, flagged a contradiction, and weighs more', () => {
    insert(SOLO, SOLO_WRONG, 'quippy');
    expect(overlay[SOLO]).toMatchObject({ value: SOLO_WRONG, source: 'inserted', contradicts_truth: true });
    expect(exposure.value).toBeGreaterThan(SOLO_WEIGHT); // struck penalty
  });
});

describe('idempotent re-insert (no accumulated drift, §4)', () => {
  it('re-inserting the SAME quippy value leaves exposure at one weight', () => {
    insert(SOLO, SOLO_TRUTH, 'quippy');
    insert(SOLO, SOLO_TRUTH, 'quippy');
    insert(SOLO, SOLO_TRUTH, 'quippy');
    expect(exposure.value).toBe(SOLO_WEIGHT);
    expect(overlay[SOLO].value).toBe(SOLO_TRUTH);
  });

  // No redemption (user decision 2026-06-17): an AMBER re-solve drops EXPOSURE to
  // zero (exposure reads live via), but the PERMANENT win-taint does not clear.
  it('an AMBER re-solve of a Quippy slot clears exposure but NOT the permanent taint', () => {
    insert(SOLO, SOLO_TRUTH, 'quippy');
    expect(exposure.value).toBe(SOLO_WEIGHT);
    expect(quippyTouched.has(SOLO)).toBe(true);
    insert(SOLO, SOLO_TRUTH, 'amber'); // same value, honest route
    expect(overlay[SOLO].via).toBe('amber');
    expect(exposure.value).toBe(0); // exposure redeemed…
    expect(quippyTouched.has(SOLO)).toBe(true); // …but the touch is permanent
  });
});

describe('resolveSlot — display precedence (v2 ladder)', () => {
  const read = (ref: string) => resolveSlot(ref);

  it('redacted when untouched', () => {
    expect(read(SOLO).state).toBe('redacted');
    expect(read(SOLO).text).toBe('█████');
  });

  it('inserted when an overlay value sits there (correct word)', () => {
    insert(SOLO, SOLO_TRUTH);
    expect(read(SOLO).state).toBe('inserted');
    expect(read(SOLO).text).toBe(SOLO_TRUTH);
  });

  it('truth-contradiction when a wrong (Quippy) word sits there', () => {
    insert(SOLO, SOLO_WRONG, 'quippy');
    const s = read(SOLO);
    expect(s.state).toBe('truth-contradiction');
    expect(s.text).toBe(SOLO_WRONG); // the wrong word the player sees
    expect(s.guess).toBe(SOLO_TRUTH); // the held truth it contradicts
  });
});

describe('crossMentions (the grounding-graph surface)', () => {
  it('lists other reachable anchors sharing the concept key', () => {
    // key-a: F1#a1 ↔ F3#a1
    expect(crossMentions(makeRef('SCP-41B-001', 'a1'))).toEqual([makeRef('SCP-41B-003', 'a1')]);
  });

  it('returns nothing for a sole-carrier slot', () => {
    expect(crossMentions(SOLO)).toEqual([]);
  });
});

describe('endState — the no-Quippy ending (design_document.md §6)', () => {
  // A restorable TARGET file (001, two teaching slots that ground each other) plus a
  // separate excluded SELF file (000), so the target is non-empty and the self-file
  // is starved, not solved (scp_x_bible.md §5.4).
  function makeWinnableCorpus(): Corpus {
    const c: Corpus = {
      'SCP-41B-001': {
        item: 'SCP-41B-001', object_class: 'Safe', site: 'Site-41B',
        entity_self: false, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors: [
          { id: 's0', slot_type: 'object', truth: 's0-truth', grounding: { kind: 'inference', threshold: 1 }, exposure_weight: 1 },
          { id: 's1', slot_type: 'object', truth: 's1-truth', grounding: { kind: 'inference', threshold: 1 }, exposure_weight: 1 },
        ],
        body: '⟦s0⟧ ⟦s1⟧',
      },
      'SCP-41B-000': {
        item: 'SCP-41B-000', object_class: 'Keter', site: 'Site-41B',
        entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors: [{ id: 'z', slot_type: 'object', truth: 'z-truth', grounding: { kind: 'inference', threshold: 1 }, exposure_weight: 1 }],
        body: '⟦z⟧',
      },
    };
    loadCorpus(c);
    return c;
  }
  const oref = (id: string) => makeRef('SCP-41B-001', id);

  /** Restore every target slot to truth via the given route (bypassing the gate). */
  function restoreAll(via: 'amber' | 'quippy') {
    for (const id of ['s0', 's1']) insert(oref(id), `${id}-truth`, via);
  }

  it('starts in the playing state with a fresh board', () => {
    makeWinnableCorpus();
    expect(endState().outcome).toBe('playing');
  });

  it('THE TRUE ENDING: full restoration via AMBER only → loop-broken', () => {
    makeWinnableCorpus();
    restoreAll('amber');
    const e = endState();
    expect(e.outcome).toBe('loop-broken');
    expect(e.restored).toBe(e.total);
    expect(e.quippyAssists).toBe(0);
    expect(e.contradictions).toBe(0);
    expect(e.breached).toBe(false);
  });

  it('HARD GATE: a single Quippy assist forecloses the true ending', () => {
    makeWinnableCorpus();
    insert(oref('s0'), 's0-truth', 'amber');
    insert(oref('s1'), 's1-truth', 'quippy'); // one assist
    const e = endState();
    expect(e.restored).toBe(e.total); // record IS complete + correct…
    expect(e.quippyAssists).toBe(1); // …but tainted
    expect(e.outcome).not.toBe('loop-broken'); // the win is foreclosed
  });

  it('NO REDEMPTION: a Quippy touch permanently forecloses loop-broken, even after AMBER re-solve', () => {
    makeWinnableCorpus();
    insert(oref('s0'), 's0-truth', 'quippy'); // tainted permanently
    insert(oref('s1'), 's1-truth', 'amber');
    expect(endState().outcome).not.toBe('loop-broken'); // tainted, foreclosed
    insert(oref('s0'), 's0-truth', 'amber'); // AMBER re-solve — does NOT launder the taint
    const e = endState();
    expect(e.restored).toBe(e.total); // the record is complete and correct…
    expect(e.quippyAssists).toBe(1); // …but the permanent touch stands
    expect(e.outcome).not.toBe('loop-broken'); // the true win is foreclosed forever
  });

  it('LAUNDER GUARD: learn a word via Quippy, AMBER-cite the SAME slot → still no true win', () => {
    // The exact playtest bug: Quippy-fill a slot (learning its word), then AMBER-cite
    // it. The whole corpus then reads correct and via=amber, but the run is tainted.
    makeWinnableCorpus();
    insert(oref('s0'), 's0-truth', 'quippy'); // learned from Quippy
    insert(oref('s0'), 's0-truth', 'amber'); // laundered through AMBER
    insert(oref('s1'), 's1-truth', 'amber'); // the rest, honestly
    const e = endState();
    expect(e.restored).toBe(e.total);
    expect(e.contradictions).toBe(0);
    expect(e.quippyAssists).toBe(1); // the Quippy touch is on the permanent record
    expect(e.outcome).not.toBe('loop-broken');
  });

  it('an incomplete record stays playing (recoverable, not a loss)', () => {
    makeWinnableCorpus();
    insert(oref('s0'), 's0-truth', 'amber'); // only one of two
    const e = endState();
    expect(e.restored).toBeLessThan(e.total);
    expect(e.outcome).toBe('playing');
  });

  it('a surviving contradiction forecloses the win even with zero Quippy', () => {
    makeWinnableCorpus();
    insert(oref('s0'), 's0-truth', 'amber');
    insert(oref('s1'), 's1-wrong', 'quippy'); // a wrong word sitting in the slot
    const e = endState();
    expect(e.contradictions).toBe(1);
    expect(e.outcome).not.toBe('loop-broken');
  });

  it('BREACH ENDING: Quippy reliance pushes exposure over the line → breach', () => {
    const c: Corpus = {
      'SCP-41B-001': {
        item: 'SCP-41B-001', object_class: 'Euclid', site: 'Site-41B',
        entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors: [
          { id: 'h', slot_type: 'object', truth: 'h-truth', grounding: { kind: 'inference', threshold: 1 }, exposure_weight: BREACH_THRESHOLD },
        ],
        body: '⟦h⟧',
      },
    };
    loadCorpus(c);
    insert(makeRef('SCP-41B-001', 'h'), 'h-truth', 'quippy');
    expect(exposure.value).toBeGreaterThanOrEqual(BREACH_THRESHOLD);
    expect(breaches.size).toBeGreaterThan(0);
    expect(endState().outcome).toBe('breach');
  });

  it('recovery: dropping exposure back under the line clears the breach', () => {
    const c: Corpus = {
      'SCP-41B-001': {
        item: 'SCP-41B-001', object_class: 'Euclid', site: 'Site-41B',
        entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors: [
          { id: 'h', slot_type: 'object', truth: 'h-truth', grounding: { kind: 'inference', threshold: 1 }, exposure_weight: BREACH_THRESHOLD },
        ],
        body: '⟦h⟧',
      },
    };
    loadCorpus(c);
    const ref = makeRef('SCP-41B-001', 'h');
    insert(ref, 'h-truth', 'quippy'); // breach
    expect(breaches.size).toBeGreaterThan(0);
    insert(ref, 'h-truth', 'amber'); // redeem → exposure drops to 0
    expect(exposure.value).toBe(0);
    evaluateBreaches();
    expect(breaches.size).toBe(0); // recovered
  });
});
