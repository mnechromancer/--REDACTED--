// The AMBER CLI traversal/state layer (ui.svelte.ts). Pure logic over the game
// store: mode switching (the refusable thesis), file/redacted-span traversal, and
// the route-aware progress readout. No DOM mounted.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  breaches,
  seedReachable,
  seedReach,
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
  seedReachable.clear();
  breaches.clear();
  exposure.value = 0;
  seedReach('SCP-41B-001');
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
    expect(openFile('SCP-41B-002')).toBe(true);
    expect(ui.activeFile).toBe('SCP-41B-002');
    expect(ui.activeSpan).toBe(redactedSpansOf('SCP-41B-002')[0]);
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
    expect(spansOf('SCP-41B-002')).toEqual([
      makeRef('SCP-41B-002', 'a1'),
      makeRef('SCP-41B-002', 'a2'),
    ]);
    expect(redactedSpansOf('SCP-41B-002').length).toBe(2);
    insert(makeRef('SCP-41B-002', 'a1'), 'beta', 'amber');
    expect(redactedSpansOf('SCP-41B-002')).toEqual([makeRef('SCP-41B-002', 'a2')]);
  });

  it('stepSpan walks all spans of the active file, wrapping', () => {
    openFile('SCP-41B-002');
    const first = ui.activeSpan;
    const second = stepSpan(1);
    expect(second).not.toBe(first);
    const back = stepSpan(1); // wraps (2 spans)
    expect(back).toBe(first);
  });

  it('nextRedacted skips solved spans and announces when none remain', () => {
    openFile('SCP-41B-001'); // single-span file
    insert(makeRef('SCP-41B-001', 'a1'), 'alpha', 'amber');
    const r = nextRedacted();
    expect(r).toBeNull();
    expect(terminal.lines.some((l) => l.tone === 'ok')).toBe(true);
  });
});

describe('amberProgress — route-aware corpus readout', () => {
  it('counts every slot redacted on a fresh board', () => {
    const p = amberProgress();
    expect(p.total).toBe(7); // fixture: F1(1) + F2(2) + F3(3) + F0(1)
    expect(p.redacted).toBe(7);
    expect(p.solved).toBe(0);
    expect(p.struck).toBe(0);
  });

  it('moves a slot from redacted to solved on insert', () => {
    insert(makeRef('SCP-41B-001', 'a1'), 'alpha', 'amber'); // also propagates to F3#a1
    const p = amberProgress();
    expect(p.redacted).toBeLessThan(7);
    expect(p.solved).toBeGreaterThan(0);
  });

  it('a wrong Quippy fill registers as struck, not solved', () => {
    insert(makeRef('SCP-41B-001', 'a1'), 'WRONG', 'quippy');
    const p = amberProgress();
    expect(p.struck).toBe(1);
  });
});
