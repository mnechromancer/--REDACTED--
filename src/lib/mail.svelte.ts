// Mail — the receiving-site cast's whole existence (v3, reset_v3_intake.md §2.3):
// the supervisor who delegated the task, HR boilerplate, facilities noise. Mail is
// the onboarding channel (day 1's brief states the premise) and the day-pacing
// channel. Delivery is day-gated: a message exists once `day <= session.day`.
//
// Rules this module carries:
//  - the receiving cast lives ONLY here, never in the corpus; the 41B cast lives
//    only in the documents (site_41b.md §4).
//  - mail PERSISTS across the 4 PM erasure — it is the site's correspondence, not
//    notes about the batch. (The erasure takes work-product; see session.advanceDay.)
//  - AMBER's voice rules hold: no message ever names or acknowledges Quippy.
//
// Phase-1 scope: the mailbox is authored here in code. The Phase-2 opening pass
// re-authors the real day-1 mail (and may move authoring to the vault if the
// content wants Obsidian editing); the store API is what Phase 2 builds on.

import { SvelteSet } from 'svelte/reactivity';
import { session } from './session.svelte.ts';

export interface MailMessage {
  id: string;
  /** the 4 AM mount that delivers this message (1-based) */
  day: number;
  from: string;
  subject: string;
  body: string;
}

// ── The mailbox (authored; Phase-2 re-authors the opening set) ──────────────
// Voice notes: the supervisor is terse, put-upon, and conspicuously does not say
// how to do the job (nobody knows how). "Transmitted reconstructions survive" is
// stated as procedure trivia, not explained — the mystery is load-bearing.

export const MAILBOX: MailMessage[] = [
  {
    id: 'd1-brief',
    day: 1,
    from: 'REDDING, P. — RECORDS SUPERVISION',
    subject: 'RE: RE: the 0400 consignment (your assignment)',
    body: [
      'You will find a consignment of Site-41B material mounted on your terminal. It arrives',
      'at 0400 daily, on the reel. At 1600 it is erased. So is everything written about it —',
      'cards, pads, chalk, the works. Do not spend the afternoon making notes; the afternoon',
      'does not keep.',
      '',
      'One exception, per the transmittal protocol: a reconstruction committed through the',
      'terminal citation ledger before 1600 stays on file. Nobody upstairs can tell you why',
      'citation is what the erasure respects. It is the only thing that has ever worked, and',
      'it was noticed by accident. Senior staff spent months on annotation. We do not have',
      'months, we have you.',
      '',
      "If you start anywhere, start with the consignment's cover slip. The station's own",
      'reference shelf is mounted under REF designations; it is dull, it is ours, and the',
      'erasure has never touched it. The seniors read the batch and wrote notes. The shelf',
      'they left on the floor. Draw your own conclusions; nobody here has instructions for',
      'you.',
      '',
      'Work what you can, transmit what holds, clock out before 1600. Questions travel up on',
      'the weekly pouch and answers do not travel back down.',
      '— R.',
    ].join('\n'),
  },
  {
    id: 'd1-hr',
    day: 1,
    from: 'PERSONNEL (AUTOMATIC)',
    subject: 'Welcome — term appointment, records section',
    body: [
      'This message confirms your term appointment to the records section. Credentials are',
      'active for the duration of the assignment. Amenities: the corridor urn (coffee, most',
      'days), the reference shelf (do not remove volumes from the floor), and the parking',
      'apron north of the annex. Your predecessor left the desk in good order.',
      '',
      'This message was generated automatically. Replies are filed unread.',
    ].join('\n'),
  },
  {
    id: 'd1-fac',
    day: 1,
    from: 'FACILITIES',
    subject: 'NOTICE: corridor lighting, east wing',
    body: [
      'The east corridor fixtures will be re-ballasted this week. Expect intermittent',
      'darkness between the records room and the loading dock. Facilities regrets the',
      'inconvenience and asks that staff not prop the fire door with the extinguisher again.',
    ].join('\n'),
  },
  {
    id: 'd2-brief',
    day: 2,
    from: 'REDDING, P. — RECORDS SUPERVISION',
    subject: 'consignment, day two',
    body: [
      "Today's mount includes yesterday's material again — it always does — plus new arrivals.",
      'Whatever you transmitted is on file upstairs; nobody has read it, but it is THERE,',
      'which is more than any of your predecessors managed. Keep going.',
      '',
      'If you kept notes yesterday you have already learned what happened to them. The ones',
      'who last in this job are the ones who stop needing them.',
      '— R.',
    ].join('\n'),
  },
];

// ── Read-state + delivery ───────────────────────────────────────────────────

const readIds = new SvelteSet<string>();

/** Messages delivered so far (day-gated), newest day last, stable within a day. */
export function deliveredMail(): MailMessage[] {
  return MAILBOX.filter((m) => m.day <= session.day);
}

/** Messages arriving exactly with the given day's mount (the "new mail" notice). */
export function mailArrivingOn(day: number): MailMessage[] {
  return MAILBOX.filter((m) => m.day === day);
}

export function isRead(id: string): boolean {
  return readIds.has(id);
}

export function markRead(id: string): void {
  readIds.add(id);
}

export function unreadCount(): number {
  return deliveredMail().filter((m) => !readIds.has(m.id)).length;
}

/** Fresh run: nothing read. (Mail itself is static content, not run state.) */
export function resetMail(): void {
  readIds.clear();
}
