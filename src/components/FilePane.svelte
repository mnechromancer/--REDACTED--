<script lang="ts">
  // Renders one ScpFile in AMBER's terminal pane (re-frame §7.2): monochrome,
  // no GUI window chrome — a file listing under a clinical terminal, scaling to
  // long multi-section dossiers. v2 reset (decision D): no clearance gate — a file
  // is shown iff it is reachable in the citation graph (App passes only reachable
  // files). Slots render via SlotSpan; the in-flight citation commit lives in
  // AmberLookup, summoned by the terminal, not embedded per-slot.
  import type { ScpFile } from '../lib/corpus.ts';
  import { isReachable, makeRef, overlay } from '../lib/game.svelte.ts';
  import { openFile, log, captureSelection } from '../lib/ui.svelte.ts';
  import { parseBody } from '../lib/parseBody.ts';
  import { bodyBlocks } from '../lib/bodyBlocks.ts';
  import SlotSpan from './SlotSpan.svelte';

  let { file }: { file: ScpFile } = $props();

  // The forged-citation verb's raw material: the player SELECTS prose in this pane to
  // stake as grounding (design_note_forged_citations.md). On any selection change we
  // report the selected text + this file's id to the UI selection state IF the
  // selection lies inside this pane's body — so the citation buffer always knows which
  // record the span came from. The redaction bars render as █████, so a selection
  // dragged across a slot picks up no letters of the hidden word (it can't ground it).
  let bodyEl = $state<HTMLElement | null>(null);

  function onSelectionChange() {
    if (!bodyEl) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    // Only claim the selection if it is anchored within THIS pane's body.
    if (!bodyEl.contains(range.commonAncestorContainer)) return;
    captureSelection(file.item, sel.toString());
  }

  // A wikilink is the traversal verb: clicking a cross-reference opens that record
  // (if it's reachable in the citation graph). This is "follow the link, find the
  // word" made clickable — and it pairs with the forged-citation mechanic
  // (design_note_forged_citations.md): click through, read, cite back.
  function followLink(target: string) {
    if (!isReachable(target)) {
      log(`${target}: no citation path to this record yet.`, 'reject');
      return;
    }
    openFile(target);
  }

  const accessible = $derived(isReachable(file.item));

  // Cross-file propagation pulse: flash when a slot here changes because a linked
  // slot elsewhere was edited, so the ripple is visible where it lands.
  const propagatedCount = $derived(
    file.anchors.filter((a) => overlay[makeRef(file.item, a.id)]?.source === 'propagated').length,
  );
  let pulsing = $state(false);
  let prevCount = -1;
  $effect(() => {
    const count = propagatedCount;
    if (prevCount >= 0 && count > prevCount) {
      pulsing = true;
      const t = setTimeout(() => (pulsing = false), 800);
      prevCount = count;
      return () => clearTimeout(t);
    }
    prevCount = count;
  });

  const blocks = $derived(accessible ? bodyBlocks(parseBody(file.body)) : []);
</script>

<svelte:document onselectionchange={onSelectionChange} />

<section class="file-pane crt-scan" class:locked={!accessible} class:pulsing>
  <!-- A Foundation dossier header block, not a shell path line: item # / class / site
       boxed, the way the paperwork reads (reset_amber_v2.md §2.2). -->
  <div class="pane-head">
    <span class="doc-tag">RECORD</span><span class="item">{file.item}</span>
    <span class="meta">CLASS {file.object_class}{#if file.entity_self} · SELF-FILE{/if}</span>
    <span class="site">{file.site}</span>
    {#if pulsing}<span class="ripple-tag" aria-hidden="true">◂ XREF UPDATED</span>{/if}
  </div>

  {#if !accessible}
    <div class="lockout">
      <p>&gt; NOT YET REACHABLE</p>
      <p class="detail">no citation path to this record yet — follow the cross-references.</p>
    </div>
  {:else}
    <!-- Two columns: the record body, and a margin gutter where the post's marginalia
         render (a `> ` blockquote in the source). Margin notes sit in the gutter in
         document flow order, not inline (the Phase-2 visual miss, now fixed). -->
    <article class="body" bind:this={bodyEl}>
      {#each blocks as block, i (i)}
        {#if block.kind === 'h1'}
          <h1 class="col-main">{#each block.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}</h1>
        {:else if block.kind === 'h2'}
          <h2 class="col-main">{#each block.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}</h2>
        {:else if block.kind === 'object-class'}
          <p class="object-class col-main">{#each block.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}</p>
        {:else if block.kind === 'margin'}
          <aside class="margin-note col-gutter" aria-label="archivist margin note">{#each block.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}</aside>
        {:else}
          <p class="col-main">{#each block.inlines as inl, j (j)}{#if inl.kind === 'anchor'}<SlotSpan
                ref={makeRef(file.item, inl.id)}
              />{:else if inl.kind === 'wikilink'}<button
                type="button"
                class="wikilink"
                onclick={() => followLink(inl.target)}
                >{inl.target}</button
              >{:else}{#each inl.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}{/if}{/each}</p>
        {/if}
      {/each}
    </article>
  {/if}
</section>

<style>
  .file-pane {
    border: 1px solid var(--amber-edge);
    border-left: 2px solid var(--amber-edge-bright);
    background: var(--amber-bg-raised);
    color: var(--amber-fg-dim);
    font-family: var(--amber-font);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .file-pane.pulsing {
    border-left-color: var(--slot-propagated-fg, #3dd6c4);
    box-shadow: -2px 0 0 0 var(--slot-propagated-fg, #3dd6c4), 0 0 18px rgba(61, 214, 196, 0.18);
    animation: pane-pulse 0.8s ease-out;
  }
  @keyframes pane-pulse { 0% { opacity: 0.5; } 20% { opacity: 1; } 100% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .file-pane.pulsing { animation: none; } }

  /* A boxed Foundation dossier header — item # / class / site, an institutional banner. */
  .pane-head {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    padding: 0.45rem 0.7rem;
    background: var(--amber-bg-sunken);
    border-bottom: 1px solid var(--amber-edge);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
  }
  .pane-head .doc-tag {
    color: var(--amber-bg);
    background: var(--amber-fg-dim);
    padding: 0 0.4ch;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
  }
  .pane-head .item { color: var(--amber-fg); font-weight: 700; letter-spacing: 0.06em; }
  .pane-head .meta { color: var(--amber-fg-dim); text-transform: uppercase; font-size: 0.64rem; }
  .pane-head .site { color: var(--amber-fg-faint); text-transform: uppercase; font-size: 0.64rem; }
  .ripple-tag {
    margin-left: auto;
    color: var(--slot-propagated-fg, #3dd6c4);
    font-size: 0.64rem;
    letter-spacing: 0.06em;
  }

  /* The record body: prose in the main column, marginalia running SIDEWAYS up a thin
     gutter (a note written up the margin of the page, turned 90°). The narrow gutter
     keeps the note out of the prose flow without a clunky card. */
  .body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 2.4rem;
    column-gap: 0.9rem;
    padding: 0.95rem 1.1rem 1.1rem;
    line-height: 1.7;
    color: var(--amber-fg);
    font-size: 0.86rem;
  }
  .col-main { grid-column: 1; }
  .col-gutter { grid-column: 2; }
  @media (max-width: 60rem) {
    /* On narrow screens, fall back to an inline sidebar note (rotation needs width). */
    .body { grid-template-columns: 1fr; }
    .col-gutter { grid-column: 1; }
  }

  .body h1 {
    font-size: 0.94rem;
    font-weight: 700;
    color: var(--amber-fg);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 0.8rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--amber-edge);
  }
  .body h2 {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--amber-fg-dim);
    margin: 1.2rem 0 0.45rem;
  }
  .body h2::before { content: '§ '; color: var(--amber-fg-faint); }
  .body p { margin: 0 0 0.65rem; }
  .body p.object-class { color: var(--amber-fg-dim); font-size: 0.82rem; margin-bottom: 0.9rem; }

  /* Marginalia: a note in the post's hand, written SIDEWAYS up the margin (turned 90°,
     reading bottom-to-top). A thin annotation against the gutter edge, not a card. */
  .margin-note {
    align-self: start;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    margin: 0.2rem auto 0.7rem;
    padding: 0.35rem 0.2rem;
    border-right: 2px solid var(--amber-edge-bright);
    color: var(--amber-fg-dim);
    font-size: 0.7rem;
    line-height: 1.35;
    font-style: italic;
    letter-spacing: 0.02em;
    max-height: 22rem;
    overflow: hidden;
    white-space: nowrap;
  }
  .margin-note::before {
    content: "✎";
    font-style: normal;
    color: var(--amber-fg-faint);
    margin-bottom: 0.4em;
  }
  /* Narrow screens: un-rotate to a readable inline slip (the gutter collapses). */
  @media (max-width: 60rem) {
    .margin-note {
      writing-mode: horizontal-tb;
      transform: none;
      white-space: normal;
      max-height: none;
      border-right: none;
      border-left: 2px solid var(--amber-edge-bright);
      padding: 0.4rem 0.55rem;
      margin: 0.1rem 0 0.7rem;
    }
  }

  /* Cross-references as bracketed see-also tokens, terminal idiom. Clickable:
     following one opens that record (the traversal verb). */
  .wikilink {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--amber-fg);
    border-bottom: 1px dotted var(--amber-edge-bright);
    cursor: pointer;
  }
  .wikilink::before { content: '['; color: var(--amber-fg-faint); }
  .wikilink::after { content: ']'; color: var(--amber-fg-faint); }
  .wikilink:hover { color: #ffd27a; border-bottom-color: var(--amber-fg); }

  .lockout { padding: 1.1rem 0.9rem; color: var(--amber-red); }
  .lockout p { margin: 0.15rem 0; letter-spacing: 0.04em; }
  .lockout .detail { color: var(--amber-fg-dim); font-size: 0.78rem; }
</style>
