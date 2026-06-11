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
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';

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
  exposure.value = 0;
  clearance.tier = 1;
});

describe('insert — single-file overlay (concept-less slot)', () => {
  it('writes an inserted overlay entry and charges its exposure weight', () => {
    insert(LOCAL, LOCAL_GUESS);
    expect(overlay[LOCAL]).toMatchObject({ value: LOCAL_GUESS, source: 'inserted' });
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
  it('re-inserting the SAME value leaves exposure at one weight', () => {
    insert(LOCAL, LOCAL_GUESS);
    insert(LOCAL, LOCAL_GUESS);
    insert(LOCAL, LOCAL_GUESS);
    expect(exposure.value).toBe(LOCAL_WEIGHT);
    expect(overlay[LOCAL].value).toBe(LOCAL_GUESS);
  });

  it('re-inserting a DIFFERENT value replaces in place, exposure does NOT ratchet', () => {
    insert(LOCAL, LOCAL_GUESS);
    insert(LOCAL, 'loc-2');
    expect(overlay[LOCAL].value).toBe('loc-2');
    // exposure is a function of the current overlay (one live edit), not history
    expect(exposure.value).toBe(LOCAL_WEIGHT);
  });

  // Property: any sequence of inserts of any candidates at one concept-less slot
  // leaves exposure at exactly that slot's weight — recompute, never accumulate.
  it('property: exposure equals one weight for any insert sequence at one slot', () => {
    const candidates = FIXTURE['SCP-41B-003'].anchors[1].mutations;
    for (let i = 0; i < 12; i++) {
      insert(LOCAL, candidates[i % candidates.length]);
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
