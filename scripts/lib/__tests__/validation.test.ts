// Build-time validation (v2 reset): each rule is proven to fire on a broken fixture
// and pass on a valid one. Covers per-file parsing (single truth + grounding) and the
// cross-file invariants (entity_self, xrefs, grounding-citeability).

import { describe, it, expect } from 'vitest';
import { parseEntry, EntryParseError } from '../parse-entry.ts';
import {
  validateCorpus,
  checkEntitySelf,
  checkXrefs,
  checkGroundingCiteable,
  bodyContainsWord,
} from '../validate-corpus.ts';
import { VALID_003, VALID_001, validFiles, clone } from './fixtures.ts';

function index(files = validFiles()) {
  return new Map(files.map((f) => [f.item, f]));
}

describe('per-file parsing (parseEntry)', () => {
  it('parses a valid entry', () => {
    const f = parseEntry(VALID_003);
    expect(f.item).toBe('SCP-41B-003');
    expect(f.anchors).toHaveLength(1);
    expect(f.anchors[0].truth).toBe('switchboard');
    expect(f.anchors[0].grounding).toEqual({ kind: 'teaching', citeIn: ['SCP-41B-001'] });
    expect(f.entity_self).toBe(false);
  });

  it('treats empty concept as local-only (undefined)', () => {
    const raw = VALID_003.replace('concept: "the-quiet-exchange"', 'concept: ""');
    expect(parseEntry(raw).anchors[0].concept).toBeUndefined();
  });

  // RULE 1 — missing anchor: a ⟦token⟧ with no matching frontmatter anchor.
  it('fires on a body token with no matching anchor (missing-anchor)', () => {
    const raw = VALID_003.replace('⟦a1⟧', '⟦a1⟧ and ⟦a9⟧');
    expect(() => parseEntry(raw)).toThrow(EntryParseError);
    expect(() => parseEntry(raw)).toThrow(/⟦a9⟧/);
  });

  it('rejects an unknown slot_type', () => {
    const raw = VALID_003.replace('slot_type: "object"', 'slot_type: "widget"');
    expect(() => parseEntry(raw)).toThrow(/slot_type/);
  });

  it('rejects an empty truth', () => {
    const raw = VALID_003.replace('truth: "switchboard"', 'truth: ""');
    expect(() => parseEntry(raw)).toThrow(/truth/);
  });

  it('parses an optional lure (Quippy\'s escalatory wrong word)', () => {
    const raw = VALID_003.replace('truth: "switchboard"', 'truth: "switchboard"\n    lure: "exchange"');
    expect(parseEntry(raw).anchors[0].lure).toBe('exchange');
  });

  it('omits lure when absent (Quippy only offers the truth)', () => {
    expect(parseEntry(VALID_003).anchors[0].lure).toBeUndefined();
  });

  it('rejects a lure equal to the truth (a lure must be the WRONG word)', () => {
    const raw = VALID_003.replace('truth: "switchboard"', 'truth: "switchboard"\n    lure: "switchboard"');
    expect(() => parseEntry(raw)).toThrow(/lure/);
  });

  it('rejects an unknown grounding kind', () => {
    const raw = VALID_003.replace('kind: "teaching"', 'kind: "telepathy"');
    expect(() => parseEntry(raw)).toThrow(/grounding/);
  });

  it('rejects a teaching grounding with an empty citeIn', () => {
    const raw = VALID_003.replace('citeIn: ["SCP-41B-001"]', 'citeIn: []');
    expect(() => parseEntry(raw)).toThrow(/citeIn/);
  });

  it('parses an inference grounding with a positive threshold', () => {
    const raw = VALID_003.replace(
      'grounding:\n      kind: "teaching"\n      citeIn: ["SCP-41B-001"]',
      'grounding:\n      kind: "inference"\n      threshold: 3',
    );
    expect(parseEntry(raw).anchors[0].grounding).toEqual({ kind: 'inference', threshold: 3 });
  });

  it('rejects a missing frontmatter block', () => {
    expect(() => parseEntry('# just prose, no frontmatter')).toThrow(/frontmatter/);
  });

  it('rejects an unknown breach_effect kind', () => {
    const raw = VALID_003.replace('kind: "corrupt_search"', 'kind: "explode"');
    expect(() => parseEntry(raw)).toThrow(/breach_effect/);
  });
});

describe('cross-file: entity_self (exactly one)', () => {
  it('passes with exactly one self-file', () => {
    expect(checkEntitySelf(validFiles())).toEqual([]);
  });

  it('fires when no file is the self-file (zero-entity-self)', () => {
    const files = clone(validFiles());
    for (const f of files) f.entity_self = false;
    const errs = checkEntitySelf(files);
    expect(errs).toHaveLength(1);
    expect(errs[0].rule).toBe('entity-self');
    expect(errs[0].message).toMatch(/no file/);
  });

  it('fires when two files are the self-file (two-entity-self)', () => {
    const files = clone(validFiles());
    for (const f of files) f.entity_self = true;
    const errs = checkEntitySelf(files);
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toMatch(/2 files/);
  });
});

describe('cross-file: xref resolution', () => {
  it('passes when every xref and wikilink resolves', () => {
    const files = validFiles();
    expect(checkXrefs(files, index(files))).toEqual([]);
  });

  it('fires on an xref to a nonexistent item (dangling-xref)', () => {
    const files = clone(validFiles());
    files[0].xrefs = ['SCP-41B-999'];
    files[0].body = 'see [[SCP-41B-999]].';
    const errs = checkXrefs(files, index(files));
    expect(errs.some((e) => e.rule === 'xref-resolves' && /SCP-41B-999/.test(e.message))).toBe(true);
  });

  it('fires when a body wikilink is not declared in xrefs (undeclared-wikilink)', () => {
    const files = clone(validFiles());
    files[0].body = 'see [[SCP-41B-001]] and [[SCP-41B-002]].';
    const errs = checkXrefs(files, index(files));
    expect(errs.some((e) => e.rule === 'wikilink-declared' && /SCP-41B-002/.test(e.message))).toBe(true);
  });

  it('fires when a declared xref has NO body wikilink (xref-linked — a dead traversal edge)', () => {
    // The 005/007/009 playtest bug: an xref the player can reach in the graph but has no
    // clickable link to follow. Declare an xref but never link it in prose.
    const files = clone(validFiles());
    const target = files[1].item; // a real second file
    files[0].xrefs = [target];
    files[0].body = 'this body declares the xref but never links it.';
    const errs = checkXrefs(files, index(files));
    expect(errs.some((e) => e.rule === 'xref-linked' && e.message.includes(target))).toBe(true);
  });
});

describe('bodyContainsWord', () => {
  it('finds a word in plain prose, case-insensitively', () => {
    expect(bodyContainsWord('the Ledger is here', 'ledger')).toBe(true);
  });
  it('does not count a word that only appears inside a redaction token', () => {
    expect(bodyContainsWord('the ⟦ledger⟧ slot', 'ledger')).toBe(false);
  });
  it('returns false when absent', () => {
    expect(bodyContainsWord('nothing relevant', 'switchboard')).toBe(false);
  });
});

describe('cross-file: grounding citeability (the v2 invariant)', () => {
  it('passes when each teaching slot is cited in a file holding its word in the clear', () => {
    expect(checkGroundingCiteable(validFiles(), index())).toEqual([]);
  });

  // RULE — the cited file does NOT hold the word in the clear.
  it('fires when a teaching slot cites a file that lacks its word', () => {
    const files = clone(validFiles());
    files[1].body = 'catalogued as ⟦a1⟧, see [[SCP-41B-003]].'; // drops "switchboard"
    const errs = checkGroundingCiteable(files, new Map(files.map((f) => [f.item, f])));
    expect(errs.some((e) => e.rule === 'grounding-citeable' && /switchboard/.test(e.message))).toBe(true);
  });

  it('fires when a teaching slot cites a nonexistent file', () => {
    const files = clone(validFiles());
    (files[0].anchors[0].grounding as { kind: 'teaching'; citeIn: string[] }).citeIn = ['SCP-41B-999'];
    files[0].xrefs = ['SCP-41B-001', 'SCP-41B-999'];
    const errs = checkGroundingCiteable(files, new Map(files.map((f) => [f.item, f])));
    expect(errs.some((e) => e.rule === 'grounding-citeable' && /SCP-41B-999/.test(e.message))).toBe(true);
  });

  it('fires when a teaching slot cites a file not declared as an xref', () => {
    const files = clone(validFiles());
    // point 003#a1 at a file it does hold the word in, but that isn't an xref.
    files[0].xrefs = []; // remove the declared link
    files[0].body = 'manifests as ⟦a1⟧.'; // also drop the wikilink so checkXrefs is clean
    const errs = checkGroundingCiteable(files, new Map(files.map((f) => [f.item, f])));
    expect(errs.some((e) => e.rule === 'grounding-citeable' && /not a declared xref/.test(e.message))).toBe(true);
  });

  it('does not check inference slots for literal co-occurrence', () => {
    const files = clone(validFiles());
    files[0].anchors[0].grounding = { kind: 'inference', threshold: 2 };
    files[0].anchors[0].truth = 'a word that appears nowhere';
    expect(checkGroundingCiteable(files, new Map(files.map((f) => [f.item, f])))).toEqual([]);
  });
});

describe('validateCorpus (aggregate)', () => {
  it('returns no errors for a valid corpus', () => {
    expect(validateCorpus(validFiles())).toEqual([]);
  });

  it('collects multiple failures in one pass', () => {
    const files = clone(validFiles());
    for (const f of files) f.entity_self = false; // entity-self failure
    files[0].xrefs = ['SCP-41B-999']; // xref failure
    files[0].body = 'see [[SCP-41B-999]].'; // and the wikilink failure
    const errs = validateCorpus(files);
    const rules = new Set(errs.map((e) => e.rule));
    expect(rules).toContain('entity-self');
    expect(rules).toContain('xref-resolves');
  });

  it('round-trips the two-file baseline through parse + validate', () => {
    const files = [parseEntry(VALID_003), parseEntry(VALID_001)];
    expect(validateCorpus(files)).toEqual([]);
  });
});

// ── v3 Phase 1 — collections + the day cycle ────────────────────────────────

describe('per-file parsing — collection/day (v3)', () => {
  const asLocal = (raw: string) =>
    raw
      .replace('site: "Site-41B"', 'site: "Site-41B"\ncollection: "local"')
      // a local file is in the clear: strip the anchor list and its body token
      .replace(/anchors:[\s\S]*?exposure_weight: 2\n/, 'anchors: []\n')
      .replace('⟦a1⟧', 'a switchboard');

  it('parses collection and day; both default to absent (inbound day-1 semantics)', () => {
    const f = parseEntry(VALID_003);
    expect(f.collection).toBeUndefined();
    expect(f.day).toBeUndefined();
    const g = parseEntry(
      VALID_003.replace('site: "Site-41B"', 'site: "Site-41B"\ncollection: "inbound"\nday: 3'),
    );
    expect(g.collection).toBe('inbound');
    expect(g.day).toBe(3);
  });

  it('parses a valid local (shelf) file — zero anchors, no day', () => {
    const f = parseEntry(asLocal(VALID_003));
    expect(f.collection).toBe('local');
    expect(f.anchors).toHaveLength(0);
  });

  it('rejects an unknown collection', () => {
    const raw = VALID_003.replace('site: "Site-41B"', 'site: "Site-41B"\ncollection: "outbound"');
    expect(() => parseEntry(raw)).toThrow(/collection/);
  });

  it('rejects a non-positive or fractional day', () => {
    const raw = VALID_003.replace('site: "Site-41B"', 'site: "Site-41B"\nday: 0');
    expect(() => parseEntry(raw)).toThrow(/day/);
    const raw2 = VALID_003.replace('site: "Site-41B"', 'site: "Site-41B"\nday: 1.5');
    expect(() => parseEntry(raw2)).toThrow(/day/);
  });

  it('rejects a local file carrying a day (the shelf was always here)', () => {
    const raw = asLocal(VALID_003).replace('collection: "local"', 'collection: "local"\nday: 1');
    expect(() => parseEntry(raw)).toThrow(/local.*day|day.*local/i);
  });

  it('rejects a local file with anchors (the shelf is in the clear)', () => {
    const raw = VALID_003.replace('site: "Site-41B"', 'site: "Site-41B"\ncollection: "local"');
    expect(() => parseEntry(raw)).toThrow(/zero anchors/);
  });
});

describe('grounding-citeable — the day/shelf rules (v3)', () => {
  it('fires when the cited file mounts AFTER the citing file', () => {
    const files = clone(validFiles());
    const cited = files.find((f) => f.item === 'SCP-41B-001')!;
    cited.day = 2; // 003 (day 1 by default) cites 001, which now arrives day 2
    const errors = checkGroundingCiteable(files, index(files));
    expect(errors.some((e) => e.rule === 'grounding-citeable' && /mounts AFTER/.test(e.message))).toBe(true);
  });

  it('passes when the cited file is local — always mounted, and no xref needed', () => {
    const files = clone(validFiles());
    const cited = files.find((f) => f.item === 'SCP-41B-001')!;
    cited.collection = 'local';
    cited.anchors = []; // the shelf is in the clear
    const citing = files.find((f) => f.item === 'SCP-41B-003')!;
    // remove the declared xref AND the body wikilink: the shelf needs no link.
    citing.xrefs = [];
    citing.body = citing.body.replace('[[SCP-41B-001]]', 'SCP-41B-001');
    const errors = checkGroundingCiteable(files, index(files));
    expect(errors).toHaveLength(0);
  });

  it('still requires the xref for an inbound→inbound cite (discovery discipline)', () => {
    const files = clone(validFiles());
    const citing = files.find((f) => f.item === 'SCP-41B-003')!;
    citing.xrefs = [];
    citing.body = citing.body.replace('[[SCP-41B-001]]', 'SCP-41B-001');
    const errors = checkGroundingCiteable(files, index(files));
    expect(errors.some((e) => e.rule === 'grounding-citeable' && /not a declared xref/.test(e.message))).toBe(true);
  });
});
