// Runtime body tokenizer: split an ScpFile.body into a flat list of segments so
// FileWindow can render prose, redaction slots, and cross-links distinctly.
// Mirrors technical_document.md §7 (FileWindow parses body tokens; SlotSpan
// renders each anchor). The regexes are imported from the build-time parser so
// runtime and build-time tokenizing stay byte-for-byte identical — there is
// exactly one definition of what `⟦id⟧` and `[[link]]` mean.

import { ANCHOR_TOKEN, WIKILINK } from '../../scripts/lib/parse-entry.ts';

/** A run of literal prose between markup tokens. */
export interface TextSegment {
  kind: 'text';
  text: string;
}

/** A redaction slot: `⟦a1⟧`. `id` is the anchor id (trimmed), used to build a ref. */
export interface AnchorSegment {
  kind: 'anchor';
  id: string;
}

/** A cross-reference: `[[SCP-41B-001]]`. `target` is the linked item id (trimmed). */
export interface WikilinkSegment {
  kind: 'wikilink';
  target: string;
}

export type BodySegment = TextSegment | AnchorSegment | WikilinkSegment;

/**
 * Tokenize body prose into ordered segments. Anchor tokens and wikilinks are
 * extracted; everything else is emitted as text. A single pass over the combined
 * match set keeps segment order faithful to the source regardless of which markup
 * comes first. Empty text runs are dropped so the render has no empty spans.
 *
 * The two markup forms are disjoint by construction (`⟦…⟧` vs `[[…]]`) so their
 * matches never overlap; we merge both match streams and walk them in order.
 */
export function parseBody(body: string): BodySegment[] {
  // Collect every markup match with its absolute position, from both patterns.
  // `matchAll` on a /g regex yields matches with `.index`; we tag each by kind.
  const marks: Array<{ index: number; length: number; seg: BodySegment }> = [];

  for (const m of body.matchAll(ANCHOR_TOKEN)) {
    marks.push({
      index: m.index,
      length: m[0].length,
      seg: { kind: 'anchor', id: m[1].trim() },
    });
  }
  for (const m of body.matchAll(WIKILINK)) {
    marks.push({
      index: m.index,
      length: m[0].length,
      seg: { kind: 'wikilink', target: m[1].trim() },
    });
  }

  marks.sort((a, b) => a.index - b.index);

  const segments: BodySegment[] = [];
  let cursor = 0;
  for (const mark of marks) {
    if (mark.index > cursor) {
      segments.push({ kind: 'text', text: body.slice(cursor, mark.index) });
    }
    segments.push(mark.seg);
    cursor = mark.index + mark.length;
  }
  if (cursor < body.length) {
    segments.push({ kind: 'text', text: body.slice(cursor) });
  }
  return segments;
}
