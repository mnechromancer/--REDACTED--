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
  sessionResult,
  BREACH_THRESHOLD,
  CONTAINMENT_TARGET,
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

describe('sessionResult — the ending (exposure consequence)', () => {
  // Fixture weights: 003#a1=2, 003#a2=5, 001#a1=1, 001#a2=3, 002#a1=4.
  const TQE_3 = makeRef('SCP-41B-003', 'a1'); // weight 2, truth tqe-truth-003
  const TQE_1 = makeRef('SCP-41B-001', 'a1'); // weight 1, truth tqe-truth-001
  const LOT_1 = makeRef('SCP-41B-001', 'a2'); // weight 3, truth lot-truth-001
  const LOT_2 = makeRef('SCP-41B-002', 'a1'); // weight 4, truth lot-truth-002

  // Like the real entries, make each slot's truth its own first candidate so the
  // player can guess correctly. (The base fixture's truths are not candidates,
  // which is fine for the wrong-guess paths but blocks the correct-guess ones.)
  function withGuessableTruths() {
    const c = makeCorpus();
    for (const f of Object.values(c)) {
      for (const a of f.anchors) {
        if (!a.mutations.includes(a.truth)) a.mutations = [a.truth, ...a.mutations.slice(1)];
      }
    }
    // keep concept partners index-aligned: truth at index 0 on both carriers
    loadCorpus(c);
    return c;
  }

  it('starts in the playing state with a fresh board', () => {
    expect(sessionResult().outcome).toBe('playing');
  });

  // A purpose-built corpus for the outcome logic: enough light, concept-less,
  // truth-guessable slots that CONTAINMENT_TARGET correct reads stay under
  // BREACH_THRESHOLD, plus one heavy slot to force a breach. Derived from the
  // constants so it survives balance retuning.
  function makeOutcomeCorpus(lightWeight = 1): Corpus {
    const anchors = [];
    for (let i = 0; i < CONTAINMENT_TARGET + 1; i++) {
      anchors.push({
        id: `s${i}`,
        slot_type: 'object' as const,
        truth: `truth-${i}`,
        redaction_level: 1 as const,
        mutations: [`truth-${i}`, `wrong-${i}`],
        exposure_weight: lightWeight,
      });
    }
    // one heavy slot able to push a small number of fills over the line
    anchors.push({
      id: 'heavy',
      slot_type: 'object' as const,
      truth: 'truth-heavy',
      redaction_level: 1 as const,
      mutations: ['truth-heavy', 'wrong-heavy'],
      exposure_weight: BREACH_THRESHOLD,
    });
    const c: Corpus = {
      'SCP-41B-001': {
        item: 'SCP-41B-001', object_class: 'Euclid', site: 'Site-41B', clearance: 1,
        entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
        anchors, body: anchors.map((a) => `⟦${a.id}⟧`).join(' '),
      },
    };
    loadCorpus(c);
    return c;
  }
  const oref = (id: string) => makeRef('SCP-41B-001', id);

  it('breaches once exposure crosses the threshold', () => {
    makeOutcomeCorpus();
    insert(oref('heavy'), 'truth-heavy'); // weight = BREACH_THRESHOLD
    const r = sessionResult();
    expect(r.exposure).toBeGreaterThanOrEqual(BREACH_THRESHOLD);
    expect(r.outcome).toBe('breach');
  });

  it('breach takes precedence over containment even with enough correct fields', () => {
    makeOutcomeCorpus();
    // CONTAINMENT_TARGET correct light reads + the heavy slot → over the line.
    for (let i = 0; i < CONTAINMENT_TARGET; i++) insert(oref(`s${i}`), `truth-${i}`);
    insert(oref('heavy'), 'truth-heavy');
    raiseClearance(5);
    const r = sessionResult();
    expect(r.correct).toBeGreaterThanOrEqual(CONTAINMENT_TARGET);
    expect(r.exposure).toBeGreaterThanOrEqual(BREACH_THRESHOLD);
    expect(r.outcome).toBe('breach'); // breach wins the tie
  });

  it('contains when enough fields are correctly restored under the line', () => {
    makeOutcomeCorpus(1); // light slots weight 1 each
    // One short of the target: still playing.
    for (let i = 0; i < CONTAINMENT_TARGET - 1; i++) insert(oref(`s${i}`), `truth-${i}`);
    raiseClearance(5);
    expect(sessionResult().correct).toBeLessThan(CONTAINMENT_TARGET);
    expect(sessionResult().outcome).toBe('playing');

    // The CONTAINMENT_TARGET-th correct read, still under the line (weights = 1).
    insert(oref(`s${CONTAINMENT_TARGET - 1}`), `truth-${CONTAINMENT_TARGET - 1}`);
    raiseClearance(5);
    const r = sessionResult();
    expect(r.correct).toBeGreaterThanOrEqual(CONTAINMENT_TARGET);
    expect(r.exposure).toBeLessThan(BREACH_THRESHOLD);
    expect(r.outcome).toBe('contained');
  });

  it('auditing blanks without guessing never wins (must restore, not just read)', () => {
    withGuessableTruths();
    // Reveal every truth via clearance, but insert nothing.
    raiseClearance(5);
    const r = sessionResult();
    expect(r.correct).toBe(0);
    expect(r.exposure).toBe(0);
    expect(r.outcome).toBe('playing'); // read the whole record, restored none of it
  });

  it('a struck (wrong) guess counts toward struck, not correct', () => {
    // Base fixture: 001#a1's truth (tqe-truth-001) is not a candidate, so 'tqe-1'
    // is a genuine wrong guess.
    insert(TQE_1, 'tqe-1');
    raiseClearance(5);
    const r = sessionResult();
    expect(r.struck).toBeGreaterThanOrEqual(1);
    expect(r.correct).toBe(0);
  });
});
