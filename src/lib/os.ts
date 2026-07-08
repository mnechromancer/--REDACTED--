// The OS readouts (v3 Phase 3, story S4) — `ls` / `status` / `log` (the ledger) /
// `verify` as PURE line-builders over (corpus, overlay, exposure, breaches, session).
// The terminal prints these verbatim; nothing here owns state, mutates, or persists
// (CLAUDE.md invariant 7 — a derived readout persists nothing; decision P3-6's ground
// rule). The honesty contract (invariant 3): every readout REPORTS board state already
// earned on screen; it never prints a truth word for an unsolved slot and never
// volunteers a candidate. Register: AMBER's clinical 80s QA voice (spec_game.md §5.1) —
// and AMBER has no record of Quippy, so no line here may reference it. A Quippy-routed
// entry surfaces only as missing paperwork (`NO CITATION ON FILE`), which IS the
// designed tell (P3-6): the absence says it diegetically.

import {
  corpus,
  overlay,
  exposure,
  breaches,
  BREACH_THRESHOLD,
  allRefs,
  makeRef,
  resolveSlot,
  dayOf,
  collectionOf,
} from './game.svelte.ts';
import { session } from './session.svelte.ts';
import type { ScpFile } from './corpus.ts';

// ── Shared derivations ──────────────────────────────────────────────────────

/**
 * Per-record field census via the display ladder (resolveSlot), so the readouts count
 * exactly what the pane shows. Vocabulary (P3-5): `restored` = reading a value that
 * does not contradict truth (inserted or propagated — under the engine's insert() a
 * non-contradiction value IS the truth word); `outstanding` = still redacted; `struck`
 * = truth-contradiction (a wrong fill sitting in the slot, to be re-derived).
 */
interface FieldCensus {
  total: number;
  restored: number;
  outstanding: number;
  struck: number;
}

function fieldCensus(file: ScpFile): FieldCensus {
  const c: FieldCensus = { total: 0, restored: 0, outstanding: 0, struck: 0 };
  for (const a of file.anchors) {
    c.total++;
    const s = resolveSlot(makeRef(file.item, a.id)).state;
    if (s === 'redacted') c.outstanding++;
    else if (s === 'truth-contradiction') c.struck++;
    else c.restored++;
  }
  return c;
}

/**
 * Does every field of this record currently read its truth? The transmittal-eligibility
 * test, compared internally the way boardState does (overlay value === anchor truth) —
 * the comparison never leaves this function; only the COUNT is printed. For engine-
 * produced overlays this coincides with "every field restored" (a wrong value is always
 * contradiction-flagged), so `status` eligibility and `verify` clearance agree by
 * construction — the two readouts must not tell different stories about readiness.
 */
function readsTruth(file: ScpFile): boolean {
  return file.anchors.every((a) => overlay[makeRef(file.item, a.id)]?.value === a.truth);
}

/** Inbound records whose 4 AM has arrived — the desk, in stable corpus order. */
function mountedInbound(): ScpFile[] {
  return Object.values(corpus).filter((f) => collectionOf(f) === 'inbound' && dayOf(f) <= session.day);
}

// ── ls — the mount listing ──────────────────────────────────────────────────
// A SHELF section (local reference volumes — zero anchors by construction, so no
// field counts) and one CONSIGNMENT section per mounted day, ascending. The
// object_class prints VERBATIM: a class-word puzzle authors the header as "withheld"
// (CLAUDE.md schema rule), and substituting anything here would leak or lie.

/**
 * `ls` — list the holdings. `filter` narrows to one section: 'shelf' (the local
 * reference volumes) or 'batch' (the mounted consignments). Omitted ⇒ both.
 */
export function lsLines(filter?: 'batch' | 'shelf'): string[] {
  const lines: string[] = [];
  const files = Object.values(corpus);

  if (filter !== 'batch') {
    const shelf = files.filter((f) => collectionOf(f) === 'local');
    lines.push(`SHELF — ${shelf.length} reference volume(s)`);
    for (const f of shelf) lines.push(`  ${f.item} · ${f.object_class}`);
  }

  if (filter !== 'shelf') {
    const mounted = mountedInbound();
    const days = [...new Set(mounted.map(dayOf))].sort((a, b) => a - b);
    if (days.length === 0) {
      lines.push('CONSIGNMENT — no holdings mounted');
    }
    for (const d of days) {
      const recs = mounted.filter((f) => dayOf(f) === d);
      lines.push(`CONSIGNMENT — DAY ${d} — ${recs.length} record(s)`);
      for (const f of recs) {
        const c = fieldCensus(f);
        lines.push(`  ${f.item} · ${f.object_class} · ${c.restored}/${c.total} fields restored`);
      }
    }
  }

  return lines;
}

// ── status — the day's state (P3-5) ─────────────────────────────────────────
// No wall clock — the shift is event-based (`end` turns it over), so the header is
// the DAY alone. Exposure renders as a diegetic IRREGULARITY INDEX: AMBER measures
// irregularity in its own records; it does not know the cause (it has no record of
// the cause). The bands reuse the visual-corruption thresholds the chrome already
// shows (AmberTerminal's corruptBand), so the number and the rot always agree.
// NOT a new resource (invariant 1) — the index IS exposure, skinned.

function irregularityBand(): 'NOMINAL' | 'MINOR' | 'ELEVATED' | 'SEVERE' {
  if (exposure.value === 0) return 'NOMINAL';
  const ratio = exposure.value / BREACH_THRESHOLD;
  if (ratio < 0.3) return 'MINOR';
  if (ratio < 0.7) return 'ELEVATED';
  return 'SEVERE';
}

/**
 * `status` — day, mount census, field census, transmittal-eligible count, and the
 * irregularity index. The field census covers EVERY mounted inbound record (the
 * self-file included — it is a record on the desk and AMBER reports it honestly);
 * the transmittal-eligible count excludes the self-file, matching `verify`'s QC
 * exclusion (P3-7: QC must not demand a record the win doesn't count). Eligibility
 * is compared internally (readsTruth) — no truth word is ever printed.
 */
export function statusLines(): string[] {
  const records = mountedInbound();
  let restored = 0;
  let outstanding = 0;
  let struck = 0;
  for (const f of records) {
    const c = fieldCensus(f);
    restored += c.restored;
    outstanding += c.outstanding;
    struck += c.struck;
  }
  const scheduled = records.filter((f) => !f.entity_self);
  const eligible = scheduled.filter(readsTruth).length;

  const lines = [
    `STATUS — DAY ${session.day}`,
    `CONSIGNMENT — ${records.length} record(s) mounted`,
    `FIELDS — ${restored} restored · ${outstanding} outstanding · ${struck} struck`,
    `TRANSMITTAL — ${eligible} of ${scheduled.length} record(s) eligible`,
    `IRREGULARITY INDEX — ${exposure.value.toFixed(1)} · ${irregularityBand()}`,
  ];
  if (breaches.size > 0) lines.push('CONTAINMENT BREACH IN EFFECT');
  return lines;
}

// ── log — the provenance ledger (P3-6) ──────────────────────────────────────
// Derived ENTIRELY from the live overlay (no stored citation history, no new store —
// invariant 7). One line per live entry in allRefs() order, showing the value the
// pane already displays (printable — it is on screen) and its paperwork:
//   inserted via amber      → CITED COMMIT
//   propagated              → ANNEX OF <caused_by>
//   any via-quippy entry    → NO CITATION ON FILE   (the missing paperwork is the tell;
//                             AMBER has no record of what filled it)
//   contradicts_truth       → DISAGREES WITH RECORD (additionally)
// `via` defaults to the honest side when unset, same as boardState.

/** `log` — the provenance ledger. Empty overlay ⇒ the single no-reconstructions line. */
export function ledgerLines(): string[] {
  const entries = allRefs().filter((ref) => overlay[ref]);
  if (entries.length === 0) return ['PROVENANCE LEDGER — no reconstructions on file'];

  const lines = [`PROVENANCE LEDGER — ${entries.length} reconstruction(s) on file`];
  for (const ref of entries) {
    const o = overlay[ref];
    const parts = [ref, `「${o.value}」`];
    if (o.source === 'propagated') parts.push(`ANNEX OF ${o.caused_by ?? '[UNRECORDED]'}`);
    else if (o.via !== 'quippy') parts.push('CITED COMMIT');
    if (o.via === 'quippy') parts.push('NO CITATION ON FILE');
    if (o.contradicts_truth) parts.push('DISAGREES WITH RECORD');
    lines.push(`  ${parts.join(' · ')}`);
  }
  return lines;
}

// ── verify — transmittal QC (P3-7) ──────────────────────────────────────────
// Read-only QC over the mounted inbound records. The entity_self file is EXCLUDED
// from every total and listed once as NOT SCHEDULED FOR TRANSMITTAL (by its corpus
// designation — never a hardcoded id): QC must not demand the record the win doesn't
// count (you starve it, you don't ship it). Per record: restored/total; each struck
// field flagged for re-derivation; a complete record cleared. Footer: n of m cleared.

/** `verify` — transmittal QC over the mounted consignments. */
export function verifyLines(): string[] {
  const lines = [`TRANSMITTAL QC — DAY ${session.day}`];
  let cleared = 0;
  let scheduled = 0;

  for (const file of mountedInbound()) {
    if (file.entity_self) {
      lines.push(`  ${file.item} · NOT SCHEDULED FOR TRANSMITTAL`);
      continue;
    }
    scheduled++;
    const c = fieldCensus(file);
    const done = c.restored === c.total;
    if (done) cleared++;
    lines.push(`  ${file.item} · ${c.restored}/${c.total} fields restored${done ? ' · CLEARED FOR TRANSMITTAL' : ''}`);
    for (const a of file.anchors) {
      const ref = makeRef(file.item, a.id);
      if (resolveSlot(ref).state === 'truth-contradiction') {
        lines.push(`    ${ref} — DISAGREES WITH RECORD — RE-DERIVE`);
      }
    }
  }

  lines.push(`QC — ${cleared} of ${scheduled} record(s) cleared for transmittal`);
  return lines;
}
