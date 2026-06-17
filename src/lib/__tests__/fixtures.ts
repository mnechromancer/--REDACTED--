// Shared runtime-engine fixtures for the store tests (v2 reset — single-word +
// grounding). A small corpus exercising every engine seam under the new primitive:
//
//   F1 (SCP-41B-001, seed-reachable) — a1 'alpha', grounded TEACHING in F2 (the
//      word "alpha" appears in F2's body in the clear). Concept `key-a` (co-carrier
//      with F3#a1, same word → propagation).
//   F2 (SCP-41B-002) — a1 'beta', grounded TEACHING in F1 ("beta" is in F1's body).
//      Reachable from F1 via xref. a2 'gamma', grounded INFERENCE (threshold 2),
//      concept `key-inf` with two solved co-carriers contributing.
//   F3 (SCP-41B-003) — a1 'alpha', concept `key-a` (same word as F1#a1 → a propagation
//      target). a2/a3 carry `key-inf` as the two inference contributors.
//   F0 (SCP-41B-000, entity_self) — excluded from the restoration target.
//
// Words are short literals so body co-occurrence is easy to assert. The real authored
// pair lives in vault/entries; this fixture is the engine's unit substrate.

import type { Corpus } from '../corpus.ts';

export function makeCorpus(): Corpus {
  return {
    'SCP-41B-001': {
      item: 'SCP-41B-001',
      object_class: 'Safe',
      site: 'Site-41B',
      entity_self: false,
      xrefs: ['SCP-41B-002', 'SCP-41B-003'],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'alpha',
          grounding: { kind: 'teaching', citeIn: ['SCP-41B-002'] },
          concept: 'key-a',
          exposure_weight: 2,
        },
      ],
      // body holds "beta" in the clear (grounds F2#a1) and links F2/F3.
      body: 'the record beta is catalogued as ⟦a1⟧, see [[SCP-41B-002]] and [[SCP-41B-003]].',
    },
    'SCP-41B-002': {
      item: 'SCP-41B-002',
      object_class: 'Safe',
      site: 'Site-41B',
      entity_self: false,
      xrefs: ['SCP-41B-001', 'SCP-41B-003'],
      breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'agent',
          truth: 'beta',
          grounding: { kind: 'teaching', citeIn: ['SCP-41B-001'] },
          concept: 'key-b',
          exposure_weight: 2,
        },
        {
          id: 'a2',
          slot_type: 'outcome',
          truth: 'gamma',
          grounding: { kind: 'inference', threshold: 2 },
          concept: 'key-inf',
          exposure_weight: 3,
        },
      ],
      // body holds "alpha" (grounds F1#a1, F3#a1) plus "delta" and "epsilon"
      // (ground F3's inference contributors) in the clear.
      body: 'the holding alpha names ⟦a1⟧ and resolves to ⟦a2⟧; cross-filed as delta and epsilon, see [[SCP-41B-001]] and [[SCP-41B-003]].',
    },
    'SCP-41B-003': {
      item: 'SCP-41B-003',
      object_class: 'Euclid',
      site: 'Site-41B',
      entity_self: false,
      xrefs: ['SCP-41B-002'],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [
        {
          // co-carrier of key-a with F1#a1, SAME word 'alpha' → propagation target.
          id: 'a1',
          slot_type: 'object',
          truth: 'alpha',
          grounding: { kind: 'teaching', citeIn: ['SCP-41B-002'] },
          concept: 'key-a',
          exposure_weight: 2,
        },
        {
          // inference contributor #1 — DISTINCT word (so it doesn't propagate into
          // the inference slot), teaching-grounded itself (word "delta" in F2).
          id: 'a2',
          slot_type: 'outcome',
          truth: 'delta',
          grounding: { kind: 'teaching', citeIn: ['SCP-41B-002'] },
          concept: 'key-inf',
          exposure_weight: 1,
        },
        {
          // inference contributor #2 — DISTINCT word, teaching-grounded ("epsilon" in F2).
          id: 'a3',
          slot_type: 'outcome',
          truth: 'epsilon',
          grounding: { kind: 'teaching', citeIn: ['SCP-41B-002'] },
          concept: 'key-inf',
          exposure_weight: 1,
        },
      ],
      // body holds the contributor words in the clear (grounds F3#a2/#a3).
      body: 'the result derives ⟦a1⟧, with delta ⟦a2⟧ and epsilon ⟦a3⟧, see [[SCP-41B-002]].',
    },
    'SCP-41B-000': {
      item: 'SCP-41B-000',
      object_class: 'Keter',
      site: 'Site-41B',
      entity_self: true,
      xrefs: ['SCP-41B-001'],
      breach_effect: { kind: 'randomize_propagation', fraction: 0.25 },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'self-secret',
          grounding: { kind: 'inference', threshold: 3 },
          concept: 'key-self',
          exposure_weight: 3,
        },
      ],
      body: 'the self-file conceals ⟦a1⟧, see [[SCP-41B-001]].',
    },
  };
}
