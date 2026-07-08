// `diff <a> <b>` — line-level comparison of two records, for the duplicate-record
// puzzle family (Phase 3 ships the tool; the content that needs it arrives Phase 4).
// Decision P3-10 (sprint_03_the_os.md): LCS anchors equal lines; between anchors the
// leftover left/right lines pair index-wise, so a one-word edition change reads as
// ONE marked row instead of a delete+insert pair. Presentation choice only — no
// engine impact; the terminal renders the rows, ESC/nav returns.
//
// THE LOAD-BEARING PROPERTY: the comparison runs over renderedLines — the text as
// the player CURRENTLY reads it (renderedText.ts) — so an unsolved slot compares as
// its `█████` bar on both sides and the diff can NEVER leak a truth (CLAUDE.md
// invariants 2/3: the tool judges what is on screen; it never surfaces the hidden
// word). Two duplicates whose hidden words differ therefore read as IDENTICAL on
// that line until the player solves one — the reveal is earned by the solve, never
// by the tool. The same rule makes the diff overlay-sensitive both ways: an AMBER
// commit breaks the bar-anchor into a marked row, and a Quippy fill shows its lie
// the same way (the lie is on screen, so the lie is in the diff — P3-1's honesty
// rule, shared with the concordance).

import { corpus } from './game.svelte.ts';
import { renderedLines } from './renderedText.ts';

export interface DiffRow {
  /** line text on the left/right side; null = no counterpart on that side */
  left: string | null;
  right: string | null;
  /** true when both sides carry the same line (an alignment anchor) */
  same: boolean;
}

/**
 * The LCS alignment anchors between two line arrays: index pairs [i, j] with
 * l[i] === r[j], forming a longest common subsequence in order. Classic O(n·m)
 * DP — records are half-page documents, a few dozen lines, so the table is tiny.
 * `dp[i][j]` holds the LCS length of l[i..] vs r[j..]; the forward walk re-derives
 * the pairing. Tie-break on equal branches advances the LEFT cursor — deterministic,
 * and either choice yields a maximal subsequence.
 */
function lcsAnchors(l: string[], r: string[]): Array<[number, number]> {
  const n = l.length;
  const m = r.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = l[i] === r[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const anchors: Array<[number, number]> = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (l[i] === r[j]) {
      anchors.push([i, j]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return anchors;
}

/**
 * Line-level comparison of two records' rendered text — what the player currently
 * reads, redaction bars and overlay values included, so a diff can never leak a
 * truth (see the module comment; this is the invariant the whole tool stands on).
 *
 * Equal lines emit `{left, right, same: true}` (alignment anchors, via LCS on
 * exact line equality). Between anchors, leftover lines pair index-wise as
 * `same: false` rows; when one side's changed block runs longer, the overhang
 * carries `null` on the other side (P3-10).
 *
 * Throws an Error naming the missing item on an unknown designation — callers
 * resolve designations and validate before calling (renderedText's silent ''
 * would otherwise diff an unknown id as one empty line, a lie). Pure: reads the
 * corpus and overlay through renderedLines, mutates nothing, so reactive callers
 * wrapping it in `$derived` recompute when a slot fills.
 */
export function diffRecords(a: string, b: string): DiffRow[] {
  if (!corpus[a]) throw new Error(`diffRecords: no record "${a}"`);
  if (!corpus[b]) throw new Error(`diffRecords: no record "${b}"`);
  const l = renderedLines(a);
  const r = renderedLines(b);

  const rows: DiffRow[] = [];
  let li = 0;
  let ri = 0;
  /** Emit the changed block up to the next anchor: index-wise pairs, null overhang. */
  const emitGap = (lEnd: number, rEnd: number): void => {
    const width = Math.max(lEnd - li, rEnd - ri);
    for (let k = 0; k < width; k++) {
      rows.push({
        left: li + k < lEnd ? l[li + k] : null,
        right: ri + k < rEnd ? r[ri + k] : null,
        same: false,
      });
    }
    li = lEnd;
    ri = rEnd;
  };

  for (const [ai, bi] of lcsAnchors(l, r)) {
    emitGap(ai, bi);
    rows.push({ left: l[ai], right: r[bi], same: true });
    li = ai + 1;
    ri = bi + 1;
  }
  emitGap(l.length, r.length);
  return rows;
}
