// Step 1 + Step 2 (handoff_amber_build.md) — the `via` provenance thread and the
// exposure re-aim, which together are the DESIGN KEYSTONE (design_document.md §3,
// R§6.4): unredaction has two routes, and only Quippy spends. A full corpus solved
// via AMBER ends at exposure 0 (no breach possible); the same solved via Quippy
// reproduces the legacy exposure curve. If this does not hold, the design is broken.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  revealedTruth,
  clearance,
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
  revealedTruth.clear();
  exposure.value = 0;
  clearance.tier = 1;
});

const TQE_003 = makeRef('SCP-41B-003', 'a1'); // the-quiet-exchange source
const TQE_001 = makeRef('SCP-41B-001', 'a1'); // its carrier
const LOCAL = makeRef('SCP-41B-003', 'a2'); // concept-less

describe('Step 1 — via stamped on the insert AND every propagated ripple', () => {
  it('a quippy insert that propagates to a carrier yields all-quippy entries', () => {
    const propagated = insert(TQE_003, 'tqe-1', 'quippy');
    expect(propagated).toEqual([TQE_001]); // one carrier (003↔001)
    expect(overlay[TQE_003]).toMatchObject({ source: 'inserted', via: 'quippy' });
    expect(overlay[TQE_001]).toMatchObject({ source: 'propagated', via: 'quippy' });
    const b = boardState();
    expect(b.viaQuippy).toBe(2); // the insert + its ripple
    expect(b.viaAmber).toBe(0);
  });

  it('an amber insert that propagates marks the ripple amber too', () => {
    insert(TQE_003, 'tqe-1', 'amber');
    expect(overlay[TQE_003].via).toBe('amber');
    expect(overlay[TQE_001].via).toBe('amber');
    const b = boardState();
    expect(b.viaAmber).toBe(2);
    expect(b.viaQuippy).toBe(0);
  });

  it('a concept-less amber insert stamps exactly one amber entry', () => {
    insert(LOCAL, 'loc-1', 'amber');
    const b = boardState();
    expect(b.viaAmber).toBe(1);
    expect(b.viaQuippy).toBe(0);
  });
});

// The candidate at index 0 on every carrier — a value insertable everywhere.
// (fixtures keep concept partners index-aligned, so index 0 maps cleanly.)
function index0Of(ref: string): string {
  return anchorOf(ref).mutations[0];
}

/** Solve every slot in the corpus via the given route, returns the slot count. */
function solveWholeCorpus(via: 'amber' | 'quippy'): number {
  let n = 0;
  for (const ref of allRefs()) {
    insert(ref, index0Of(ref), via);
    n++;
  }
  return n;
}

describe('Step 2 — the keystone: AMBER costs zero, Quippy reproduces the curve', () => {
  it('a full corpus solved entirely via AMBER ends at exposure 0', () => {
    const n = solveWholeCorpus('amber');
    expect(n).toBeGreaterThan(0);
    // every slot filled…
    expect(boardState().filled).toBe(n);
    // …and not one unit of exposure spent. No breach is reachable on this path.
    expect(exposure.value).toBe(0);
  });

  it('a full corpus solved entirely via Quippy charges the sum of every weight', () => {
    solveWholeCorpus('quippy');
    // Every live overlay entry contributes; since we inserted at every slot, each
    // is source 'inserted' and charges its own weight (propagation only re-wrote
    // carriers we then overwrote with our own insert). The total is the sum of all
    // anchor weights — the legacy "everything charged" curve.
    const expected = allRefs().reduce((sum, ref) => sum + anchorOf(ref).exposure_weight, 0);
    expect(exposure.value).toBe(expected);
    expect(boardState().viaQuippy).toBe(allRefs().length);
  });

  it('the same propagation costs zero via AMBER and a positive curve via Quippy', () => {
    // AMBER route
    insert(TQE_003, 'tqe-1', 'amber');
    const amberExposure = exposure.value;
    // reset and run the identical edit via Quippy
    for (const k of Object.keys(overlay)) delete overlay[k];
    exposure.value = 0;
    insert(TQE_003, 'tqe-1', 'quippy');
    const quippyExposure = exposure.value;

    expect(amberExposure).toBe(0);
    expect(quippyExposure).toBe(
      anchorOf(TQE_003).exposure_weight + anchorOf(TQE_001).exposure_weight * PROPAGATION_FACTOR,
    );
    expect(quippyExposure).toBeGreaterThan(amberExposure);
  });
});
