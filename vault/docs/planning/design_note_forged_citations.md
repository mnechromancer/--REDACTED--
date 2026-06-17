# Design note — player-forged citations (the "find it yourself" upgrade)

**Status:** design decision, captured 2026-06-17 from the Phase-1 playtest. Targets the
Phase-2/3 CLI rebuild (`AmberLookup` / `AmberTerminal`). Not yet built. Supersedes the
Phase-1 stopgap where AMBER *surfaces* the grounding clue.

## The problem this fixes
In the Phase-1 `AmberLookup`, AMBER hands the player the grounding: for a teaching slot
it shows the file holding the word. That short-circuits the core verb — the player is
*told* where the word lives instead of *finding* it. The playtest call (user): the
discovery should be the player's, not AMBER's. "Learn the files well enough to read them
yourself, and you starve it" is the whole thesis; being handed the clue undercuts it.

## The mechanic — forge a citation from a highlighted span
In the CLI-driven OS the archivist:

1. **Types the recovered word** into the redacted slot — a deliberate act of recall.
   (Word entry stays separate from citing — user decision: *type the word, cite to justify.*)
2. **Highlights a span of text** in some reachable document and **forges a citation**
   from that span to the redacted slot. The link **always draws** — it is an assertion
   the player is making, not something AMBER pre-validates. (User decision: *any selected
   span links; commit judges.*)
3. **Commits.** AMBER adjudicates at commit time: the citation grounds the word iff its
   **cited span actually contains the word** (the teaching check, now span-scoped rather
   than whole-file) **and its file is reachable.** A citation whose span lacks the word is
   **rejected at commit** — the player built a wrong case and learns from the rejection.

The act of citing *is* the act of having found the word. AMBER never reveals where the
word lives; the player discovers it by reading, selects the occurrence, and stakes the link.

## Why "any span links, commit judges" (not "validate on link")
Validating at link time would re-introduce the hand-holding — AMBER would effectively
confirm "yes, that span is right" the instant you select it. Deferring judgment to commit
keeps AMBER cold and the discovery real: you can assemble a wrong or partial case, and the
rejection (`✗ cited span does not carry the word`) is the teaching signal. This also
generalizes cleanly to inference slots — you forge several spans and the commit weighs them.

## Engine implications (for the Phase-2/3 build, not Phase 1)
The Phase-1 engine already has the honest bones; this changes the citation *unit* and the
*who-finds-it*:

- **Citation unit changes from a ref to a span.** Today `corroborates(citationRef, ref)` /
  `commitWithCitations(ref, value, citations)` take co-carrier/file refs. The forged-citation
  model wants citations to carry **(file id, selected text)** — or at minimum the selected
  text — so the commit check is "does this span contain the word," span-scoped, replacing
  the current whole-file `bodyContainsWord`. Keep `bodyContainsWord` as the span check.
- **Teaching grounding's `citeIn` may become advisory, not the gate.** Today `citeIn` names
  the sanctioned files. Under forged citations the gate is "the span carries the word AND the
  file is reachable" — *any* reachable file whose prose contains the word should be citable,
  not only authored `citeIn` files. `citeIn` could downgrade to a build-time *guarantee that
  at least one reachable grounding exists* (the winnability check), while play accepts any
  valid span the player finds. **Decision deferred to the build:** keep `citeIn` as the
  authored winnability guarantee; let play accept any reachable span containing the word.
- **The honesty rule survives unchanged.** A propagated value still can't ground (you cite
  *prose you read*, not a value your own ripple pushed). Reachability still gates.
- **UI: span selection + "forge citation" is the new core interaction** — `AmberTerminal`
  span-select, a citation buffer on the slot, commit reads the buffer. This is the R§6.6
  "real CLI" debt, now with a concrete verb.

## Open sub-questions (resolve at the Phase-2/3 build, not blocking)
- Span granularity: exact-word selection, or any span that *contains* the word? (Lean: any
  span containing the word — selecting loosely is fine; the check is containment.)
- Do forged citations persist on the slot (a visible "evidence file" the player builds up),
  or are they per-commit ephemeral? (Lean: persist — the player should see their case.)
- Inference slots: multiple forged spans summing to threshold — same buffer, count distinct
  grounding spans. Fits the decision-A meter.

## Companion principle — citing guidance lives in AMBER, never in entry prose
(Playtest finding, 2026-06-17.) The Phase-1 teaching entries narrate *how to cite*
("follow the link, find the word, cite it") inside the document prose. That is a
giveaway and a category error: **the documents are the subject matter; the method of
citing belongs to AMBER** — surfaced through a `help` / `hint` command, the Concordance
tooling, or AMBER's terse register, never written into an entry. When the entries are
re-authored for the forged-citation mechanic, strip all how-to-cite scaffolding from the
prose; the entry should read as in-world Foundation paperwork that happens to contain the
grounding word, with no awareness it is teaching anything. AMBER teaches; the record does not.

## Related
- [[reset_amber_v2]] §1.3 (grounding by depth), §2.1 (the real CLI), §4 (wiki-graph — the
  discovery surface the player uses to *find* citeable files).
- [[handoff_reset_build]] §5 (Phase-2/3 UI), §2 (the grounding model this refines).
