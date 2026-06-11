// C2t — each build-time validation rule is proven to fire on a broken fixture
// and to pass on a valid one. Covers technical_document.md §8 step 3 and the
// CLAUDE.md cross-file invariants.

import { describe, it, expect } from 'vitest';
import { parseEntry, EntryParseError } from '../parse-entry.ts';
import {
  validateCorpus,
  checkEntitySelf,
  checkXrefs,
  checkConceptAlignment,
} from '../validate-corpus.ts';
import { VALID_003, VALID_001, validFiles, clone } from './fixtures.ts';

describe('per-file parsing (parseEntry)', () => {
  it('parses a valid entry', () => {
    const f = parseEntry(VALID_003);
    expect(f.item).toBe('SCP-41B-003');
    expect(f.anchors).toHaveLength(1);
    expect(f.anchors[0].concept).toBe('the-quiet-exchange');
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

  it('rejects a redaction_level outside 1–5', () => {
    const raw = VALID_003.replace('redaction_level: 3', 'redaction_level: 7');
    expect(() => parseEntry(raw)).toThrow(/redaction_level/);
  });

  it('rejects an empty mutation set', () => {
    const raw = VALID_003.replace(
      /mutations:\n(\s+- ".*"\n)+/,
      'mutations: []\n',
    );
    expect(() => parseEntry(raw)).toThrow(/mutations/);
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

  // RULE 4a — zero entity_self.
  it('fires when no file is the self-file (zero-entity-self)', () => {
    const files = clone(validFiles());
    for (const f of files) f.entity_self = false;
    const errs = checkEntitySelf(files);
    expect(errs).toHaveLength(1);
    expect(errs[0].rule).toBe('entity-self');
    expect(errs[0].message).toMatch(/no file/);
  });

  // RULE 4b — two entity_self.
  it('fires when two files are the self-file (two-entity-self)', () => {
    const files = clone(validFiles());
    for (const f of files) f.entity_self = true;
    const errs = checkEntitySelf(files);
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toMatch(/2 files/);
  });
});

describe('cross-file: xref resolution', () => {
  function index(files = validFiles()) {
    return new Map(files.map((f) => [f.item, f]));
  }

  it('passes when every xref and wikilink resolves', () => {
    const files = validFiles();
    expect(checkXrefs(files, index(files))).toEqual([]);
  });

  // RULE 3 — dangling xref.
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
});

describe('cross-file: concept alignment (index-aligned mutation sets)', () => {
  it('passes when shared-concept carriers have equal-length mutation sets', () => {
    expect(checkConceptAlignment(validFiles())).toEqual([]);
  });

  // RULE 2 — misaligned mutation set.
  it('fires when shared-concept carriers have different mutation-set lengths (misaligned-mutations)', () => {
    const files = clone(validFiles());
    files[1].anchors[0].mutations = ['only', 'two']; // baseline carriers have 3
    const errs = checkConceptAlignment(files);
    expect(errs).toHaveLength(1);
    expect(errs[0].rule).toBe('concept-alignment');
    expect(errs[0].message).toMatch(/the-quiet-exchange/);
  });

  it('ignores length differences across DIFFERENT concepts', () => {
    const files = clone(validFiles());
    files[1].anchors[0].concept = 'a-different-key';
    files[1].anchors[0].mutations = ['only', 'two'];
    expect(checkConceptAlignment(files)).toEqual([]);
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
    files[1].anchors[0].mutations = ['x']; // alignment failure
    const errs = validateCorpus(files);
    const rules = new Set(errs.map((e) => e.rule));
    expect(rules).toContain('entity-self');
    expect(rules).toContain('xref-resolves');
    expect(rules).toContain('concept-alignment');
  });

  it('round-trips the two-file baseline through parse + validate', () => {
    const files = [parseEntry(VALID_003), parseEntry(VALID_001)];
    expect(validateCorpus(files)).toEqual([]);
  });
});
