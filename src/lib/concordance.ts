// The concordance — `xref <word>` / `grep <word>` (v3 Phase 3, spec_game.md §5.1;
// sprint 03 S1). Every REACHABLE record whose READABLE text carries the player's
// word, listed as jumpable, forgeable hits. A pure read: it mutates nothing,
// suggests nothing, and takes only what the player typed — AMBER never volunteers
// a word (CLAUDE.md invariant 3); it only reports where the player's word already
// stands on screen.
//
// Honest by construction, twice over:
//
//  - WHAT it searches (decision P3-1): the RENDERED text (renderedText.ts) — prose
//    plus solved overlay values. A still-redacted slot renders as the bar, which
//    carries no letters of the hidden word, so a redacted truth is structurally
//    unfindable and coverage GROWS as the player solves — the traffic jam made
//    visible (reset_v3_intake.md §3). What is on screen is in the index, including
//    a wrong Quippy fill: the lie becomes findable (deliberate — the Phase-7
//    corruption seed).
//
//  - HOW it matches (decision P3-2): literal, case-insensitive SUBSTRING — the
//    IDENTICAL rule to `spanContainsWord`, the containment predicate the commit
//    gate adjudicates forged citations against (game.svelte.ts §7.5). The search
//    is exactly as strict as the gate, so the two can never disagree: every hit's
//    snippet is guaranteed to ground the word if staked as a citation — against
//    any slot in a DIFFERENT record (corroborates() rejects a slot's own file as
//    grounding, so a hit inside the target's own record lists honestly but cannot
//    ground it) — and no span the gate would accept goes unfound. No regex, no
//    wildcards, no fuzzy anything — a search looser than the gate would offer
//    hits that fail at commit; stricter would hide grounding that exists.

import { corpus, reachableFiles, spanContainsWord } from './game.svelte.ts';
import { renderedLines } from './renderedText.ts';

export interface ConcordanceHit {
  /** record designation, e.g. 'SCP-41B-101' */
  item: string;
  /** 1-based index into renderedLines(item) */
  line: number;
  /** exact substring of that rendered line containing the match — the forgeable span */
  snippet: string;
}

/** A rendered line whose trimmed length fits here IS its own snippet. */
const FULL_LINE_MAX = 140;

/** Window width aimed for when a longer line is cut down around its match. */
const WINDOW_TARGET = 120;

/**
 * The forgeable span for a match at [at, at + len) of `line` (decision P3-9).
 * Short line ⇒ the trimmed line itself; long line ⇒ a ~WINDOW_TARGET window
 * around the match, edges pushed OUTWARD to word boundaries so no word is cut
 * mid-letter. Always an EXACT substring of the rendered line, with no ellipsis
 * or decoration inside it — the snippet doubles as the staked citation text
 * (captureSelection/forgeCitation consume it downstream), and a forged citation
 * must be real prose the record contains, byte for byte.
 *
 * Trimming is substring-preserving (it removes only edge whitespace), and the
 * match survives it: the searched word is trimmed before matching, so its first
 * and last characters are non-space and cannot sit in the trimmed-away margin.
 */
function snippetOf(line: string, at: number, len: number): string {
  const trimmed = line.trim();
  if (trimmed.length <= FULL_LINE_MAX) return trimmed;

  const matchEnd = at + len;
  const extra = Math.max(0, WINDOW_TARGET - len);
  let start = Math.max(0, at - Math.floor(extra / 2));
  let end = Math.min(line.length, matchEnd + Math.ceil(extra / 2));
  // Budget clipped at one edge flows to the other, so an edge match still gets
  // a full-width window instead of a stub.
  if (start === 0) end = Math.min(line.length, Math.max(end, WINDOW_TARGET));
  if (end === line.length) start = Math.max(0, Math.min(start, line.length - WINDOW_TARGET));
  // Never open or close on whitespace (shrink toward the match, never into it)…
  while (start < at && /\s/.test(line[start])) start++;
  while (end > matchEnd && /\s/.test(line[end - 1])) end--;
  // …then extend OUTWARD to word boundaries: a snippet never cuts a word in half.
  while (start > 0 && !/\s/.test(line[start - 1])) start--;
  while (end < line.length && !/\s/.test(line[end])) end++;
  return line.slice(start, end);
}

/**
 * `xref <word>`: every hit of `word` across the reachable, rendered corpus.
 * Trims the word; empty/whitespace ⇒ no hits (nothing typed, nothing searched).
 * Scans reachable items in corpus iteration order, lines in order; at most ONE
 * hit per (item, line) — the first occurrence anchors the snippet. The match is
 * `spanContainsWord`'s rule verbatim (case-insensitive literal substring), so
 * `spanContainsWord(hit.snippet, word)` holds for every hit returned — the
 * concordance is a map of exactly the spans the commit gate would accept.
 */
export function concordance(word: string): ConcordanceHit[] {
  const needle = word.trim();
  if (!needle) return [];
  const lowered = needle.toLowerCase();
  const reached = reachableFiles();
  const hits: ConcordanceHit[] = [];
  for (const file of Object.values(corpus)) {
    if (!reached.has(file.item)) continue; // not shelved, not yet mounted — not evidence
    const lines = renderedLines(file.item);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const at = line.toLowerCase().indexOf(lowered);
      if (at === -1) continue;
      let snippet = snippetOf(line, at, lowered.length);
      // `at` indexes the LOWERED line. Lowercasing preserves length for the
      // corpus's register, but the grounding guarantee is unconditional: if an
      // exotic case mapping ever shifted the window off the match, fall back to
      // the whole trimmed line, which provably carries the word.
      if (!spanContainsWord(snippet, needle)) snippet = line.trim();
      hits.push({ item: file.item, line: i + 1, snippet });
    }
  }
  return hits;
}
