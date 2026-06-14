// C7t — clearance-gated reveal. Reveal model (reconciled with the citation gate,
// 2026-06-13 — "spec reveal, scoped to open files", technical_document.md §5):
// reaching a tier reveals in-tier truth for slots in ACCESSIBLE files
// (file.clearance <= tier), filled or not — this is what SEEDS the AMBER citation
// gate (a clearance-revealed co-carrier is the only non-circular evidence). The
// load-bearing half of invariant #4 still holds: the reveal writes NO overlay
// entry (it never volunteers a value INTO the player's guess layer); and a
// not-yet-met file (locked by its baseline clearance) is not pre-revealed.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  revealedTruth,
  clearance,
  exposure,
  breaches,
  makeRef,
  insert,
  raiseClearance,
  resolveSlot,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';

// Fixture redaction levels: 003#a1=3, 003#a2=2, 001#a1=2, 001#a2=3, 002#a1=2.
// Fixture file clearances: 003=2, 001=1, 002=1.
const LVL2 = [
  makeRef('SCP-41B-003', 'a2'),
  makeRef('SCP-41B-001', 'a1'),
  makeRef('SCP-41B-002', 'a1'),
];
const LVL3 = [makeRef('SCP-41B-003', 'a1'), makeRef('SCP-41B-001', 'a2')];

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  revealedTruth.clear();
  breaches.clear();
  clearance.tier = 1;
  exposure.value = 0;
});

describe('reveal keyed to tier (accessible files; filled or not)', () => {
  it('reveals every in-tier slot in accessible files, filled or untouched', () => {
    // At tier 2 all three files are accessible (clearances 1/1/2). The level-≤2
    // slots reveal whether or not the player filled them — this seeds citations.
    insert(makeRef('SCP-41B-001', 'a1'), 'tqe-0', 'amber'); // fill one
    const batch = raiseClearance(2);
    expect(new Set(batch)).toEqual(new Set(LVL2));
    for (const ref of LVL2) expect(revealedTruth.has(ref)).toBe(true);
    for (const ref of LVL3) expect(revealedTruth.has(ref)).toBe(false); // above tier
  });

  it('does NOT reveal slots of a file the tier has not yet opened', () => {
    // 003 has baseline clearance 2; at tier 1 it is locked, so its level-≤1 slots
    // (none here, but the guard is what matters) are not pre-revealed. Concretely:
    // at tier 1 only 001/002 are accessible, and neither has a level-1 slot, so the
    // batch is empty — and 003's slots stay hidden.
    const batch = raiseClearance(1);
    expect(batch).toEqual([]);
    for (const a of ['a1', 'a2']) {
      expect(revealedTruth.has(makeRef('SCP-41B-003', a))).toBe(false);
    }
  });

  it('a later raise reveals only the newly-in-reach in-tier delta', () => {
    raiseClearance(2); // reveals the LVL2 set
    const batch3 = raiseClearance(3);
    expect(new Set(batch3)).toEqual(new Set(LVL3)); // the level-3 delta
  });

  it('holding or lowering the tier reveals nothing new', () => {
    raiseClearance(3);
    expect(raiseClearance(3)).toEqual([]);
    expect(raiseClearance(1)).toEqual([]); // cannot un-reveal or re-batch
  });

  it('revealing writes NO overlay entry (invariant #4, load-bearing half)', () => {
    const before = Object.keys(overlay).length;
    raiseClearance(5);
    expect(Object.keys(overlay).length).toBe(before);
  });

  // Property: a slot's truth is never revealed while its redaction_level exceeds
  // the current tier — the anti-leak invariant, unchanged.
  it('property: no slot above the current tier is ever revealed', () => {
    for (const tier of [1, 2, 3, 4, 5] as const) {
      loadCorpus(makeCorpus());
      revealedTruth.clear();
      clearance.tier = 1;
      raiseClearance(tier);
      for (const file of Object.values(makeCorpus())) {
        for (const a of file.anchors) {
          const ref = makeRef(file.item, a.id);
          if (a.redaction_level > tier) {
            expect(revealedTruth.has(ref)).toBe(false);
          }
        }
      }
    }
  });
});

describe('contradiction surfacing (confirms wrongness, not the answer)', () => {
  it('flips an inserted wrong guess to truth-contradiction on reveal', () => {
    const ref = makeRef('SCP-41B-001', 'a1'); // level 2, truth tqe-truth-001
    insert(ref, 'tqe-0', 'amber'); // a wrong candidate
    raiseClearance(2);
    const s = resolveSlot(ref);
    expect(s.state).toBe('truth-contradiction');
    expect(overlay[ref].contradicts_truth).toBe(true);
  });

  it('a revealed untouched slot shows truth in the pane but stays unrestored', () => {
    // 003#a2 is level 2, never guessed: clearance reveals its truth in the pane,
    // but no overlay entry is written — the player must still restore it.
    raiseClearance(2);
    const ref = makeRef('SCP-41B-003', 'a2');
    expect(overlay[ref]).toBeUndefined(); // no guess written
    expect(revealedTruth.has(ref)).toBe(true); // truth shown
    expect(resolveSlot(ref).state).toBe('revealed');
  });
});
