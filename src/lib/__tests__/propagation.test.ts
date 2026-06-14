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
    insert(TQE_003, 'tqe-0', 'quippy');
    insert(TQE_003, 'tqe-2', 'quippy');
    expect(overlay[TQE_001].value).toBe('tqe-2');
    // exposure reflects the current overlay: source weight + carrier weight, once
    // (Quippy route, since only Quippy reliance spends — R§6.4)
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
  it('a Quippy edit charges the source weight plus each propagated carrier weight', () => {
    insert(TQE_003, 'tqe-1', 'quippy');
    const expected =
      anchorOf(TQE_003).exposure_weight +
      anchorOf(TQE_001).exposure_weight * PROPAGATION_FACTOR;
    expect(exposure.value).toBe(expected);
  });

  it('an AMBER edit charges ZERO across the source and every ripple (keystone)', () => {
    insert(TQE_003, 'tqe-1', 'amber');
    expect(overlay[TQE_001]).toMatchObject({ source: 'propagated', via: 'amber' });
    expect(exposure.value).toBe(0);
  });
});

describe('player-owned inserts survive propagation (no carrier-clobber)', () => {
  // HelpUtility offers candidate buttons on every slot, including a propagated
  // carrier, so the player can directly insert at a slot that is also another
  // slot's propagation sink. Propagation must never demote such a player insert
  // back to 'propagated' or invert its provenance.
  it('directly inserting at a carrier keeps the original source insert intact', () => {
    insert(TQE_003, 'tqe-1'); // 003 inserted → 001 becomes propagated(caused_by=003)
    expect(overlay[TQE_001].source).toBe('propagated');

    insert(TQE_001, 'tqe-2'); // player now edits the carrier directly
    // The carrier is now the player's own inserted edit…
    expect(overlay[TQE_001]).toMatchObject({ value: 'tqe-2', source: 'inserted' });
    // …and the original source is NOT clobbered back to propagated.
    expect(overlay[TQE_003]).toMatchObject({ value: 'tqe-1', source: 'inserted' });
    expect(overlay[TQE_003].caused_by).toBeUndefined();
  });

  it('re-editing the source still moves a carrier that is only propagated', () => {
    insert(TQE_003, 'tqe-0');
    insert(TQE_003, 'tqe-2'); // carrier was never independently inserted → still tracks
    expect(overlay[TQE_001]).toMatchObject({ value: 'tqe-2', source: 'propagated' });
  });

  it('editing one concept does not disturb a peer the player set in another', () => {
    // 001 participates in BOTH the-quiet-exchange (a1) and acquisition-lot (a2).
    insert(LOT_001, 'lot-1'); // 001#a2 inserted → 002#a1 propagated
    expect(overlay[LOT_001].source).toBe('inserted');

    insert(TQE_003, 'tqe-1'); // edits 001#a1 via propagation, a different anchor
    expect(overlay[TQE_001].source).toBe('propagated'); // a1 carrier moves
    expect(overlay[LOT_001]).toMatchObject({ value: 'lot-1', source: 'inserted' }); // a2 untouched
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
