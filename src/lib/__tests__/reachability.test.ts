// Reachability (v3 Phase 1 — the day is the gate). The v2 seed-plus-xref-closure
// gate is retired: a file is reachable iff it is on the SHELF (collection 'local',
// always here) or MOUNTED (inbound, day <= session.day). The xref graph is
// navigation and grounding-discovery, not the opening gate. Reachability still
// gates what counts as evidence: an unmounted carrier is not yet citable.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  reachableFiles,
  isReachable,
  collectionOf,
  dayOf,
  crossMentions,
  makeRef,
} from '../game.svelte.ts';
import { session, resetSession } from '../session.svelte.ts';
import { makeCorpus } from './fixtures.ts';
import type { Corpus } from '../corpus.ts';

/** The engine fixture, re-collectioned: F1 local (the shelf), F2 day-1, F3 day-2. */
function makeDayCorpus(): Corpus {
  const c = makeCorpus();
  return {
    ...c,
    'SCP-41B-001': { ...c['SCP-41B-001'], collection: 'local', anchors: [] },
    'SCP-41B-002': { ...c['SCP-41B-002'], collection: 'inbound', day: 1 },
    'SCP-41B-003': { ...c['SCP-41B-003'], collection: 'inbound', day: 2 },
  };
}

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  resetSession();
  session.booting = false;
});

describe('defaults — the v2 corpus is all inbound, day 1 (back-compat)', () => {
  it('a file with neither field is inbound and mounts on day 1', () => {
    const f = makeCorpus()['SCP-41B-001'];
    expect(collectionOf(f)).toBe('inbound');
    expect(dayOf(f)).toBe(1);
  });

  it('on day 1 the whole legacy corpus is reachable — the tray is open', () => {
    const r = reachableFiles();
    expect(r.has('SCP-41B-001')).toBe(true);
    expect(r.has('SCP-41B-002')).toBe(true);
    expect(r.has('SCP-41B-003')).toBe(true);
    expect(r.has('SCP-41B-000')).toBe(true);
  });

  it('before the first consignment (day 0) nothing inbound is mounted', () => {
    session.day = 0;
    expect(reachableFiles().size).toBe(0);
  });
});

describe('collections — the shelf and the mounts', () => {
  beforeEach(() => {
    loadCorpus(makeDayCorpus());
  });

  it('a local file is reachable even before any consignment', () => {
    session.day = 0;
    expect(isReachable('SCP-41B-001')).toBe(true);
    expect(dayOf(makeDayCorpus()['SCP-41B-001'])).toBe(0);
  });

  it('an inbound file is unreachable until its day arrives, then stays mounted', () => {
    expect(isReachable('SCP-41B-002')).toBe(true); // day 1, mounted
    expect(isReachable('SCP-41B-003')).toBe(false); // day 2 — not yet arrived
    session.day = 2;
    expect(isReachable('SCP-41B-003')).toBe(true);
    session.day = 3; // cumulative: earlier mounts stay
    expect(isReachable('SCP-41B-002')).toBe(true);
    expect(isReachable('SCP-41B-003')).toBe(true);
  });

  it('a dangling item is not reachable', () => {
    expect(isReachable('SCP-41B-999')).toBe(false);
  });
});

describe('crossMentions — an unmounted carrier is not yet evidence', () => {
  beforeEach(() => {
    loadCorpus(makeDayCorpus());
  });

  it('a co-carrier in a not-yet-mounted file is not surfaced', () => {
    // F2#a2 (key-inf) has co-carriers on F3 (a2/a3) — F3 mounts day 2.
    const ref = makeRef('SCP-41B-002', 'a2');
    expect(crossMentions(ref)).toEqual([]);
  });

  it('once its day arrives, the co-carrier appears', () => {
    session.day = 2;
    const ref = makeRef('SCP-41B-002', 'a2');
    const mentions = crossMentions(ref);
    expect(mentions).toContain(makeRef('SCP-41B-003', 'a2'));
    expect(mentions).toContain(makeRef('SCP-41B-003', 'a3'));
  });
});
