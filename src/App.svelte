<script lang="ts">
  // Sprint-1 slice harness: load a small corpus, render its files with clearance
  // gating, and let the player raise clearance and insert via the SCP-X hover.
  // Not the final Desktop window manager (§7) — just enough to feel the C3–C5
  // loop. The real corpus is loaded from static/corpus.json once entries exist;
  // for now we mount an inline fixture so the slice runs with the vault empty.
  import './styles/tokens.css';
  import type { Corpus } from './lib/corpus.ts';
  import { corpus, clearance, exposure, loadCorpus, raiseClearance } from './lib/game.svelte.ts';
  import FileWindow from './components/FileWindow.svelte';

  const FIXTURE: Corpus = {
    'SCP-41B-003': {
      item: 'SCP-41B-003',
      object_class: 'Euclid',
      site: 'Site-41B',
      clearance: 2,
      entity_self: false,
      xrefs: ['SCP-41B-001'],
      breach_effect: { kind: 'corrupt_search' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'a brass switchboard with no external wiring',
          redaction_level: 3,
          concept: 'the-quiet-exchange',
          mutations: [
            'a brass switchboard with no external wiring',
            'a rotary handset sealed in resin',
            'a punch-card reader missing its feed tray',
          ],
          exposure_weight: 2,
        },
      ],
      body: 'SCP-41B-003 manifests as ⟦a1⟧, cross-referenced with [[SCP-41B-001]].',
    },
    'SCP-41B-001': {
      item: 'SCP-41B-001',
      object_class: 'Euclid',
      site: 'Site-41B',
      clearance: 1,
      entity_self: true,
      xrefs: ['SCP-41B-003'],
      breach_effect: { kind: 'inject_xrefs' },
      anchors: [
        {
          id: 'a1',
          slot_type: 'object',
          truth: 'a numbered intake ledger',
          redaction_level: 2,
          concept: 'the-quiet-exchange',
          mutations: [
            'a numbered intake ledger',
            'a sealed correspondence file',
            'a redacted call manifest',
          ],
          exposure_weight: 1,
        },
      ],
      body: 'SCP-41B-001 is catalogued as ⟦a1⟧, sharing provenance with [[SCP-41B-003]].',
    },
  };

  loadCorpus(FIXTURE);

  const tiers = [1, 2, 3, 4, 5] as const;
  const files = $derived(Object.values(corpus));
</script>

<main>
  <header class="hud">
    <span class="site">SITE-41B · DEEP RECORDS</span>
    <label class="tier">
      clearance
      <select
        value={clearance.tier}
        onchange={(e) => raiseClearance(Number(e.currentTarget.value) as 1 | 2 | 3 | 4 | 5)}
      >
        {#each tiers as t (t)}
          <option value={t}>L{t}</option>
        {/each}
      </select>
    </label>
    <span class="exposure">exposure {exposure.value}</span>
  </header>

  <div class="windows">
    {#each files as file (file.item)}
      <FileWindow {file} />
    {/each}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #050608;
    color: #c8ccd2;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  }
  main {
    max-width: 52rem;
    margin: 0 auto;
    padding: 1.5rem 1rem 4rem;
  }
  .hud {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.5rem 0.2rem 1rem;
    border-bottom: 1px solid #1c2026;
    font-size: 0.8rem;
    color: #8a93a0;
  }
  .site {
    letter-spacing: 0.1em;
    color: #6b7280;
  }
  .tier {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  select {
    background: #14171c;
    color: #e6e9ee;
    border: 1px solid #2a2f36;
    border-radius: 3px;
    padding: 0.1rem 0.3rem;
    font: inherit;
  }
  .exposure {
    margin-left: auto;
    color: var(--slot-inserted-fg, #e8a33d);
  }
  .windows {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
</style>
