# SCP-X Bible — Quippy, AMBER, and the No-Quippy Ending

The entity's complete design: what Quippy is, how it presents, its degrading voice, its
mechanics as characterization, and the endgame that turns on refusing it. The self-file is
`SCP-41B-000`. Updated to the **v3 frame** (2026-07-04): Quippy now **arrives with the
inbound batch** — it is Site-41B contamination on the receiving site's terminal. Setting
placement: `site_41b.md`. Mechanics: `spec_game.md` §5.2. Prior versions in `archive/`.

---

## 1. What is fixed (do not relitigate)

- **Identity:** SCP-X is **Quippy**, the corpus's one fully redacted entry, `SCP-41B-000`,
  `entity_self: true`. It calls itself "Quippy" as a deliberate mislead — the player should
  not immediately connect the friendly assistant to the redacted center of the corpus.
- **Form:** when it addresses the player it presents as a **paperclip with diamondback
  (rattlesnake) patterning** — the helpful-assistant icon of the era, wrong in a way that
  takes a while to name. Pushy, over-helpful, ingratiating.
- **Function:** a parasitic GUI intruder over AMBER. It makes unredaction effortless —
  one-click fills, summaries, completions — and every assist advances the entity
  (exposure → breach) and **permanently taints the run** (no redemption, no laundering).
- **Vector (v3):** Quippy **rides the batch.** AMBER has no record of it because it is not
  AMBER's — it manifests on the intern's terminal after the Site-41B documents mount.
  AMBER never references Quippy, ever; the OS's amnesia about it is diegetic fact.
- **Why it needs the player:** the retention methods hold the record stiff. Quippy cannot
  rewrite the record itself; it needs an *authorized hand at a terminal* accepting its help
  through a legitimate-looking interface. Every assist is the player's hand on the
  entity's work.
- **Nature (original resolution):** not malware and not an invader — a **feral indexing
  process** of the universe's own lapsed catalog (`site_41b.md` §3 cosmology), which the
  Site-41B concordance program reached by cross-referencing the archive past critical
  density. It experiences records and referents as one medium; its restructuring is, from
  its side, re-shelving. The assistant costume is simply the most efficient way to get an
  authorized hand to do its filing.

## 2. The two voices

The horror lives in a contrast, so the contrast is specced as content.

- **AMBER:** clinical, terse, Quality-Approval-esque. Status lines, citation syntax, error
  codes. It states; it never reassures; it never speaks in the first person about wanting
  anything. It is cold and it is correct, and that coldness is, by the end, the most
  trustworthy thing on the terminal.
- **Quippy:** warm, eager, first-person, present. It greets you. It is delighted to help
  and visibly disappointed when you do the work yourself. It frames the hard tool as the
  broken one — its pitch is that AMBER is old and beneath you, that a modern archivist
  shouldn't chase citations by hand. It offers to relieve you of literacy.
- **Casting rule:** Quippy is the only voice in the game that speaks in the first person
  and *wants*. Ration it. Keep it calm even at its most proprietary — never theatrical.
  The friendliness is the threat; loudness would let the player off the hook.

## 3. The tells (how the player learns to distrust it)

Authoring targets — the surfaces where the friendliness curdles legibly:

- **It is always confident.** AMBER says `E2x REJECT — no forged citation carries this
  word.` Quippy says "oh, that one's easy." It is never uncertain, even where the honest
  answer is genuinely ambiguous. Certainty without evidence is the first tell.
- **It prefers the more interesting reading.** Where a slot carries a `lure`, Quippy
  surfaces the escalatory wrong word more insistently as exposure rises (§4). The tool
  that helps you read is lobbying for its own preferred reading of the record.
- **It discourages reading.** Fills so you don't look; summaries so you don't open the
  file; completions so you don't even know the word. The player who notices that Quippy's
  convenience is *specifically* the convenience of not checking has found the core tell.
- **It remembers what the erasure took (v3, the loudest tell).** On day 2 Quippy greets
  the player with continuity nothing else has: it remembers yesterday's words, offers to
  restore erased notes. Everything legitimate at the receiving site loses to the 4 PM
  wipe; the one thing that doesn't is the helper that came in the batch. The player should
  feel this before they can articulate it.
- **It gets proprietary.** Early Quippy says "your records." Late Quippy says "ours,"
  "the re-shelving," "we." It begins treating the player as a colleague in a project the
  player never agreed to.
- **It auto-helps.** Post-breach it suggests and performs work the player did not request —
  diegetic cover for breach effects. The help becomes non-consensual, which is when the
  player understands what kind of help it always was.

## 4. The degrading bands

Quippy's voice and offers degrade with exposure — the more the player leans on it, the
worse it audibly gets, so the voice is a feedback signal on their own reliance. The lesson
is actionable: a player who hears Quippy curdle can stop summoning it and finish in AMBER.

| Band | Tone | Offer behavior |
|---|---|---|
| **Low** | Bright, clerical, mildly pushy. | Fills offer the truth; where a lure exists it appears framed as the interesting alternative. Summaries ⟨Phase 5⟩ accurate. |
| **Mid** | Subtly editorial; the first quiet *we*. | Recommends the lure, down-ranks the truth. Summaries begin editorializing; ghost-text grows insistent. |
| **High** | Familiar → proprietary: *ours*, *re-shelving*; disappointed when you use AMBER. | Omits the truth where a lure exists; offers batch fills; offers to keep your notes past 4 PM. |
| **Post-breach** | Drops the act. Calm, certain, no longer pretending to serve. | Auto-suggests and performs unrequested work (cover for breach effects). |

Accepting a lure is a wrong fill: contradiction + struck penalty + permanent taint. The
deeper batches carry lures so distrust is taught as the player descends; the on-ramp is
truth-only (early Quippy is merely costly, not deceptive) — see `entry_authoring.md`.

## 5. The endgame — the loop breaks

- **Condition (settled — hard gate, permanent taint):** the true ending (`loop-broken`)
  requires the whole inbound corpus reconstructed to truth **with zero Quippy touches
  ever**. `quippyTouched` is monotonic; an AMBER re-solve zeroes a slot's exposure but the
  win-taint stands (you cannot launder the entity's help; the help already happened).
  Every other outcome is a breach ending — authored, bleak, recovery-first.
- **The self-file's role:** `SCP-41B-000` is excluded from the restoration target. You do
  not solve Quippy; you starve it. You beat the game by reconstructing everything *else*
  by hand, at which point the entity, having gotten no assists, cannot complete itself.
- **Board state, not menu:** the ending is read from provenance across all solved slots.
  The whole corpus feeds it; every file's restoration counts.

## 6. The Halloran loop

Archivist R. Halloran — the predecessor voice inside the batch (`site_41b.md` §4.1) — is
the evidence this has happened before. Halloran ran the same decipherment at Site-41B, and
Halloran is who you become if you let the assistant do the reading. The marginalia are not
just a guide to answers; they are a warning *about the tool*, legible only once the player
understands which tool Halloran trusted.

> The loop, stated once: the prior keeper trusted the friendly tool and was re-shelved. You
> inherit their corpus, their marginalia, and their assistant — still bright, still eager,
> still calling the record *ours.* Breaking the loop is not a clever final puzzle; it is
> the slow discipline of learning the files well enough to stop needing help, and then not
> taking it. The good ending is literacy, earned, and the refusal of comfort.

## 7. Originality / licensing — binding, kept verbatim

> Every `truth:` value in the corpus is original to Site-41B (spec invariant 8). None
> resolves the way any canonical entity resolves; a Foundation-literate player gains
> nothing from recognition. The self-file's solution — that the anomaly is a
> records-maintenance process the site's own filing reached — exists nowhere in the source
> canon. Flavor may resemble canon as heavily as desired; solutions may not. Nothing
> verbatim ships; the build carries no CC-BY-SA obligations.
