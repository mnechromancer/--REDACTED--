// Step 6 keystone, end to end: a properly index-aligned corpus is fully solvable
// to the TRUE ending via AMBER's citation gate alone, reaching exposure 0 and
// 'loop-broken'; the same corpus solved via Quippy reaches a breach. This proves
// the whole mechanic chain — clearance reveal → citation → cited commit →
// propagation → no-Quippy ending — not just the units. (The real authored trio's
// content alignment is a separate lore-track concern; this isolates the engine.)

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  revealedTruth,
  clearance,
  breaches,
  makeRef,
  insert,
  commitWithCitations,
  raiseClearance,
  endState,
} from '../game.svelte.ts';
import type { Corpus } from '../corpus.ts';

// Two files sharing one concept ('link'), truth index-aligned at index 0 on both
// carriers (the registry discipline: index 0 = the mundane truth). Plus a separate
// excluded self-file. File clearance 1, slots redaction_level 2, so reaching L2
// reveals both carriers' truth — seeding citations.
function makeAlignedCorpus(): Corpus {
  const carrier = (item: string, w: number) => ({
    item,
    object_class: 'Euclid',
    site: 'Site-41B',
    clearance: 1 as const,
    entity_self: false,
    xrefs: [],
    breach_effect: { kind: 'corrupt_search' as const },
    anchors: [
      {
        id: 'a1',
        slot_type: 'object' as const,
        truth: 'link-truth', // index 0
        redaction_level: 2 as const,
        concept: 'link',
        mutations: ['link-truth', 'link-wrong'],
        exposure_weight: w,
      },
    ],
    body: 'shares ⟦a1⟧',
  });
  const c: Corpus = {
    'SCP-41B-001': carrier('SCP-41B-001', 2),
    'SCP-41B-002': carrier('SCP-41B-002', 2),
    'SCP-41B-000': {
      item: 'SCP-41B-000', object_class: 'Euclid', site: 'Site-41B', clearance: 5,
      entity_self: true, xrefs: [], breach_effect: { kind: 'corrupt_search' },
      anchors: [
        { id: 'z', slot_type: 'object', truth: 'z', redaction_level: 5, mutations: ['z'], exposure_weight: 1 },
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
  makeAlignedCorpus();
  for (const k of Object.keys(overlay)) delete overlay[k];
  revealedTruth.clear();
  breaches.clear();
  exposure.value = 0;
  clearance.tier = 1;
});

describe('THE TRUE ENDING via AMBER, end to end', () => {
  it('clearance reveal → cite → commit → propagate → loop-broken at exposure 0', () => {
    // 1. Raise clearance: reveals both carriers' truth (index 0) in the pane.
    raiseClearance(2);
    expect(revealedTruth.has(C1)).toBe(true);
    expect(revealedTruth.has(C2)).toBe(true);

    // 2. AMBER-commit C1, citing C2 (its revealed truth reads index 0).
    const r1 = commitWithCitations(C1, 'link-truth', [C2]);
    expect(r1.ok).toBe(true);
    expect(overlay[C1]).toMatchObject({ via: 'amber', source: 'inserted' });

    // 3. AMBER-commit C2, citing C1 (now player-solved at index 0).
    const r2 = commitWithCitations(C2, 'link-truth', [C1]);
    expect(r2.ok).toBe(true);

    // 4. The whole (non-self) record is restored, by hand, zero Quippy, +0 exposure.
    const e = endState();
    expect(e.outcome).toBe('loop-broken');
    expect(e.restored).toBe(e.total);
    expect(e.quippyAssists).toBe(0);
    expect(exposure.value).toBe(0);
    expect(breaches.size).toBe(0);
  });

  it('a player-solved co-carrier seeds the citation chain (no clearance needed for the 2nd)', () => {
    // Even before revealing C1, once C2 is solved it corroborates C1.
    raiseClearance(2); // reveal both (so C2 is solvable)
    commitWithCitations(C2, 'link-truth', [C1]); // C1 revealed-truth corroborates
    // now C1 cites the player-solved C2:
    const r = commitWithCitations(C1, 'link-truth', [C2]);
    expect(r.ok).toBe(true);
    expect(r.citedBy).toEqual([C2]);
  });
});

describe('the same corpus via Quippy reaches a breach (the costed route)', () => {
  it('one-click filling every slot drives exposure and breaches', () => {
    insert(C1, 'link-truth', 'quippy');
    insert(C2, 'link-truth', 'quippy');
    raiseClearance(2);
    const e = endState();
    expect(e.quippyAssists).toBeGreaterThan(0);
    // exposure rose (Quippy route) where AMBER would have stayed at 0
    expect(exposure.value).toBeGreaterThan(0);
    expect(e.outcome).not.toBe('loop-broken'); // tainted: the true ending is foreclosed
  });
});
