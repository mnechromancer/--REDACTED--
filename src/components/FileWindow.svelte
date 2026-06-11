<script lang="ts">
  // Renders one ScpFile as a window: clearance-gated (a file below the player's
  // tier will not open at all, per C3 / design_document.md §5.1), and on open it
  // tokenizes the body and renders prose, redaction slots, and cross-links.
  // technical_document.md §7.
  import type { ScpFile } from '../lib/corpus.ts';
  import { clearance, makeRef } from '../lib/game.svelte.ts';
  import { parseBody } from '../lib/parseBody.ts';
  import SlotSpan from './SlotSpan.svelte';

  let { file }: { file: ScpFile } = $props();

  // Clearance gate: the file's baseline `clearance` is the tier required to open
  // it at all. Truth-within-file is gated per-anchor by redaction_level later;
  // this is the open/closed gate only.
  const accessible = $derived(clearance.tier >= file.clearance);

  const segments = $derived(accessible ? parseBody(file.body) : []);
</script>

<section class="file-window" class:locked={!accessible}>
  <header>
    <span class="item">{file.item}</span>
    <span class="class">{file.object_class}</span>
    <span class="clearance">L{file.clearance}</span>
  </header>

  {#if !accessible}
    <div class="lockout">
      <p>ACCESS DENIED</p>
      <p class="detail">
        Clearance L{file.clearance} required — you hold L{clearance.tier}.
      </p>
    </div>
  {:else}
    <article class="body">
      {#each segments as seg, i (i)}
        {#if seg.kind === 'text'}{seg.text}{:else if seg.kind === 'anchor'}<SlotSpan
            ref={makeRef(file.item, seg.id)}
          />{:else}<a class="wikilink" href={'#' + seg.target}>{seg.target}</a>{/if}
      {/each}
    </article>
  {/if}
</section>

<style>
  .file-window {
    border: 1px solid #2a2f36;
    border-radius: 6px;
    background: #0b0d10;
    color: #c8ccd2;
    overflow: hidden;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  }
  header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.4rem 0.7rem;
    background: #14171c;
    border-bottom: 1px solid #2a2f36;
    font-size: 0.8rem;
  }
  .item {
    font-weight: 600;
    color: #e6e9ee;
  }
  .class {
    color: #8a93a0;
  }
  .clearance {
    margin-left: auto;
    color: #6b7280;
  }
  .body {
    padding: 0.9rem 1rem;
    white-space: pre-wrap;
    line-height: 1.6;
  }
  .wikilink {
    color: #7fa8c9;
    text-decoration: none;
    border-bottom: 1px dotted #3a5168;
  }
  .lockout {
    padding: 1.5rem 1rem;
    text-align: center;
    color: #e85d5d;
  }
  .lockout p {
    margin: 0.2rem 0;
    letter-spacing: 0.08em;
  }
  .lockout .detail {
    color: #6b7280;
    font-size: 0.8rem;
    letter-spacing: normal;
  }
</style>
