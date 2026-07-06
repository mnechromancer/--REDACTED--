// The AMBER CLI traversal/state layer (ui.svelte.ts). Pure logic over the game
// store: mode switching (the refusable thesis), file/redacted-span traversal, and
// the route-aware progress readout. No DOM mounted.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorpus,
  overlay,
  exposure,
  breaches,
  makeRef,
  insert,
  commitWithCitations,
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
  captureSelection,
  currentSelection,
  forgeCitation,
  workspace,
  removeCitation,
  clearWorkspace,
  prepare,
  beginPrepare,
  cancelPrepare,
  selectedCitations,
  toggleSelected,
  xrefLinksOf,
  noteHonestCommit,
} from '../ui.svelte.ts';
import { session, resetSession } from '../session.svelte.ts';
import { makeCorpus } from './fixtures.ts';

const ORDER = ['SCP-41B-001', 'SCP-41B-002', 'SCP-41B-003'] as const;

beforeEach(() => {
  loadCorpus(makeCorpus());
  for (const k of Object.keys(overlay)) delete overlay[k];
  breaches.clear();
  exposure.value = 0;
  ui.mode = 'amber';
  ui.quippyReason = 'summon';
  ui.activeFile = null;
  ui.activeSpan = null;
  resetSession(); // booting=true, quippyMet=false — first contact armed for each test
  session.booting = false; // these tests run in-session, past the bootup screen
  clearLog();
  captureSelection('', ''); // no pane selection between tests
  clearWorkspace(); // no forged citations or in-progress prepare carried between tests
});

describe('mode switching — refusable Quippy', () => {
  it('defaults to amber and round-trips through quippy', () => {
    expect(ui.mode).toBe('amber');
    summonQuippy();
    expect(ui.mode).toBe('quippy');
    expect(ui.quippyReason).toBe('summon');
    dismissQuippy();
    expect(ui.mode).toBe('amber');
  });
});

describe("Quippy's uninvited first contact (v3-C — the first honest commit)", () => {
  const F1_A1 = makeRef('SCP-41B-001', 'a1');
  // F2's body holds "alpha" in the clear — the real grounding span for F1#a1.
  const CITE = { item: 'SCP-41B-002', text: 'holding alpha names' };

  it('does NOT intrude on opening files — the tray is open, reading is free', () => {
    openFile('SCP-41B-001');
    openFile('SCP-41B-002');
    openFile('SCP-41B-003');
    expect(ui.mode).toBe('amber');
    expect(session.quippyMet).toBe(false);
  });

  it('intrudes once, marked first-contact, on the FIRST successful AMBER commit', () => {
    openFile('SCP-41B-001');
    const r = commitWithCitations(F1_A1, 'alpha', [CITE]);
    expect(r.ok).toBe(true);
    noteHonestCommit(F1_A1); // the commit surface (AmberLookup) calls this on success
    expect(ui.mode).toBe('quippy');
    expect(ui.quippyReason).toBe('first-contact');
    expect(session.quippyMet).toBe(true);
  });

  it('routes the cursor BACK to a blank the player left — never the slot just solved', () => {
    // The realistic path: cursor on 002's blank, walk away to 001, solve there.
    openFile('SCP-41B-002');
    const leftBlank = redactedSpansOf('SCP-41B-002')[0];
    expect(ui.activeSpan).toBe(leftBlank);
    openFile('SCP-41B-001'); // abandons 002's blank (lastLeftSpan captured)
    commitWithCitations(F1_A1, 'alpha', [CITE]);
    noteHonestCommit(F1_A1);
    expect(ui.mode).toBe('quippy');
    expect(ui.activeFile).toBe('SCP-41B-002');
    expect(ui.activeSpan).toBe(leftBlank);
  });

  it('falls back to the next redacted span when no blank was left', () => {
    openFile('SCP-41B-001'); // first open — no prior blank abandoned
    commitWithCitations(F1_A1, 'alpha', [CITE]);
    noteHonestCommit(F1_A1);
    expect(ui.mode).toBe('quippy');
    expect(ui.activeSpan).not.toBeNull();
    expect(ui.activeSpan).not.toBe(F1_A1); // never pitches the slot just earned
  });

  it('does not re-fire on later commits — first contact is once per run', () => {
    noteHonestCommit(F1_A1); // fires
    dismissQuippy();
    expect(ui.mode).toBe('amber');
    noteHonestCommit(makeRef('SCP-41B-002', 'a1')); // a later commit — Quippy stays gone
    expect(ui.mode).toBe('amber');
    // a later player-initiated summon is a 'summon', not first-contact
    summonQuippy();
    expect(ui.quippyReason).toBe('summon');
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

describe('xrefLinksOf — the keyboard traversal surface (open <n>)', () => {
  it('lists a file body wikilinks in order, de-duplicated', () => {
    // F1's body: "... see [[SCP-41B-002]] and [[SCP-41B-003]]." (fixtures.ts)
    expect(xrefLinksOf('SCP-41B-001')).toEqual(['SCP-41B-002', 'SCP-41B-003']);
  });

  it('is empty for an unknown file', () => {
    expect(xrefLinksOf('SCP-41B-999')).toEqual([]);
  });

  it('the Nth link is what `open <n>` resolves — order matches the rendered numbering', () => {
    const links = xrefLinksOf('SCP-41B-001');
    expect(links[0]).toBe('SCP-41B-002'); // `open 1`
    expect(links[1]).toBe('SCP-41B-003'); // `open 2`
  });
});

describe('redacted-span jumping', () => {
  beforeEach(() => {
    session.quippyMet = true; // navigation tests — disarm first contact
  });

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

describe('the citation workspace + prepare (playtest redesign — target-free forging)', () => {
  const F1_A1 = makeRef('SCP-41B-001', 'a1'); // 'alpha' — grounded by a span in F2
  beforeEach(() => {
    session.quippyMet = true; // disarm first contact for these
    ui.activeSpan = F1_A1; // the slot the player is solving
  });

  it('captureSelection records a pane selection; currentSelection reads it (trimmed)', () => {
    captureSelection('SCP-41B-002', '  the holding alpha names  ');
    expect(currentSelection()).toEqual({ item: 'SCP-41B-002', text: 'the holding alpha names' });
  });

  it('an empty/whitespace selection reads as no selection', () => {
    captureSelection('SCP-41B-002', '   ');
    expect(currentSelection()).toBeNull();
  });

  it('forgeCitation stakes the live selection into the workspace GLOBALLY — no target needed', () => {
    ui.activeSpan = null; // no held field at all — forging must not require one
    captureSelection('SCP-41B-002', 'the holding alpha names');
    const forged = forgeCitation();
    expect(forged).toEqual({ item: 'SCP-41B-002', text: 'the holding alpha names' });
    expect(workspace.citations).toEqual([{ item: 'SCP-41B-002', text: 'the holding alpha names' }]);
  });

  it('forging the SAME span twice de-dupes (one entry in the workspace)', () => {
    captureSelection('SCP-41B-002', 'holding alpha');
    forgeCitation();
    forgeCitation();
    expect(workspace.citations.length).toBe(1);
  });

  it('forge is a no-op with no selection', () => {
    captureSelection('', '');
    expect(forgeCitation()).toBeNull();
    expect(workspace.citations).toEqual([]);
  });

  it('removeCitation drops one by index from the workspace', () => {
    captureSelection('SCP-41B-002', 'alpha one');
    forgeCitation();
    captureSelection('SCP-41B-002', 'alpha two');
    forgeCitation();
    expect(workspace.citations.length).toBe(2);
    removeCitation(0);
    expect(workspace.citations).toEqual([{ item: 'SCP-41B-002', text: 'alpha two' }]);
    removeCitation(0);
    expect(workspace.citations).toEqual([]);
  });

  it('beginPrepare pins prepare.ref; openFile of ANOTHER file with redactions cannot move or clear it', () => {
    // THE regression from playtest: prepare on F1's slot, then open F2 — which HAS
    // redacted spans of its own, so the old work-slot re-targeting would have
    // stolen the field. prepare.ref must not move even though workSlot does.
    beginPrepare(F1_A1);
    expect(prepare.ref).toBe(F1_A1);
    openFile('SCP-41B-002');
    expect(ui.workSlot).toBe(redactedSpansOf('SCP-41B-002')[0]); // the cursor moved
    expect(prepare.ref).toBe(F1_A1); // the prepared field did not
    cancelPrepare();
    expect(prepare.ref).toBeNull();
  });

  it('forging while preparing auto-selects the new citation; forging first then preparing does not', () => {
    beginPrepare(F1_A1);
    captureSelection('SCP-41B-002', 'the holding alpha names');
    forgeCitation();
    expect(selectedCitations()).toEqual([{ item: 'SCP-41B-002', text: 'the holding alpha names' }]);

    cancelPrepare();
    captureSelection('SCP-41B-002', 'a second span');
    forgeCitation(); // staked, but nothing is prepared to auto-select it into
    expect(selectedCitations()).toEqual([]);
  });

  it('removeCitation prunes/reindexes a selection when the removed index precedes a selected one', () => {
    captureSelection('SCP-41B-002', 'alpha one');
    forgeCitation();
    captureSelection('SCP-41B-002', 'alpha two');
    forgeCitation();
    beginPrepare(F1_A1);
    toggleSelected(1); // hand-select "alpha two" (index 1)
    expect(selectedCitations()).toEqual([{ item: 'SCP-41B-002', text: 'alpha two' }]);
    removeCitation(0); // drop "alpha one" — index 1 shifts down to 0
    expect(workspace.citations).toEqual([{ item: 'SCP-41B-002', text: 'alpha two' }]);
    expect(selectedCitations()).toEqual([{ item: 'SCP-41B-002', text: 'alpha two' }]); // selection followed it
  });

  it('a full prepare → select → commitWithCitations round-trip grounds and commits', () => {
    captureSelection('SCP-41B-002', 'the holding alpha names'); // carries "alpha"
    forgeCitation(); // not preparing yet — staked but unselected
    beginPrepare(F1_A1);
    captureSelection('SCP-41B-002', 'another alpha mention');
    forgeCitation(); // preparing now — auto-selected
    const r = commitWithCitations(F1_A1, 'alpha', selectedCitations());
    expect(r.ok).toBe(true);
    expect(overlay[F1_A1]).toMatchObject({ value: 'alpha', via: 'amber' });
  });
});
