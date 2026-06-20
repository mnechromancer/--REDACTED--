# Planning

> **⚠ Second pivot (2026-06-17): the v2 reset.** Current direction. Read **`reset_amber_v2.md`** (the plan), then `amber_build_decisions.md` (the decision + phase-completion log) and `roadmap.md` top box (the v2 phase ledger). **Phases 0–3 are done** (the primitive, the playable opening, and the forged-citation verb + 80s aesthetic), and **Phase 4's first content batch is done** (2026-06-17): the corpus grew from the 2-file teaching pair to **10 files** — seven new entries (`003`–`009`), one per arc, a chronological grounding chain proven AMBER-winnable end to end; E resolved (broad, one per arc) and F partially built (the `lure` field + band-gated Quippy offer — Quippy can now offer the escalatory WRONG word; the reference-rewrite teeth wait for Phase 6). **Next up: Phase 5 (the wiki-graph view + deeper inference) or Phase 6 (Quippy reference-corruption — now unblocked).** The completed phase handoffs (`handoff_reset_build.md`, `handoff_phase3.md`) now live in **`archive/`**. **`design_note_forged_citations.md`** is **BUILT** (Phase 3): the player *forges* citations from selected spans, AMBER judges at commit, `citeIn` demoted to a build-time winnability guarantee. Its dark mirror is **`design_note_quippy_corruption.md`** (Phase 6, spec'd 2026-06-17): Quippy fills are ungrounded AND a Quippy unredaction rewrites the cross-referenced text so the corpus closes over the lie — build deferred (now unblocked: the span/citation model it needs exists). The reset keeps the AMBER/Quippy split and the no-Quippy win but **replaces the redaction primitive** (sentence-rewrite mutation sets → single redacted word recovered by citing where the corpus grounds it), cuts clearance for pure-graph reachability, and resets onboarding. The 2026-06-13 re-frame (`reframe_amber_quippy.md`) is the **prior** north star — still readable, superseded-in-part by the reset.
>
> **Earlier (2026-06-13) re-frame, now partly superseded:** `reframe_amber_quippy.md` (banner-marked superseded-in-part). **All the completed handoffs (`archive/handoff_docs_reviser.md`, `archive/handoff_janitor.md`, `archive/handoff_lore_trio.md`, `archive/handoff_amber_build.md`, `archive/handoff_reset_build.md`, `archive/handoff_phase3.md`, `archive/sprint_01_vertical_slice.md`, …) now live in `archive/` and stand as history — do not rewrite them.** Under the reset the trio is **retired** (its lore mined into new chronological entries; see `archive/handoff_reset_build.md` §0).

The **execution layer** of the project. Living, forward-looking artifacts: the sprint runbook, the current sprint's stories and status, and the roadmap. Distinct from the reference docs in `vault/docs/`, which are stable specs.

## The split — methodology vs. application

| Layer | Lives in | Changes |
|---|---|---|
| **Methodology** — how we work (lore pipeline, dev roles, orchestration patterns, operating rules) | `agents.md` | Rarely; it's the process *design* |
| **Application** — this sprint's actual stories, status, decisions, the runbook that operationalizes the method | `planning/` (here) | Every sprint; it's the process *in motion* |
| **Reference** — what the game is and how it's built (mechanics, schema, setting, corpus) | `vault/docs/*.md` | When a spec decision changes |

Rule of thumb: if it describes *how the team works in general*, it's `agents.md`. If it's *what we're doing this sprint or next*, it's here. If it's *what the game is*, it's a reference doc.

`agents.md` §3 (dev lifecycle: epics, roles, sprint shape) is the **parent** of this folder — the planning docs instantiate the structures it defines. When the two disagree, `agents.md` is authoritative on *method*; the sprint docs are authoritative on *current state*.

## Contents

- **`sprint_process.md`** — the repeatable runbook. The phases every sprint follows, the ceremonies, the definition-of-done gates, how lore and code tracks converge. Generalized from Sprint 1; applied to all subsequent sprints.
- **`sprint_01_vertical_slice.md`** — the current sprint. Concrete stories, owners (agent roles), status, decisions log. The single source of truth for "what are we doing right now."
- **`roadmap.md`** — the horizon. Epics (`agents.md` §3.1) mapped to sprints, with the convergence points and the content-scaling plan. Coarse beyond the next sprint by design.

## How a sprint flows (one line)

`roadmap.md` says what's next → `sprint_NN.md` is opened from `sprint_process.md`'s template → work runs the two tracks (code per `agents.md` §3, lore per `agents.md` §2) → sprint closes when every story hits its playable definition of done → `handoff.md` and `roadmap.md` are updated → next sprint opens.
