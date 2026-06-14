// The ripple log: a persistent, append-only record of what the player's edits
// did to the corpus — propagations (a shared field rippled to a linked record)
// and audits (a batch reconciled against ground truth). The transient window
// flash shows a ripple where it lands; this sidebar keeps the history so the
// player can see the shape of what they've changed. Presentation only.

import { splitRef } from './game.svelte.ts';

export interface RippleEvent {
  id: number;
  kind: 'propagate' | 'audit';
  /** Human-readable summary line. */
  text: string;
  /** Files touched (item ids), for the sidebar to highlight. */
  files: string[];
  /** 'flag' (discrepancy/corruption) tints the entry; 'ok' confirms. */
  tone: 'neutral' | 'flag' | 'ok';
}

let nextId = 0;

export const ripples = $state<{ events: RippleEvent[] }>({ events: [] });

function push(e: Omit<RippleEvent, 'id'>): void {
  // newest first; cap so the log can't grow unbounded in a long session
  ripples.events.unshift({ ...e, id: nextId++ });
  if (ripples.events.length > 50) ripples.events.length = 50;
}

/**
 * Log a propagation: editing `sourceRef` rippled the shared concept to one or
 * more target refs. Called by the insert path via game's propagation step.
 */
export function logPropagation(sourceRef: string, targetRefs: string[]): void {
  if (targetRefs.length === 0) return;
  const src = splitRef(sourceRef).item;
  const targets = [...new Set(targetRefs.map((r) => splitRef(r).item))];
  push({
    kind: 'propagate',
    text: `Edit to ${src} propagated to ${targets.join(', ')}`,
    files: [src, ...targets],
    tone: 'neutral',
  });
}

/** Log an audit batch result. */
export function logAudit(tier: number, discrepancies: number, confirmed: number): void {
  const parts: string[] = [];
  if (discrepancies > 0) parts.push(`${discrepancies} struck`);
  if (confirmed > 0) parts.push(`${confirmed} confirmed`);
  push({
    kind: 'audit',
    text: `Audit to L${tier}${parts.length ? ' — ' + parts.join(', ') : ' — no entries to reconcile'}`,
    files: [],
    tone: discrepancies > 0 ? 'flag' : confirmed > 0 ? 'ok' : 'neutral',
  });
}
