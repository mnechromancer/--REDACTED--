# Roadmap

> **⚠ Pivot (2026-06-13): the project re-framed — see `reframe_amber_quippy.md`.** The single "help utility" interface splits into **AMBER (honest CLI)** + **Quippy (refusable GUI = SCP-X)**, and the endgame inverts to **unredact everything without Quippy.** The epic/milestone table below predates the pivot: Epic D's "endgame" is now the no-Quippy completion (not the ouroboros fork), and the M5+ milestones reorder per `technical_document.md` §10 (AMBER tooling + Quippy split; M7–M10). Sprint 1 (below) **completed under the prior design and stands as history** — its code core (pipeline, propagation, clearance, four-state grammar) is mechanic-stable and survives. Future sprints are planned to the re-frame; two design questions ([R§6.2] AMBER tooling, [R§6.4] exposure model) are **PENDING (human)** and gate the next mechanic sprint.

The horizon: epics (`agents.md` §3.1) mapped to sprints. Fine-grained for the current and next sprint; deliberately coarse beyond — scope past Sprint 2 will shift as the loop teaches us what's fun. The milestone spine is `technical_document.md` §10; the content spine is `entity_roster.md`.

---

## Epics → milestones (from `agents.md` §3.1)

| Epic | Milestones | Definition of done |
|---|---|---|
| A — Corpus pipeline | M1 | 3 entries round-trip to `corpus.json`; all validations fire on broken fixtures |
| B — Reader | M2–M3 | Files render with redaction bars + clearance gating; single-file insertion shows redacted/inserted |
| C — Propagation core | M4–M5 | Cross-file mutation with provenance; batched truth reveal; four-state grammar complete |
| D — Breach & endgame | M6–M7 | Terminal-mutating breach effects + recovery; ouroboros fork on overlay state |
| E — Dials & content | M8–M9 | Difficulty/accessibility dials; corpus scaled to 15–30 entities via the §2 pipeline |

---

## Sprint plan

### Sprint 1 — Vertical Slice  *(current)*
**Epics A + B + C · M1–M5 · 3 entries (003/001/002).**
The playable core loop: read → hover → insert → propagate → batched validate, on three entities. Detail in `sprint_01_vertical_slice.md`. Convergence at M4.
**Exit:** the loop is felt; engine + four-state grammar complete; no breaches yet.

### Sprint 2 — Consequence & a wider graph  *(next, coarse)*
**Epic D (M6) + early Epic E content.**
Make exposure *matter*: breach thresholds, the four terminal-mutating effects (`inject_xrefs`, `corrupt_search`, `lock_tier`, `randomize_propagation`), and first-class recovery/stabilization. Author the next cluster increment — likely the rest of the Misfiled (004) plus the first Quiet Departments entries (005–006) to give breaches and `the-transfer` something to act on. The degrading help-utility voice (`scp_x_bible.md` §4) gets its first two bands here, since tone is tied to exposure.
**Exit:** a breach can fire, mutate the terminal, and be recovered from; ~6–7 entities live.

### Sprint 3+ — Endgame & scale  *(horizon, intentionally loose)*
- **M7 / Epic D:** the ouroboros — `SCP-41B-000` self-file, `thread_coherence` fork (`scp_x_bible.md` §5). Requires the five threaded keys' carriers authored, so the Drift/Retention clusters must land first.
- **M8 / Epic E:** difficulty + accessibility dials (autofill, set size, exposure decay, reduced-glitch).
- **M9 / Epic E:** scale to the full 15–30 via the lore pipeline; cluster-by-cluster, density-first.

Sequencing constraint on the endgame: `SCP-41B-000` is authored **last** (`scp_x_bible.md` §7) — its anchors must be index-aligned with every carrier of its five keys, so those carriers (across all five clusters) exist first. The roadmap therefore fills clusters before the self-file, and the visual-grammar spec (`handoff.md` §8 item 4) lands before the endgame's two-ending presentation.

---

## Content-scaling order (Epic E, beyond the trio)

Drives which entries each content sprint authors. Curate for graph density, not coverage — every increment should activate a new propagation seam, not just add nodes.

1. Finish **Misfiled** (004) — completes Act I, closes `induced-nominal-amnesia`'s onboarding pair.
2. **Quiet Departments** (005–009) — brings `the-transfer` (the hinge key) and `sublevel-grid` online; first `lock_tier` breaches.
3. **Negative Stacks** (010–014) — `randomize_propagation` affinity; bridges to Retention via `reading-rota`/`standing-order`.
4. **Retention Methods** (015–020) — the connective tissue; widest tier span; seeds `concordance-program` (the entity thread) and `halloran-marginalia`.
5. **Drift** (021–024) — Tier-5 cosmology; the self-file's key-partners.
6. **`SCP-41B-000`** — last; the endgame becomes buildable.

Full carrier/key detail in `concept_key_registry.md` and `entity_roster.md`.

---

## Status

| Sprint | State |
|---|---|
| 1 — Vertical Slice | Planning |
| 2 — Consequence | Not started |
| 3+ — Endgame & scale | Horizon |

Updated at each sprint close (Phase 3, `sprint_process.md` §2).
