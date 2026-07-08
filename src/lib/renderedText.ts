// The in-the-clear text of a record, as the player currently reads it (Phase 3 —
// the shared substrate under the concordance and `diff`). One rule, stated once:
// what these tools see is EXACTLY what the pane shows. Prose renders verbatim; a
// slot renders per resolveSlot — its overlay value when solved (or Quippy-filled;
// the lie is on screen, so the lie is in the text), and the redaction bar when
// not. The bar carries no letters of the hidden word, so any substring search over
// this text is honest by construction (the same structural guarantee that keeps
// the citation gate clean, game.svelte.ts §7.5): a redacted truth cannot be found,
// and coverage GROWS as the player solves — the traffic jam made visible
// (reset_v3_intake.md §3). Wikilinks render as their bare target designation,
// matching what the pane's reference text carries.

import { parseBody } from './parseBody.ts';
import { corpus, makeRef, resolveSlot } from './game.svelte.ts';

/** What a still-redacted slot contributes to rendered text (resolveSlot's bar). */
export const REDACTION_BAR = '█████';

/**
 * The whole readable text of `item` under the current overlay, as one string.
 * Unknown item ⇒ '' (callers gate reachability; this only renders). Reads the
 * overlay through resolveSlot, so reactive callers recompute when a slot fills.
 */
export function renderedText(item: string): string {
  const file = corpus[item];
  if (!file) return '';
  let out = '';
  for (const seg of parseBody(file.body)) {
    if (seg.kind === 'text') out += seg.text;
    else if (seg.kind === 'anchor') out += resolveSlot(makeRef(item, seg.id)).text;
    else out += seg.target;
  }
  return out;
}

/** renderedText split into lines — the unit the concordance lists and `diff` aligns. */
export function renderedLines(item: string): string[] {
  return renderedText(item).split('\n');
}
