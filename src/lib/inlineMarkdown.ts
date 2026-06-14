// Inline **bold** splitting for entry-body prose. The vault entries are full
// Foundation pages; parseBody extracts ⟦slots⟧ and [[wikilinks]], and bodyBlocks
// groups the rest into header/paragraph blocks. Within a prose line, `**...**`
// is the only inline markup, handled here. Slots/wikilinks never reach this — it
// only sees inert text — so no token can be split across a styling boundary.

/** One styled inline run within a line. */
export interface InlineRun {
  text: string;
  bold: boolean;
}

/** Split a line into bold/plain runs on `**...**`. Unmatched `**` stays literal. */
export function inlineRuns(line: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  for (const m of line.matchAll(re)) {
    if (m.index! > cursor) runs.push({ text: line.slice(cursor, m.index), bold: false });
    runs.push({ text: m[1], bold: true });
    cursor = m.index! + m[0].length;
  }
  if (cursor < line.length) runs.push({ text: line.slice(cursor), bold: false });
  return runs.length > 0 ? runs : [{ text: line, bold: false }];
}
