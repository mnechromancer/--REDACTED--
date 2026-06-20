// Lore-track regression guard (v2 reset): the REAL authored corpus (static/corpus.json,
// built from vault/entries/*.md) must be fully AMBER-winnable with ZERO Quippy assists,
// reaching 'loop-broken' at exposure 0. This closes the gap between the engine proof
// (endgame-integration.test.ts, synthetic corpus) and the actual authored teaching pair.
//
// Two assertions, both load-bearing:
//  1. Grounding soundness: every non-self TEACHING slot's word actually appears in the
//     clear in each file it says to cite, and those files are reachable from the seed.
//     (The build enforces this too; here it's the runtime mirror.)
//  2. End-to-end solve: drive the real corpus through forge-span → commit for every
//     non-self slot and assert the true ending.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  breaches,
  seedReachable,
  seedReach,
  reachableFiles,
  bodyContainsWord,
  corpus,
  makeRef,
  anchorOf,
  commitWithCitations,
  crossMentions,
  splitRef,
  endState,
} from '../game.svelte.ts';
import type { Corpus, ForgedCitation } from '../corpus.ts';

/** Strip markup so a "selected span" is plain prose, the way the UI hands one over. */
function plain(body: string): string {
  return body.replace(/⟦[^⟧]+⟧/g, ' ').replace(/\[\[([^\]]+)\]\]/g, '$1');
}
import corpusData from '../../../static/corpus.json';

const REAL = corpusData as unknown as Corpus;

// The seed the app uses (App.svelte): the intake hub. Its xrefs open the rest.
const SEED = 'SCP-41B-001';

beforeEach(() => {
  loadCorpus(REAL);
  for (const k of Object.keys(overlay)) delete overlay[k];
  seedReachable.clear();
  breaches.clear();
  exposure.value = 0;
  seedReach(SEED);
});

describe('the real authored corpus is soundly grounded for the citation gate', () => {
  it('every non-self teaching slot is grounded by a reachable file holding its word', () => {
    const reached = reachableFiles();
    for (const file of Object.values(REAL)) {
      if (file.entity_self) continue;
      for (const a of file.anchors) {
        if (a.grounding.kind !== 'teaching') continue;
        const ref = makeRef(file.item, a.id);
        // at least one cited file is reachable AND holds the word in the clear.
        const grounded = a.grounding.citeIn.some(
          (c) => reached.has(c) && REAL[c] && bodyContainsWord(REAL[c].body, a.truth),
        );
        expect(grounded, `${ref} ("${a.truth}") has no reachable file holding its word`).toBe(true);
      }
    }
  });
});

describe('the real authored pair solves to the true ending via AMBER alone', () => {
  it('forge a real span → commit every non-self slot → loop-broken at exposure 0', () => {
    const targets: string[] = [];
    for (const file of Object.values(corpus)) {
      if (file.entity_self) continue;
      for (const a of file.anchors) targets.push(makeRef(file.item, a.id));
    }

    // Iterate to a fixed point: teaching slots are immediately committable (their word
    // stands in the clear in a reachable file's prose, so a span carrying it can be
    // forged); inference slots become committable as their co-carriers get solved.
    // Repeated passes let the chain bootstrap.
    let progressed = true;
    let guard = 0;
    while (progressed && guard++ < 20) {
      progressed = false;
      for (const ref of targets) {
        const o = overlay[ref];
        const truth = anchorOf(ref).truth;
        if (o && o.value === truth) continue; // already solved
        const anchor = anchorOf(ref);
        // Forge a citation from each grounding source: teaching → the citeIn files;
        // inference → the solved co-carriers' files. The "selected span" is that file's
        // plain prose — it grounds only if the word truly stands in it (commit judges).
        const sources =
          anchor.grounding.kind === 'teaching'
            ? anchor.grounding.citeIn
            : crossMentions(ref).map((r) => splitRef(r).item);
        const citations: ForgedCitation[] = sources
          .filter((item) => corpus[item])
          .map((item) => ({ item, text: plain(corpus[item].body) }));
        const r = commitWithCitations(ref, truth, citations);
        if (r.ok) progressed = true;
      }
    }

    const e = endState();
    expect(e.quippyAssists).toBe(0);
    expect(e.contradictions).toBe(0);
    expect(e.restored).toBe(e.total);
    expect(e.outcome).toBe('loop-broken');
    expect(exposure.value).toBe(0);
    expect(breaches.size).toBe(0);
  });
});
