<script lang="ts">
  // ⚠ RE-FRAME (vault/docs/planning/reframe_amber_quippy.md §1, §3): file rendering
  //   survives (AMBER's primary capability) but flips to a CLI/terminal aesthetic,
  //   needs keyboard span-traversal, and must scale to long multi-section dossiers.
  //   See planning/handoff_janitor.md → "FileWindow.svelte".
  //
  // Renders one ScpFile as a window: clearance-gated (a file below the player's
  // tier will not open at all, per C3 / design_document.md §5.1), and on open it
  // tokenizes the body and renders prose, redaction slots, and cross-links.
  // technical_document.md §7.
  import type { ScpFile } from '../lib/corpus.ts';
  import { clearance, makeRef, overlay } from '../lib/game.svelte.ts';
  import { parseBody } from '../lib/parseBody.ts';
  import { bodyBlocks } from '../lib/bodyBlocks.ts';
  import SlotSpan from './SlotSpan.svelte';

  let { file }: { file: ScpFile } = $props();

  // Clearance gate: the file's baseline `clearance` is the tier required to open
  // it at all. Truth-within-file is gated per-anchor by redaction_level later;
  // this is the open/closed gate only.
  const accessible = $derived(clearance.tier >= file.clearance);

  // Propagation pulse: when a slot in THIS file changes because the player edited
  // a linked slot in ANOTHER file, the player may not be looking here. Watch this
  // file's propagated-slot count; when it rises, flash the window border teal so
  // the cross-file ripple is visible where it lands. `overlay` is read so the
  // count is reactive.
  const propagatedCount = $derived(
    file.anchors.filter((a) => overlay[makeRef(file.item, a.id)]?.source === 'propagated').length,
  );
  let pulsing = $state(false);
  // Plain (non-reactive) tracker of the last-seen count; only the effect writes
  // it, so it holds the value from the previous run to compare against.
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

  // Tokenize body → flat segments, then group into header/paragraph blocks so the
  // Foundation-page markdown (## headers, **bold**) renders as structure instead
  // of literal markup, with slots/wikilinks kept inline in their paragraph.
  const blocks = $derived(accessible ? bodyBlocks(parseBody(file.body)) : []);
</script>

<section class="file-window" class:locked={!accessible} class:pulsing>
  {#if pulsing}<div class="ripple-tag" aria-hidden="true">◂ CROSS-REFERENCE UPDATED</div>{/if}
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
              />{:else if inl.kind === 'wikilink'}<a class="wikilink" href={'#' + inl.target}
                >{inl.target}<span class="xref-mark" aria-hidden="true">▸</span></a
              >{:else}{#each inl.runs as r (r)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}{/if}{/each}</p>
        {/if}
      {/each}
    </article>
  {/if}
</section>

<style>
  .file-window {
    position: relative;
    border: 1px solid #2a2f36;
    border-radius: 4px;
    background: #0c0e11;
    color: #c8ccd2;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
    box-shadow: 0 1px 0 #000, 0 6px 20px rgba(0, 0, 0, 0.35);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  /* Cross-file propagation landed in this window — flash teal so the ripple is
     seen even when the player is reading a different file. */
  .file-window.pulsing {
    border-color: var(--slot-propagated-fg, #3dd6c4);
    box-shadow: 0 0 0 1px var(--slot-propagated-fg, #3dd6c4),
      0 0 18px rgba(61, 214, 196, 0.35), 0 6px 20px rgba(0, 0, 0, 0.35);
    animation: window-pulse 0.8s ease-out;
  }
  .ripple-tag {
    position: absolute;
    top: -0.6rem;
    right: 0.8rem;
    padding: 0.1rem 0.45rem;
    background: #07100f;
    border: 1px solid var(--slot-propagated-fg, #3dd6c4);
    border-radius: 2px;
    color: var(--slot-propagated-fg, #3dd6c4);
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    animation: window-pulse 0.8s ease-out;
  }
  @keyframes window-pulse {
    0% { opacity: 0.4; }
    20% { opacity: 1; }
    100% { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .file-window.pulsing {
      animation: none;
    }
    .ripple-tag {
      animation: none;
    }
  }
  /* No overflow:hidden here — the SCP-X popover (HelpUtility) is absolutely
     positioned inside a slot and drops below it, so clipping the window hides it.
     Corner-rounding is applied to the header/last child directly instead. */

  /* Header reads as a document classification banner: dossier number left, a
     monospace ruled bar, the clearance requirement stamped at the right. */
  header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.45rem 0.85rem;
    background: linear-gradient(#171b20, #12151a);
    border-bottom: 1px solid #2a2f36;
    border-radius: 4px 4px 0 0;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }
  .body,
  .lockout {
    border-radius: 0 0 4px 4px;
  }
  .item {
    font-weight: 600;
    color: #e6e9ee;
    letter-spacing: 0.06em;
  }
  .item::before {
    content: 'FILE ';
    color: #5b636e;
    font-weight: 400;
  }
  .class {
    color: #8a93a0;
    text-transform: uppercase;
    font-size: 0.72rem;
  }
  /* Clearance requirement, stamped like a rubber-stamp badge at the banner's right. */
  .clearance {
    margin-left: auto;
    padding: 0.05rem 0.4rem;
    color: #c79a4a;
    border: 1px solid #6b5320;
    border-radius: 2px;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
  }
  .clearance::before {
    content: 'CLR ';
    color: #7a6230;
  }
  .body {
    padding: 1rem 1.15rem 1.2rem;
    line-height: 1.65;
    color: #cfd4da;
    /* faint scanline/paper tone so the body reads as a record under a terminal,
       not a flat code panel */
    background: repeating-linear-gradient(
      transparent,
      transparent 1.6rem,
      rgba(255, 255, 255, 0.012) 1.6rem,
      rgba(255, 255, 255, 0.012) calc(1.6rem + 1px)
    );
  }
  .body h1 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #e6e9ee;
    letter-spacing: 0.08em;
    margin: 0 0 0.9rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid #20252b;
  }
  /* Section headings as typed/ruled labels — uppercase, numbered-memo feel. */
  .body h2 {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #93a7bd;
    margin: 1.3rem 0 0.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #1c2026;
  }
  .body h2::before {
    content: '§ ';
    color: #586374;
  }
  .body p {
    margin: 0 0 0.7rem;
  }
  .body p.object-class {
    color: #8a93a0;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  /* Cross-references read as a stamped see-also call-out, not a web link:
     bracketed, boxed, with breathing room so they don't crowd the prose. */
  .wikilink {
    display: inline-block;
    margin: 0 0.18em;
    padding: 0.02em 0.36em;
    color: #9cc0dd;
    text-decoration: none;
    background: #0e1620;
    border: 1px solid #294056;
    border-radius: 2px;
    font-size: 0.92em;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .wikilink::before {
    content: '⮡ ';
    color: #5e7a90;
  }
  .wikilink:hover {
    background: #132130;
    border-color: #3a5a76;
  }
  .xref-mark {
    margin-left: 0.25em;
    color: #5e7a90;
    font-size: 0.85em;
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
