// Step 6 keystone, end to end (v2 reset): a teaching-grounded corpus is fully
// solvable to the TRUE ending via AMBER's citation gate alone, reaching exposure 0
// and 'loop-broken'; the same corpus via Quippy is tainted/breaches. Proves the whole
// chain — reachability → teaching cite → cited commit → propagation → no-Quippy
// ending — on a synthetic corpus, isolating the engine from the authored content.

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
  commitWithCitations,
  endState,
} from '../game.svelte.ts';
import type { Corpus } from '../corpus.ts';

// Two files that mutually teaching-ground: F1#a1 'aaa' appears in the clear in F2's
// body; F2#a1 'bbb' appears in F1's body. Each cites the other. Plus an excluded
// self-file. Seed F1; F1 xrefs F2 → both reachable.
function makeGroundedCorpus(): Corpus {
  const c: Corpus = {
    'SCP-41B-001': {
      item: 'SCP-41B-001', object_class: 'Safe', site: 'Site-41B',
      entity_self: false, xrefs: ['SCP-41B-002'], breach_effect: { kind: 'corrupt_search' },
      anchors: [
        { id: 'a1', slot_type: 'object', truth: 'aaa', grounding: { kind: 'teaching', citeIn: ['SCP-41B-002'] }, concept: 'k1', exposure_weight: 2 },
      ],
      body: 'holds bbb and names ⟦a1⟧, see [[SCP-41B-002]].', // "bbb" grounds F2#a1
    },
    'SCP-41B-002': {
      item: 'SCP-41B-002', object_class: 'Safe', site: 'Site-41B',
      entity_self: false, xrefs: ['SCP-41B-001'], breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        { id: 'a1', slot_type: 'agent', truth: 'bbb', grounding: { kind: 'teaching', citeIn: ['SCP-41B-001'] }, concept: 'k2', exposure_weight: 2 },
      ],
      body: 'holds aaa and names ⟦a1⟧, see [[SCP-41B-001]].', // "aaa" grounds F1#a1
    },
    'SCP-41B-000': {
      item: 'SCP-41B-000', object_class: 'Keter', site: 'Site-41B',
      entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
      anchors: [
        { id: 'z', slot_type: 'object', truth: 'z', grounding: { kind: 'inference', threshold: 1 }, exposure_weight: 1 },
      ],
      body: '⟦z⟧',
    },
  };
  loadCorpus(c);
  return c;
}

const C1 = makeRef('SCP-41B-001', 'a1');
const C2 = makeRef('SCP-41B-002', 'a1');

beforeEach(() => {
  makeGroundedCorpus();
  for (const k of Object.keys(overlay)) delete overlay[k];
  seedReachable.clear();
  breaches.clear();
  exposure.value = 0;
  seedReach('SCP-41B-001'); // reaches F2 via xref
});

describe('THE TRUE ENDING via AMBER, end to end', () => {
  it('teaching cite → commit → loop-broken at exposure 0', () => {
    // C1 'aaa' is grounded by F2 (its body holds "aaa"); cite F2 and commit.
    const r1 = commitWithCitations(C1, 'aaa', ['SCP-41B-002']);
    expect(r1.ok).toBe(true);
    expect(overlay[C1]).toMatchObject({ via: 'amber', source: 'inserted' });

    // C2 'bbb' is grounded by F1 (its body holds "bbb"); cite F1 and commit.
    const r2 = commitWithCitations(C2, 'bbb', ['SCP-41B-001']);
    expect(r2.ok).toBe(true);

    const e = endState();
    expect(e.outcome).toBe('loop-broken');
    expect(e.restored).toBe(e.total);
    expect(e.quippyAssists).toBe(0);
    expect(exposure.value).toBe(0);
    expect(breaches.size).toBe(0);
  });

  it('the wrong word is refused even with a valid cite', () => {
    const r = commitWithCitations(C1, 'not-aaa', ['SCP-41B-002']);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong-word');
  });
});

describe('the same corpus via Quippy forecloses the win (the costed route)', () => {
  it('one-click filling every slot taints and raises exposure', () => {
    insert(C1, 'aaa', 'quippy');
    insert(C2, 'bbb', 'quippy');
    const e = endState();
    expect(e.quippyAssists).toBeGreaterThan(0);
    expect(exposure.value).toBeGreaterThan(0); // Quippy route spends where AMBER would not
    expect(e.outcome).not.toBe('loop-broken'); // tainted: the true ending is foreclosed
  });
});
