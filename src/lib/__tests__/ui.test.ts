// Step 4 — the AMBER CLI traversal/state layer (ui.svelte.ts). Pure logic over the
// game store: mode switching (the refusable thesis), file/redacted-span traversal,
// and the route-aware progress readout. No DOM mounted.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  revealedTruth,
  clearance,
  exposure,
  makeRef,
  insert,
} from '../game.svelte.ts';
import {
  ui,
  summonQuippy,
  dismissQuippy,
  openFile,
  stepFile,
  stepSpan,
  nextRedacted,
  redactedSpansOf,
  spansOf,
  amberProgress,
  terminal,
  clearLog,
} from '../ui.svelte.ts';
import { makeCorpus } from './fixtures.ts';

const ORDER = ['SCP-41B-001', 'SCP-41B-002', 'SCP-41B-003'] as const;

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  revealedTruth.clear();
  exposure.value = 0;
  clearance.tier = 1;
  ui.mode = 'amber';
  ui.activeFile = null;
  ui.activeSpan = null;
  clearLog();
});

describe('mode switching — refusable Quippy', () => {
  it('defaults to amber and round-trips through quippy', () => {
    expect(ui.mode).toBe('amber');
    summonQuippy();
    expect(ui.mode).toBe('quippy');
    dismissQuippy();
    expect(ui.mode).toBe('amber');
  });
});

describe('file traversal', () => {
  it('open sets the active file and lands on its first redacted span', () => {
    expect(openFile('SCP-41B-001')).toBe(true);
    expect(ui.activeFile).toBe('SCP-41B-001');
    expect(ui.activeSpan).toBe(redactedSpansOf('SCP-41B-001')[0]);
  });

  it('open rejects an unknown file and logs it', () => {
    expect(openFile('SCP-41B-999')).toBe(false);
    expect(terminal.lines.some((l) => l.tone === 'reject')).toBe(true);
  });

  it('stepFile cycles through the order and wraps', () => {
    openFile('SCP-41B-001');
    stepFile(ORDER, 1);
    expect(ui.activeFile).toBe('SCP-41B-002');
    stepFile(ORDER, 1);
    expect(ui.activeFile).toBe('SCP-41B-003');
    stepFile(ORDER, 1);
    expect(ui.activeFile).toBe('SCP-41B-001'); // wrapped
    stepFile(ORDER, -1);
    expect(ui.activeFile).toBe('SCP-41B-003'); // wrap backward
  });
});

describe('redacted-span jumping', () => {
  it('spansOf lists every slot in body order; redactedSpansOf only the unsolved', () => {
    expect(spansOf('SCP-41B-001')).toEqual([
      makeRef('SCP-41B-001', 'a1'),
      makeRef('SCP-41B-001', 'a2'),
    ]);
    // both redacted initially
    expect(redactedSpansOf('SCP-41B-001').length).toBe(2);
    insert(makeRef('SCP-41B-001', 'a1'), 'tqe-0', 'amber');
    expect(redactedSpansOf('SCP-41B-001')).toEqual([makeRef('SCP-41B-001', 'a2')]);
  });

  it('stepSpan walks all spans of the active file, wrapping', () => {
    openFile('SCP-41B-001');
    const first = ui.activeSpan;
    const second = stepSpan(1);
    expect(second).not.toBe(first);
    const back = stepSpan(1); // wraps (2 spans)
    expect(back).toBe(first);
  });

  it('nextRedacted skips solved spans and announces when none remain', () => {
    openFile('SCP-41B-002'); // single-span file
    insert(makeRef('SCP-41B-002', 'a1'), 'lot-0', 'amber');
    const r = nextRedacted();
    expect(r).toBeNull();
    expect(terminal.lines.some((l) => l.tone === 'ok')).toBe(true);
  });
});

describe('amberProgress — route-aware corpus readout', () => {
  it('counts every slot redacted on a fresh board', () => {
    const p = amberProgress();
    expect(p.total).toBe(5); // trio fixture: 2+2+1
    expect(p.redacted).toBe(5);
    expect(p.solved).toBe(0);
    expect(p.revealed).toBe(0);
  });

  it('moves a slot from redacted to solved on insert', () => {
    insert(makeRef('SCP-41B-001', 'a1'), 'tqe-0', 'amber'); // also propagates to 003#a1
    const p = amberProgress();
    expect(p.redacted).toBeLessThan(5);
    expect(p.solved).toBeGreaterThan(0);
  });
});
