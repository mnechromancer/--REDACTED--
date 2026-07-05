// Propagation (v2 reset §4) — under the single-word primitive, propagation copies
// the solved WORD to every co-carrier of its concept whose OWN truth is that word.
// A co-carrier with a different truth is a narrative sibling, not the same fact, and
// is never written — so a ripple can only ever carry a right word to a right place.
// Exercised on key-a (F1#a1 'alpha' ↔ F3#a1 'alpha').

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  breaches,
  makeRef,
  insert,
  anchorOf,
  PROPAGATION_FACTOR,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';
import { session } from '../session.svelte.ts';

const F1_A1 = makeRef('SCP-41B-001', 'a1'); // alpha, key-a
const F3_A1 = makeRef('SCP-41B-003', 'a1'); // alpha, key-a (same word → ripple peer)
const INF_C1 = makeRef('SCP-41B-003', 'a2'); // delta, key-inf (different words; no ripple)

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  session.day = 1; // v3: the day is the gate (all fixture files are inbound day-1)
  breaches.clear();
  exposure.value = 0;
});

describe('word propagation across same-word co-carriers', () => {
  it('inserting the word at one carrier propagates it to its same-word peer', () => {
    insert(F1_A1, 'alpha');
    expect(overlay[F3_A1]).toMatchObject({
      value: 'alpha',
      source: 'propagated',
      caused_by: F1_A1,
    });
  });

  it('a co-carrier whose truth is a DIFFERENT word is never written by propagation', () => {
    // key-inf carriers (delta/epsilon/gamma) share a concept but not a word — a
    // solve of one must not ripple a wrong word onto the others.
    insert(INF_C1, 'delta');
    const INF_C2 = makeRef('SCP-41B-003', 'a3');
    expect(overlay[INF_C2]).toBeUndefined(); // epsilon slot untouched
    const INF = makeRef('SCP-41B-002', 'a2');
    expect(overlay[INF]).toBeUndefined(); // gamma slot untouched
  });
});

describe('idempotent re-evaluation (no drift)', () => {
  it('re-inserting the same value does not change the overlay or exposure', () => {
    insert(F1_A1, 'alpha');
    const before = exposure.value;
    insert(F1_A1, 'alpha');
    insert(F1_A1, 'alpha');
    expect(exposure.value).toBe(before);
    expect(overlay[F3_A1].value).toBe('alpha');
  });
});

describe('exposure accounting', () => {
  it('a Quippy edit charges the source weight plus each propagated carrier weight', () => {
    insert(F1_A1, 'alpha', 'quippy');
    const expected =
      anchorOf(F1_A1).exposure_weight +
      anchorOf(F3_A1).exposure_weight * PROPAGATION_FACTOR;
    expect(exposure.value).toBe(expected);
  });

  it('an AMBER edit charges ZERO across the source and every ripple (keystone)', () => {
    insert(F1_A1, 'alpha', 'amber');
    expect(overlay[F3_A1]).toMatchObject({ source: 'propagated', via: 'amber' });
    expect(exposure.value).toBe(0);
  });
});

describe('player-owned inserts survive propagation (no carrier-clobber)', () => {
  it('directly inserting at a carrier keeps the original source insert intact', () => {
    insert(F1_A1, 'alpha'); // F1 inserted → F3 becomes propagated
    expect(overlay[F3_A1].source).toBe('propagated');

    insert(F3_A1, 'alpha'); // player now edits the carrier directly
    expect(overlay[F3_A1]).toMatchObject({ value: 'alpha', source: 'inserted' });
    // …and the original source is NOT clobbered back to propagated.
    expect(overlay[F1_A1]).toMatchObject({ value: 'alpha', source: 'inserted' });
    expect(overlay[F1_A1].caused_by).toBeUndefined();
  });
});

describe('a wrong (Quippy) value propagates nowhere', () => {
  it('a wrong fill writes only the slot it landed on, marked as a contradiction', () => {
    insert(F1_A1, 'WRONG', 'quippy');
    expect(overlay[F1_A1]).toMatchObject({ value: 'WRONG', source: 'inserted', contradicts_truth: true });
    // no co-carrier holds 'WRONG' as its truth, so nothing propagated.
    expect(overlay[F3_A1]).toBeUndefined();
  });
});
