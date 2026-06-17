// Session/boot state — the minimal first-run flow that replaces the retired
// scripted onboarding (`progression.svelte.ts`, removed in Phase 2 per
// reset_amber_v2.md §3 and handoff_reset_build.md §5).
//
// What the old module did and why it's gone:
//   - file UNLOCK gating → dead. Under decision D (pure-graph), file visibility is
//     reachability (`reachableFiles()` in game.svelte.ts); App derives the visible
//     set from that. There is no separate unlock order anymore.
//   - the staged SCRIPT (boot→restore→audit→link→open→free) → removed. It taught a
//     retired loop (clearance/raise), front-loaded a mechanic the player couldn't
//     act on, and NAMED Quippy in AMBER's own voice — which §0.2 forbids (AMBER
//     never introduces Quippy; it behaves as if it keeps forgetting Quippy exists).
//
// What survives as the bare minimum: one boolean — are we on the bootup screen, or
// in session — and one diegetic fact — has Quippy made its uninvited first contact
// yet (so the panel can speak a real first-contact line instead of the recurring
// "you came back" greeting, the §0.3 confusion). The source-less premise the bootup
// states lives in App's bootup view; the teaching beats live in the corpus bodies
// (001/002 already narrate the verb). Nothing here gates files or touches
// truth/overlay.

/**
 * `booting` — true until the player leaves the bootup screen and is handed the
 * terminal (alone with AMBER on the first record, §3.1).
 * `quippyMet` — false until Quippy's uninvited first contact fires. Drives the
 * one-time first-contact line and the motivated entrance trigger (§3.3): Quippy
 * pops up the moment the player follows 001's link into 002 — the instant they've
 * shown they can do the honest work without it. Reset by loadCorpus for a fresh run.
 */
export const session = $state<{ booting: boolean; quippyMet: boolean }>({
  booting: true,
  quippyMet: false,
});

/** Leave the bootup screen and hand over the terminal. */
export function beginSession(): void {
  session.booting = false;
}

/** Reset the boot/first-contact flags for a fresh run (called from loadCorpus). */
export function resetSession(): void {
  session.booting = true;
  session.quippyMet = false;
}
