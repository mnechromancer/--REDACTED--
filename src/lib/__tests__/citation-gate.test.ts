// Step 3 (handoff_amber_build.md) — the citation-cost gate (technical_document.md
// §7.5, design_document.md §5.3). AMBER's manual unredaction: cite a corroborating
// co-carrier to commit, via=amber, exposure +0. The six required cases plus the
// orphan-slot fallback decision (clearance-reveal only).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  revealedTruth,
  clearance,
  makeRef,
  insert,
  corroborates,
  commitWithCitations,
  isOrphanSlot,
  anchorOf,
  CITATIONS_REQUIRED,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';

// the-quiet-exchange seam: 003#a1 ↔ 001#a1 (index-aligned mutations tqe-0/1/2).
const TQE_003 = makeRef('SCP-41B-003', 'a1');
const TQE_001 = makeRef('SCP-41B-001', 'a1');
// acquisition-lot seam: 001#a2 ↔ 002#a1.
const LOT_001 = makeRef('SCP-41B-001', 'a2');
const LOT_002 = makeRef('SCP-41B-002', 'a1');
// concept-less orphan slot.
const LOCAL = makeRef('SCP-41B-003', 'a2');

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  revealedTruth.clear();
  exposure.value = 0;
  clearance.tier = 1;
});

// Make a chosen index the *truth* at a citation so a clearance reveal corroborates
// it. The base fixture's truths aren't candidates; rewrite one carrier's truth to
// its index-k candidate, then reload.
function makeTruthIndex(ref: string, k: number) {
  const c = makeCorpus();
  const { item, anchorId } = { item: ref.split('#')[0], anchorId: ref.split('#')[1] };
  const a = c[item].anchors.find((x) => x.id === anchorId)!;
  a.truth = a.mutations[k];
  loadCorpus(c);
}

describe('corroborates — what counts as evidence (§7.5)', () => {
  it('(a) a clearance-revealed co-carrier reading index k corroborates', () => {
    makeTruthIndex(TQE_001, 1); // 001#a1 truth := tqe-1
    revealedTruth.add(TQE_001); // clearance has shown it
    expect(corroborates(TQE_001, TQE_003, 1)).toBe(true);
  });

  it('(b) a co-carrier the player solved at index k corroborates', () => {
    insert(TQE_001, 'tqe-2', 'amber'); // player-solved at index 2
    expect(corroborates(TQE_001, TQE_003, 2)).toBe(true);
  });

  it('(c) a co-carrier holding a PROPAGATED index-k value does NOT corroborate', () => {
    // Solve LOT_001 so 001 has a real insert, then propagate TQE into 001#a1 by
    // editing 003#a1 — 001#a1 becomes propagated, which must not corroborate.
    insert(TQE_003, 'tqe-1', 'amber'); // 003#a1 inserted → 001#a1 propagated(tqe-1)
    expect(overlay[TQE_001].source).toBe('propagated');
    expect(corroborates(TQE_001, TQE_003, 1)).toBe(false);
  });

  it('(d) a co-carrier reading a DIFFERENT index does not corroborate index k', () => {
    insert(TQE_001, 'tqe-0', 'amber'); // solved at index 0
    expect(corroborates(TQE_001, TQE_003, 2)).toBe(false); // citing it for index 2 fails
  });

  it('a non-co-carrier (different concept) never corroborates', () => {
    insert(LOT_001, 'lot-1', 'amber');
    // LOT_001 carries acquisition-lot, not the-quiet-exchange
    expect(corroborates(LOT_001, TQE_003, 1)).toBe(false);
  });

  it('a slot cannot cite itself', () => {
    insert(TQE_003, 'tqe-1', 'amber');
    expect(corroborates(TQE_003, TQE_003, 1)).toBe(false);
  });
});

describe('commitWithCitations — the accept/reject boundary', () => {
  it('(e) no citation → rejected (uncorroborated), no write', () => {
    const r = commitWithCitations(TQE_003, 'tqe-1', []);
    expect(r).toEqual({ ok: false, reason: 'uncorroborated' });
    expect(overlay[TQE_003]).toBeUndefined();
    expect(exposure.value).toBe(0);
  });

  it('a rejected value not in the candidate set → not-a-candidate', () => {
    const r = commitWithCitations(TQE_003, 'made up', ['anything']);
    expect(r).toEqual({ ok: false, reason: 'not-a-candidate' });
    expect(overlay[TQE_003]).toBeUndefined();
  });

  it('a wrong citation (different index) is rejected', () => {
    insert(TQE_001, 'tqe-0', 'amber'); // co-carrier reads index 0
    const r = commitWithCitations(TQE_003, 'tqe-2', [TQE_001]); // cite it for index 2
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('uncorroborated');
  });

  it('a good citation accepts: via=amber and exposure stays zero', () => {
    insert(TQE_001, 'tqe-1', 'amber'); // solved at index 1
    const r = commitWithCitations(TQE_003, 'tqe-1', [TQE_001]);
    expect(r.ok).toBe(true);
    expect(r.citedBy).toEqual([TQE_001]);
    expect(overlay[TQE_003]).toMatchObject({ value: 'tqe-1', source: 'inserted', via: 'amber' });
    expect(exposure.value).toBe(0); // (f) accepted commit charges zero
  });

  it('(f) an accepted commit propagates, charging zero exposure on the ripple', () => {
    insert(LOT_002, 'lot-1', 'amber'); // co-carrier on the acquisition-lot seam, solved
    const r = commitWithCitations(LOT_001, 'lot-1', [LOT_002]);
    expect(r.ok).toBe(true);
    // LOT_001 inserted via amber; it has no OTHER carrier than LOT_002 (which is a
    // player insert and never clobbered), so propagatedTo is empty here — assert
    // exposure stayed zero across the commit regardless.
    expect(overlay[LOT_001]).toMatchObject({ source: 'inserted', via: 'amber' });
    expect(exposure.value).toBe(0);
  });

  it('filters to only the corroborating citations among several', () => {
    insert(TQE_001, 'tqe-1', 'amber'); // good (index 1)
    insert(LOT_001, 'lot-1', 'amber'); // wrong concept (not a co-carrier)
    const r = commitWithCitations(TQE_003, 'tqe-1', [LOT_001, TQE_001]);
    expect(r.ok).toBe(true);
    expect(r.citedBy).toEqual([TQE_001]); // only the real co-carrier counted
  });
});

describe('orphan-slot fallback (watch item 3): clearance-reveal only', () => {
  it('isOrphanSlot is true for a concept-less slot, false for a co-carried one', () => {
    expect(isOrphanSlot(LOCAL)).toBe(true);
    expect(isOrphanSlot(TQE_003)).toBe(false);
  });

  it('rejects an orphan commit while its own truth is unrevealed', () => {
    const r = commitWithCitations(LOCAL, 'loc-1', []);
    expect(r).toEqual({ ok: false, reason: 'orphan-unrevealed' });
    expect(overlay[LOCAL]).toBeUndefined();
  });

  it('accepts an orphan commit to truth once clearance has revealed it', () => {
    makeTruthIndex(LOCAL, 0); // LOCAL truth := loc-0
    revealedTruth.add(LOCAL);
    const r = commitWithCitations(LOCAL, 'loc-0', []);
    expect(r.ok).toBe(true);
    expect(overlay[LOCAL]).toMatchObject({ value: 'loc-0', source: 'inserted', via: 'amber' });
    expect(exposure.value).toBe(0);
  });

  it('rejects an orphan commit to a NON-truth value even when revealed', () => {
    makeTruthIndex(LOCAL, 0); // truth is loc-0
    revealedTruth.add(LOCAL);
    const r = commitWithCitations(LOCAL, 'loc-1', []); // not the truth
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('orphan-unrevealed');
  });
});

describe('the citations-required dial (design §8)', () => {
  it('default requires one citation, capped at the slot co-carrier count', () => {
    // the trio seam is 2-carrier, so the demand is min(CITATIONS_REQUIRED, 1) = 1
    // at the default. One good citation suffices.
    expect(CITATIONS_REQUIRED).toBeGreaterThanOrEqual(1);
    insert(TQE_001, 'tqe-1', 'amber');
    const r = commitWithCitations(TQE_003, 'tqe-1', [TQE_001]);
    expect(r.ok).toBe(true); // one citation meets the (clamped) requirement
  });
});

describe('the gate never leaks (invariant 4)', () => {
  it('rejection writes nothing — no overlay entry, no truth revealed', () => {
    const before = Object.keys(overlay).length;
    commitWithCitations(TQE_003, 'tqe-1', []);
    expect(Object.keys(overlay).length).toBe(before);
    expect(revealedTruth.has(TQE_003)).toBe(false);
  });

  it('the gate only confirms a candidate the player chose, never volunteers truth', () => {
    // No mechanism here returns the truth value; commit only ever echoes the
    // player's own chosen `value`. Guard: a successful commit's stored value is
    // exactly what was passed, not anchorOf(ref).truth.
    insert(TQE_001, 'tqe-1', 'amber');
    const r = commitWithCitations(TQE_003, 'tqe-1', [TQE_001]);
    expect(r.ok).toBe(true);
    expect(overlay[TQE_003].value).toBe('tqe-1');
    // (the fixture truth for TQE_003 is 'tqe-truth-003', deliberately not surfaced)
    expect(overlay[TQE_003].value).not.toBe(anchorOf(TQE_003).truth);
  });
});
