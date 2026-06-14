// Lore-track regression guard: the REAL authored corpus (static/corpus.json, built
// from vault/entries/*.md) must be fully AMBER-winnable with ZERO Quippy assists,
// reaching the 'loop-broken' ending at exposure 0. The engine-only proof lives in
// endgame-integration.test.ts on a synthetic aligned corpus; THIS test closes the
// gap that handoff_lore_after_amber_build.md flagged as the BLOCKER — that the
// authored entries themselves are index-aligned, not just the engine.
//
// Two assertions, both load-bearing:
//  1. A static audit: every concept key whose carriers sit at the SAME tier must
//     have all its carriers' truths at the SAME mutation index. (Same-tier carriers
//     are corroborated against each other by the citation gate, which only matches
//     when both truths share an index — concept_key_registry.md, index 0 = mundane.)
//  2. An end-to-end solve: drive the real corpus through clearance-reveal → cite →
//     commit for every non-self slot and assert the true ending.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  revealedTruth,
  clearance,
  breaches,
  corpus,
  makeRef,
  commitWithCitations,
  raiseClearance,
  crossMentions,
  endState,
} from '../game.svelte.ts';
import type { Corpus } from '../corpus.ts';
// The built artifact, imported the same way the app loads it (App.svelte) — no
// node:fs, so this stays inside the svelte-check tsconfig's type scope.
import corpusData from '../../../static/corpus.json';

const REAL = corpusData as unknown as Corpus;

beforeEach(() => {
  loadCorpus(REAL);
  for (const k of Object.keys(overlay)) delete overlay[k];
  revealedTruth.clear();
  breaches.clear();
  exposure.value = 0;
  clearance.tier = 1;
});

describe('the real authored corpus is index-aligned for the citation gate', () => {
  it('every same-tier concept key has all carriers truthed at one shared index', () => {
    // group carriers by concept
    const byConcept = new Map<string, { ref: string; tier: number; truthIdx: number; len: number }[]>();
    for (const file of Object.values(REAL)) {
      for (const a of file.anchors) {
        if (!a.concept) continue; // local-only slots don't participate
        const truthIdx = a.mutations.indexOf(a.truth);
        const list = byConcept.get(a.concept) ?? [];
        list.push({ ref: makeRef(file.item, a.id), tier: a.redaction_level, truthIdx, len: a.mutations.length });
        byConcept.set(a.concept, list);
      }
    }

    for (const [concept, carriers] of byConcept) {
      // every carrier's truth must actually be in its own mutation set
      for (const c of carriers) {
        expect(c.truthIdx, `${c.ref} (${concept}) truth not in mutations`).toBeGreaterThanOrEqual(0);
      }
      // mutation sets must be equal length across carriers (build-corpus enforces too)
      const lengths = new Set(carriers.map((c) => c.len));
      expect(lengths.size, `${concept}: mutation sets differ in length`).toBe(1);

      // carriers sharing a tier must share a truth index (the citation-gate rule)
      const byTier = new Map<number, number[]>();
      for (const c of carriers) {
        const idxs = byTier.get(c.tier) ?? [];
        idxs.push(c.truthIdx);
        byTier.set(c.tier, idxs);
      }
      for (const [tier, idxs] of byTier) {
        const distinct = new Set(idxs);
        expect(
          distinct.size,
          `${concept}: same-tier (rl=${tier}) carriers at different truth indices ${[...distinct]} — high carrier becomes AMBER-unsolvable`,
        ).toBe(1);
      }
    }
  });
});

describe('the real authored trio solves to the true ending via AMBER alone', () => {
  it('clearance-reveal → cite → commit every non-self slot → loop-broken at exposure 0', () => {
    // Raise to the top tier the trio uses (003#a2 is rl=4). Reaching each tier
    // reveals in-tier truth for slots in open files — seeding the citation gate.
    raiseClearance(2);
    raiseClearance(3);
    raiseClearance(4);

    // Solve every non-self slot to its truth via AMBER. We iterate to a fixed point:
    // a slot is committable once enough of its co-carriers are corroborating
    // (clearance-revealed or already player-solved), so repeated passes let the
    // chain bootstrap. Orphans commit via the clearance-reveal fallback (no citation).
    const targets: string[] = [];
    for (const file of Object.values(corpus)) {
      if (file.entity_self) continue;
      for (const a of file.anchors) targets.push(makeRef(file.item, a.id));
    }

    let progressed = true;
    let guard = 0;
    while (progressed && guard++ < 20) {
      progressed = false;
      for (const ref of targets) {
        const o = overlay[ref];
        const truth = corpus[ref.slice(0, ref.indexOf('#'))].anchors.find(
          (a) => makeRef(ref.slice(0, ref.indexOf('#')), a.id) === ref,
        )!.truth;
        if (o && o.value === truth) continue; // already solved
        // cite every co-carrier; corroborates() filters to the ones that actually support index k
        const citations = crossMentions(ref);
        const r = commitWithCitations(ref, truth, citations);
        if (r.ok) progressed = true;
      }
    }

    const e = endState();
    expect(e.quippyAssists).toBe(0);
    expect(e.contradictions).toBe(0);
    expect(e.restored).toBe(e.total);
    expect(e.outcome).toBe('loop-broken');
    expect(exposure.value).toBe(0);
    expect(breaches.size).toBe(0);
  });
});
