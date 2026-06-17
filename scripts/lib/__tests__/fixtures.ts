// Fixtures for the build-time validators (v2 reset): a valid baseline (markdown +
// parsed pair) and helpers to derive deliberately-broken variants. Each validation
// rule gets a passing case (the baseline) and a failing case (a mutation of it).
//
// The pair mutually teaching-grounds: 003#a1 'switchboard' appears in the clear in
// 001's body; 001#a1 'ledger' appears in 003's body. So each slot's word is really
// citeable in the file it points to — the checkGroundingCiteable invariant passes.

import type { ScpFile } from '../../../src/lib/corpus.ts';

/** A minimal, valid two-file corpus as raw markdown, mutually teaching-grounded. */
export const VALID_003 = `---
item: "SCP-41B-003"
object_class: "Euclid"
site: "Site-41B"
entity_self: false
xrefs: ["SCP-41B-001"]
breach_effect:
  kind: "corrupt_search"
anchors:
  - id: "a1"
    slot_type: "object"
    truth: "switchboard"
    grounding:
      kind: "teaching"
      citeIn: ["SCP-41B-001"]
    concept: "the-quiet-exchange"
    exposure_weight: 2
---

# Item #: SCP-41B-003

SCP-41B-003 manifests as ⟦a1⟧; the ledger is cross-referenced with [[SCP-41B-001]].
`;

export const VALID_001 = `---
item: "SCP-41B-001"
object_class: "Euclid"
site: "Site-41B"
entity_self: true
xrefs: ["SCP-41B-003"]
breach_effect:
  kind: "inject_xrefs"
anchors:
  - id: "a1"
    slot_type: "object"
    truth: "ledger"
    grounding:
      kind: "teaching"
      citeIn: ["SCP-41B-003"]
    concept: "the-quiet-exchange"
    exposure_weight: 1
---

# Item #: SCP-41B-001

SCP-41B-001 is catalogued as ⟦a1⟧; the switchboard shares provenance with [[SCP-41B-003]].
`;

/** Parsed equivalents for testing the pure cross-file validators directly. */
export function validFiles(): ScpFile[] {
  return [
    {
      item: 'SCP-41B-003',
      object_class: 'Euclid',
      site: 'Site-41B',
      entity_self: false,
      xrefs: ['SCP-41B-001'],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'switchboard',
          grounding: { kind: 'teaching', citeIn: ['SCP-41B-001'] },
          concept: 'the-quiet-exchange',
          exposure_weight: 2,
        },
      ],
      body: 'manifests as ⟦a1⟧; the ledger, see [[SCP-41B-001]].',
    },
    {
      item: 'SCP-41B-001',
      object_class: 'Euclid',
      site: 'Site-41B',
      entity_self: true,
      xrefs: ['SCP-41B-003'],
      breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'ledger',
          grounding: { kind: 'teaching', citeIn: ['SCP-41B-003'] },
          concept: 'the-quiet-exchange',
          exposure_weight: 1,
        },
      ],
      body: 'catalogued as ⟦a1⟧; the switchboard, see [[SCP-41B-003]].',
    },
  ];
}

/** Deep clone so a per-case mutation never leaks into another test. */
export function clone(files: ScpFile[]): ScpFile[] {
  return structuredClone(files);
}
