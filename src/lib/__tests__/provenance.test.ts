// The `via` provenance thread + exposure re-aim — the DESIGN KEYSTONE
// (design_document.md §3, R§6.4): unredaction has two routes, only Quippy spends. A
// full corpus solved via AMBER ends at exposure 0 (no breach possible); the same
// solved via Quippy reproduces the legacy exposure curve.

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
  anchorOf,
  boardState,
  allRefs,
  PROPAGATION_FACTOR,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  seedReachable.clear();
  breaches.clear();
  exposure.value = 0;
  seedReach('SCP-41B-001');
});

const F1_A1 = makeRef('SCP-41B-001', 'a1'); // alpha, key-a
const F3_A1 = makeRef('SCP-41B-003', 'a1'); // alpha, key-a (same-word ripple peer)
const F2_A1 = makeRef('SCP-41B-002', 'a1'); // beta, key-b (sole carrier)

describe('via stamped on the insert AND every propagated ripple', () => {
  it('a quippy insert that propagates to a same-word peer yields all-quippy entries', () => {
    const propagated = insert(F1_A1, 'alpha', 'quippy');
    expect(propagated).toEqual([F3_A1]); // one same-word peer
    expect(overlay[F1_A1]).toMatchObject({ source: 'inserted', via: 'quippy' });
    expect(overlay[F3_A1]).toMatchObject({ source: 'propagated', via: 'quippy' });
    const b = boardState();
    expect(b.viaQuippy).toBe(2); // the insert + its ripple
    expect(b.viaAmber).toBe(0);
  });

  it('an amber insert that propagates marks the ripple amber too', () => {
    insert(F1_A1, 'alpha', 'amber');
    expect(overlay[F1_A1].via).toBe('amber');
    expect(overlay[F3_A1].via).toBe('amber');
    const b = boardState();
    expect(b.viaAmber).toBe(2);
    expect(b.viaQuippy).toBe(0);
  });

  it('a sole-carrier amber insert stamps exactly one amber entry', () => {
    insert(F2_A1, 'beta', 'amber'); // key-b has no other carrier → no ripple
    const b = boardState();
    expect(b.viaAmber).toBe(1);
    expect(b.viaQuippy).toBe(0);
  });
});

/** Solve every slot in the corpus to its truth word via the given route. */
function solveWholeCorpus(via: 'amber' | 'quippy'): number {
  let n = 0;
  for (const ref of allRefs()) {
    insert(ref, anchorOf(ref).truth, via);
    n++;
  }
  return n;
}

describe('the keystone: AMBER costs zero, Quippy reproduces the curve', () => {
  it('a full corpus solved entirely via AMBER ends at exposure 0', () => {
    const n = solveWholeCorpus('amber');
    expect(n).toBeGreaterThan(0);
    expect(boardState().filled).toBe(n);
    expect(exposure.value).toBe(0); // not one unit spent — no breach reachable here
  });

  it('a full corpus solved entirely via Quippy charges the sum of every weight', () => {
    solveWholeCorpus('quippy');
    // every slot inserted to its truth (correct, so no struck penalty) → sum of weights.
    const expected = allRefs().reduce((sum, ref) => sum + anchorOf(ref).exposure_weight, 0);
    expect(exposure.value).toBe(expected);
    expect(boardState().viaQuippy).toBe(allRefs().length);
  });

  it('the same propagation costs zero via AMBER and a positive curve via Quippy', () => {
    insert(F1_A1, 'alpha', 'amber');
    const amberExposure = exposure.value;
    for (const k of Object.keys(overlay)) delete overlay[k];
    exposure.value = 0;
    insert(F1_A1, 'alpha', 'quippy');
    const quippyExposure = exposure.value;

    expect(amberExposure).toBe(0);
    expect(quippyExposure).toBe(
      anchorOf(F1_A1).exposure_weight + anchorOf(F3_A1).exposure_weight * PROPAGATION_FACTOR,
    );
    expect(quippyExposure).toBeGreaterThan(amberExposure);
  });
});
