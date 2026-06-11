# Planning

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
