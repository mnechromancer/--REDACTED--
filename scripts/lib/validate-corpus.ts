// Cross-file corpus invariants. Pure over a parsed set of ScpFiles — no filesystem —
// so each rule is unit-testable on in-memory fixtures (story C2t).
// Mirrors technical_document.md §8 step 3 (rules 2–4) and CLAUDE.md "Cross-file invariants".

import type { ScpFile } from '../../src/lib/corpus.ts';
import { ANCHOR_TOKEN, WIKILINK } from './parse-entry.ts';

/** A single validation failure. Multiple are collected and reported together. */
export interface ValidationError {
  rule: string;
  message: string;
  file?: string;
}

export class CorpusValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super(
      `corpus validation failed (${errors.length} error${errors.length === 1 ? '' : 's'}):\n` +
        errors.map((e) => `  [${e.rule}] ${e.file ? e.file + ': ' : ''}${e.message}`).join('\n'),
    );
    this.name = 'CorpusValidationError';
  }
}

/**
 * Validate every cross-file invariant over the full set. Collects all failures
 * rather than throwing on the first, so authors see every problem in one build.
 * Returns the error list (empty = valid); the build driver turns a non-empty
 * list into a CorpusValidationError.
 */
export function validateCorpus(files: ScpFile[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const byItem = new Map<string, ScpFile>();

  // Duplicate item ids would make xref/propagation resolution ambiguous.
  for (const f of files) {
    if (byItem.has(f.item)) {
      errors.push({
        rule: 'unique-item',
        message: `duplicate item id "${f.item}"`,
        file: f.item,
      });
    }
    byItem.set(f.item, f);
  }

  errors.push(...checkEntitySelf(files));
  errors.push(...checkXrefs(files, byItem));
  errors.push(...checkConceptAlignment(files));

  return errors;
}

/** Rule 4: exactly one file has entity_self: true. */
export function checkEntitySelf(files: ScpFile[]): ValidationError[] {
  const selves = files.filter((f) => f.entity_self);
  if (selves.length === 1) return [];
  if (selves.length === 0) {
    return [{ rule: 'entity-self', message: 'no file sets entity_self: true (exactly one required)' }];
  }
  return [
    {
      rule: 'entity-self',
      message: `${selves.length} files set entity_self: true (exactly one allowed): ${selves
        .map((f) => f.item)
        .join(', ')}`,
    },
  ];
}

/**
 * Rule 3: every declared xref resolves to an existing item. Also enforces
 * consistency between frontmatter `xrefs` and body `[[wikilinks]]` per §8 step 2:
 * every wikilinked item must be declared as an xref (so the cross-reference graph
 * the parser validates matches the one the prose asserts).
 */
export function checkXrefs(files: ScpFile[], byItem: Map<string, ScpFile>): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const f of files) {
    for (const ref of f.xrefs) {
      if (!byItem.has(ref)) {
        errors.push({
          rule: 'xref-resolves',
          message: `xref "${ref}" resolves to no existing item`,
          file: f.item,
        });
      }
      if (ref === f.item) {
        errors.push({ rule: 'xref-resolves', message: `xref "${ref}" is a self-reference`, file: f.item });
      }
    }
    const declared = new Set(f.xrefs);
    for (const m of f.body.matchAll(WIKILINK)) {
      const link = m[1].trim();
      if (!declared.has(link)) {
        errors.push({
          rule: 'wikilink-declared',
          message: `body wikilink [[${link}]] is not declared in xrefs`,
          file: f.item,
        });
      }
    }
  }
  return errors;
}

/**
 * Rule 2 (the propagation backbone): anchors sharing a `concept` key must have
 * equal-length, index-aligned mutation sets. Equal length is the build-time
 * guarantee that makes index-aligned propagation (candidate k → candidate k in
 * every carrier) well-defined. This is the invariant the concept_key_registry.md
 * exists to coordinate.
 */
export function checkConceptAlignment(files: ScpFile[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // concept -> list of { ref, length }
  const groups = new Map<string, { ref: string; length: number }[]>();
  for (const f of files) {
    for (const a of f.anchors) {
      if (!a.concept) continue;
      const ref = `${f.item}#${a.id}`;
      const list = groups.get(a.concept) ?? [];
      list.push({ ref, length: a.mutations.length });
      groups.set(a.concept, list);
    }
  }

  for (const [concept, carriers] of groups) {
    const len = carriers[0].length;
    const mismatched = carriers.filter((c) => c.length !== len);
    if (mismatched.length > 0) {
      const detail = carriers.map((c) => `${c.ref}=${c.length}`).join(', ');
      errors.push({
        rule: 'concept-alignment',
        message: `concept "${concept}" has misaligned mutation-set lengths: ${detail}`,
      });
    }
  }

  return errors;
}

/** Re-export so the build driver can surface the per-file token rule alongside these. */
export { ANCHOR_TOKEN };
