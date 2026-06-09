# Technical Development Discovery Pass — Engines & Build Path

## How the comparable games were actually built

**Hypnospace Outlaw (Tendershoot).** The closest technical analog — a "super robust fake OS and a really big fake internet." Built in **Construct 2**, an HTML5 event-sheet (2D, no-code/low-code) engine. It began as a Clickteam Fusion arcade prototype and escalated into the fake-OS sim when the team found the web pages more interesting than the driving. The Unity title in this universe is the *sequel* (Slayers X), not the original. Takeaway: **a convincing windowed fake-OS does not need a 3D engine or even a conventional game engine** — it is a 2D UI sim, and HTML/web tech is native to it.

**Chants of Sennaar (Rundisc).** Two people (Julien Moya — art/design; Thomas Panuel — code/design). Demonstrates the whole genre is small-team-tractable; the notebook validation system is the hard part, not the rendering.

**Heaven's Vault (inkle).** Small studio. Narrative and state run on **ink**, inkle's open-source branching-narrative scripting language, which compiles into a host runtime (Unity, or **inkjs** for the web). ink is the tool to know if you want scripted story beats with clean state tracking.

**Return of the Obra Dinn (Lucas Pope).** Custom in-house engine, one developer. Listed only to rule it out: bespoke-engine territory is the wrong path for your scope.

## Text/IF engine landscape, against your specific needs

Your game is not branching prose. It is a **file-browser OS over a cross-referential state graph with a four-state visual-corruption layer**. Evaluate tools against that, not against "interactive fiction."

- **Twine** — TiddlyWiki/HTML-JS lineage; compiles to a single distributable HTML file; trivial to start; visual passage map. Weakness: logic and state get unwieldy as they scale. Good for a *throwaway prototype* of the propagation logic, poor as the shipping substrate for a stateful graph.
- **ink (inkjs)** — open-source, writer-facing, excellent state/variable tracking, web-embeddable. Right tool *if* the spine were branching narrative. Your spine is a data graph, so ink would be auxiliary (scripted beats, entity dialogue) at most.
- **Ren'Py** — Python visual-novel engine; strong save/UI, but VN-shaped. Wrong geometry for a document-browser; you would fight its assumptions.
- **Construct 3 / Godot** — viable general engines. Construct proves the fake-OS is achievable; Godot gives more control. Both are heavier than this project needs given your existing workflow.

## Recommendation

Build it as a **self-contained web app — plain JS or React SPA** — for three reasons:

1. **The "OS" is a windowing UI.** HTML/CSS/JS is the native medium for windows, terminals, file panes, clearance gating, and — critically — the **four-state visual grammar** (redacted / player-inserted / propagated-elsewhere / ground-truth-contradiction). CSS gives you color, strikethrough, diff markup, glyph overlays, and mouse-over reveals (your scoped-resolution feature) directly. A game engine would abstract you *away* from this control.
2. **The core is a data model, not a renderer.** Represent each SCP file as structured data: `file → typed slots (object/agent/location/outcome) → cross-reference edges → corruption state`. Propagation is a graph traversal over shared anchors; ground-truth is an immutable field per slot; the overlay is a mutable field; the displayed state is a function of both. This is a state-management problem React handles cleanly (or vanilla JS with a central store).
3. **It matches your existing pipeline.** You already ship self-contained HTML game artifacts. Same substrate, same distribution, no toolchain switch, immediate iteration.

Architecture sketch:

- **Data layer:** JSON corpus of ~15–30 hand-authored entities with explicit anchor terms and pre-written bounded mutation sets per anchor (no free text).
- **Propagation engine:** on insertion, walk the cross-reference graph; apply the anchor's mutation to every linked file; increment an `exposure` scalar; mark touched slots `propagated`.
- **Stability/breach layer:** `exposure` thresholds trigger per-entity breach states that mutate terminal behavior (corrupt search, lock a tier, inject noise) — board state, not a fail screen.
- **Validation:** ground-truth fragments unlock in **batches** on clearance gain; the displayed delta between propagated overlay and leaking truth is the puzzle surface.
- **Optional:** inkjs only if you want scripted narrative interludes; not required for the loop.

Use Twine only to prototype propagation rules fast if you want a sandbox before committing to the SPA.
