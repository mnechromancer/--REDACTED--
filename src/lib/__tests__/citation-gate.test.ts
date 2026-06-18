// The citation-cost gate (Phase 3 — the forged-citation verb). Under the single-word
// primitive the player TYPES the recovered word, then FORGES citations from spans they
// selected in reachable records and stakes them; AMBER judges only at commit. A forged
// citation grounds the word iff its file is reachable AND its selected span literally
// carries the word (spanContainsWord). One grounding span commits a teaching slot;
// distinct grounding spans count toward an inference slot's threshold. A good commit →
// via=amber, exposure +0; a short/wrong one → reject, no write. AMBER no longer
// SURFACES where the word lives (groundingClues is gone) — the player finds it.

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
  spanContainsWord,
  commitWithCitations,
  isUngroundable,
  anchorOf,
} from '../game.svelte.ts';
import type { ForgedCitation } from '../corpus.ts';
import { makeCorpus } from './fixtures.ts';

// teaching seams: F1#a1 'alpha' grounded by a span in F2; F2#a1 'beta' grounded in F1.
const F1_A1 = makeRef('SCP-41B-001', 'a1'); // alpha — F2's body holds "alpha"
const F2_A1 = makeRef('SCP-41B-002', 'a1'); // beta  — F1's body holds "beta"
const F3_A1 = makeRef('SCP-41B-003', 'a1'); // alpha — co-carrier of F1#a1 (key-a)
const INF = makeRef('SCP-41B-002', 'a2');    // gamma — inference, threshold 2

/** A forged citation: a span the player selected in a reachable file. */
function cite(item: string, text: string): ForgedCitation {
  return { item, text };
}

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  seedReachable.clear();
  breaches.clear();
  exposure.value = 0;
  // seed F1; F1 xrefs F2 and F3, so the whole non-self corpus is reachable.
  seedReach('SCP-41B-001');
});

describe('spanContainsWord — the commit-time containment check', () => {
  it('a span literally carrying the word matches (case-insensitive, loose span ok)', () => {
    expect(spanContainsWord('the holding Alpha names', 'alpha')).toBe(true);
  });
  it('a span not carrying the word does not match', () => {
    expect(spanContainsWord('the holding beta names', 'alpha')).toBe(false);
  });
});

describe('corroborates — a forged span grounds the word', () => {
  it('a span from a reachable file carrying the word grounds it', () => {
    // F1#a1 is 'alpha'; the player selected "holding alpha names" out of F2 (reachable).
    expect(corroborates(cite('SCP-41B-002', 'holding alpha names'), F1_A1)).toBe(true);
  });

  it('a span that does NOT carry the word grounds nothing', () => {
    expect(corroborates(cite('SCP-41B-002', 'cross-filed as delta'), F1_A1)).toBe(false);
  });

  it('a span from an UNREACHABLE file grounds nothing', () => {
    seedReachable.clear(); // nothing reachable now
    expect(corroborates(cite('SCP-41B-002', 'holding alpha names'), F1_A1)).toBe(false);
  });

  it("a span from the slot's OWN file cannot ground it", () => {
    // F1's body literally contains "alpha" too, but citing your own file is not finding
    // the word elsewhere — the gate refuses a self-citation.
    expect(corroborates(cite('SCP-41B-001', 'alpha'), F1_A1)).toBe(false);
  });
});

describe('commitWithCitations — teaching slot', () => {
  it('the wrong word is rejected before any grounding check', () => {
    const r = commitWithCitations(F1_A1, 'not-the-word', [cite('SCP-41B-002', 'holding alpha names')]);
    expect(r).toEqual({ ok: false, reason: 'wrong-word' });
    expect(overlay[F1_A1]).toBeUndefined();
  });

  it('the right word with no forged citation → uncited, no write', () => {
    const r = commitWithCitations(F1_A1, 'alpha', []);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('uncited');
    expect(overlay[F1_A1]).toBeUndefined();
    expect(exposure.value).toBe(0);
  });

  it('the right word + a span carrying it accepts: via=amber, exposure 0', () => {
    const c = cite('SCP-41B-002', 'the holding alpha names');
    const r = commitWithCitations(F1_A1, 'alpha', [c]);
    expect(r.ok).toBe(true);
    expect(r.citedBy).toEqual([c]);
    expect(overlay[F1_A1]).toMatchObject({ value: 'alpha', source: 'inserted', via: 'amber' });
    expect(exposure.value).toBe(0);
  });

  it('a forged span that lacks the word is filtered out → uncited (commit judges)', () => {
    // The player built a wrong case — selected a span that does not carry "alpha".
    const r = commitWithCitations(F1_A1, 'alpha', [cite('SCP-41B-002', 'cross-filed as delta')]);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('uncited');
    expect(overlay[F1_A1]).toBeUndefined();
  });

  it('the reciprocal seam: F2#a1 beta grounded by a span in F1', () => {
    const r = commitWithCitations(F2_A1, 'beta', [cite('SCP-41B-001', 'the record beta is catalogued')]);
    expect(r.ok).toBe(true);
    expect(overlay[F2_A1]).toMatchObject({ value: 'beta', source: 'inserted', via: 'amber' });
  });
});

describe('commitWithCitations — inference slot (transparent meter, decision A)', () => {
  // The fixture's inference slot's word ('gamma') is not in any file (that is what makes
  // it inference). We exercise the THRESHOLD-COUNTING and de-dup logic directly with
  // spans that carry the word, since the per-span counting is the engine behaviour under
  // test here (authored inference content is a later phase — see the gate's NOTE).
  it('below threshold → insufficient, returns the running grounded/threshold', () => {
    const r = commitWithCitations(INF, 'gamma', [cite('SCP-41B-003', 'a gamma reading')]);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('insufficient');
    expect(r.grounded).toBe(1);
    expect(r.threshold).toBe(2);
    expect(overlay[INF]).toBeUndefined();
  });

  it('meeting the threshold with two DISTINCT spans accepts: via=amber, exposure 0', () => {
    const r = commitWithCitations(INF, 'gamma', [
      cite('SCP-41B-003', 'a gamma reading'),
      cite('SCP-41B-001', 'gamma also appears here'),
    ]);
    expect(r.ok).toBe(true);
    expect(r.grounded).toBe(2);
    expect(r.threshold).toBe(2);
    expect(overlay[INF]).toMatchObject({ value: 'gamma', source: 'inserted', via: 'amber' });
    expect(exposure.value).toBe(0);
  });

  it('the SAME span staked twice counts once (de-dup) → still insufficient', () => {
    const dup = cite('SCP-41B-003', 'a gamma reading');
    const r = commitWithCitations(INF, 'gamma', [dup, dup]);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('insufficient');
    expect(r.grounded).toBe(1);
  });
});

describe('ungroundable slots', () => {
  it('a teaching slot whose citeIn (winnability) files are all unreachable is ungroundable', () => {
    seedReachable.clear();
    expect(isUngroundable(F1_A1)).toBe(true);
    const r = commitWithCitations(F1_A1, 'alpha', [cite('SCP-41B-002', 'the holding alpha names')]);
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
    const r = commitWithCitations(F2_A1, 'beta', [cite('SCP-41B-001', 'the record beta is catalogued')]);
    expect(r.ok).toBe(true);
    expect(overlay[F2_A1].value).toBe('beta');
    expect(overlay[F2_A1].value).toBe(anchorOf(F2_A1).truth); // here the word IS the truth — by the player typing it
  });

  it('a propagated value can never be staked as grounding (honesty rule, structural)', () => {
    // Solve F3#a1 'alpha' → propagates to F1#a1 (same word, key-a). The player cannot
    // forge a citation FROM that propagated value: it lives behind a slot bar, not in
    // selectable prose. The gate only ever sees span TEXT, so there is no path to cite it.
    insert(F3_A1, 'alpha', 'amber');
    expect(overlay[F1_A1]?.source).toBe('propagated');
    // A span the player could only have lifted from F1's own propagated slot is a
    // self-citation and refused regardless of content.
    expect(corroborates(cite('SCP-41B-001', 'alpha'), F1_A1)).toBe(false);
  });
});
