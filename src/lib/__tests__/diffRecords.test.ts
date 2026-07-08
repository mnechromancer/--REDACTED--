// diffRecords — `diff <a> <b>` for the duplicate-record family (P3-10). LOCAL
// fixtures (not fixtures.ts): a near-duplicate pair whose bodies differ on exactly
// one prose line, a third copy with a trailing addendum, and a shelf volume that
// grounds the shared truth word — so the duplicates themselves never carry it in
// the clear, which is what the no-leak tests stand on.
//
//   REF-01       (local shelf, zero anchors) — holds 'marlowe' in the clear; the
//                citeIn target, kept OUT of every diff the leak tests read.
//   SCP-41B-201  three lines; line 2 holds slot a1 (truth 'marlowe').
//   SCP-41B-202  the duplicate: lines 1–2 identical (its own a1, same truth, same
//                position → identical bar line while redacted); line 3 differs
//                (the one-word edition change of P3-10).
//   SCP-41B-203  201's body plus one trailing addendum line (the overhang case).
//
// No anchor carries a concept, so solving 201#a1 propagates NOWHERE — the overlay-
// sensitivity test needs 202's copy to stay redacted on its own.

import { describe, it, expect, beforeEach } from 'vitest';
import { loadCorpus, overlay, insert, makeRef } from '../game.svelte.ts';
import { resetSession } from '../session.svelte.ts';
import { REDACTION_BAR } from '../renderedText.ts';
import { diffRecords } from '../diffRecords.ts';
import type { Corpus } from '../corpus.ts';

const LINE_1 = 'RECORD OF TRANSFER — vault nine consignment.';
const LINE_2_TOKENED = 'custodian of record: ⟦a1⟧.';
const LINE_3_A = 'disposition: retained on site.';
const LINE_3_B = 'disposition: destroyed by order.';
const ADDENDUM = 'addendum: crate resealed under seal four.';
const TRUTH = 'marlowe';

function makeDiffCorpus(): Corpus {
  return {
    'REF-01': {
      item: 'REF-01',
      object_class: 'Reference',
      site: 'Site-81C',
      collection: 'local',
      entity_self: false,
      xrefs: [],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [],
      body: 'shelf volume: custodians of transfer, marlowe among those listed.',
    },
    'SCP-41B-201': {
      item: 'SCP-41B-201',
      object_class: 'Safe',
      site: 'Site-41B',
      entity_self: false,
      xrefs: [],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'agent',
          truth: TRUTH,
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          exposure_weight: 2,
        },
      ],
      body: `${LINE_1}\n${LINE_2_TOKENED}\n${LINE_3_A}`,
    },
    'SCP-41B-202': {
      item: 'SCP-41B-202',
      object_class: 'Safe',
      site: 'Site-41B',
      entity_self: false,
      xrefs: [],
      breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'agent',
          truth: TRUTH,
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          exposure_weight: 2,
        },
      ],
      body: `${LINE_1}\n${LINE_2_TOKENED}\n${LINE_3_B}`,
    },
    'SCP-41B-203': {
      item: 'SCP-41B-203',
      object_class: 'Safe',
      site: 'Site-41B',
      entity_self: false,
      xrefs: [],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'agent',
          truth: TRUTH,
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          exposure_weight: 2,
        },
      ],
      body: `${LINE_1}\n${LINE_2_TOKENED}\n${LINE_3_A}\n${ADDENDUM}`,
    },
  };
}

beforeEach(() => {
  loadCorpus(makeDiffCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  resetSession(); // day 1 — everything here is shelf or day-1 inbound
});

describe('alignment — LCS anchors and index-wise gap pairing (P3-10)', () => {
  it('a record diffed against itself is all anchors, both sides populated', () => {
    const rows = diffRecords('SCP-41B-201', 'SCP-41B-201');
    expect(rows.length).toBe(3);
    for (const row of rows) {
      expect(row.same).toBe(true);
      expect(row.left).not.toBeNull();
      expect(row.right).toBe(row.left);
    }
  });

  it('a one-line edition change reads as ONE marked row, not a delete+insert pair', () => {
    const rows = diffRecords('SCP-41B-201', 'SCP-41B-202');
    const changed = rows.filter((r) => !r.same);
    expect(changed.length).toBe(1);
    expect(changed[0].left).toBe(LINE_3_A);
    expect(changed[0].right).toBe(LINE_3_B);
    // every other row is an alignment anchor carrying both sides
    expect(rows.length).toBe(3);
    for (const row of rows.filter((r) => r.same)) {
      expect(row.left).not.toBeNull();
      expect(row.right).toBe(row.left);
    }
  });

  it('an extra line gets null on the shorter side (overhang)', () => {
    const rows = diffRecords('SCP-41B-201', 'SCP-41B-203');
    expect(rows.length).toBe(4);
    expect(rows.slice(0, 3).every((r) => r.same)).toBe(true);
    expect(rows[3]).toEqual({ left: null, right: ADDENDUM, same: false });
  });
});

describe('honesty — the diff reads the rendered text, never the truth', () => {
  it('never leaks a redacted truth: both sides render the bar, no row carries the word', () => {
    const rows = diffRecords('SCP-41B-201', 'SCP-41B-202');
    for (const row of rows) {
      expect(row.left ?? '').not.toContain(TRUTH);
      expect(row.right ?? '').not.toContain(TRUTH);
    }
    const custodian = rows.find((r) => (r.left ?? '').includes('custodian of record'));
    expect(custodian).toBeDefined();
    expect(custodian!.left).toContain(REDACTION_BAR);
    expect(custodian!.right).toContain(REDACTION_BAR);
    // identical bars anchor: duplicates hiding different-or-same words read as
    // IDENTICAL on that line until one is solved — the reveal is earned, not diffed out
    expect(custodian!.same).toBe(true);
  });

  it('is overlay-sensitive: an AMBER solve on one side breaks the bar-anchor into a marked row', () => {
    insert(makeRef('SCP-41B-201', 'a1'), TRUTH, 'amber');
    const rows = diffRecords('SCP-41B-201', 'SCP-41B-202');
    const custodian = rows.find((r) => (r.left ?? '').includes('custodian of record'));
    expect(custodian).toBeDefined();
    expect(custodian!.same).toBe(false);
    expect(custodian!.left).toContain(TRUTH); // the solved side shows the word…
    expect(custodian!.right).toContain(REDACTION_BAR); // …the unsolved side still bars it
    expect(custodian!.right).not.toContain(TRUTH);
    // index-wise pairing keeps the changed block aligned: the custodian lines pair
    // with each other, not with the disposition lines
    expect(custodian!.right).toContain('custodian of record');
  });
});

describe('unknown designations fail loudly', () => {
  it('throws naming the missing item, on either side', () => {
    expect(() => diffRecords('SCP-41B-201', 'SCP-41B-999')).toThrow(/SCP-41B-999/);
    expect(() => diffRecords('SCP-41B-999', 'SCP-41B-201')).toThrow(/SCP-41B-999/);
  });
});
