// Shared runtime-engine fixtures for the C5t/C6t/C7t store tests. A three-file
// corpus mirroring the Sprint-1 trio's seams: 003↔001 share `the-quiet-exchange`,
// 001↔002 share `acquisition-lot`. One anchor (003#a2) is deliberately
// concept-less so the single-file tests can exercise insertion without
// triggering propagation. Truths and mutation sets are placeholders — the real
// authored entries (L1–L3) are a separate, model-switched track.

import type { Corpus } from '../corpus.ts';

export function makeCorpus(): Corpus {
  return {
    'SCP-41B-003': {
      item: 'SCP-41B-003',
      object_class: 'Euclid',
      site: 'Site-41B',
      clearance: 2,
      entity_self: false,
      xrefs: ['SCP-41B-001'],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'tqe-truth-003',
          redaction_level: 3,
          concept: 'the-quiet-exchange',
          mutations: ['tqe-0', 'tqe-1', 'tqe-2'],
          exposure_weight: 2,
        },
        {
          // local-only: no concept, so inserting here never propagates.
          id: 'a2',
          slot_type: 'location',
          truth: 'local-truth',
          redaction_level: 2,
          mutations: ['loc-0', 'loc-1', 'loc-2'],
          exposure_weight: 5,
        },
      ],
      body: 'object ⟦a1⟧ at ⟦a2⟧, see [[SCP-41B-001]].',
    },
    'SCP-41B-001': {
      item: 'SCP-41B-001',
      object_class: 'Euclid',
      site: 'Site-41B',
      clearance: 1,
      entity_self: true,
      xrefs: ['SCP-41B-003', 'SCP-41B-002'],
      breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'tqe-truth-001',
          redaction_level: 2,
          concept: 'the-quiet-exchange',
          mutations: ['tqe-0', 'tqe-1', 'tqe-2'], // index-aligned with 003#a1
          exposure_weight: 1,
        },
        {
          id: 'a2',
          slot_type: 'object',
          truth: 'lot-truth-001',
          redaction_level: 3,
          concept: 'acquisition-lot',
          mutations: ['lot-0', 'lot-1', 'lot-2'],
          exposure_weight: 3,
        },
      ],
      body: 'catalogued as ⟦a1⟧ in ⟦a2⟧, see [[SCP-41B-003]] and [[SCP-41B-002]].',
    },
    'SCP-41B-002': {
      item: 'SCP-41B-002',
      object_class: 'Euclid',
      site: 'Site-41B',
      clearance: 1,
      entity_self: false,
      xrefs: ['SCP-41B-001'],
      breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'lot-truth-002',
          redaction_level: 2,
          concept: 'acquisition-lot',
          mutations: ['lot-0', 'lot-1', 'lot-2'], // index-aligned with 001#a2
          exposure_weight: 4,
        },
      ],
      body: 'logged under ⟦a1⟧, see [[SCP-41B-001]].',
    },
  };
}
