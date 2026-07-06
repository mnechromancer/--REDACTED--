// The day cycle (v3 Phase 1) — the frame's engine, proven on a micro-corpus:
// a shelf file grounding a day-1 inbound file, with a day-2 arrival behind it.
//
//  - the transmittal model (decision v3-A): endShift takes the WORK-PRODUCT
//    (notes, forge buffers, selection, log, cursor memory) and keeps RUN STATE
//    (overlay — cited commits AND Quippy fills, exposure, breaches, taint);
//  - the shelf grounds the batch: an AMBER commit cited from a local file's span;
//  - mail is day-gated and persists across the wipe;
//  - an unmounted holding cannot be opened (the dead-letter reject).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  breaches,
  quippyTouched,
  insert,
  commitWithCitations,
  isUngroundable,
  makeRef,
} from '../game.svelte.ts';
import {
  ui,
  openFile,
  endShift,
  terminal,
  clearLog,
  captureSelection,
  forgeCitation,
  citationsFor,
  clearAllBuffers,
} from '../ui.svelte.ts';
import { session, resetSession, addNote, advanceDay } from '../session.svelte.ts';
import { deliveredMail, mailArrivingOn, unreadCount, markRead, isRead, resetMail, MAILBOX } from '../mail.svelte.ts';
import { makeCorpus } from './fixtures.ts';
import type { Corpus } from '../corpus.ts';

/** Micro-corpus: F1 = the shelf (local, in the clear), F2 = day-1 inbound, F3 = day-2. */
function makeFrameCorpus(): Corpus {
  const c = makeCorpus();
  return {
    ...c,
    'SCP-41B-001': { ...c['SCP-41B-001'], collection: 'local', anchors: [] },
    'SCP-41B-002': { ...c['SCP-41B-002'], collection: 'inbound', day: 1 },
    'SCP-41B-003': { ...c['SCP-41B-003'], collection: 'inbound', day: 2 },
  };
}

const F2_A1 = makeRef('SCP-41B-002', 'a1'); // truth 'beta', citeIn F1 (the shelf)
// F1's body holds "beta" in the clear — the shelf span the player forges from.
const SHELF_CITE = { item: 'SCP-41B-001', text: 'the record beta is catalogued' };

beforeEach(() => {
  loadCorpus(makeFrameCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  breaches.clear();
  quippyTouched.clear();
  exposure.value = 0;
  resetSession();
  session.booting = false;
  resetMail();
  ui.mode = 'amber';
  ui.activeFile = null;
  ui.activeSpan = null;
  clearLog();
  captureSelection('', '');
  clearAllBuffers();
});

describe('the shelf grounds the batch', () => {
  it('a day-1 slot citing the shelf is groundable and commits from a shelf span', () => {
    expect(isUngroundable(F2_A1)).toBe(false);
    const r = commitWithCitations(F2_A1, 'beta', [SHELF_CITE]);
    expect(r.ok).toBe(true);
    expect(overlay[F2_A1].via).toBe('amber');
    expect(exposure.value).toBe(0);
  });

  it('an unmounted holding cannot be opened — the dead-letter reject', () => {
    expect(openFile('SCP-41B-003')).toBe(false); // day 2 has not arrived
    expect(ui.activeFile).toBeNull();
    expect(terminal.lines.at(-1)?.text).toContain('NOT IN ARCHIVE');
    session.day = 2;
    expect(openFile('SCP-41B-003')).toBe(true);
  });

  // Phase 2 playtest regression: the intended verb is leave the blank in the batch,
  // open the SHELF (which has no fields of its own), select the evidence, forge.
  // Opening a zero-anchor file clears the cursor; the WORK SLOT must hold so the
  // forge still targets the abandoned blank — this was the step-4 blocker.
  it('reading the shelf keeps the work slot: forge and commit target the blank left behind', () => {
    openFile('SCP-41B-002'); // cursor lands on the day-1 blank
    expect(ui.activeSpan).toBe(F2_A1);
    expect(ui.workSlot).toBe(F2_A1);

    openFile('SCP-41B-001'); // the shelf: no fields — cursor clears, work slot holds
    expect(ui.activeSpan).toBeNull();
    expect(ui.workSlot).toBe(F2_A1);

    captureSelection('SCP-41B-001', 'the record beta is catalogued');
    const forged = forgeCitation();
    expect(forged).not.toBeNull();
    expect(citationsFor(F2_A1)).toHaveLength(1); // staked on the HELD slot

    const r = commitWithCitations(F2_A1, 'beta', citationsFor(F2_A1));
    expect(r.ok).toBe(true);
    expect(exposure.value).toBe(0);
  });
});

describe('notes — the doomed scratchpad', () => {
  it('accumulates lines and is destroyed by the day turnover', () => {
    addNote('the register drifts forward');
    addNote('  '); // blank lines are not kept
    addNote('check the shelf primer');
    expect(session.notes).toHaveLength(2);
    advanceDay();
    expect(session.notes).toHaveLength(0);
    expect(session.day).toBe(2);
  });
});

describe('endShift — the 16:00 turnover (transmittal model, decision v3-A)', () => {
  it('takes the work-product, keeps the run state, mounts the next day', () => {
    // Build up a day's state: a transmitted commit, a Quippy fill, a note, a
    // staked-but-uncommitted citation, and some log.
    commitWithCitations(F2_A1, 'beta', [SHELF_CITE]);
    insert(makeRef('SCP-41B-002', 'a2'), 'gamma', 'quippy'); // costly, tainting
    const exposureBefore = exposure.value;
    expect(exposureBefore).toBeGreaterThan(0);
    addNote('do not trust the friendly one');
    openFile('SCP-41B-002');
    ui.activeSpan = makeRef('SCP-41B-002', 'a2');
    captureSelection('SCP-41B-001', 'catalogued');
    forgeCitation();
    expect(citationsFor(makeRef('SCP-41B-002', 'a2'))).toHaveLength(1);

    endShift();

    // Taken: notes, buffers, selection, the old log.
    expect(session.notes).toHaveLength(0);
    expect(citationsFor(makeRef('SCP-41B-002', 'a2'))).toHaveLength(0);
    // Kept: the overlay (cited commit AND the Quippy fill — the tell), exposure, taint.
    expect(overlay[F2_A1]?.value).toBe('beta');
    expect(overlay[makeRef('SCP-41B-002', 'a2')]?.via).toBe('quippy');
    expect(exposure.value).toBe(exposureBefore);
    expect(quippyTouched.size).toBe(1);
    // Advanced: day 2 is mounted and announced in a fresh log.
    expect(session.day).toBe(2);
    const logText = terminal.lines.map((l) => l.text).join('\n');
    expect(logText).toContain('DAY 2');
    expect(logText).toContain('WORKSPACE ERASURE');
    expect(openFile('SCP-41B-003')).toBe(true);
  });

  it('drops the cursor from a file that is somehow no longer reachable', () => {
    openFile('SCP-41B-002');
    expect(ui.activeFile).toBe('SCP-41B-002');
    endShift();
    // F2 (day 1) survives the turnover — the batch is cumulative.
    expect(ui.activeFile).toBe('SCP-41B-002');
  });
});

describe('mail — day-gated, persistent, receiving-site voice', () => {
  it('delivers by day and counts unread', () => {
    const day1 = deliveredMail();
    expect(day1.length).toBeGreaterThan(0);
    expect(day1.every((m) => m.day === 1)).toBe(true);
    expect(unreadCount()).toBe(day1.length);
    markRead(day1[0].id);
    expect(isRead(day1[0].id)).toBe(true);
    expect(unreadCount()).toBe(day1.length - 1);
  });

  it('new mail arrives with the day-2 mount and read-state survives the wipe', () => {
    const before = deliveredMail().length;
    markRead(deliveredMail()[0].id);
    endShift();
    expect(deliveredMail().length).toBeGreaterThan(before);
    expect(mailArrivingOn(2).length).toBeGreaterThan(0);
    expect(isRead(MAILBOX[0].id)).toBe(true); // correspondence is not notes
  });

  it('no message ever names Quippy (AMBER-side voice rule)', () => {
    for (const m of MAILBOX) {
      expect(m.body.toLowerCase()).not.toContain('quippy');
      expect(m.subject.toLowerCase()).not.toContain('quippy');
    }
  });
});
