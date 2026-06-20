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

/** Build-time options. `allowIncomplete` relaxes the must-have-a-self-file rule. */
export interface ValidateOptions {
  /**
   * When true, the "exactly one entity_self" rule is relaxed to "at most one":
   * a corpus with NO self-file is allowed. This is the escape hatch for deleting
   * the placeholder SCP-41B-000 before the real Quippy self-file is authored —
   * `npm run build:corpus -- --allow-incomplete` keeps the build green in the gap.
   * (More than one self-file is always an error.)
   */
  allowIncomplete?: boolean;
}

/**
 * Validate every cross-file invariant over the full set. Collects all failures
 * rather than throwing on the first, so authors see every problem in one build.
 * Returns the error list (empty = valid); the build driver turns a non-empty
 * list into a CorpusValidationError.
 */
export function validateCorpus(files: ScpFile[], opts: ValidateOptions = {}): ValidationError[] {
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

  errors.push(...checkEntitySelf(files, opts.allowIncomplete));
  errors.push(...checkXrefs(files, byItem));
  errors.push(...checkGroundingCiteable(files, byItem));

  return errors;
}

/** Rule 4: exactly one file has entity_self: true (at most one if allowIncomplete). */
export function checkEntitySelf(files: ScpFile[], allowIncomplete = false): ValidationError[] {
  const selves = files.filter((f) => f.entity_self);
  if (selves.length === 1) return [];
  if (selves.length === 0) {
    if (allowIncomplete) return []; // explicit gap: placeholder removed, real one not yet authored
    return [{ rule: 'entity-self', message: 'no file sets entity_self: true (exactly one required; pass --allow-incomplete to permit the gap)' }];
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
 * Does `body` contain `word` as plain prose — i.e. literally present, outside any
 * `⟦anchor⟧` redaction token (a slot showing its own redacted word doesn't count as
 * grounding it). Case-insensitive; the comparison both sides see is the same one the
 * runtime citation gate mirrors, so "citeable at build" == "citeable at play". Body
 * is already comment-free (stripComments at parse time).
 */
export function bodyContainsWord(body: string, word: string): boolean {
  const plain = body.replace(ANCHOR_TOKEN, ' '); // a slot's own bar never grounds the word
  return plain.toLowerCase().includes(word.toLowerCase());
}

/**
 * The grounding winnability guarantee. For a **teaching** slot, every file it says to
 * cite (`grounding.citeIn`) must (a) exist and (b) actually hold the slot's truth word
 * as plain text — so "the word is really citeable there" is a build error, not a
 * runtime surprise. Each cited file must also be a declared xref of the carrying file,
 * so the followable link the player traverses to find the word actually exists.
 *
 * Under the forged-citation verb (Phase 3 — design_note_forged_citations.md) `citeIn`
 * is NO LONGER the play-time gate: at play, AMBER accepts ANY forged span from a
 * reachable file that carries the word. `citeIn`'s job is now this BUILD-TIME
 * WINNABILITY GUARANTEE — it proves at least one reachable grounding exists for every
 * teaching slot, which is what keeps the no-Quippy win reachable. The check is
 * unchanged; only its role moved (gate → guarantee).
 *
 * **inference** slots ground by parallel context, not literal co-occurrence; they
 * carry no citeIn and are not checked here (their threshold is validated for shape at
 * parse time).
 */
export function checkGroundingCiteable(
  files: ScpFile[],
  byItem: Map<string, ScpFile>,
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const f of files) {
    const xrefs = new Set(f.xrefs);
    for (const a of f.anchors) {
      if (a.grounding.kind !== 'teaching') continue;
      const ref = `${f.item}#${a.id}`;
      for (const target of a.grounding.citeIn) {
        const cited = byItem.get(target);
        if (!cited) {
          errors.push({
            rule: 'grounding-citeable',
            message: `${ref} grounding.citeIn names "${target}", which resolves to no existing item`,
            file: f.item,
          });
          continue;
        }
        if (target === f.item) {
          errors.push({
            rule: 'grounding-citeable',
            message: `${ref} grounding.citeIn names its own file "${target}" (a slot cannot ground itself)`,
            file: f.item,
          });
          continue;
        }
        if (!xrefs.has(target)) {
          errors.push({
            rule: 'grounding-citeable',
            message: `${ref} grounding.citeIn names "${target}", which is not a declared xref (the cite link must exist)`,
            file: f.item,
          });
        }
        if (!bodyContainsWord(cited.body, a.truth)) {
          errors.push({
            rule: 'grounding-citeable',
            message: `${ref} truth "${a.truth}" does not appear in the clear in cited file "${target}"`,
            file: f.item,
          });
        }
      }
    }
  }
  return errors;
}

/** Re-export so the build driver can surface the per-file token rule alongside these. */
export { ANCHOR_TOKEN };
