// Group parseBody's flat segment stream into renderable blocks. The vault body is
// a full Foundation page — `# Item #:` title, `**Object Class:**`, `##` section
// headers, blank-line-separated paragraphs — interleaved with inline ⟦slots⟧ and
// [[wikilinks]]. parseBody yields those as a flat ordered list; this turns that
// list into block-level structure (headers as their own blocks; prose grouped
// into paragraphs) while keeping slots/wikilinks INLINE inside their paragraph,
// so a slot mid-sentence does not break onto its own line.

import type { BodySegment } from './parseBody.ts';
import { inlineRuns, type InlineRun } from './inlineMarkdown.ts';

/** An inline piece within a paragraph block. */
export type Inline =
  | { kind: 'runs'; runs: InlineRun[] } // styled text (handles **bold**)
  | { kind: 'anchor'; id: string }
  | { kind: 'wikilink'; target: string };

/** One block of the rendered body. */
export type Block =
  | { kind: 'h1'; runs: InlineRun[] }
  | { kind: 'h2'; runs: InlineRun[] }
  | { kind: 'object-class'; runs: InlineRun[] }
  | { kind: 'para'; inlines: Inline[] };

function isHeaderLine(line: string): Block | null {
  if (line.startsWith('## ')) return { kind: 'h2', runs: inlineRuns(line.slice(3)) };
  if (line.startsWith('# ')) return { kind: 'h1', runs: inlineRuns(line.slice(2)) };
  if (/^\*\*Object Class:\*\*/.test(line)) return { kind: 'object-class', runs: inlineRuns(line) };
  return null;
}

/**
 * Build block structure from the flat segment list. Text segments are split on
 * newlines: a line that is a header flushes the current paragraph and emits a
 * header block; a blank line flushes the paragraph; other lines append to the
 * current paragraph. Anchor and wikilink segments append inline to whatever
 * paragraph is open (starting one if needed), so they never leave their sentence.
 */
export function bodyBlocks(segments: BodySegment[]): Block[] {
  const blocks: Block[] = [];
  let para: Inline[] = [];

  const flush = () => {
    if (para.length > 0) {
      blocks.push({ kind: 'para', inlines: para });
      para = [];
    }
  };

  for (const seg of segments) {
    if (seg.kind === 'anchor') {
      para.push({ kind: 'anchor', id: seg.id });
      continue;
    }
    if (seg.kind === 'wikilink') {
      para.push({ kind: 'wikilink', target: seg.target });
      continue;
    }

    // Text segment: walk its lines, honoring headers and blank-line breaks.
    const lines = seg.text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // A newline inside a text segment is a soft join unless the line is blank
      // or a header. Mid-paragraph newlines (the body wraps prose at ~95 cols)
      // collapse to a single space so wrapped sentences read as one paragraph.
      if (i > 0 && trimmed !== '' && !isHeaderLine(trimmed) && para.length > 0) {
        para.push({ kind: 'runs', runs: [{ text: ' ', bold: false }] });
      }

      if (trimmed === '') {
        flush();
        continue;
      }
      const header = isHeaderLine(trimmed);
      if (header) {
        flush();
        blocks.push(header);
        continue;
      }
      para.push({ kind: 'runs', runs: inlineRuns(line.trim()) });
    }
  }
  flush();
  return blocks;
}
