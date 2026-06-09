# Design Discovery Pass — Decipherment & Document Mechanics

## The single problem this genre is about

Every game below is solving one thing: **how to confirm a player's deduction without the confirmation mechanism leaking the answer.** This is the named, unsolved-in-general design problem (Pope, inkle, and Osmotic each attacked it differently and each left exploits). Your overlay-vs-ground-truth delta is your proposed answer to it. Judge every borrowed mechanic against whether it leaks.

## Chants of Sennaar (Rundisc, 2023 — 2-person team)

Mechanic: a **notebook of guess-slots**. The player assigns tentative meanings to glyphs from context. When enough clues exist, the notebook prompts matching a *page* of glyphs to illustrated meanings; a correct page locks in and **auto-fills every future instance** of those glyphs.

- Vocabulary is tiny (~30 words per culture) and the same symbol serves spoken and written forms.
- Validation is **batched** (a page at a time), not per-guess.
- Known weakness: the notebook silently corrects small errors. Hardcore players disable autofill for real difficulty.

Lessons for you: bounded vocabulary is what makes propagation tractable; validate in batches; treat autofill aggressiveness as a difficulty dial (your typed-slot anchors are the equivalent of glyphs).

## Heaven's Vault (inkle, 2019)

Mechanic: a **procedural ancient language** with, under the hood, roughly five possible errors per inscription. **No fail state.** Mistranslations feed back into the narrative — every translation is "a correct answer to what happens next," even when one reading is literally correct. The game nudges you toward or eliminates options without ever blocking progress.

Lessons for you: ambiguity is the aesthetic, not the bug. **A wrong guess should generate diegetic corruption, not a failure screen** — this is the direct precedent for your propagation-as-consequence loop. Archaeology (and your decipherment) is about provisional interpretation revised under new evidence, never "completion."

## Return of the Obra Dinn (Lucas Pope, 2018)

Mechanic: the **"rule of three."** The player assigns fate + identity from multiple-choice lists; the game locks answers only when **three are simultaneously correct**, specifically to block one-at-a-time brute force.

- Known exploit: players still cycle options against the batch confirmation, and dropdown contents leak thematic hints. Functional but imperfect.

Lessons for you: batch-confirmation is the strongest available anti-brute-force pattern — adopt it for unlocking ground-truth fragments. But minimize the leak: your "options" should be the player's *own propagated guesses*, not a curated menu, which structurally reduces the dropdown-hint exploit.

## Orwell (Osmotic Studios, 2016)

Mechanic: a desktop where the player harvests "datachunks," the system **flags conflicts between contradictory chunks**, and uploads are **irreversible** ("once uploaded, this cannot be undone").

- Known weakness (cited by reviewers): collapses into a gut-instinct binary between two conflicting items with **no way to deepen understanding** before committing.

Lessons for you: irreversibility + conflict-flagging is precisely your corruption-propagation + OS-stability stakes — a commit you cannot take back, that ripples across files. **But Orwell's flaw is your trap.** Avoid the shallow binary: the inference loop must let the player *deepen* their read (mouse-over reveals, cross-reference triangulation) before the irreversible insertion, so the choice is earned, not a coin-flip.

## Meta / corrupted-OS precedent

Pony Island, Inscryption, and Hypnospace Outlaw establish the fake-OS-harboring-a-malevolent-entity frame and the fourth-wall corruption aesthetic. Reference for tone and for the "the software itself is the antagonist" reveal — not for core loop.

## Synthesis — the borrow list

- Typed-slot anchors with bounded mutation sets → from Sennaar's vocabulary discipline.
- Wrong guess = diegetic corruption, no fail screen → from Heaven's Vault.
- Ground-truth fragments unlock in batches → from Obra Dinn's rule of three.
- Irreversible, rippling commits raise OS exposure → from Orwell, minus its shallow binary.
- Mouse-over reveal deepens inference before commit → your fix for Orwell's weakness.
