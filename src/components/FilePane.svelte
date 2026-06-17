<script lang="ts">
  // Renders one ScpFile in AMBER's terminal pane (re-frame §7.2): monochrome,
  // no GUI window chrome — a file listing under a clinical terminal, scaling to
  // long multi-section dossiers. v2 reset (decision D): no clearance gate — a file
  // is shown iff it is reachable in the citation graph (App passes only reachable
  // files). Slots render via SlotSpan; the in-flight citation commit lives in
  // AmberLookup, summoned by the terminal, not embedded per-slot.
  import type { ScpFile } from '../lib/corpus.ts';
  import { isReachable, makeRef, overlay } from '../lib/game.svelte.ts';
  import { openFile, log } from '../lib/ui.svelte.ts';
  import { parseBody } from '../lib/parseBody.ts';
  import { bodyBlocks } from '../lib/bodyBlocks.ts';
  import SlotSpan from './SlotSpan.svelte';

  let { file }: { file: ScpFile } = $props();

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

<section class="file-pane" class:locked={!accessible} class:pulsing>
  <div class="pane-head">
    <span class="prompt">amber:/records/</span><span class="item">{file.item}</span>
    <span class="meta">{file.object_class}{#if file.entity_self} · SELF{/if}</span>
    {#if pulsing}<span class="ripple-tag" aria-hidden="true">◂ XREF UPDATED</span>{/if}
  </div>

  {#if !accessible}
    <div class="lockout">
      <p>&gt; NOT YET REACHABLE</p>
      <p class="detail">no citation path to this record yet — follow the cross-references.</p>
    </div>
  {:else}
    <article class="body">
      {#each blocks as block, i (i)}
        {#if block.kind === 'h1'}
          <h1>{#each block.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}</h1>
        {:else if block.kind === 'h2'}
          <h2>{#each block.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}</h2>
        {:else if block.kind === 'object-class'}
          <p class="object-class">{#each block.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}</p>
        {:else}
          <p>{#each block.inlines as inl, j (j)}{#if inl.kind === 'anchor'}<SlotSpan
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
    border: 1px solid #1c2026;
    border-left: 2px solid #2a3138;
    background: #07090b;
    color: #b9c0c8;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .file-pane.pulsing {
    border-left-color: var(--slot-propagated-fg, #3dd6c4);
    box-shadow: -2px 0 0 0 var(--slot-propagated-fg, #3dd6c4), 0 0 18px rgba(61, 214, 196, 0.18);
    animation: pane-pulse 0.8s ease-out;
  }
  @keyframes pane-pulse { 0% { opacity: 0.5; } 20% { opacity: 1; } 100% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .file-pane.pulsing { animation: none; } }

  /* The header reads as a shell path line, not a classification banner. */
  .pane-head {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    padding: 0.4rem 0.7rem;
    border-bottom: 1px solid #14181c;
    font-size: 0.74rem;
    letter-spacing: 0.03em;
  }
  .pane-head .prompt { color: #4d5a52; }
  .pane-head .item { color: #cdd3d9; font-weight: 600; letter-spacing: 0.05em; }
  .pane-head .meta { color: #5b636e; text-transform: uppercase; font-size: 0.66rem; }
  .ripple-tag {
    margin-left: auto;
    color: var(--slot-propagated-fg, #3dd6c4);
    font-size: 0.64rem;
    letter-spacing: 0.06em;
  }

  .body {
    padding: 0.85rem 1rem 1rem;
    line-height: 1.7;
    color: #c0c6cd;
    font-size: 0.86rem;
  }
  .body h1 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #dfe3e8;
    letter-spacing: 0.08em;
    margin: 0 0 0.8rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #161b20;
  }
  .body h2 {
    font-size: 0.74rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #7f93a7;
    margin: 1.2rem 0 0.45rem;
  }
  .body h2::before { content: '> '; color: #4a5666; }
  .body p { margin: 0 0 0.65rem; }
  .body p.object-class { color: #828b96; font-size: 0.82rem; margin-bottom: 0.9rem; }

  /* Cross-references as bracketed see-also tokens, terminal idiom. Clickable:
     following one opens that record (the traversal verb). */
  .wikilink {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: #8fb3d4;
    border-bottom: 1px dotted #2f4a5e;
    cursor: pointer;
  }
  .wikilink::before { content: '['; color: #4a5e72; }
  .wikilink::after { content: ']'; color: #4a5e72; }
  .wikilink:hover { color: #b6d2ec; border-bottom-color: #5a8bb0; }

  .lockout { padding: 1.1rem 0.9rem; color: #c96a6a; }
  .lockout p { margin: 0.15rem 0; letter-spacing: 0.04em; }
  .lockout .detail { color: #5b636e; font-size: 0.78rem; }
</style>
