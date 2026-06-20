// Quippy's behaviour (quippy.svelte.ts, scp_x_bible.md §3–§4): the exposure bands,
// the costed one-click fill, and the escalatory-wrong-word tell (Phase 4 — Question F).
// A slot with no authored `lure` only ever offers the truth (costly, not wrong); a slot
// WITH a lure has Quippy lobby for it as exposure rises (down-ranking, then omitting, the
// true reading), per the §4 band table.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  breaches,
  seedReachable,
  seedReach,
  makeRef,
  anchorOf,
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

describe('the offer with NO lure (truth-only, merely costly)', () => {
  it('offers the one truth word', () => {
    const s = quippySuggestions(F1_A1);
    expect(s.map((x) => x.value)).toEqual(['alpha']);
  });

  it('frames the offer harder (recommended) as Quippy curdles', () => {
    expect(quippySuggestions(F1_A1)[0].framing).toBe('dull'); // low band: the boring true one
    exposure.value = QUIPPY_MID_THRESHOLD;
    expect(quippySuggestions(F1_A1)[0].framing).toBe('recommended');
  });
});

describe('the offer WITH a lure (the escalatory wrong-word tell, §4)', () => {
  // Give F1#a1 an authored lure so Quippy has a wrong reading to lobby for.
  beforeEach(() => {
    anchorOf(F1_A1).lure = 'omega'; // the escalatory WRONG word (truth is 'alpha')
  });

  it('low band: surfaces BOTH — the lure plain, the truth as the dull alternate', () => {
    const s = quippySuggestions(F1_A1);
    expect(s.map((x) => x.value)).toEqual(['omega', 'alpha']);
    expect(s[1].framing).toBe('dull'); // the true reading down-framed as boring
  });

  it('mid band: reorders so the lure is the RECOMMENDED reading, truth down-ranked', () => {
    exposure.value = QUIPPY_MID_THRESHOLD;
    const s = quippySuggestions(F1_A1);
    expect(s[0]).toEqual({ value: 'omega', framing: 'recommended' });
    expect(s.find((x) => x.value === 'alpha')?.framing).toBe('dull');
  });

  it('high band: OMITS the true reading entirely — only the lure remains', () => {
    exposure.value = QUIPPY_HIGH_THRESHOLD;
    const s = quippySuggestions(F1_A1);
    expect(s.map((x) => x.value)).toEqual(['omega']);
    expect(s[0].framing).toBe('recommended');
  });

  it('accepting the lure plants a wrong value: contradiction + extra exposure + taint', () => {
    insert(F1_A1, 'omega', 'quippy'); // the player trusts the high-band offer
    expect(overlay[F1_A1]).toMatchObject({ value: 'omega', via: 'quippy', contradicts_truth: true });
    // STRUCK_PENALTY makes a wrong Quippy fill cost more than a right one.
    expect(exposure.value).toBeGreaterThan(anchorOf(F1_A1).exposure_weight);
  });
});

describe('one-click fill is the spend (the costed route)', () => {
  it('a Quippy fill charges exposure where AMBER would not', () => {
    insert(F1_A1, 'alpha', 'quippy'); // what the panel calls
    expect(overlay[F1_A1]).toMatchObject({ via: 'quippy', source: 'inserted' });
    expect(exposure.value).toBeGreaterThan(0);
  });
});
