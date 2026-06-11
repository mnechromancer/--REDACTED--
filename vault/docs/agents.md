# Agents — Agentic Development Methodology

How this game gets built and authored by agents. Method aligned to the five CCA-F (Claude Certified Architect – Foundations) exam domains; every pattern named below is a pattern from that blueprint applied to this repo's actual work. Companion docs: `technical_document.md` (what to build), `site_41b.md` (what to write), `handoff.md` (context routing).

The organizing conceit: **the development process is diegetic.** The agents that author and QA the corpus are Foundation staff personas at Site-41B; the documentation pipeline below is simultaneously the real quality gate and the in-fiction provenance of every file the player reads. The recurring characters in `site_41b.md` §3 are these personas. Nothing about that conceit is decorative — severity-tiered authoring and descending redaction are how the entries acquire their load-bearing properties (original truths, inferable-but-not-trivial prose, index-aligned mutation sets).

---

## 1. CCA-F domain map

| # | Domain (weight) | What it means in this repo |
|---|---|---|
| 1 | Agentic Architecture & Orchestration (27%) | Two standing workflows: the **Documentation QA pipeline** (§2, evaluator-optimizer) and the **sprint dev cycle** (§3, orchestrator-worker). Task decomposition = work orders and user stories. Model selection by role (§5.4). |
| 2 | Claude Code Configuration & Workflows (20%) | `CLAUDE.md` as the compressed always-loaded contract; plan mode for architecture decisions; worktree isolation for parallel stories; a `PostToolUse`-style hook running `build-corpus.ts` on any `vault/entries/` write (§3.4); headless/CI validation once the parser exists. |
| 3 | Prompt Engineering & Structured Output (20%) | Persona prompts with explicit role/task framing and few-shot exemplars (`entry_template.md`'s worked SCP-41B-003 *is* the few-shot example); structured output = the frontmatter schema, validated by the parser, retried on failure (§2.4's return loop is the validation-retry loop). |
| 4 | Tool Design & MCP Integration (18%) | `build-corpus.ts` is the project's canonical tool: deterministic, validating, structured errors. Least-privilege scoping = lore agents get vault access only, dev agents get src access only (§4.2). |
| 5 | Context Management & Reliability (15%) | File-based memory (§4.3); just-in-time doc retrieval via the routing table in `handoff.md` §2; the integrity gate as the error-propagation firewall (§4.4); stable-prefix caching for the lore pipeline (§5.4). |

---

## 2. The Documentation QA pipeline (lore authoring)

**Pattern: evaluator-optimizer with sequential staged refinement.** Each entry passes through descending-clearance stages; a terminal validator either promotes the draft or returns it with findings. The chain is also the fiction: a document authored high, redacted downward, and filed — exactly the history the player excavates.

### 2.1 Severity tiers select the author

An entry's object class and baseline clearance determine which persona authors it and how much context that persona is given. Severity is not cosmetic — higher-tier entries carry higher `redaction_level` anchors, denser concept membership, and endgame proximity, so they are written by the agent role holding the most context (and the strongest model, §5.4).

| Severity | Object class / clearance | Authoring persona | Context loaded |
|---|---|---|---|
| High | Keter-analog / clearance 4–5, anything touching SCP-X | L5 Senior Researcher | Full: `site_41b.md`, concept-key registry, SCP-X arc, all prior entries |
| Mid | Euclid-analog / clearance 2–3 | L4 Researcher | `site_41b.md` cluster brief, registry slice for its concepts, xref partners |
| Low | Safe-analog / clearance 1–2 | L3 Staff Researcher | Cluster brief + registry slice only |

### 2.2 Stages

Every stage reads one artifact and writes one artifact. Drafts live at `vault/entries/_WIP-SCP-41B-###.md` — the `_` prefix keeps them out of the parser. Promotion is the rename that strips the prefix.

**Stage 0 — Commission (Orchestrator / "Site Records Directive").**
Consults the entity roster and concept-key registry; emits a *work order*: item #, object class, clearance, cluster membership (`site_41b.md` §2), ≥2 concept-keys with their existing mutation-set orderings, xref targets, breach effect. The work order is the structured task decomposition; nothing downstream invents these fields.

**Stage 1 — Authoring (severity-selected persona, §2.1).**
Writes the *unredacted* document: clean Series-I prose, complete frontmatter skeleton, all `truth:` values. Owns two invariants: **licensing** (every truth original — flavor may echo canon, resolutions may not) and **voice** (clinical register, addendum structure, no ACS anachronism).

**Stage 2 — Redaction (Records Officer persona, one pass per descending tier).**
Selects the spans that become anchors, assigns each a `redaction_level`, replaces spans with `⟦id⟧` tokens, builds the `anchors[]` list. The descending repetition is functional: the tier-N pass reads the document *as a tier-N reader* and verifies the surviving prose still triangulates the slot without leaking it — the "inferable, not trivial" check from `entry_template.md`, performed in-character. A slot that's obvious at tier 2 gets its surrounding prose tightened; a slot that's unreadable gets a contextual breadcrumb added.

**Stage 3 — Mutation authoring (Counterintelligence Officer persona).**
Writes each anchor's bounded MadLib set (3–5 candidates), consulting the registry so that every shared-`concept` group stays **equal-length and index-aligned** across all carrying files. Owns the typed-slot invariant: no free text, candidates plausible enough to be dangerous, wrong candidates that *read* true. This persona is diegetically the disinformation desk — the one who writes convincing falsehoods — which is exactly the craft requirement.

**Stage 4 — Integrity gate (Records Integrity persona — the evaluator).**
Runs `build-corpus.ts` against a staging copy (pre-code: the manual checklist below). On failure, returns the draft to the owning stage with structured findings; on pass, promotes the file and triggers Stage 5. Checks:
- every `⟦id⟧` resolves to an anchor; every xref resolves to a file
- concept groups equal-length and index-aligned corpus-wide
- exactly one `entity_self: true` in the corpus
- density target: ≥2 shared concept-keys
- licensing scan: no canon entity, name, or solution in any `truth:` field

**Stage 5 — Registry update (Orchestrator).**
Concept-key registry and entity roster updated with the new memberships and orderings. The registry is the pipeline's shared memory (§4.3); skipping this step is how orphan concepts and silent graph failure happen.

### 2.3 Why staged, why descending

Single-shot entry generation reliably fails three ways: truths drift toward canon (licensing), slots become either trivial or unreadable (playability), and mutation sets misalign across files (the build invariant). Each stage exists because it owns exactly one of those failure modes with the minimum context needed to catch it. That is the CCA-F decomposition argument: split where failure modes split.

### 2.4 The return loop

Stage 4 findings name the owning stage: a leaked truth goes back to Stage 2 (redaction too thin), a misaligned mutation set to Stage 3, a canon-shaped resolution to Stage 1. One bounded retry per stage per finding; a draft failing the same check twice escalates to the human — the CCA-F escalation pattern, applied where taste (not validation) is the bottleneck.

---

## 3. Dev lifecycle automation (the code track)

**Pattern: orchestrator-worker.** An orchestrator/PM agent maintains the backlog and dispatches; worker roles execute. Runs parallel to the lore track (§2) — the two converge at milestone 4 when propagation needs real entries.

### 3.1 Epics → milestones

Epics group `technical_document.md` §10 milestones; every milestone is independently playable, which makes "playable" the definition of done.

| Epic | Milestones | Definition of done |
|---|---|---|
| A — Corpus pipeline | M1 | 3 stub entries round-trip Obsidian → `corpus.json`; all validation rules fire on deliberately broken fixtures |
| B — Reader | M2–M3 | Files render with redaction bars + clearance gating; single-file insertion shows redacted/inserted states |
| C — Propagation core | M4–M5 | Cross-file mutation with provenance; batched truth reveal; four-state grammar complete |
| D — Breach & endgame | M6–M7 | Terminal-mutating breach effects + recovery; ouroboros fork on overlay state |
| E — Dials & content | M8–M9 | Difficulty/accessibility dials; corpus scaled to 15–30 entities through the §2 pipeline |

### 3.2 Roles

- **Orchestrator/PM** — owns backlog, slices milestones into user stories ("As the archivist, I hover a redacted span and see slot type + cross-mentions + candidates"), dispatches, integrates.
- **Architect** — plan-mode only; resolves design forks against the six CLAUDE.md invariants before code exists. Any story touching the inference/exposure economy or the overlay/truth boundary routes here first.
- **Implementer** — writes code per story; one story per worktree when parallel.
- **Test engineer** — `propagation.ts`, `validation.ts`, `breaches.ts` are pure functions over (corpus, overlay) — ideal unit targets. Property tests for the invariants: idempotent re-insertion, index-aligned mutation mapping, truth never volunteered for untouched slots.
- **Reviewer** — `/code-review` per story; invariant violations (a second resource, per-guess validation, free-text insertion) are blocking findings, not style notes.
- **Verifier** — runs the app, plays the milestone's "definition of done" loop, reports observed behavior.

### 3.3 Sprint shape

Sprint 1 is the vertical slice (`handoff.md` §6): Epic A + B stories on the code track while the §2 pipeline produces the first 3 entities sharing 2 concept-keys. Sequential where state demands it (M3 before M4 — `displayedSlot` before propagation), parallel where it doesn't (content track, test scaffolding, the four-state CSS tokens). The parallelization rule from Domain 1: parallelize only what shares no mutable state — stories touching `game.svelte.ts` serialize, stories touching distinct components don't.

### 3.4 Automation hooks

Once M1 lands: a hook on `vault/entries/*.md` writes runs `build-corpus.ts` and surfaces failures immediately — Stage 4 becomes mechanical, the Records Integrity persona keeps only the licensing/taste judgment. CI runs the same validation headless on every commit, so the corpus cannot merge broken.

---

## 4. Context management & orchestration

### 4.1 The two-layer memory model

`CLAUDE.md` is the compressed, always-loaded contract — invariants, schema, layout. The deep specs live in `vault/docs/` and load **just-in-time** via the routing rule (`handoff.md` §2): mechanics → `design_document.md`, build → `technical_document.md`, authoring → `entry_template.md`, setting → `site_41b.md`, method → this file. Agents are prompted with the route, not the corpus of docs. Keep CLAUDE.md compressed; growth pressure goes into the routed docs.

### 4.2 Context isolation by role

Lore personas never load the codebase; dev workers never load the antimemetics research. A subagent's context is its clearance — load exactly what the stage owns (§2.1's context column is the access-control list). This is least-privilege scoping applied to context instead of credentials, and it is also why the pipeline personas stay in voice: an L3 Staff Researcher prompt that contains the whole SCP-X arc will leak it into a clearance-1 entry.

### 4.3 Files are the only durable memory

Anything that must survive compaction or session death is a file: work orders, the concept-key registry, the entity roster, sprint state, stage findings. Handoffs between stages are artifacts (`_WIP-` drafts + findings notes), never conversation state. The registry is load-bearing — it is the shared mutation-set ordering that keeps propagation deterministic, and it only works if Stage 5 writes it every time.

### 4.4 Error propagation firewall

In a multi-agent corpus, one misaligned mutation set corrupts every file sharing the concept. The Stage 4 gate exists so errors die at the boundary: nothing reaches `vault/entries/` unvalidated, so no downstream agent ever ingests a broken graph. Same reasoning as the game's own design: validation is batched at a gate, never trusted to the per-step actor.

### 4.5 Orchestration summary

| Workflow | Pattern | Sequencing |
|---|---|---|
| Lore pipeline (§2) | Evaluator-optimizer, staged | Sequential per entry; multiple entries pipeline in parallel if their concept-keys don't overlap (shared keys serialize through Stage 3) |
| Dev cycle (§3) | Orchestrator-worker | Stories parallel across worktrees unless they share mutable state |
| Cross-track | Convergence point | Lore and code tracks independent until M4; propagation testing consumes the first 3 piped entries |

---

## 5. Operating rules

### 5.1 Invariants bind agents harder than humans

The six CLAUDE.md invariants are blocking findings at every gate (review, integrity, plan mode). The two most agent-tempting violations: adding a stability resource separate from inference (rejected on sight, `design_document.md` §9) and letting any free text into a slot (Stage 3 and the parser both forbid it).

### 5.2 State decisions, escalate forks

Per the collaborator contract (`handoff.md` §7): agents state decisions for anything derivable from the docs and escalate only genuine forks — taste calls on entry quality, invariant tensions plan mode can't resolve, scope changes. The §2.4 two-strike rule operationalizes this for the pipeline.

### 5.3 Few-shot is the style guide

SCP-41B-003 in `entry_template.md` is the canonical exemplar every authoring persona receives. Style drift is corrected by improving the exemplar, not by lengthening persona prompts.

### 5.4 Model selection by role

Reasoning-heavy, judgment-heavy roles get the strongest model; mechanical roles get the cheapest. High-severity authoring, the Architect, and Stage 3 mutation craft → strongest. Redaction passes, test scaffolding, registry updates → mid. Formatting, file moves, checklist verification → cheapest. The lore pipeline shares a stable prompt prefix (CLAUDE.md + registry + exemplar) across stages, so caching pays for the staging.
