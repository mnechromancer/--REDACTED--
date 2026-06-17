// Quippy's behaviour (quippy.svelte.ts, scp_x_bible.md §3–§4): the exposure bands
// and the costed one-click fill. v2 reset: there is no candidate set to reorder —
// Quippy offers the one truth word and fills it at cost. The escalatory-wrong-word
// tell is deferred past Phase 1 (open F).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  breaches,
  seedReachable,
  seedReach,
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

const F1_A1 = makeRef('SCP-41B-001', 'a1'); // truth 'alpha'

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  seedReachable.clear();
  breaches.clear();
  exposure.value = 0;
  seedReach('SCP-41B-001');
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

describe('the single-word offer', () => {
  it('offers the one truth word', () => {
    const s = quippySuggestions(F1_A1);
    expect(s.map((x) => x.value)).toEqual(['alpha']);
  });

  it('frames the offer harder (recommended) as Quippy curdles', () => {
    expect(quippySuggestions(F1_A1)[0].framing).toBe('plain'); // low band
    exposure.value = QUIPPY_MID_THRESHOLD;
    expect(quippySuggestions(F1_A1)[0].framing).toBe('recommended');
  });
});

describe('one-click fill is the spend (the costed route)', () => {
  it('a Quippy fill charges exposure where AMBER would not', () => {
    insert(F1_A1, 'alpha', 'quippy'); // what the panel calls
    expect(overlay[F1_A1]).toMatchObject({ via: 'quippy', source: 'inserted' });
    expect(exposure.value).toBeGreaterThan(0);
  });
});
