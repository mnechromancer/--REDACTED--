// AMBER's self-documentation — `man <cmd>` (v3 Phase 3, sprint 03 story S3).
// Copy as data: pages are printed verbatim to the terminal log, one array entry
// per line. This is the ONLY tutorial voice in the game, so every line here is
// documentation the player will trust with their run: mechanics stated must be
// mechanics true (register contract, spec_game.md §5.1).
//
// Register rules enforced by test:
//   - AMBER never volunteers — no page hints at an answer, a candidate word, or
//     a shortcut. Pages document verbs; the player supplies everything else.
//   - AMBER holds no page for what rides the batch. `man` on that name returns
//     null exactly like any unknown command (decision P3-8 — the designed tell,
//     so that word appears nowhere in this module).
//   - Clinical, terse, period-accurate. No exclamation marks. No apologies.
//   - Every line ≤ 100 characters (the one-screen terminal).

/** canonical command → page lines, printed verbatim to the terminal log */
export const MAN: Record<string, string[]> = {
  open: [
    'USAGE: open <n> | open <designation>',
    'a bare number opens that numbered cross-reference in the open record.',
    'designations resolve case-insensitively: open scp-41b-101, open ref-03.',
    'a holding no consignment has delivered reports NOT IN ARCHIVE.',
    'alias: o.',
  ],
  next: [
    'USAGE: next | next doc',
    "next moves to this record's next outstanding field.",
    'next doc cycles to the next record. the ] and [ keys do the same.',
    'alias: n.',
  ],
  cite: [
    'USAGE: cite',
    'stakes the current pane selection into the citation workspace.',
    'costs nothing. needs no target: read any record, stake what stands in it.',
    'a staked span is judged only at commit — PREPARE the field, then INITIATE.',
    'aliases: forge, c.',
  ],
  xref: [
    'USAGE: xref <word> | xref <n>',
    'the concordance. lists every reachable record whose readable text carries <word>.',
    'hits are numbered. xref <n> opens hit n and stakes its span into the workspace.',
    'it finds occurrences of a word the operator supplies. it proposes nothing.',
    "coverage grows as reconstruction proceeds: a restored field's text is readable text.",
    'aliases: grep, search, s.',
  ],
  diff: [
    'USAGE: diff <a> <b>',
    'renders two records side by side, differences marked.',
    'withheld fields compare as withheld; a comparison discloses nothing withheld.',
  ],
  ls: [
    'USAGE: ls [batch|shelf]',
    'lists the mounted consignment and the reference shelf; consignment records carry restoration counts.',
    'ls batch or ls shelf confines the listing to one collection.',
  ],
  status: [
    'USAGE: status',
    'reports the day, consignment progress, and records eligible for transmittal.',
    'reports the irregularity index. an index above nominal warrants review.',
  ],
  log: [
    'USAGE: log',
    'the reconstruction ledger: every field on file, its source, and its citation status.',
    'a field enters the ledger by cited commit or by annex propagation.',
  ],
  verify: [
    'USAGE: verify',
    'transmittal QC over the mounted consignment.',
    'reports outstanding fields and fields that disagree with the record. re-derive the latter.',
    'records with nothing outstanding are CLEARED FOR TRANSMITTAL.',
  ],
  mail: [
    'USAGE: mail [n]',
    'lists the message file. mail <n> reads message n full-pane.',
    'any navigation returns to the record.',
    'alias: m.',
  ],
  note: [
    'USAGE: note [text]',
    'note <text> adds a line to the scratchpad. bare note lists it.',
    'the scratchpad is destroyed at 16:00, without exception.',
  ],
  end: [
    'USAGE: end',
    'runs the 16:00 turnover. transmitted reconstructions survive; nothing else does.',
    'the next consignment mounts at 04:00.',
    'alias: eod.',
  ],
  prov: [
    'USAGE: prov',
    'toggles the provenance tell on restored fields.',
    "a field's source is a matter of record.",
  ],
  man: [
    'USAGE: man [cmd]',
    'prints the page for a command. bare man lists the pages on file.',
    'a command not on file has no page.',
  ],
  help: [
    'USAGE: help',
    'prints the one-screen command summary.',
    'man <cmd> holds the page for each command.',
    'alias: ?.',
  ],
};

/** alias → canonical. no alias points at a page that does not exist. */
export const MAN_ALIASES: Record<string, string> = {
  o: 'open',
  n: 'next',
  c: 'cite',
  forge: 'cite',
  m: 'mail',
  grep: 'xref',
  search: 'xref',
  s: 'xref',
  eod: 'end',
  '?': 'help',
};

/**
 * Resolve a command (through aliases, case-insensitively — designations resolve
 * case-insensitively and the pages follow suit) to its page, or null when AMBER
 * holds no page. Unknown commands are null; so is the one name AMBER has no
 * record of (P3-8).
 */
export function manPage(cmd: string): string[] | null {
  const key = cmd.trim().toLowerCase();
  const canonical = MAN_ALIASES[key] ?? key;
  return MAN[canonical] ?? null;
}

/** Canonical page names in display order — the listing bare `man` prints. */
export function manIndex(): string[] {
  return Object.keys(MAN);
}
