// The concordance (`xref <word>` — v3 Phase 3, sprint 03 S1) over LOCAL fixtures
// (the work order's rule: fixtures.ts untouched). What these tests pin down:
//
//  - the reachability gate — a future-day consignment is not evidence until its
//    4 AM mount (decision v3-A carried through);
//  - coverage grows as the player solves (decision P3-1) — a redacted truth is
//    structurally unfindable, an AMBER commit makes it findable, and a wrong
//    Quippy fill enters the index too (the lie is on screen, so the lie is
//    findable — the Phase-7 seed, deliberate);
//  - the spanContainsWord equivalence (decision P3-2) — every hit's snippet
//    grounds the word at the commit gate, proven both by the predicate and by
//    driving a hit's snippet through commitWithCitations end to end;
//  - the snippet-as-exact-substring contract (decision P3-9) — the snippet is
//    real prose the record contains, byte for byte, window path included.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  insert,
  makeRef,
  spanContainsWord,
  commitWithCitations,
} from '../game.svelte.ts';
import { session, resetSession } from '../session.svelte.ts';
import { renderedLines } from '../renderedText.ts';
import { concordance } from '../concordance.ts';
import type { Corpus } from '../corpus.ts';

// A single rendered line long enough (>140 chars trimmed) to force the window
// path. The match word sits mid-line between short filler words so word-boundary
// extension is observable at both snippet edges.
const LONG_LINE =
  'margin '.repeat(15) + 'the candlewick fixture sits mid-sheet ' + 'ledger '.repeat(15) + 'close.';

/**
 * The search fixture:
 *   REF-01      — shelf (local, always reachable): 'Euclid' in the clear line 1,
 *                 'euclid' TWICE on line 2 (one hit per line), LONG_LINE line 3
 *                 (the window path), lowercase 'lantern' line 4 (case tests).
 *   SCP-41B-101 — inbound day 1: a1 truth 'gaslamp' (lure 'mirror') behind the
 *                 bar on line 1; a2 truth 'euclid' behind the bar on line 2,
 *                 grounded by the shelf — the commit round-trip target.
 *   SCP-41B-201 — inbound day 2: 'zephyr' in the clear (the reachability gate).
 */
function makeSearchCorpus(): Corpus {
  return {
    'REF-01': {
      item: 'REF-01',
      object_class: 'N/A',
      site: 'Site-81C',
      collection: 'local',
      entity_self: false,
      xrefs: [],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [],
      body: [
        'Shelf volume one. The Euclid designation stands here in the clear.',
        'Filed twice on one line: euclid and euclid again.',
        LONG_LINE,
        'a lantern hangs by the stacks.',
      ].join('\n'),
    },
    'SCP-41B-101': {
      item: 'SCP-41B-101',
      object_class: 'withheld',
      site: 'Site-41B',
      collection: 'inbound',
      day: 1,
      entity_self: false,
      xrefs: ['REF-01'],
      breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'gaslamp',
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          lure: 'mirror',
          exposure_weight: 2,
        },
        {
          id: 'a2',
          slot_type: 'object',
          truth: 'euclid',
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          exposure_weight: 1,
        },
      ],
      body: 'Recovered item catalogued as ⟦a1⟧ pending review.\nIts class is filed under ⟦a2⟧, see [[REF-01]].',
    },
    'SCP-41B-201': {
      item: 'SCP-41B-201',
      object_class: 'withheld',
      site: 'Site-41B',
      collection: 'inbound',
      day: 2,
      entity_self: false,
      xrefs: [],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [],
      body: 'The zephyr manifest is not yet on the dock.',
    },
  };
}

beforeEach(() => {
  loadCorpus(makeSearchCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  resetSession();
  session.booting = false;
});

describe('the reachability gate — a future consignment is not evidence', () => {
  it('a day-2 file is not indexed on day 1; its 4 AM mount adds it', () => {
    expect(concordance('zephyr')).toEqual([]);
    session.day = 2;
    expect(concordance('zephyr')).toEqual([
      { item: 'SCP-41B-201', line: 1, snippet: 'The zephyr manifest is not yet on the dock.' },
    ]);
  });
});

describe('coverage grows as the player solves (P3-1)', () => {
  it('a redacted truth is unfindable; an AMBER commit makes it findable', () => {
    expect(concordance('gaslamp')).toEqual([]);
    insert(makeRef('SCP-41B-101', 'a1'), 'gaslamp', 'amber');
    expect(concordance('gaslamp')).toEqual([
      { item: 'SCP-41B-101', line: 1, snippet: 'Recovered item catalogued as gaslamp pending review.' },
    ]);
  });

  it('a wrong Quippy fill enters the index — the lie is on screen, so the lie is findable', () => {
    expect(concordance('mirror')).toEqual([]);
    insert(makeRef('SCP-41B-101', 'a1'), 'mirror', 'quippy');
    const hits = concordance('mirror');
    expect(hits.map((h) => h.item)).toEqual(['SCP-41B-101']);
    expect(hits[0].snippet).toContain('mirror');
    // and the truth stays unfindable — the bar never leaked it
    expect(concordance('gaslamp')).toEqual([]);
  });
});

describe('match rule — literal, case-insensitive substring (P3-2)', () => {
  it('a lowercase query finds capitalized text', () => {
    const hits = concordance('euclid');
    expect(hits.some((h) => h.item === 'REF-01' && h.line === 1)).toBe(true);
  });

  it('an uppercase query finds lowercase text', () => {
    const hits = concordance('LANTERN');
    expect(hits).toEqual([{ item: 'REF-01', line: 4, snippet: 'a lantern hangs by the stacks.' }]);
  });

  it('the word is trimmed before matching', () => {
    expect(concordance('  euclid  ')).toEqual(concordance('euclid'));
  });

  it('empty and whitespace-only words return no hits', () => {
    expect(concordance('')).toEqual([]);
    expect(concordance('   ')).toEqual([]);
    expect(concordance('\t\n')).toEqual([]);
  });

  it('at most one hit per (item, line) — a doubled word yields a single hit', () => {
    const hits = concordance('euclid').filter((h) => h.item === 'REF-01');
    expect(hits.map((h) => h.line)).toEqual([1, 2]);
  });

  it('hits come in corpus iteration order, then line order', () => {
    session.day = 2;
    const hits = concordance('the');
    expect(hits.map((h) => `${h.item}:${h.line}`)).toEqual([
      'REF-01:1',
      'REF-01:3',
      'REF-01:4',
      'SCP-41B-201:1',
    ]);
  });
});

describe('the snippet is a forgeable span (P3-9)', () => {
  it('every hit grounds its word at the gate AND is an exact substring of its rendered line', () => {
    session.day = 2;
    insert(makeRef('SCP-41B-101', 'a1'), 'gaslamp', 'amber');
    for (const word of ['euclid', 'lantern', 'the', 'candlewick', 'gaslamp', 'zephyr', 'margin']) {
      const hits = concordance(word);
      expect(hits.length).toBeGreaterThan(0); // non-vacuous per word
      for (const hit of hits) {
        expect(spanContainsWord(hit.snippet, word)).toBe(true);
        expect(renderedLines(hit.item)[hit.line - 1].includes(hit.snippet)).toBe(true);
      }
    }
  });

  it('a long line windows to ~120 chars at word boundaries, undecorated', () => {
    const hits = concordance('candlewick');
    expect(hits).toHaveLength(1);
    const hit = hits[0];
    const line = renderedLines(hit.item)[hit.line - 1];
    expect(line.length).toBeGreaterThan(140); // the window path was exercised
    expect(hit.snippet.length).toBeLessThanOrEqual(140); // ~120 target + word-boundary slack
    expect(hit.snippet).toContain('candlewick');
    expect(hit.snippet).toBe(hit.snippet.trim()); // no whitespace edges
    expect(hit.snippet).not.toContain('…'); // never decorated — it IS citation text
    const at = line.indexOf(hit.snippet);
    expect(at).toBeGreaterThanOrEqual(0); // exact substring
    if (at > 0) expect(line[at - 1]).toMatch(/\s/); // opens at a word boundary
    const after = at + hit.snippet.length;
    if (after < line.length) expect(line[after]).toMatch(/\s/); // closes at one
  });

  it('a hit snippet passes the commit gate end to end — the S1 done-check', () => {
    const [hit] = concordance('euclid'); // first hit: REF-01 line 1, in the clear
    expect(hit.item).toBe('REF-01');
    const result = commitWithCitations(makeRef('SCP-41B-101', 'a2'), 'euclid', [
      { item: hit.item, text: hit.snippet },
    ]);
    expect(result.ok).toBe(true);
    // and the solved record itself joins the index — coverage grew
    expect(concordance('euclid').some((h) => h.item === 'SCP-41B-101')).toBe(true);
  });
});
