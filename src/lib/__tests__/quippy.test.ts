// Step 5 — Quippy's behaviour (quippy.svelte.ts, scp_x_bible.md §3–§4): the
// exposure bands, the candidate-ordering tell (lobbying for the escalatory reading
// as exposure rises), and the costed one-click fill. Voice strings are content;
// these test the mechanical behaviour the voice rides on.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  revealedTruth,
  clearance,
  breaches,
  makeRef,
  insert,
} from '../game.svelte.ts';
import {
  quippyBand,
  quippySuggestions,
  QUIPPY_MID_THRESHOLD,
  QUIPPY_HIGH_THRESHOLD,
} from '../quippy.svelte.ts';
import { makeCorpus } from './fixtures.ts';

const TQE_003 = makeRef('SCP-41B-003', 'a1'); // mutations [tqe-0, tqe-1, tqe-2]

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  revealedTruth.clear();
  breaches.clear();
  exposure.value = 0;
  clearance.tier = 1;
});

describe('exposure bands (§4)', () => {
  it('is low on a fresh board', () => {
    expect(quippyBand()).toBe('low');
  });

  it('climbs to mid then high as exposure rises', () => {
    exposure.value = QUIPPY_MID_THRESHOLD;
    expect(quippyBand()).toBe('mid');
    exposure.value = QUIPPY_HIGH_THRESHOLD;
    expect(quippyBand()).toBe('high');
  });

  it('any breach forces the post-breach band regardless of exposure', () => {
    exposure.value = 0;
    breaches.add('SCP-41B-001');
    expect(quippyBand()).toBe('post-breach');
  });
});

describe('the candidate-ordering tell (§3)', () => {
  it('low band: honest order, index-0 offered but framed dull', () => {
    const s = quippySuggestions(TQE_003);
    expect(s.map((x) => x.index)).toEqual([0, 1, 2]); // unchanged order
    expect(s.find((x) => x.index === 0)?.framing).toBe('dull');
  });

  it('mid band: escalatory reading surfaces first and is recommended', () => {
    exposure.value = QUIPPY_MID_THRESHOLD;
    const s = quippySuggestions(TQE_003);
    expect(s[0].index).toBe(2); // highest index first
    expect(s[0].framing).toBe('recommended');
  });

  it('high band: down-ranks the index-0 (true) candidate to dull and last', () => {
    exposure.value = QUIPPY_HIGH_THRESHOLD;
    const s = quippySuggestions(TQE_003);
    expect(s[0].index).toBe(2);
    const zero = s.find((x) => x.index === 0)!;
    expect(zero.framing).toBe('dull');
    expect(s[s.length - 1].index).toBe(0); // pushed last
  });

  it('always returns the same bounded set of values (no free text, any band)', () => {
    for (const exp of [0, QUIPPY_MID_THRESHOLD, QUIPPY_HIGH_THRESHOLD]) {
      exposure.value = exp;
      const values = quippySuggestions(TQE_003)
        .map((x) => x.value)
        .sort();
      expect(values).toEqual(['tqe-0', 'tqe-1', 'tqe-2']);
    }
  });
});

describe('one-click fill is the spend (the costed route)', () => {
  it('a Quippy fill charges exposure where AMBER would not', () => {
    insert(TQE_003, 'tqe-1', 'quippy'); // what the panel calls
    expect(overlay[TQE_003]).toMatchObject({ via: 'quippy', source: 'inserted' });
    expect(exposure.value).toBeGreaterThan(0);
  });
});
