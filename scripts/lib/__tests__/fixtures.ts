// Fixtures for C2t: a valid baseline (markdown + parsed pair) and helpers to
// derive deliberately-broken variants. Each validation rule gets a passing case
// (the baseline) and a failing case (a mutation of it).

import type { ScpFile } from '../../../src/lib/corpus.ts';

/** A minimal, valid two-file corpus as raw markdown, sharing one concept key. */
export const VALID_003 = `---
item: "SCP-41B-003"
object_class: "Euclid"
site: "Site-41B"
clearance: 2
entity_self: false
xrefs: ["SCP-41B-001"]
breach_effect:
  kind: "corrupt_search"
anchors:
  - id: "a1"
    slot_type: "object"
    truth: "a brass switchboard with no external wiring"
    redaction_level: 3
    concept: "the-quiet-exchange"
    mutations:
      - "a brass switchboard with no external wiring"
      - "a rotary handset sealed in resin"
      - "a punch-card reader missing its feed tray"
    exposure_weight: 2
---

# Item #: SCP-41B-003

SCP-41B-003 manifests as ⟦a1⟧, cross-referenced with [[SCP-41B-001]].
`;

export const VALID_001 = `---
item: "SCP-41B-001"
object_class: "Euclid"
site: "Site-41B"
clearance: 1
entity_self: true
xrefs: ["SCP-41B-003"]
breach_effect:
  kind: "inject_xrefs"
anchors:
  - id: "a1"
    slot_type: "object"
    truth: "a numbered intake ledger"
    redaction_level: 2
    concept: "the-quiet-exchange"
    mutations:
      - "a numbered intake ledger"
      - "a sealed correspondence file"
      - "a redacted call manifest"
    exposure_weight: 1
---

# Item #: SCP-41B-001

SCP-41B-001 is catalogued as ⟦a1⟧, sharing provenance with [[SCP-41B-003]].
`;

/** Parsed equivalents for testing the pure cross-file validators directly. */
export function validFiles(): ScpFile[] {
  return [
    {
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
          truth: 'a brass switchboard with no external wiring',
          redaction_level: 3,
          concept: 'the-quiet-exchange',
          mutations: ['one', 'two', 'three'],
          exposure_weight: 2,
        },
      ],
      body: 'manifests as ⟦a1⟧, see [[SCP-41B-001]].',
    },
    {
      item: 'SCP-41B-001',
      object_class: 'Euclid',
      site: 'Site-41B',
      clearance: 1,
      entity_self: true,
      xrefs: ['SCP-41B-003'],
      breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'a numbered intake ledger',
          redaction_level: 2,
          concept: 'the-quiet-exchange',
          mutations: ['one', 'two', 'three'],
          exposure_weight: 1,
        },
      ],
      body: 'catalogued as ⟦a1⟧, see [[SCP-41B-003]].',
    },
  ];
}

/** Deep clone so a per-case mutation never leaks into another test. */
export function clone(files: ScpFile[]): ScpFile[] {
  return structuredClone(files);
}
