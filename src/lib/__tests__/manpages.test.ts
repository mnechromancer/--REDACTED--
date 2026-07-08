// `man <cmd>` — AMBER's self-documentation (sprint 03 story S3). These tests are
// the register contract made mechanical: every shell command has a page, pages
// fit the one-screen terminal, aliases resolve, and AMBER holds no page — and no
// string at all — for the one name it has no record of (decision P3-8).

import { describe, it, expect } from 'vitest';
import { MAN, MAN_ALIASES, manPage, manIndex } from '../manpages.ts';

/** The canonical page set the work order requires, in display order. */
const REQUIRED = [
  'open',
  'next',
  'cite',
  'xref',
  'diff',
  'ls',
  'status',
  'log',
  'verify',
  'mail',
  'note',
  'end',
  'prov',
  'man',
  'help',
];

/** Every player-visible string the module exports: page lines, page names, alias names. */
function allStrings(): string[] {
  return [
    ...Object.keys(MAN),
    ...Object.values(MAN).flat(),
    ...Object.keys(MAN_ALIASES),
    ...Object.values(MAN_ALIASES),
    ...manIndex(),
  ];
}

describe('man pages — coverage', () => {
  it('has a page for every required canonical command', () => {
    for (const cmd of REQUIRED) {
      expect(MAN[cmd], `missing page: ${cmd}`).toBeDefined();
      expect(MAN[cmd].length, `${cmd}: empty page`).toBeGreaterThan(0);
    }
  });

  it('has no pages beyond the required set', () => {
    expect(Object.keys(MAN).sort()).toEqual([...REQUIRED].sort());
  });

  it('every page is a USAGE line then 2–6 terse lines', () => {
    for (const [cmd, lines] of Object.entries(MAN)) {
      expect(lines[0], `${cmd}: first line is not USAGE`).toMatch(/^USAGE: /);
      expect(lines.length, `${cmd}: too few lines`).toBeGreaterThanOrEqual(3);
      expect(lines.length, `${cmd}: too many lines`).toBeLessThanOrEqual(7);
      for (const line of lines) {
        expect(line.trim().length, `${cmd}: blank line`).toBeGreaterThan(0);
      }
    }
  });

  it('every line fits the terminal (≤ 100 chars)', () => {
    for (const [cmd, lines] of Object.entries(MAN)) {
      for (const line of lines) {
        expect(line.length, `${cmd}: over-long line: "${line}"`).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('man pages — resolution', () => {
  it('resolves every canonical name to its own page', () => {
    for (const cmd of REQUIRED) {
      expect(manPage(cmd)).toBe(MAN[cmd]);
    }
  });

  it('resolves aliases to the canonical page', () => {
    expect(manPage('grep')).toBe(MAN.xref);
    expect(manPage('search')).toBe(MAN.xref);
    expect(manPage('s')).toBe(MAN.xref);
    expect(manPage('o')).toBe(MAN.open);
    expect(manPage('n')).toBe(MAN.next);
    expect(manPage('c')).toBe(MAN.cite);
    expect(manPage('forge')).toBe(MAN.cite);
    expect(manPage('m')).toBe(MAN.mail);
    expect(manPage('eod')).toBe(MAN.end);
    expect(manPage('?')).toBe(MAN.help);
  });

  it('every alias in the map points at a page that exists', () => {
    for (const [alias, canonical] of Object.entries(MAN_ALIASES)) {
      expect(MAN[canonical], `alias ${alias} → ${canonical}: no such page`).toBeDefined();
      expect(MAN[alias], `alias ${alias} shadows a canonical page`).toBeUndefined();
    }
  });

  it('returns null for unknown commands', () => {
    expect(manPage('nonsense')).toBeNull();
    expect(manPage('')).toBeNull();
    expect(manPage('map')).toBeNull(); // Phase 6 — not on file yet
  });

  it('holds no page for the intruder — null exactly like an unknown command (P3-8)', () => {
    expect(manPage('quippy')).toBeNull();
    expect(manPage('QUIPPY')).toBeNull();
    expect(manPage('q')).toBeNull();
  });

  it('manIndex() matches the MAN keys in display order', () => {
    expect(manIndex()).toEqual(Object.keys(MAN));
  });
});

describe('man pages — register', () => {
  it('no string anywhere mentions the intruder', () => {
    for (const s of allStrings()) {
      expect(s, `register breach: "${s}"`).not.toMatch(/quippy/i);
    }
  });

  it('no exclamation marks, no apologies', () => {
    for (const s of allStrings()) {
      expect(s, `exclamation: "${s}"`).not.toContain('!');
      expect(s, `apology: "${s}"`).not.toMatch(/\b(sorry|apolog|please)\w*/i);
    }
  });
});
