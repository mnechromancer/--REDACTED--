// Parse one vault entry (markdown with YAML frontmatter) into an ScpFile.
// Per-file structural validation lives here; cross-file invariants live in
// validate-corpus.ts. Mirrors technical_document.md §8 steps 1–2.

import { load as parseYaml } from 'js-yaml';
import type {
  Anchor,
  BreachEffect,
  ScpFile,
  SlotType,
} from '../../src/lib/corpus.ts';

const SLOT_TYPES: ReadonlySet<string> = new Set([
  'object',
  'agent',
  'location',
  'outcome',
]);
const BREACH_KINDS: ReadonlySet<string> = new Set([
  'inject_xrefs',
  'corrupt_search',
  'lock_tier',
  'randomize_propagation',
]);

/** Anchor-token markup: ⟦a1⟧ */
export const ANCHOR_TOKEN = /⟦([^⟧]+)⟧/g;
/** Wikilink markup: [[SCP-41B-001]] */
export const WIKILINK = /\[\[([^\]]+)\]\]/g;
/** HTML comments: `<!-- … -->`, including multi-line. */
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/**
 * Strip HTML comments from body prose so markup inside them is inert. Authors use
 * `<!-- … -->` for re-frame flags and notes; without this, a `⟦id⟧` or `[[link]]`
 * left in a comment would be parsed as a real anchor token / wikilink, dangling
 * the build or rendering a phantom slot. Applied once at parse time so the stored
 * `body` is comment-free and build-time and runtime tokenizing stay identical.
 */
export function stripComments(body: string): string {
  return body.replace(HTML_COMMENT, '');
}

/** Raised for any structural problem in a single file. `file` is set by the caller. */
export class EntryParseError extends Error {
  constructor(
    message: string,
    public file?: string,
  ) {
    super(file ? `${file}: ${message}` : message);
    this.name = 'EntryParseError';
  }
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/** Split a raw markdown file into its YAML frontmatter block and prose body. */
export function splitFrontmatter(raw: string): { yaml: string; body: string } {
  const m = raw.match(FRONTMATTER);
  if (!m) {
    throw new EntryParseError('no YAML frontmatter block (expected leading ---)');
  }
  // Strip HTML comments from the body up front so every downstream consumer
  // (token validation, wikilink checks, runtime rendering) sees comment-free prose.
  return { yaml: m[1], body: stripComments(m[2]) };
}

function asString(v: unknown, field: string): string {
  if (typeof v !== 'string') {
    throw new EntryParseError(`field "${field}" must be a string`);
  }
  return v;
}

function asTier(v: unknown, field: string): 1 | 2 | 3 | 4 | 5 {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 5) {
    throw new EntryParseError(`field "${field}" must be an integer 1–5 (got ${JSON.stringify(v)})`);
  }
  return v as 1 | 2 | 3 | 4 | 5;
}

function parseBreachEffect(v: unknown): BreachEffect {
  if (typeof v !== 'object' || v === null) {
    throw new EntryParseError('breach_effect must be a mapping');
  }
  const o = v as Record<string, unknown>;
  const kind = asString(o.kind, 'breach_effect.kind');
  if (!BREACH_KINDS.has(kind)) {
    throw new EntryParseError(
      `breach_effect.kind "${kind}" is not one of inject_xrefs|corrupt_search|lock_tier|randomize_propagation`,
    );
  }
  if (kind === 'lock_tier') {
    if (typeof o.tier !== 'number') {
      throw new EntryParseError('breach_effect.kind lock_tier requires numeric "tier"');
    }
    return { kind, tier: o.tier };
  }
  if (kind === 'randomize_propagation') {
    if (typeof o.fraction !== 'number') {
      throw new EntryParseError('breach_effect.kind randomize_propagation requires numeric "fraction"');
    }
    return { kind, fraction: o.fraction };
  }
  return { kind: kind as 'inject_xrefs' | 'corrupt_search' };
}

function parseAnchor(v: unknown, idx: number): Anchor {
  if (typeof v !== 'object' || v === null) {
    throw new EntryParseError(`anchors[${idx}] must be a mapping`);
  }
  const o = v as Record<string, unknown>;
  const id = asString(o.id, `anchors[${idx}].id`);

  const slot_type = asString(o.slot_type, `anchor "${id}".slot_type`);
  if (!SLOT_TYPES.has(slot_type)) {
    throw new EntryParseError(`anchor "${id}".slot_type "${slot_type}" is not object|agent|location|outcome`);
  }

  const mutations = o.mutations;
  if (!Array.isArray(mutations) || mutations.some((m) => typeof m !== 'string')) {
    throw new EntryParseError(`anchor "${id}".mutations must be an array of strings`);
  }
  if (mutations.length === 0) {
    throw new EntryParseError(`anchor "${id}".mutations must not be empty`);
  }

  if (typeof o.exposure_weight !== 'number') {
    throw new EntryParseError(`anchor "${id}".exposure_weight must be a number`);
  }

  // concept is optional; treat "" as absent (local-only anchor)
  const conceptRaw = o.concept;
  let concept: string | undefined;
  if (conceptRaw !== undefined && conceptRaw !== null && conceptRaw !== '') {
    concept = asString(conceptRaw, `anchor "${id}".concept`);
  }

  return {
    id,
    slot_type: slot_type as SlotType,
    truth: asString(o.truth, `anchor "${id}".truth`),
    redaction_level: asTier(o.redaction_level, `anchor "${id}".redaction_level`),
    ...(concept ? { concept } : {}),
    mutations: mutations as string[],
    exposure_weight: o.exposure_weight,
  };
}

/**
 * Parse one entry's raw markdown into an ScpFile, validating structure and the
 * single-file invariant that every ⟦id⟧ token resolves to a declared anchor
 * (technical_document.md §8 step 3, rule 1). Cross-file rules are not checked here.
 */
export function parseEntry(raw: string): ScpFile {
  const { yaml, body } = splitFrontmatter(raw);

  let fm: unknown;
  try {
    fm = parseYaml(yaml);
  } catch (e) {
    throw new EntryParseError(`invalid YAML frontmatter: ${(e as Error).message}`);
  }
  if (typeof fm !== 'object' || fm === null) {
    throw new EntryParseError('frontmatter did not parse to a mapping');
  }
  const o = fm as Record<string, unknown>;

  const rawAnchors = o.anchors;
  if (!Array.isArray(rawAnchors)) {
    throw new EntryParseError('field "anchors" must be a list');
  }
  const anchors = rawAnchors.map(parseAnchor);

  const seen = new Set<string>();
  for (const a of anchors) {
    if (seen.has(a.id)) {
      throw new EntryParseError(`duplicate anchor id "${a.id}"`);
    }
    seen.add(a.id);
  }

  const rawXrefs = o.xrefs ?? [];
  if (!Array.isArray(rawXrefs) || rawXrefs.some((x) => typeof x !== 'string')) {
    throw new EntryParseError('field "xrefs" must be an array of strings');
  }

  if (typeof o.entity_self !== 'boolean') {
    throw new EntryParseError('field "entity_self" must be a boolean');
  }

  const file: ScpFile = {
    item: asString(o.item, 'item'),
    object_class: asString(o.object_class, 'object_class'),
    site: asString(o.site, 'site'),
    clearance: asTier(o.clearance, 'clearance'),
    anchors,
    xrefs: rawXrefs as string[],
    breach_effect: parseBreachEffect(o.breach_effect),
    entity_self: o.entity_self,
    body,
  };

  validateTokensResolve(file);
  return file;
}

/** Rule 1: every ⟦id⟧ token in the body has a matching anchor in frontmatter. */
export function validateTokensResolve(file: ScpFile): void {
  const declared = new Set(file.anchors.map((a) => a.id));
  for (const m of file.body.matchAll(ANCHOR_TOKEN)) {
    const id = m[1].trim();
    if (!declared.has(id)) {
      throw new EntryParseError(`body token ⟦${id}⟧ has no matching anchor`, file.item);
    }
  }
}
