// C2 driver-level proof: the build pipeline round-trips a multi-file vault through
// parse → cross-file validate → corpus, skips `_`-prefixed drafts, and surfaces
// validation failures. Uses a temp directory so vault/entries/ is never touched
// (the real entries are L1–L3, parked for the model switch).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildCorpus, parseEntries } from '../build-corpus.ts';
import { CorpusValidationError } from '../lib/validate-corpus.ts';
import { VALID_003, VALID_001 } from '../lib/__tests__/fixtures.ts';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'corpus-test-'));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function write(name: string, content: string) {
  writeFileSync(join(dir, name), content, 'utf8');
}

describe('buildCorpus (driver)', () => {
  it('round-trips a valid multi-file vault into a keyed corpus', () => {
    write('SCP-41B-003.md', VALID_003);
    write('SCP-41B-001.md', VALID_001);
    const corpus = buildCorpus(dir);
    expect(Object.keys(corpus).sort()).toEqual(['SCP-41B-001', 'SCP-41B-003']);
    expect(corpus['SCP-41B-003'].anchors[0].concept).toBe('the-quiet-exchange');
  });

  it('ignores `_`-prefixed draft files', () => {
    write('SCP-41B-003.md', VALID_003);
    write('SCP-41B-001.md', VALID_001);
    // A deliberately broken WIP draft must NOT be parsed or validated.
    write('_WIP-broken.md', 'this is not even valid frontmatter');
    const corpus = buildCorpus(dir);
    expect(Object.keys(corpus)).toHaveLength(2);
  });

  it('fails the build when a cross-file invariant is violated', () => {
    // Both files self → entity_self failure surfaces from the driver.
    write('SCP-41B-003.md', VALID_003.replace('entity_self: false', 'entity_self: true'));
    write('SCP-41B-001.md', VALID_001);
    expect(() => buildCorpus(dir)).toThrow(CorpusValidationError);
  });

  it('parseEntries reads files in sorted order', () => {
    write('SCP-41B-003.md', VALID_003);
    write('SCP-41B-001.md', VALID_001);
    expect(parseEntries(dir).map((f) => f.item)).toEqual(['SCP-41B-001', 'SCP-41B-003']);
  });
});
