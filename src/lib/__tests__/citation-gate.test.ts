// The citation-cost gate (v2 reset §1.3) — AMBER's manual unredaction under the
// single-word primitive. Teaching depth: cite a reachable file holding the word in
// the clear. Inference depth: assemble grounding from solved co-carriers to a
// threshold. A good commit → via=amber, exposure +0; a short/wrong one → reject, no
// write. Replaces the old clearance-reveal + candidate-index gate.

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
  corroborates,
  commitWithCitations,
  isUngroundable,
  anchorOf,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';

// teaching seams: F1#a1 'alpha' grounded in F2; F2#a1 'beta' grounded in F1.
const F1_A1 = makeRef('SCP-41B-001', 'a1'); // alpha, teaching citeIn F2
const F2_A1 = makeRef('SCP-41B-002', 'a1'); // beta, teaching citeIn F1
const F3_A1 = makeRef('SCP-41B-003', 'a1'); // alpha, co-carrier of F1#a1 (key-a)
// inference seam: F2#a2 'gamma' (threshold 2), contributors F3#a2/#a3 (key-inf).
const INF = makeRef('SCP-41B-002', 'a2');
const INF_C1 = makeRef('SCP-41B-003', 'a2'); // delta, teaching citeIn F2
const INF_C2 = makeRef('SCP-41B-003', 'a3'); // epsilon, teaching citeIn F2

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  seedReachable.clear();
  breaches.clear();
  exposure.value = 0;
  // seed F1; F1 xrefs F2 and F3, so the whole non-self corpus is reachable.
  seedReach('SCP-41B-001');
});

describe('corroborates — teaching depth (word in the clear)', () => {
  it('a reachable cited file holding the word in the clear corroborates', () => {
    // F1#a1 is 'alpha'; F2's body holds "alpha" in the clear and F2 is reachable.
    expect(corroborates('SCP-41B-002', F1_A1)).toBe(true);
  });

  it('a file NOT in the slot citeIn does not corroborate', () => {
    expect(corroborates('SCP-41B-003', F1_A1)).toBe(false); // F1#a1 only sanctions F2
  });

  it('an unreachable cited file does not corroborate', () => {
    seedReachable.clear(); // nothing reachable now
    expect(corroborates('SCP-41B-002', F1_A1)).toBe(false);
  });
});

describe('corroborates — inference depth (solved co-carrier)', () => {
  it('a solved reachable co-carrier corroborates the inference slot', () => {
    insert(INF_C1, 'delta', 'amber'); // contributor solved
    expect(corroborates(INF_C1, INF)).toBe(true);
  });

  it('an UNSOLVED co-carrier does not corroborate', () => {
    expect(corroborates(INF_C1, INF)).toBe(false);
  });

  it('a PROPAGATED value never corroborates (the honesty rule)', () => {
    // Solve F3#a1 'alpha' → propagates to F1#a1 (same word, key-a). F1#a1 becomes
    // propagated, which must not count as evidence for a sibling.
    insert(F3_A1, 'alpha', 'amber');
    expect(overlay[F1_A1]?.source).toBe('propagated');
    expect(corroborates(F1_A1, F3_A1)).toBe(false);
  });

  it('a slot cannot cite itself', () => {
    insert(INF, 'gamma', 'amber');
    expect(corroborates(INF, INF)).toBe(false);
  });
});

describe('commitWithCitations — teaching slot', () => {
  it('the wrong word is rejected before any grounding check', () => {
    const r = commitWithCitations(F1_A1, 'not-the-word', ['SCP-41B-002']);
    expect(r).toEqual({ ok: false, reason: 'wrong-word' });
    expect(overlay[F1_A1]).toBeUndefined();
  });

  it('the right word with no cite → uncited, no write', () => {
    const r = commitWithCitations(F1_A1, 'alpha', []);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('uncited');
    expect(overlay[F1_A1]).toBeUndefined();
    expect(exposure.value).toBe(0);
  });

  it('the right word cited in the grounding file accepts: via=amber, exposure 0', () => {
    const r = commitWithCitations(F1_A1, 'alpha', ['SCP-41B-002']);
    expect(r.ok).toBe(true);
    expect(r.citedBy).toEqual(['SCP-41B-002']);
    expect(overlay[F1_A1]).toMatchObject({ value: 'alpha', source: 'inserted', via: 'amber' });
    expect(exposure.value).toBe(0);
  });

  it('a non-grounding citation is filtered out → uncited', () => {
    // F3 is not in F1#a1.citeIn (only F2 is), so citing it grounds nothing.
    const r = commitWithCitations(F1_A1, 'alpha', ['SCP-41B-003']);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('uncited');
  });
});

describe('commitWithCitations — inference slot (transparent meter, decision A)', () => {
  it('below threshold → insufficient, returns the running grounded/threshold', () => {
    insert(INF_C1, 'delta', 'amber'); // one contributor solved → grounded 1, threshold 2
    const r = commitWithCitations(INF, 'gamma', [INF_C1]);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('insufficient');
    expect(r.grounded).toBe(1);
    expect(r.threshold).toBe(2);
    expect(overlay[INF]).toBeUndefined();
  });

  it('meeting the threshold accepts: via=amber, exposure 0', () => {
    insert(INF_C1, 'delta', 'amber');
    insert(INF_C2, 'epsilon', 'amber'); // two contributors → grounded 2 ≥ threshold 2
    const r = commitWithCitations(INF, 'gamma', [INF_C1, INF_C2]);
    expect(r.ok).toBe(true);
    expect(r.grounded).toBe(2);
    expect(r.threshold).toBe(2);
    expect(overlay[INF]).toMatchObject({ value: 'gamma', source: 'inserted', via: 'amber' });
    expect(exposure.value).toBe(0);
  });
});

describe('ungroundable slots', () => {
  it('a teaching slot whose citeIn files are all unreachable is ungroundable', () => {
    seedReachable.clear();
    expect(isUngroundable(F1_A1)).toBe(true);
    const r = commitWithCitations(F1_A1, 'alpha', ['SCP-41B-002']);
    expect(r).toEqual({ ok: false, reason: 'ungroundable' });
  });

  it('a reachable teaching slot is groundable', () => {
    expect(isUngroundable(F1_A1)).toBe(false);
  });
});

describe('the gate never leaks (invariant 4)', () => {
  it('rejection writes nothing', () => {
    const before = Object.keys(overlay).length;
    commitWithCitations(F1_A1, 'alpha', []);
    expect(Object.keys(overlay).length).toBe(before);
  });

  it('commit only ever stores the player-passed word, never reads truth into the slot for them', () => {
    const r = commitWithCitations(F2_A1, 'beta', ['SCP-41B-001']);
    expect(r.ok).toBe(true);
    expect(overlay[F2_A1].value).toBe('beta');
    expect(overlay[F2_A1].value).toBe(anchorOf(F2_A1).truth); // here the word IS the truth — by the player typing it
  });
});
