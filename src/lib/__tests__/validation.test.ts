// C7t — clearance-gated reconciliation. Per CLAUDE.md invariant #4 (chosen
// reading): an audit "confirms inserted guesses; it never volunteers an untouched
// slot's value." So raising clearance reconciles only the slots the player has
// FILLED and whose tier is now in reach — never an untouched slot, at any tier.
// Truth is still never revealed above the current tier; already-inserted guesses
// that contradict revealed truth flip to the contradiction state without the
// system stating the answer. (This replaced an earlier "reaching a tier reveals
// every in-tier slot" model, which made the staged onboarding pre-reveal a
// later file's slots before the player could guess them.)

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

describe('reconciliation keyed to tier (filled slots only)', () => {
  it('reconciles only FILLED in-tier slots, nothing untouched', () => {
    // Fill two of the three level-≤2 slots; leave the third untouched.
    insert(makeRef('SCP-41B-001', 'a1'), 'tqe-0'); // level 2
    insert(makeRef('SCP-41B-003', 'a2'), 'loc-0'); // level 2
    const untouched = makeRef('SCP-41B-002', 'a1'); // level 2, NOT filled
    const batch = raiseClearance(2);
    expect(new Set(batch)).toEqual(
      new Set([makeRef('SCP-41B-001', 'a1'), makeRef('SCP-41B-003', 'a2')]),
    );
    // the untouched in-tier slot is NOT reconciled
    expect(revealedTruth.has(untouched)).toBe(false);
    for (const ref of LVL3) expect(revealedTruth.has(ref)).toBe(false); // above tier
  });

  it('never reconciles an untouched slot, however high clearance climbs', () => {
    raiseClearance(5); // top clearance, but nothing filled
    for (const file of Object.values(makeCorpus())) {
      for (const a of file.anchors) {
        expect(revealedTruth.has(makeRef(file.item, a.id))).toBe(false);
      }
    }
  });

  it('a later raise reconciles only newly-in-reach FILLED slots', () => {
    // Use a concept-less slot so a single insert fills exactly one slot (no
    // propagation pulling extra carriers into the batch).
    insert(makeRef('SCP-41B-003', 'a2'), 'loc-0'); // level 2, concept-less
    insert(makeRef('SCP-41B-001', 'a2'), 'lot-0'); // level 3 (propagates to 002#a1, level 2)
    raiseClearance(2); // reconciles the level-2 fills (003#a2 and the propagated 002#a1)
    expect(revealedTruth.has(makeRef('SCP-41B-001', 'a2'))).toBe(false); // still above tier
    const batch3 = raiseClearance(3);
    expect(new Set(batch3)).toEqual(new Set([makeRef('SCP-41B-001', 'a2')])); // the level-3 delta
  });

  it('holding or lowering the tier reconciles nothing new', () => {
    insert(makeRef('SCP-41B-001', 'a2'), 'lot-0'); // level 3
    raiseClearance(3);
    expect(raiseClearance(3)).toEqual([]);
    expect(raiseClearance(1)).toEqual([]); // cannot un-reveal or re-batch
  });

  // Property: a slot's truth is never revealed while its redaction_level exceeds
  // the current tier — the anti-leak invariant, unchanged.
  it('property: no slot above the current tier is ever revealed', () => {
    for (const tier of [1, 2, 3, 4, 5] as const) {
      loadCorpus(makeCorpus());
      revealedTruth.clear();
      clearance.tier = 1;
      // fill every slot so tier is the only gate under test
      for (const file of Object.values(makeCorpus())) {
        for (const a of file.anchors) insert(makeRef(file.item, a.id), a.mutations[0]);
      }
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

  it('does NOT reveal an untouched in-tier slot — it stays redacted and fillable', () => {
    // 003#a2 is level 2 but was never guessed: clearance alone never reveals it,
    // so it stays redacted (the player must guess it to ever see its truth).
    raiseClearance(2);
    const ref = makeRef('SCP-41B-003', 'a2');
    expect(overlay[ref]).toBeUndefined(); // the system inserted no guess
    expect(revealedTruth.has(ref)).toBe(false); // not volunteered
    expect(resolveSlot(ref).state).toBe('redacted'); // still fillable
  });

  // Property: revealing truth never creates an overlay entry — the player's
  // guess layer is only ever written by the player's own inserts.
  it('property: raising clearance writes no overlay entries', () => {
    const before = Object.keys(overlay).length;
    raiseClearance(5);
    expect(Object.keys(overlay).length).toBe(before);
  });
});
