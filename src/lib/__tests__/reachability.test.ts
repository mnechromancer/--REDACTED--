// Reachability (v2 reset, decision D) — the pure-graph gate that replaces clearance.
// A file is reachable iff its inbound citations are reachable: the seed plus the
// transitive closure of xrefs from a reachable file. This gates what can be cited and
// what grounds anything — an unreachable carrier is not yet evidence.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  seedReachable,
  seedReach,
  reachableFiles,
  isReachable,
  crossMentions,
  makeRef,
} from '../game.svelte.ts';
import { makeCorpus } from './fixtures.ts';

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  seedReachable.clear();
});

describe('reachableFiles — seed + xref closure', () => {
  it('nothing is reachable before a seed', () => {
    expect(reachableFiles().size).toBe(0);
  });

  it('the seed reaches itself and everything its xrefs transitively open', () => {
    seedReach('SCP-41B-001'); // F1 xrefs F2, F3; F2 xrefs F3 — closure is {F1,F2,F3}
    const r = reachableFiles();
    expect(r.has('SCP-41B-001')).toBe(true);
    expect(r.has('SCP-41B-002')).toBe(true);
    expect(r.has('SCP-41B-003')).toBe(true);
  });

  it('a file with no inbound path from a seed stays unreachable', () => {
    // F0 (self) is xref'd by nobody in the non-self graph and is not seeded.
    seedReach('SCP-41B-001');
    expect(isReachable('SCP-41B-000')).toBe(false);
  });

  it('seeding a leaf reaches only what IT links to', () => {
    seedReach('SCP-41B-003'); // F3 xrefs only F2; F2 xrefs F1, F3 → {F3,F2,F1}
    const r = reachableFiles();
    expect(r.has('SCP-41B-003')).toBe(true);
    expect(r.has('SCP-41B-002')).toBe(true);
    expect(r.has('SCP-41B-001')).toBe(true);
  });
});

describe('crossMentions respects reachability', () => {
  it('a co-carrier in an unreachable file is not surfaced as evidence', () => {
    // key-a: F1#a1 ↔ F3#a1. Seed only F3 in isolation by clearing the F1 path? F3
    // xrefs F2 which xrefs F1, so F1 is reachable from F3. To get an unreachable
    // co-carrier, seed nothing: then F1#a1 has no reachable peers.
    seedReachable.clear();
    expect(crossMentions(makeRef('SCP-41B-001', 'a1'))).toEqual([]);
  });

  it('once reachable, the co-carrier appears', () => {
    seedReach('SCP-41B-001');
    expect(crossMentions(makeRef('SCP-41B-001', 'a1'))).toEqual([makeRef('SCP-41B-003', 'a1')]);
  });
});
