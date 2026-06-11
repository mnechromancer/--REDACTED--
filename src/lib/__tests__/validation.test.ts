// C7t — batched, clearance-gated truth reveal. Properties from
// technical_document.md §5 / design_document.md §5.7: reveal is batched per tier
// (never per-guess), truth is never volunteered for a slot above the current
// tier, and already-inserted guesses that contradict revealed truth flip to the
// contradiction state — without the system stating the right answer.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  revealedTruth,
  clearance,
  exposure,
  makeRef,
  insert,
  raiseClearance,
  resolveSlot,
  anchorOf,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';

// Redaction levels in the fixture: 003#a1=3, 003#a2=2, 001#a1=2, 001#a2=3,
// 002#a1=2. So tier 2 reveals the four level-≤2 slots; tier 3 adds the two
// level-3 slots.
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
  clearance.tier = 1;
  exposure.value = 0;
});

describe('batched reveal keyed to tier', () => {
  it('reveals exactly the in-tier batch, not slots above the tier', () => {
    const batch = raiseClearance(2);
    expect(new Set(batch)).toEqual(new Set(LVL2));
    for (const ref of LVL3) expect(revealedTruth.has(ref)).toBe(false);
  });

  it('a later raise reveals only the newly-unlocked tier, not the whole corpus again', () => {
    raiseClearance(2);
    const batch3 = raiseClearance(3);
    expect(new Set(batch3)).toEqual(new Set(LVL3)); // only the delta
  });

  it('holding or lowering the tier reveals nothing new', () => {
    raiseClearance(3);
    expect(raiseClearance(3)).toEqual([]);
    expect(raiseClearance(1)).toEqual([]); // cannot un-reveal or re-batch
  });

  // Property: a slot's truth is never revealed while its redaction_level exceeds
  // the current tier. This is the anti-leak invariant.
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
    insert(ref, 'tqe-0'); // a wrong candidate
    raiseClearance(2);
    const s = resolveSlot(ref);
    expect(s.state).toBe('truth-contradiction');
    expect(overlay[ref].contradicts_truth).toBe(true);
  });

  it('does NOT volunteer the truth of an untouched in-tier slot as a guess', () => {
    // 003#a2 is revealed at tier 2 but was never guessed: it shows as 'revealed'
    // (legitimate clearance read), and no overlay entry is fabricated for it.
    raiseClearance(2);
    const ref = makeRef('SCP-41B-003', 'a2');
    expect(overlay[ref]).toBeUndefined(); // the system inserted no guess
    expect(resolveSlot(ref).state).toBe('revealed');
  });

  // Property: revealing truth never creates an overlay entry — the player's
  // guess layer is only ever written by the player's own inserts.
  it('property: raising clearance writes no overlay entries', () => {
    const before = Object.keys(overlay).length;
    raiseClearance(5);
    expect(Object.keys(overlay).length).toBe(before);
  });
});
