// C6t — concept-keyed propagation. Properties from technical_document.md §4:
// index-aligned mapping, idempotent re-evaluation (no drift), and that no free
// text ever enters propagation. Exercised on the trio fixture's two seams
// (the-quiet-exchange: 003↔001; acquisition-lot: 001↔002).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  makeRef,
  insert,
  mapMutation,
  anchorOf,
  PROPAGATION_FACTOR,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';

const TQE_003 = makeRef('SCP-41B-003', 'a1'); // the-quiet-exchange source
const TQE_001 = makeRef('SCP-41B-001', 'a1'); // its index-aligned carrier
const LOT_001 = makeRef('SCP-41B-001', 'a2'); // acquisition-lot source
const LOT_002 = makeRef('SCP-41B-002', 'a1'); // its carrier

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  exposure.value = 0;
});

describe('index-aligned mapping', () => {
  it('inserting candidate k at the source sets candidate k at every carrier', () => {
    insert(TQE_003, 'tqe-1'); // index 1
    expect(overlay[TQE_001]).toMatchObject({
      value: 'tqe-1',
      source: 'propagated',
      caused_by: TQE_003,
    });
  });

  it('mapMutation maps by position, not by string identity', () => {
    insert(TQE_003, 'tqe-2');
    expect(mapMutation(TQE_003, anchorOf(TQE_001))).toBe('tqe-2');
  });

  // Property: for every candidate index, the carrier mirrors that index.
  it('property: every index maps to the same index across the seam', () => {
    const src = anchorOf(TQE_003).mutations;
    for (let k = 0; k < src.length; k++) {
      insert(TQE_003, src[k]);
      expect(overlay[TQE_001].value).toBe(anchorOf(TQE_001).mutations[k]);
    }
  });

  it('propagates across a different seam independently (acquisition-lot)', () => {
    insert(LOT_001, 'lot-1');
    expect(overlay[LOT_002]).toMatchObject({ value: 'lot-1', source: 'propagated', caused_by: LOT_001 });
  });
});

describe('idempotent re-evaluation (no drift)', () => {
  it('re-inserting the same source value does not change the overlay or exposure', () => {
    insert(TQE_003, 'tqe-1');
    const before = exposure.value;
    insert(TQE_003, 'tqe-1');
    insert(TQE_003, 'tqe-1');
    expect(exposure.value).toBe(before);
    expect(overlay[TQE_001].value).toBe('tqe-1');
  });

  it('changing the source value moves the carrier instead of layering edits', () => {
    insert(TQE_003, 'tqe-0');
    insert(TQE_003, 'tqe-2');
    expect(overlay[TQE_001].value).toBe('tqe-2');
    // exposure reflects the current overlay: source weight + carrier weight, once
    const expected =
      anchorOf(TQE_003).exposure_weight +
      anchorOf(TQE_001).exposure_weight * PROPAGATION_FACTOR;
    expect(exposure.value).toBe(expected);
  });

  // Property: N re-evaluations of one source value yield a fixed exposure.
  it('property: repeated re-evaluation is a fixed point for exposure', () => {
    insert(TQE_003, 'tqe-1');
    const fixed = exposure.value;
    for (let n = 0; n < 8; n++) {
      insert(TQE_003, 'tqe-1');
      expect(exposure.value).toBe(fixed);
    }
  });
});

describe('exposure accounting', () => {
  it('charges the source weight plus each propagated carrier weight', () => {
    insert(TQE_003, 'tqe-1');
    const expected =
      anchorOf(TQE_003).exposure_weight +
      anchorOf(TQE_001).exposure_weight * PROPAGATION_FACTOR;
    expect(exposure.value).toBe(expected);
  });
});

describe('no free text enters propagation (invariant 3)', () => {
  it('a rejected source insert produces no propagated carriers', () => {
    expect(() => insert(TQE_003, 'free text')).toThrow(/not an authored candidate/);
    expect(overlay[TQE_001]).toBeUndefined();
    expect(exposure.value).toBe(0);
  });

  // Property: every value that ever lands in the overlay is an authored
  // candidate of its own anchor — propagation can only emit authored strings.
  it('property: all overlay values are authored candidates of their anchor', () => {
    insert(TQE_003, 'tqe-2');
    insert(LOT_001, 'lot-0');
    for (const [ref, entry] of Object.entries(overlay)) {
      expect(anchorOf(ref).mutations).toContain(entry.value);
    }
  });
});
