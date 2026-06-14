// Authoring pipeline: vault/entries/*.md → static/corpus.json.
// The vault is authoritative; this script regenerates the corpus deterministically.
// Authors never edit JSON. Run via `npm run build:corpus` or as a Vite pre-step.
// Mirrors technical_document.md §8.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Corpus, ScpFile } from '../src/lib/corpus.ts';
import { parseEntry, EntryParseError } from './lib/parse-entry.ts';
import { validateCorpus, CorpusValidationError, type ValidateOptions } from './lib/validate-corpus.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..');
const ENTRIES_DIR = join(REPO_ROOT, 'vault', 'entries');
const OUT_FILE = join(REPO_ROOT, 'static', 'corpus.json');

/** Files prefixed `_` (e.g. _WIP- drafts) are ignored by the parser, per CLAUDE.md. */
function entryFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort();
}

/** Parse every entry under `dir`, throwing EntryParseError on the first bad file. */
export function parseEntries(dir: string): ScpFile[] {
  const files: ScpFile[] = [];
  for (const name of entryFiles(dir)) {
    const raw = readFileSync(join(dir, name), 'utf8');
    try {
      files.push(parseEntry(raw));
    } catch (e) {
      if (e instanceof EntryParseError) {
        throw new EntryParseError(e.message, e.file ?? name);
      }
      throw e;
    }
  }
  return files;
}

/** Parse + validate + serialize. Returns the corpus; throws on any failure. */
export function buildCorpus(dir: string, opts: ValidateOptions = {}): Corpus {
  const files = parseEntries(dir);
  const errors = validateCorpus(files, opts);
  if (errors.length > 0) {
    throw new CorpusValidationError(errors);
  }
  const corpus: Corpus = {};
  for (const f of files) corpus[f.item] = f;
  return corpus;
}

function main(): void {
  // `--allow-incomplete` permits a corpus with no self-file (the gap between
  // deleting the placeholder SCP-41B-000 and authoring the real Quippy self-file).
  const allowIncomplete = process.argv.includes('--allow-incomplete');
  let corpus: Corpus;
  try {
    corpus = buildCorpus(ENTRIES_DIR, { allowIncomplete });
  } catch (e) {
    if (e instanceof EntryParseError || e instanceof CorpusValidationError) {
      console.error(`\n✗ build-corpus failed:\n${e.message}\n`);
      process.exit(1);
    }
    throw e;
  }

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(corpus, null, 2) + '\n', 'utf8');

  const count = Object.keys(corpus).length;
  console.log(`✓ build-corpus: ${count} entr${count === 1 ? 'y' : 'ies'} → ${OUT_FILE}`);
}

// Run only when invoked directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('build-corpus.ts')) {
  main();
}
