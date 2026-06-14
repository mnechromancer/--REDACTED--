// C5t — single-file insertion logic: idempotent re-insert and the four-state
// display precedence. The store is a rune module ($state/$derived); vitest runs
// it through the Svelte plugin (vite.config.ts). These are logic tests, not
// component tests — no DOM is mounted. Single-file behavior is exercised on the
// concept-less anchor 003#a2 so propagation never confounds the exposure math;
// propagation has its own file (propagation.test.ts, C6t).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  revealedTruth,
  clearance,
  makeRef,
  insert,
  resolveSlot,
  crossMentions,
  raiseClearance,
  endState,
  evaluateBreaches,
  breaches,
  BREACH_THRESHOLD,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';
import type { Corpus } from '../corpus.ts';

const FIXTURE = makeCorpus();

// Single-file ref: 003#a2 is concept-less, so inserting here touches only itself.
const LOCAL = makeRef('SCP-41B-003', 'a2');
const LOCAL_TRUTH = FIXTURE['SCP-41B-003'].anchors[1].truth;
const LOCAL_WEIGHT = FIXTURE['SCP-41B-003'].anchors[1].exposure_weight; // 5
const LOCAL_GUESS = 'loc-1'; // a non-truth candidate

/** Reset the singleton store to a clean board before each test. */
beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  revealedTruth.clear();
  breaches.clear();
  exposure.value = 0;
  clearance.tier = 1;
});

describe('insert — single-file overlay (concept-less slot)', () => {
  it('writes an inserted overlay entry stamped with its route (default amber)', () => {
    insert(LOCAL, LOCAL_GUESS);
    expect(overlay[LOCAL]).toMatchObject({ value: LOCAL_GUESS, source: 'inserted', via: 'amber' });
  });

  // Exposure re-aim (R§6.4): AMBER charges zero, Quippy charges the weight.
  it('an AMBER insert charges ZERO exposure (the safe route)', () => {
    insert(LOCAL, LOCAL_GUESS, 'amber');
    expect(exposure.value).toBe(0);
  });

  it('a Quippy insert charges its exposure weight (the costly route)', () => {
    insert(LOCAL, LOCAL_GUESS, 'quippy');
    expect(overlay[LOCAL]).toMatchObject({ via: 'quippy' });
    expect(exposure.value).toBe(LOCAL_WEIGHT);
  });

  it('does not propagate from a concept-less slot', () => {
    insert(LOCAL, LOCAL_GUESS);
    // only the one slot is in the overlay
    expect(Object.keys(overlay)).toEqual([LOCAL]);
    expect(crossMentions(LOCAL)).toEqual([]);
  });

  it('rejects free text not in the candidate set (invariant 3)', () => {
    expect(() => insert(LOCAL, 'a thing I made up')).toThrow(/not an authored candidate/);
    expect(overlay[LOCAL]).toBeUndefined();
    expect(exposure.value).toBe(0);
  });
});

describe('idempotent re-insert (no accumulated drift, §4)', () => {
  it('re-inserting the SAME quippy value leaves exposure at one weight', () => {
    insert(LOCAL, LOCAL_GUESS, 'quippy');
    insert(LOCAL, LOCAL_GUESS, 'quippy');
    insert(LOCAL, LOCAL_GUESS, 'quippy');
    expect(exposure.value).toBe(LOCAL_WEIGHT);
    expect(overlay[LOCAL].value).toBe(LOCAL_GUESS);
  });

  it('re-inserting a DIFFERENT quippy value replaces in place, exposure does NOT ratchet', () => {
    insert(LOCAL, LOCAL_GUESS, 'quippy');
    insert(LOCAL, 'loc-2', 'quippy');
    expect(overlay[LOCAL].value).toBe('loc-2');
    // exposure is a function of the current overlay (one live edit), not history
    expect(exposure.value).toBe(LOCAL_WEIGHT);
  });

  // Watch item 1: an AMBER re-solve of a Quippy-tainted slot redeems it — the
  // entry is re-stamped via=amber and its exposure drops back to zero.
  it('an AMBER re-solve of a Quippy slot clears the taint and the exposure', () => {
    insert(LOCAL, LOCAL_GUESS, 'quippy');
    expect(exposure.value).toBe(LOCAL_WEIGHT);
    insert(LOCAL, LOCAL_GUESS, 'amber'); // same value, honest route
    expect(overlay[LOCAL].via).toBe('amber');
    expect(exposure.value).toBe(0);
  });

  // Property: any sequence of QUIPPY inserts of any candidates at one concept-less
  // slot leaves exposure at exactly that slot's weight — recompute, never accumulate.
  it('property: quippy exposure equals one weight for any insert sequence at one slot', () => {
    const candidates = FIXTURE['SCP-41B-003'].anchors[1].mutations;
    for (let i = 0; i < 12; i++) {
      insert(LOCAL, candidates[i % candidates.length], 'quippy');
      expect(exposure.value).toBe(LOCAL_WEIGHT);
    }
  });
});

describe('resolveSlot — four-state precedence (§3 ladder verbatim)', () => {
  const read = (ref: string) => resolveSlot(ref);

  it('redacted when untouched and truth not revealed', () => {
    expect(read(LOCAL).state).toBe('redacted');
    expect(read(LOCAL).text).toBe('█████');
  });

  it('inserted when an overlay guess exists and truth not revealed', () => {
    insert(LOCAL, LOCAL_GUESS);
    expect(read(LOCAL).state).toBe('inserted');
    expect(read(LOCAL).text).toBe(LOCAL_GUESS);
  });

  it('revealed (truth) takes precedence over an untouched slot', () => {
    revealedTruth.add(LOCAL);
    expect(read(LOCAL).state).toBe('revealed');
    expect(read(LOCAL).text).toBe(LOCAL_TRUTH);
  });

  it('truth-contradiction when revealed truth differs from the guess', () => {
    insert(LOCAL, LOCAL_GUESS);
    revealedTruth.add(LOCAL);
    const s = read(LOCAL);
    expect(s.state).toBe('truth-contradiction');
    expect(s.text).toBe(LOCAL_TRUTH);
    expect(s.guess).toBe(LOCAL_GUESS);
  });

  it('revealed (not contradiction) when the guess happens to equal truth', () => {
    // make the truth itself a candidate so it can be inserted
    loadCorpus(makeCorpus());
    const c = makeCorpus();
    c['SCP-41B-003'].anchors[1].mutations = [LOCAL_TRUTH, 'loc-1', 'loc-2'];
    loadCorpus(c);
    insert(LOCAL, LOCAL_TRUTH);
    revealedTruth.add(LOCAL);
    expect(read(LOCAL).state).toBe('revealed');
  });

  // Precedence property: a truth reveal dominates any overlay state for a slot.
  it('property: revealing truth overrides any prior inserted state', () => {
    insert(LOCAL, LOCAL_GUESS);
    expect(read(LOCAL).state).toBe('inserted');
    revealedTruth.add(LOCAL);
    expect(read(LOCAL).state).not.toBe('inserted');
  });
});

describe('crossMentions (HelpUtility inference surface)', () => {
  it('lists other anchors sharing the concept key', () => {
    const tqe = makeRef('SCP-41B-003', 'a1');
    expect(crossMentions(tqe)).toEqual([makeRef('SCP-41B-001', 'a1')]);
  });

  it('returns nothing for a concept-less slot', () => {
    expect(crossMentions(LOCAL)).toEqual([]);
  });
});

describe('endState — the no-Quippy ending (design_document.md §6)', () => {
  // A corpus with a restorable TARGET file (001, two concept-less rl-1 slots whose
  // truth is each slot's index-0 candidate) plus a separate excluded SELF file
  // (000), so the restoration target is non-empty and the self-file is starved,
  // not solved (scp_x_bible.md §5.4).
  function makeWinnableCorpus(): Corpus {
    const mk = (id: string, w: number) => ({
      id,
      slot_type: 'object' as const,
      truth: `${id}-truth`,
      redaction_level: 1 as const,
      mutations: [`${id}-truth`, `${id}-wrong`],
      exposure_weight: w,
    });
    const c: Corpus = {
      'SCP-41B-001': {
        item: 'SCP-41B-001', object_class: 'Euclid', site: 'Site-41B', clearance: 1,
        entity_self: false, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors: [mk('s0', 1), mk('s1', 1)],
        body: '⟦s0⟧ ⟦s1⟧',
      },
      'SCP-41B-000': {
        item: 'SCP-41B-000', object_class: 'Euclid', site: 'Site-41B', clearance: 5,
        entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors: [mk('z', 1)], body: '⟦z⟧',
      },
    };
    loadCorpus(c);
    return c;
  }
  const oref = (id: string) => makeRef('SCP-41B-001', id);

  /** Restore every slot to truth via the given route, then reveal all truth. */
  function restoreAll(via: 'amber' | 'quippy') {
    for (const id of ['s0', 's1']) insert(oref(id), `${id}-truth`, via);
    raiseClearance(5);
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
    raiseClearance(5);
    const e = endState();
    expect(e.restored).toBe(e.total); // record IS complete + correct…
    expect(e.quippyAssists).toBe(1); // …but tainted
    expect(e.outcome).not.toBe('loop-broken'); // the win is foreclosed
  });

  it('WATCH ITEM 1: an AMBER re-solve REDEEMS a Quippy-tainted slot → loop-broken', () => {
    makeWinnableCorpus();
    insert(oref('s0'), 's0-truth', 'quippy'); // tainted
    insert(oref('s1'), 's1-truth', 'amber');
    raiseClearance(5);
    expect(endState().outcome).not.toBe('loop-broken'); // tainted, foreclosed
    // Redeem s0 by re-solving it honestly:
    insert(oref('s0'), 's0-truth', 'amber');
    const e = endState();
    expect(e.quippyAssists).toBe(0); // taint cleared
    expect(e.outcome).toBe('loop-broken'); // the win is now reachable
  });

  it('an incomplete clean record stays playing (recoverable, not a loss)', () => {
    makeWinnableCorpus();
    insert(oref('s0'), 's0-truth', 'amber'); // only one of two
    raiseClearance(5);
    const e = endState();
    expect(e.restored).toBeLessThan(e.total);
    expect(e.outcome).toBe('playing');
  });

  it('a surviving contradiction forecloses the win even with zero Quippy', () => {
    makeWinnableCorpus();
    insert(oref('s0'), 's0-truth', 'amber');
    insert(oref('s1'), 's1-wrong', 'amber'); // a wrong AMBER guess
    raiseClearance(5);
    const e = endState();
    expect(e.contradictions).toBe(1);
    expect(e.outcome).not.toBe('loop-broken');
  });

  it('BREACH ENDING: Quippy reliance pushes exposure over the line → breach', () => {
    // A heavy slot whose Quippy fill alone crosses BREACH_THRESHOLD.
    const c: Corpus = {
      'SCP-41B-001': {
        item: 'SCP-41B-001', object_class: 'Euclid', site: 'Site-41B', clearance: 1,
        entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors: [
          {
            id: 'h', slot_type: 'object', truth: 'h-truth', redaction_level: 1,
            mutations: ['h-truth', 'h-wrong'], exposure_weight: BREACH_THRESHOLD,
          },
        ],
        body: '⟦h⟧',
      },
    };
    loadCorpus(c);
    insert(makeRef('SCP-41B-001', 'h'), 'h-truth', 'quippy');
    expect(exposure.value).toBeGreaterThanOrEqual(BREACH_THRESHOLD);
    expect(breaches.size).toBeGreaterThan(0); // wired evaluateBreaches fired
    expect(endState().outcome).toBe('breach');
  });

  it('recovery: dropping exposure back under the line clears the breach', () => {
    const c: Corpus = {
      'SCP-41B-001': {
        item: 'SCP-41B-001', object_class: 'Euclid', site: 'Site-41B', clearance: 1,
        entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors: [
          {
            id: 'h', slot_type: 'object', truth: 'h-truth', redaction_level: 1,
            mutations: ['h-truth', 'h-wrong'], exposure_weight: BREACH_THRESHOLD,
          },
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
