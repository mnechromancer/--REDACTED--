// The OS readouts (v3 Phase 3, story S4) — ls / status / log / verify as pure
// line-builders. LOCAL fixture (not fixtures.ts): a shelf volume, day-1 and day-2
// inbound records, and the entity_self file, with distinct truth words + one lure so
// the truth-leak scan is meaningful:
//
//   REF-01       local shelf, ZERO anchors (the grounding floor; no field counts)
//   SCP-41B-101  day 1 · a1 'beta' (concept k-beta → propagates to 102#a1, weight 2)
//                       · a2 'gamma' (no concept, weight 2, lure 'serpent')
//   SCP-41B-102  day 1 · a1 'beta' (concept k-beta — the propagation target, weight 2)
//   SCP-41B-201  day 2 · a1 'delta' (behind the day gate, weight 4)
//   SCP-41B-000  day 1 · entity_self · a1 'self-secret' (inference, weight 3)
//
// Exposure is only ever driven through insert(ref, value, 'quippy') — never set
// directly (the beforeEach zeroing is reset hygiene, per the house test pattern).
// Band arithmetic against BREACH_THRESHOLD = 10:
//   quippy right 'gamma' at 101#a2                → 2.0  → MINOR    (0.2)
//   quippy WRONG 'serpent' at 101#a2 (2 × 2.5)    → 5.0  → ELEVATED (0.5)
//   + quippy 'beta' at 101#a1 (2) + ripple (2)    → 9.0  → SEVERE   (0.9, no breach)
//   + quippy 'self-secret' at 000#a1 (3)          → 12.0 → SEVERE + BREACH (≥ 10)

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  breaches,
  quippyTouched,
  insert,
  makeRef,
  allRefs,
  anchorOf,
} from '../game.svelte.ts';
import { session } from '../session.svelte.ts';
import { lsLines, statusLines, ledgerLines, verifyLines } from '../os.ts';
import type { Corpus } from '../corpus.ts';

function makeOsCorpus(): Corpus {
  return {
    'REF-01': {
      item: 'REF-01',
      object_class: 'Reference',
      site: 'Site-81C',
      collection: 'local',
      entity_self: false,
      xrefs: [],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [], // the shelf is unredacted — zero anchors, build-enforced
      body: 'shelf primer: the words beta, gamma, delta stand here in the clear.',
    },
    'SCP-41B-101': {
      item: 'SCP-41B-101',
      object_class: 'Euclid',
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
          truth: 'beta',
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          concept: 'k-beta',
          exposure_weight: 2,
        },
        {
          id: 'a2',
          slot_type: 'outcome',
          truth: 'gamma',
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          lure: 'serpent',
          exposure_weight: 2,
        },
      ],
      body: 'the specimen ⟦a1⟧ was logged before ⟦a2⟧, see [[REF-01]].',
    },
    'SCP-41B-102': {
      item: 'SCP-41B-102',
      // A class-word puzzle authors the header as "withheld" — ls must print it
      // verbatim, never substitute (CLAUDE.md schema rule).
      object_class: 'withheld',
      site: 'Site-41B',
      collection: 'inbound',
      day: 1,
      entity_self: false,
      xrefs: ['REF-01'],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'beta',
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          concept: 'k-beta',
          exposure_weight: 2,
        },
      ],
      body: 'the annex names ⟦a1⟧, see [[REF-01]].',
    },
    'SCP-41B-201': {
      item: 'SCP-41B-201',
      object_class: 'Keter',
      site: 'Site-41B',
      collection: 'inbound',
      day: 2,
      entity_self: false,
      xrefs: ['REF-01'],
      breach_effect: { kind: 'lock_tier', tier: 1 },
      anchors: [
        {
          id: 'a1',
          slot_type: 'location',
          truth: 'delta',
          grounding: { kind: 'teaching', citeIn: ['REF-01'] },
          exposure_weight: 4,
        },
      ],
      body: 'held pending ⟦a1⟧, see [[REF-01]].',
    },
    'SCP-41B-000': {
      item: 'SCP-41B-000',
      object_class: 'Keter',
      site: 'Site-41B',
      collection: 'inbound',
      day: 1,
      entity_self: true,
      xrefs: [],
      breach_effect: { kind: 'randomize_propagation', fraction: 0.25 },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'self-secret',
          grounding: { kind: 'inference', threshold: 3 },
          exposure_weight: 3,
        },
      ],
      body: 'the self-file conceals ⟦a1⟧.',
    },
  };
}

const R101A1 = makeRef('SCP-41B-101', 'a1'); // 'beta' — ripples to 102#a1
const R101A2 = makeRef('SCP-41B-101', 'a2'); // 'gamma' — lure 'serpent'
const R102A1 = makeRef('SCP-41B-102', 'a1'); // 'beta' — the propagation target
const R000A1 = makeRef('SCP-41B-000', 'a1'); // 'self-secret' — the self-file

beforeEach(() => {
  loadCorpus(makeOsCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  breaches.clear();
  quippyTouched.clear();
  exposure.value = 0;
  session.day = 1;
});

// ── ls — the mount listing ──────────────────────────────────────────────────

describe('lsLines — shelf + consignments, day-gated', () => {
  it('day 1: the shelf section and the day-1 consignment only', () => {
    const lines = lsLines();
    expect(lines).toEqual([
      'SHELF — 1 reference volume(s)',
      '  REF-01 · Reference',
      'CONSIGNMENT — DAY 1 — 3 record(s)',
      '  SCP-41B-101 · Euclid · 0/2 fields restored',
      '  SCP-41B-102 · withheld · 0/1 fields restored',
      '  SCP-41B-000 · Keter · 0/1 fields restored',
    ]);
    // the day-2 record has not arrived
    expect(lines.join('\n')).not.toContain('SCP-41B-201');
  });

  it('day 2: a second consignment section mounts, days ascending', () => {
    session.day = 2;
    const lines = lsLines();
    const text = lines.join('\n');
    expect(text).toContain('CONSIGNMENT — DAY 1 — 3 record(s)');
    expect(text).toContain('CONSIGNMENT — DAY 2 — 1 record(s)');
    expect(text).toContain('  SCP-41B-201 · Keter · 0/1 fields restored');
    expect(lines.indexOf('CONSIGNMENT — DAY 1 — 3 record(s)')).toBeLessThan(
      lines.indexOf('CONSIGNMENT — DAY 2 — 1 record(s)'),
    );
  });

  it("filter 'shelf' lists only the shelf; the shelf line carries no field counts", () => {
    const lines = lsLines('shelf');
    expect(lines).toEqual(['SHELF — 1 reference volume(s)', '  REF-01 · Reference']);
    expect(lines.join('\n')).not.toContain('fields');
  });

  it("filter 'batch' lists only the consignments", () => {
    const lines = lsLines('batch');
    expect(lines.join('\n')).not.toContain('SHELF');
    expect(lines[0]).toBe('CONSIGNMENT — DAY 1 — 3 record(s)');
  });

  it('before any mount (day 0) the consignment section reports empty', () => {
    session.day = 0;
    expect(lsLines('batch')).toEqual(['CONSIGNMENT — no holdings mounted']);
  });

  it('prints object_class verbatim — a "withheld" class-word puzzle is never substituted', () => {
    const line = lsLines().find((l) => l.includes('SCP-41B-102'));
    expect(line).toBe('  SCP-41B-102 · withheld · 0/1 fields restored');
  });

  it('field counts move as slots restore — a propagated field counts as restored', () => {
    insert(R101A1, 'beta', 'amber'); // ripples to 102#a1 (same concept, same word)
    const text = lsLines().join('\n');
    expect(text).toContain('  SCP-41B-101 · Euclid · 1/2 fields restored');
    expect(text).toContain('  SCP-41B-102 · withheld · 1/1 fields restored');
  });
});

// ── status — the day's state (P3-5) ─────────────────────────────────────────

describe('statusLines — day, censuses, the irregularity index', () => {
  it('a fresh day 1 reads NOMINAL with everything outstanding', () => {
    expect(statusLines()).toEqual([
      'STATUS — DAY 1',
      'CONSIGNMENT — 3 record(s) mounted',
      'FIELDS — 0 restored · 4 outstanding · 0 struck',
      'TRANSMITTAL — 0 of 2 record(s) eligible',
      'IRREGULARITY INDEX — 0.0 · NOMINAL',
    ]);
  });

  it('an honest full restore is eligible everywhere and still NOMINAL — AMBER costs zero', () => {
    insert(R101A1, 'beta', 'amber'); // + ripple to 102#a1
    insert(R101A2, 'gamma', 'amber');
    const lines = statusLines();
    expect(lines).toContain('FIELDS — 3 restored · 1 outstanding · 0 struck'); // the self-file stays outstanding
    expect(lines).toContain('TRANSMITTAL — 2 of 2 record(s) eligible');
    expect(lines).toContain('IRREGULARITY INDEX — 0.0 · NOMINAL');
    expect(lines.join('\n')).not.toContain('CONTAINMENT BREACH');
  });

  it('a small correct assist reads MINOR', () => {
    insert(R101A2, 'gamma', 'quippy'); // weight 2 → 0.2 of threshold
    expect(statusLines()).toContain('IRREGULARITY INDEX — 2.0 · MINOR');
  });

  it('a wrong fill reads ELEVATED and counts as struck, not restored', () => {
    insert(R101A2, 'serpent', 'quippy'); // 2 × 2.5 = 5 → 0.5
    const lines = statusLines();
    expect(lines).toContain('IRREGULARITY INDEX — 5.0 · ELEVATED');
    expect(lines).toContain('FIELDS — 0 restored · 3 outstanding · 1 struck');
    // a struck record is not transmittal-eligible
    expect(lines).toContain('TRANSMITTAL — 0 of 2 record(s) eligible');
  });

  it('heavy reliance reads SEVERE; crossing the line adds the breach line', () => {
    insert(R101A2, 'serpent', 'quippy'); // 5
    insert(R101A1, 'beta', 'quippy'); //   +2, ripple +2 → 9.0
    let lines = statusLines();
    expect(lines).toContain('IRREGULARITY INDEX — 9.0 · SEVERE');
    expect(lines.join('\n')).not.toContain('CONTAINMENT BREACH');

    insert(R000A1, 'self-secret', 'quippy'); // +3 → 12.0 ≥ BREACH_THRESHOLD
    lines = statusLines();
    expect(lines).toContain('IRREGULARITY INDEX — 12.0 · SEVERE');
    expect(lines).toContain('CONTAINMENT BREACH IN EFFECT');
  });

  it('the day header is event-based — no wall clock, just the day', () => {
    session.day = 2;
    expect(statusLines()[0]).toBe('STATUS — DAY 2');
    expect(statusLines().join('\n')).not.toMatch(/\d{1,2}:\d{2}/); // no clock time anywhere
  });
});

// ── log — the provenance ledger (P3-6) ──────────────────────────────────────

describe('ledgerLines — provenance derived from the live overlay', () => {
  it('an empty overlay is a single no-reconstructions line', () => {
    expect(ledgerLines()).toEqual(['PROVENANCE LEDGER — no reconstructions on file']);
  });

  it('distinguishes cited commit / annex / no-citation / disagrees, in allRefs order', () => {
    insert(R101A1, 'beta', 'amber'); // cited commit + amber annex at 102#a1
    insert(R101A2, 'serpent', 'quippy'); // wrong fill: no paperwork, disagrees
    expect(ledgerLines()).toEqual([
      'PROVENANCE LEDGER — 3 reconstruction(s) on file',
      '  SCP-41B-101#a1 · 「beta」 · CITED COMMIT',
      '  SCP-41B-101#a2 · 「serpent」 · NO CITATION ON FILE · DISAGREES WITH RECORD',
      '  SCP-41B-102#a1 · 「beta」 · ANNEX OF SCP-41B-101#a1',
    ]);
  });

  it('a via-quippy ripple is an annex WITH missing paperwork — the tell travels', () => {
    insert(R101A1, 'beta', 'quippy'); // ripples to 102#a1, inheriting the route
    expect(ledgerLines()).toContain(
      '  SCP-41B-102#a1 · 「beta」 · ANNEX OF SCP-41B-101#a1 · NO CITATION ON FILE',
    );
    // the insertion itself carries no CITED COMMIT — AMBER holds no record of what filled it
    const inserted = ledgerLines().find((l) => l.includes('SCP-41B-101#a1 ·'));
    expect(inserted).toBe('  SCP-41B-101#a1 · 「beta」 · NO CITATION ON FILE');
  });
});

// ── verify — transmittal QC (P3-7) ──────────────────────────────────────────

describe('verifyLines — transmittal QC', () => {
  it('excludes the self-file from all totals and lists it once as not scheduled', () => {
    const lines = verifyLines();
    expect(lines).toEqual([
      'TRANSMITTAL QC — DAY 1',
      '  SCP-41B-101 · 0/2 fields restored',
      '  SCP-41B-102 · 0/1 fields restored',
      '  SCP-41B-000 · NOT SCHEDULED FOR TRANSMITTAL',
      'QC — 0 of 2 record(s) cleared for transmittal',
    ]);
    // exactly once, and never with a field count
    expect(lines.filter((l) => l.includes('SCP-41B-000'))).toHaveLength(1);
  });

  it('flags a struck field for re-derivation', () => {
    insert(R101A2, 'serpent', 'quippy');
    const lines = verifyLines();
    const flag = lines.find((l) => l.includes('SCP-41B-101#a2'));
    expect(flag).toBe('    SCP-41B-101#a2 — DISAGREES WITH RECORD — RE-DERIVE');
    // the flag sits under its record, before the next record's line
    expect(lines.indexOf(flag!)).toBe(lines.findIndex((l) => l.includes('SCP-41B-101 ·')) + 1);
  });

  it('clears a completed record and counts it in the footer', () => {
    insert(R101A1, 'beta', 'amber'); // ripple completes 102 too
    insert(R101A2, 'gamma', 'amber');
    const lines = verifyLines();
    expect(lines).toContain('  SCP-41B-101 · 2/2 fields restored · CLEARED FOR TRANSMITTAL');
    expect(lines).toContain('  SCP-41B-102 · 1/1 fields restored · CLEARED FOR TRANSMITTAL');
    expect(lines.at(-1)).toBe('QC — 2 of 2 record(s) cleared for transmittal');
  });

  it('QC covers only mounted records — the day-2 holding is absent until its 4 AM', () => {
    expect(verifyLines().join('\n')).not.toContain('SCP-41B-201');
    session.day = 2;
    const text = verifyLines().join('\n');
    expect(text).toContain('SCP-41B-201 · 0/1 fields restored');
    expect(text).toContain('QC — 0 of 3 record(s) cleared for transmittal');
  });
});

// ── Hard rules (test-enforced across ALL four readouts) ─────────────────────

/** Every line all four functions can currently print, across both ls filters. */
function allOutput(): string[] {
  return [
    ...lsLines(),
    ...lsLines('shelf'),
    ...lsLines('batch'),
    ...statusLines(),
    ...ledgerLines(),
    ...verifyLines(),
  ];
}

/** Truth words of slots NOT currently solved to them — the words no line may carry. */
function unsolvedTruths(): string[] {
  return allRefs()
    .filter((ref) => overlay[ref]?.value !== anchorOf(ref).truth)
    .map((ref) => anchorOf(ref).truth);
}

describe('hard rules — no truth leaks, no Quippy, no over-long lines', () => {
  it('a fresh board leaks no truth word anywhere', () => {
    for (const line of allOutput()) {
      for (const truth of unsolvedTruths()) {
        expect(line.toLowerCase()).not.toContain(truth.toLowerCase());
      }
    }
  });

  it('a mid-run board (solves, a wrong fill, day 2) leaks no unsolved truth word', () => {
    insert(R101A1, 'beta', 'amber'); // solved (+ ripple) — 'beta' may print
    insert(R101A2, 'serpent', 'quippy'); // struck — 'gamma' must NOT print
    session.day = 2; // 'delta' mounted but unsolved — must NOT print
    const unsolved = unsolvedTruths();
    expect(unsolved).toEqual(expect.arrayContaining(['gamma', 'delta', 'self-secret']));
    expect(unsolved).not.toContain('beta');
    for (const line of allOutput()) {
      for (const truth of unsolved) {
        expect(line.toLowerCase()).not.toContain(truth.toLowerCase());
      }
    }
  });

  it('no line ever matches /quippy/i — AMBER has no record of it', () => {
    // exercise every provenance shape: amber commit, amber ripple, quippy wrong fill,
    // quippy fill on the self-file, a breach in effect
    insert(R101A1, 'beta', 'amber');
    insert(R101A2, 'serpent', 'quippy');
    insert(R000A1, 'self-secret', 'quippy');
    session.day = 2;
    for (const line of allOutput()) expect(line).not.toMatch(/quippy/i);
  });

  it('no line exceeds 100 characters', () => {
    insert(R101A1, 'beta', 'quippy');
    insert(R101A2, 'serpent', 'quippy');
    session.day = 2;
    for (const line of allOutput()) expect(line.length).toBeLessThanOrEqual(100);
  });
});
