import {
  App,
  ItemView,
  MarkdownRenderer,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  WorkspaceLeaf,
} from 'obsidian';
import { exec } from 'child_process';
import { request as httpsRequest } from 'https';
import type { IncomingMessage } from 'http';
import * as path from 'path';
import * as fs from 'fs';

// ─── Settings ────────────────────────────────────────────────────────────────

interface PluginSettings {
  anthropicApiKey: string;
  model: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  anthropicApiKey: '',
  model: 'claude-sonnet-4-6',
};

// ─── View IDs ────────────────────────────────────────────────────────────────

const BUILD_VIEW  = 'site41b-build';
const WIKI_VIEW   = 'site41b-wiki';

// ─── Build runner ─────────────────────────────────────────────────────────────

interface BuildError {
  rule: string;
  file: string | null;
  message: string;
}

interface BuildResult {
  success: boolean;
  output: string;
  errors: BuildError[];
  durationMs: number;
}

function parseErrors(output: string): BuildError[] {
  const errors: BuildError[] = [];
  for (const line of output.split('\n')) {
    // Matches lines like: "  [rule-name] SCP-41B-XXX: message"
    const m = line.match(/^\s+\[([^\]]+)\]\s+(.+)/);
    if (!m) continue;
    const [, rule, rest] = m;
    const colon = rest.indexOf(': ');
    if (colon > -1 && rest.slice(0, colon).startsWith('SCP-')) {
      errors.push({ rule, file: rest.slice(0, colon), message: rest.slice(colon + 2) });
    } else {
      errors.push({ rule, file: null, message: rest });
    }
  }
  return errors;
}

function runCmd(cwd: string, cmd: string): Promise<BuildResult> {
  const t0 = Date.now();
  return new Promise(resolve => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      const output = stdout + stderr;
      resolve({
        success: !err,
        output,
        errors: err ? parseErrors(output) : [],
        durationMs: Date.now() - t0,
      });
    });
  });
}

// ─── Context assembler ────────────────────────────────────────────────────────

async function assembleContext(app: App, repoRoot: string): Promise<string> {
  const readVault = async (vaultRel: string): Promise<string> => {
    try {
      const f = app.vault.getAbstractFileByPath(vaultRel);
      if (f instanceof TFile) return await app.vault.read(f);
    } catch { /* fall through */ }
    return '';
  };

  const readRepo = (rel: string): string => {
    try { return fs.readFileSync(path.join(repoRoot, rel), 'utf8'); }
    catch { return ''; }
  };

  const [authoring, registry, siteBible, ex001, ex009, schema] = await Promise.all([
    readVault('docs/entry_authoring.md'),
    readVault('docs/concept_key_registry.md'),
    readVault('docs/site_41b.md'),
    readVault('entries/SCP-41B-001.md'),
    readVault('entries/SCP-41B-009.md'),
    Promise.resolve(readRepo('src/lib/corpus.ts')),
  ]);

  const entryList = app.vault
    .getFiles()
    .filter(f => f.path.startsWith('entries/SCP-41B-') && !f.name.startsWith('_'))
    .map(f => f.basename)
    .sort()
    .join(', ');

  // Trim site bible to ~8 000 chars to keep token cost reasonable
  const bibleExcerpt = siteBible.slice(0, 8000);

  return `## CORPUS SCHEMA (src/lib/corpus.ts — the authoritative type contract)
\`\`\`typescript
${schema}
\`\`\`

## AUTHORING RULES (entry_authoring.md — read every rule before generating)
${authoring}

## SETTING BIBLE (site_41b.md — first section)
${bibleExcerpt}

## CONCEPT KEY REGISTRY (concept_key_registry.md — every key that currently exists)
${registry}

## EXAMPLE ENTRY: SCP-41B-001 (the corpus seed, no lure — teaching-slot pattern)
\`\`\`markdown
${ex001}
\`\`\`

## EXAMPLE ENTRY: SCP-41B-009 (deep file — has a lure, Halloran marginalia, careful prose)
\`\`\`markdown
${ex009}
\`\`\`

## CURRENTLY AUTHORED ENTRIES
${entryList}
`;
}

// ─── Claude streaming via Node.js https (bypasses Obsidian's CSP) ────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function* streamClaude(
  apiKey: string,
  model: string,
  system: string,
  messages: Message[],
): AsyncGenerator<string> {
  const body = JSON.stringify({
    model,
    max_tokens: 4096,
    system,
    messages,
    stream: true,
  });

  // Initiate request — use Node.js https so it's not subject to Obsidian's CSP.
  const response = await new Promise<IncomingMessage>((resolve, reject) => {
    const req = httpsRequest(
      {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        },
      },
      resolve,
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  if (response.statusCode !== 200) {
    let errBody = '';
    for await (const chunk of response as AsyncIterable<Buffer>) {
      errBody += chunk.toString('utf8');
    }
    throw new Error(`Anthropic API ${response.statusCode}: ${errBody}`);
  }

  // Parse SSE stream from the response body.
  let buf = '';
  for await (const chunk of response as AsyncIterable<Buffer>) {
    buf += chunk.toString('utf8');
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const ev = JSON.parse(data);
        if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
          yield ev.delta.text as string;
        }
      } catch { /* ignore malformed SSE lines */ }
    }
  }
}

// ─── Helpers shared by both views ────────────────────────────────────────────

function repoRootFromApp(app: App): string {
  // Vault is at <repoRoot>/vault/ — so repo root is one directory up.
  const vaultPath = (app.vault.adapter as any).basePath as string;
  return path.resolve(vaultPath, '..');
}

function nextEntryNum(app: App): string {
  const nums = app.vault
    .getFiles()
    .filter(f => f.path.startsWith('entries/SCP-41B-') && !f.name.startsWith('_'))
    .map(f => parseInt(f.basename.replace('SCP-41B-', ''), 10))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : -1;
  return String(max + 1).padStart(3, '0');
}

// ─── Build Validator View ─────────────────────────────────────────────────────

export class BuildView extends ItemView {
  private plugin: Site41BPlugin;
  private statusEl!: HTMLElement;
  private resultsEl!: HTMLElement;

  constructor(leaf: WorkspaceLeaf, plugin: Site41BPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType()    { return BUILD_VIEW; }
  getDisplayText() { return 'Site-41B Build'; }
  getIcon()        { return 'check-circle'; }

  async onOpen() {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass('site41b-panel');

    const hdr = root.createDiv('site41b-hdr');
    hdr.createEl('h4', { text: 'Build Validator' });
    this.statusEl = hdr.createEl('span', { cls: 'site41b-status' });

    const btns = root.createDiv('site41b-btn-row');
    const bldBtn  = btns.createEl('button', { text: '▶ build:corpus',   cls: 'site41b-btn site41b-btn-primary' });
    const testBtn = btns.createEl('button', { text: '▶ winnable test',  cls: 'site41b-btn' });
    const bothBtn = btns.createEl('button', { text: '▶ both',           cls: 'site41b-btn' });

    this.resultsEl = root.createDiv('site41b-results');

    bldBtn.addEventListener('click',  () => this.runBuild());
    testBtn.addEventListener('click', () => this.runWinnableTest());
    bothBtn.addEventListener('click', async () => { await this.runBuild(); await this.runWinnableTest(); });
  }

  private setStatus(text: string, cls: 'site41b-ok' | 'site41b-fail' | 'site41b-run') {
    this.statusEl.className = `site41b-status ${cls}`;
    this.statusEl.setText(text);
  }

  private renderResult(result: BuildResult, label: string) {
    if (result.success) {
      this.setStatus(`✓ ${label}`, 'site41b-ok');
      this.resultsEl.createDiv({ cls: 'site41b-no-errors', text: `${label} passed in ${result.durationMs}ms` });
      return;
    }

    this.setStatus(`✗ ${result.errors.length || '?'} error(s)`, 'site41b-fail');
    this.resultsEl.createEl('p', { text: `${label} failed (${result.durationMs}ms):`, cls: 'site41b-label' });

    if (result.errors.length > 0) {
      const ul = this.resultsEl.createEl('ul', { cls: 'site41b-error-list' });
      for (const err of result.errors) {
        const li = ul.createEl('li', { cls: 'site41b-error-item' });
        li.createEl('span', { cls: 'site41b-rule-badge', text: err.rule });
        if (err.file) {
          const a = li.createEl('a', { cls: 'site41b-file-link', text: err.file });
          a.addEventListener('click', async () => {
            const f = this.app.vault.getAbstractFileByPath(`entries/${err.file}.md`);
            if (f instanceof TFile) await this.app.workspace.getLeaf().openFile(f);
          });
          li.createEl('span', { cls: 'site41b-err-msg', text: ': ' + err.message });
        } else {
          li.createEl('span', { cls: 'site41b-err-msg', text: ' ' + err.message });
        }
      }
    } else {
      // Fallback: raw output (test runner failures, TypeScript errors, etc.)
      this.resultsEl.createEl('pre', { cls: 'site41b-raw-output', text: result.output.slice(0, 3000) });
    }
  }

  async runBuild() {
    this.resultsEl.empty();
    this.setStatus('running…', 'site41b-run');
    const result = await runCmd(repoRootFromApp(this.app), 'npm run build:corpus');
    this.renderResult(result, 'build:corpus');
  }

  async runWinnableTest() {
    this.setStatus('running…', 'site41b-run');
    const cmd = 'npx vitest run src/lib/__tests__/real-corpus-winnable.test.ts --reporter=verbose';
    const result = await runCmd(repoRootFromApp(this.app), cmd);
    this.renderResult(result, 'winnable test');
  }
}

// ─── Wiki Generator View ──────────────────────────────────────────────────────

type WikiAction = 'draft' | 'expand' | 'check' | 'coin-key';

const ACTION_META: Record<WikiAction, { label: string; desc: string }> = {
  'draft': {
    label: 'Draft a new entry',
    desc: 'Claude writes a complete SCP-41B-### file (frontmatter + body) respecting the schema, concept registry, and winnability spine. The next available number is pre-filled.',
  },
  'expand': {
    label: 'Expand current entry',
    desc: 'Claude appends 2–3 addenda to the currently open entry, deepening the grounding surface and adding cast-voice fragments (Halloran marginalia, Vogel memos). Does not touch existing frontmatter.',
  },
  'check': {
    label: 'Check current entry',
    desc: 'Claude audits the currently open entry for schema violations, missing grounding, orphaned concept keys, and winnability issues — reports in [rule-name]: format matching the build\'s error output.',
  },
  'coin-key': {
    label: 'Coin a concept key',
    desc: 'Claude designs a new concept_key_registry.md entry: kebab-case key, cluster membership, 3-index escalation, planned carriers, sibling keys. Paste result directly into the registry.',
  },
};

export class WikiView extends ItemView {
  private plugin: Site41BPlugin;

  // Controls
  private actionEl!: HTMLSelectElement;
  private descEl!: HTMLElement;
  private notesEl!: HTMLTextAreaElement;
  private genBtn!: HTMLButtonElement;
  private insertBtn!: HTMLButtonElement;
  private createBtn!: HTMLButtonElement;
  private copyBtn!: HTMLButtonElement;
  private rawToggle!: HTMLButtonElement;

  // Output
  private outputPre!: HTMLPreElement;
  private renderedEl!: HTMLElement;
  private outputWrap!: HTMLElement;

  // Feedback
  private feedbackWrap!: HTMLElement;
  private feedbackEl!: HTMLTextAreaElement;
  private refineBtn!: HTMLButtonElement;

  // State
  private output = '';
  private generating = false;
  private messages: Message[] = [];
  private currentSystem = '';
  private showRaw = false;

  constructor(leaf: WorkspaceLeaf, plugin: Site41BPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType()    { return WIKI_VIEW; }
  getDisplayText() { return 'Site-41B Wiki Gen'; }
  getIcon()        { return 'sparkles'; }

  async onOpen() {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass('site41b-panel');

    root.createDiv('site41b-hdr').createEl('h4', { text: 'Wiki Generator' });

    // ── Action selector ──────────────────────────────────────────
    const af = root.createDiv('site41b-field');
    af.createDiv({ cls: 'site41b-label', text: 'Action' });
    this.actionEl = af.createEl('select', { cls: 'site41b-select' });
    for (const [value, { label }] of Object.entries(ACTION_META) as [WikiAction, { label: string; desc: string }][]) {
      const opt = this.actionEl.createEl('option', { text: label });
      opt.value = value;
    }

    this.descEl = root.createDiv('site41b-desc');
    this.syncDesc();
    this.actionEl.addEventListener('change', () => this.syncDesc());

    // ── Notes ────────────────────────────────────────────────────
    const nf = root.createDiv('site41b-field');
    nf.createDiv({ cls: 'site41b-label', text: 'Notes / focus (optional)' });
    this.notesEl = nf.createEl('textarea', { cls: 'site41b-textarea' });
    this.notesEl.rows = 3;
    this.notesEl.placeholder = 'E.g. "Arc: Negative Stacks. Use the-flood-of-71 key. Ground in SCP-41B-008."';

    // ── Generate / Clear ─────────────────────────────────────────
    const br = root.createDiv('site41b-btn-row');
    this.genBtn = br.createEl('button', { text: '▶ Generate', cls: 'site41b-btn site41b-btn-primary' });
    const clrBtn = br.createEl('button', { text: 'Clear', cls: 'site41b-btn' });
    this.genBtn.addEventListener('click', () => this.generate());
    clrBtn.addEventListener('click', () => this.clear());

    // ── Output section ───────────────────────────────────────────
    this.outputWrap = root.createDiv('site41b-output-wrap');

    const outputHdr = this.outputWrap.createDiv('site41b-output-hdr');
    outputHdr.createDiv({ cls: 'site41b-label', text: 'Output' });
    const outputHdrBtns = outputHdr.createDiv('site41b-output-hdr-btns');
    this.copyBtn = outputHdrBtns.createEl('button', { text: 'Copy', cls: 'site41b-btn site41b-btn-sm' });
    this.rawToggle = outputHdrBtns.createEl('button', { text: 'Raw', cls: 'site41b-btn site41b-btn-sm' });
    this.copyBtn.disabled = true;
    this.rawToggle.disabled = true;

    this.copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.output);
      new Notice('Copied to clipboard.');
    });
    this.rawToggle.addEventListener('click', () => {
      this.showRaw = !this.showRaw;
      this.rawToggle.setText(this.showRaw ? 'Preview' : 'Raw');
      void this.renderOutput();
    });

    const outputEl = this.outputWrap.createDiv('site41b-output');
    this.outputPre = outputEl.createEl('pre', { cls: 'site41b-output-pre' });
    this.renderedEl = outputEl.createDiv('site41b-output-rendered');
    this.renderedEl.hide();

    // ── Insert / Create ──────────────────────────────────────────
    const ib = root.createDiv('site41b-btn-row');
    this.insertBtn = ib.createEl('button', { text: 'Append to active file', cls: 'site41b-btn' });
    this.createBtn = ib.createEl('button', { text: 'Create as new entry…',  cls: 'site41b-btn' });
    this.insertBtn.disabled = true;
    this.createBtn.disabled = true;
    this.insertBtn.addEventListener('click', () => this.appendToActive());
    this.createBtn.addEventListener('click', () => this.createFile());

    // ── Feedback / refine ────────────────────────────────────────
    this.feedbackWrap = root.createDiv('site41b-feedback-wrap');
    this.feedbackWrap.hide();

    const fb = this.feedbackWrap.createDiv('site41b-field');
    fb.createDiv({ cls: 'site41b-label', text: 'Follow up' });
    this.feedbackEl = fb.createEl('textarea', { cls: 'site41b-textarea' });
    this.feedbackEl.rows = 2;
    this.feedbackEl.placeholder = 'E.g. "Make the lure more subtle." or "Add a Halloran addendum."';
    this.feedbackEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        void this.refine();
      }
    });

    const fbBtns = this.feedbackWrap.createDiv('site41b-btn-row');
    this.refineBtn = fbBtns.createEl('button', { text: '▶ Refine', cls: 'site41b-btn site41b-btn-primary' });
    const newSessionBtn = fbBtns.createEl('button', { text: 'New session', cls: 'site41b-btn' });
    this.refineBtn.addEventListener('click', () => this.refine());
    newSessionBtn.addEventListener('click', () => this.clear());
  }

  private syncDesc() {
    const action = this.actionEl.value as WikiAction;
    this.descEl.setText(ACTION_META[action].desc);
  }

  // ── Rendering ──────────────────────────────────────────────────

  private async renderOutput() {
    if (this.showRaw || !this.output) {
      this.renderedEl.hide();
      this.outputPre.show();
      this.outputPre.setText(this.output);
    } else {
      this.outputPre.hide();
      this.renderedEl.show();
      this.renderedEl.empty();
      const sourcePath = this.getActiveEntry()?.path ?? 'entries/';
      await MarkdownRenderer.render(this.app, this.output, this.renderedEl, sourcePath, this);
    }
  }

  // ── Generation ──────────────────────────────────────────────────

  private async generate() {
    if (this.generating) return;

    const { anthropicApiKey, model } = this.plugin.settings;
    if (!anthropicApiKey) {
      new Notice('Set your Anthropic API key in Site-41B plugin settings first.');
      return;
    }

    const action = this.actionEl.value as WikiAction;
    const notes  = this.notesEl.value.trim();

    if ((action === 'expand' || action === 'check') && !this.getActiveEntry()) {
      new Notice('Open a vault/entries/SCP-41B-###.md file first.');
      return;
    }

    const repoRoot = repoRootFromApp(this.app);
    const context  = await assembleContext(this.app, repoRoot);
    this.currentSystem = this.buildSystem(context);
    const userMsg  = await this.buildUserMsg(action, notes);

    this.messages = [{ role: 'user', content: userMsg }];
    await this.runStream(model, anthropicApiKey);
  }

  private async refine() {
    if (this.generating) return;

    const followup = this.feedbackEl.value.trim();
    if (!followup) return;

    const { anthropicApiKey, model } = this.plugin.settings;
    if (!anthropicApiKey) {
      new Notice('Set your Anthropic API key in Site-41B plugin settings first.');
      return;
    }

    // Add previous assistant turn + new user follow-up to history
    this.messages.push({ role: 'assistant', content: this.output });
    this.messages.push({ role: 'user', content: followup });
    this.feedbackEl.value = '';

    await this.runStream(model, anthropicApiKey);
  }

  private async runStream(model: string, apiKey: string) {
    this.generating = true;
    this.genBtn.disabled = true;
    this.genBtn.setText('Generating…');
    this.refineBtn.disabled = true;
    this.insertBtn.disabled = true;
    this.createBtn.disabled = true;
    this.copyBtn.disabled = true;
    this.rawToggle.disabled = true;
    this.feedbackWrap.hide();

    // Show raw pre during streaming (fast DOM updates)
    this.output = '';
    this.renderedEl.hide();
    this.outputPre.show();
    this.outputPre.className = 'site41b-output-pre';
    this.outputPre.setText('');
    this.outputWrap.addClass('site41b-streaming');

    try {
      for await (const chunk of streamClaude(apiKey, model, this.currentSystem, this.messages)) {
        this.output += chunk;
        this.outputPre.setText(this.output);
        const wrap = this.outputWrap.querySelector('.site41b-output');
        if (wrap) wrap.scrollTop = wrap.scrollHeight;
      }

      // Switch to rendered view (unless user pinned raw)
      await this.renderOutput();

      this.copyBtn.disabled = false;
      this.rawToggle.disabled = false;
      this.insertBtn.disabled = false;
      this.createBtn.disabled = false;
      this.feedbackWrap.show();
      this.refineBtn.disabled = false;
    } catch (err) {
      this.outputPre.show();
      this.renderedEl.hide();
      this.outputPre.className = 'site41b-output-pre site41b-err-inline';
      this.outputPre.setText(`Error: ${(err as Error).message}`);
    } finally {
      this.generating = false;
      this.genBtn.disabled = false;
      this.genBtn.setText('▶ Generate');
      this.outputWrap.removeClass('site41b-streaming');
    }
  }

  private buildSystem(context: string): string {
    return `You are an authoring assistant for Site-41B — a text-game about a Foundation deep-records annex. Your role is to help author SCP-41B-### entries (Foundation archive documents) that are mechanically correct and narratively consistent.

Always output actual content — never placeholders like "[insert text here]". Be dense and specific.

Every truth word must be original (not a canon SCP resolution). Every entry you draft must be mechanically sound:
- the truth word grounded in a cited earlier reachable file
- every frontmatter xref mirrored as a [[wikilink]] in the body
- no ⟦anchor_id⟧ token appears more than once
- lure differs from truth (if present)
- body contains zero instructions on how to cite (method belongs to AMBER, not the record)

${context}`;
  }

  private async buildUserMsg(action: WikiAction, notes: string): Promise<string> {
    const entryContent = await this.getActiveEntryContent();

    switch (action) {

      case 'draft': {
        const num = nextEntryNum(this.app);
        return `Draft a complete entry file for SCP-41B-${num}.

This is a deep entry (number ${num}), so include a lure word on at least one anchor.

Requirements:
1. The truth word must appear in the clear in an earlier authored file — state which file and where
2. All frontmatter xrefs must appear as [[wikilinks]] in the body
3. Use at least one concept key from the registry (prefer keys with only one carrier — orphan risk)
4. Register any new concept key in the concept_key_registry.md (output the registry block separately)
5. Object class: Safe | Euclid | Keter (Series I only; no ACS)
6. Cast only: Vogel, Halloran, Marsh, Sze, Andrade — no new recurring names
7. Lure must be the entity's signature inversion (erase the human, flip a countermeasure)

${notes ? `Author's notes:\n${notes}\n` : ''}
Output:
1. The complete markdown file content (ready to save as vault/entries/SCP-41B-${num}.md)
2. A NOTE section (not part of the file) explaining: which earlier file grounds each truth word, why each concept key was chosen, and any registry updates needed.`;
      }

      case 'expand': {
        return `Expand this entry by adding 2–3 new addenda. Append only — do not alter existing content.

Current entry:
\`\`\`markdown
${entryContent}
\`\`\`

Rules:
- Append only: start your output from the next addendum section (e.g. ## Addendum XXX.2 —)
- Each addendum deepens the grounding surface: more prose the player can triangulate from
- Use cast voices only: Halloran marginalia (> blockquotes), Vogel memos, recovered fragments
- Add cross-references to sibling-key entries not yet linked (check concept registry)
- Do not explain how to cite — the body is in-world paperwork, not a tutorial

${notes ? `Author's focus:\n${notes}\n` : ''}
Output only the new addenda to append.`;
      }

      case 'check': {
        return `Audit this entry for mechanical correctness and authoring discipline.

\`\`\`markdown
${entryContent}
\`\`\`

Report every issue in [rule-name]: description format (matching the build's error output). Check:
1. [xref-linked] — every frontmatter xref has a [[wikilink]] in body
2. [grounding-citeable] — each teaching anchor's truth word appears in clear prose in its citeIn file(s)
3. [lure-differs] — lure (if present) differs from truth
4. [token-once] — each ⟦id⟧ token appears exactly once in body
5. [concept-registry] — every concept key is in the registry
6. [winnability-chain] — entry is reachable from SCP-41B-001 via the declared xref chain
7. [entity-self] — only one file across the corpus may have entity_self: true

Authoring discipline (flag but don't error):
- Body narrates how to cite (companion principle violation)
- Unregistered cast names
- Truth word looks like a canonical SCP resolution (licensing risk)
- No lure despite being a deeper entry (entries beyond 005 should have a lure)

${notes ? `Additional focus:\n${notes}\n` : ''}
End with VERDICT: PASS (if no mechanical errors) or FAIL (list blockers).`;
      }

      case 'coin-key': {
        return `Design a new concept key for concept_key_registry.md.

Concept to capture: ${notes || '(not specified — choose one that fills a gap in the current registry)'}

Design it to:
1. Use a kebab-case name not already in the registry
2. Bridge at least two clusters (no islands — see §4 cross-cluster map)
3. Have ≥2 planned carriers (choose plausible SCP-41B-### numbers not yet authored)
4. 3-index escalation: 0 = mundane bureaucratic reading, 1 = anomalous, 2 = cosmological
5. Sibling keys from the existing registry
6. NOT conflict with reserved placeholder keys

Output:
1. The complete registry entry block, formatted to paste directly into concept_key_registry.md
2. A brief rationale: which gap it fills, why the index escalation works, which entries should author its first carriers`;
      }
    }
  }

  // ── Insert helpers ──────────────────────────────────────────────

  private getActiveEntry(): TFile | null {
    const f = this.app.workspace.getActiveFile();
    return (f && f.path.startsWith('entries/')) ? f : null;
  }

  private async getActiveEntryContent(): Promise<string> {
    const f = this.getActiveEntry();
    return f ? await this.app.vault.read(f) : '';
  }

  private clear() {
    this.messages = [];
    this.currentSystem = '';
    this.output = '';
    this.showRaw = false;
    this.rawToggle.setText('Raw');
    this.outputPre.className = 'site41b-output-pre';
    this.outputPre.setText('');
    this.outputPre.show();
    this.renderedEl.hide();
    this.renderedEl.empty();
    this.insertBtn.disabled = true;
    this.createBtn.disabled = true;
    this.copyBtn.disabled = true;
    this.rawToggle.disabled = true;
    this.feedbackWrap.hide();
    this.feedbackEl.value = '';
    this.notesEl.value = '';
  }

  private async appendToActive() {
    const f = this.app.workspace.getActiveFile();
    if (!f) { new Notice('No file is currently open.'); return; }
    const current = await this.app.vault.read(f);
    await this.app.vault.modify(f, current + '\n\n' + this.output);
    new Notice(`Appended to ${f.basename}.`);
  }

  private async createFile() {
    const num  = nextEntryNum(this.app);
    const dest = `entries/SCP-41B-${num}.md`;

    // Strip any outer ```markdown ... ``` wrapper Claude may have added
    let content = this.output;
    const wrapped = content.match(/```(?:markdown)?\n([\s\S]+?)\n```/);
    if (wrapped) content = wrapped[1];

    // Strip any trailing NOTE section Claude adds
    const noteIdx = content.indexOf('\n---\n**NOTE');
    if (noteIdx > -1) content = content.slice(0, noteIdx).trimEnd();

    try {
      const f = await this.app.vault.create(dest, content + '\n');
      await this.app.workspace.getLeaf().openFile(f);
      new Notice(`Created ${f.basename} — run build:corpus to validate.`);
    } catch (e) {
      new Notice(`Could not create file: ${(e as Error).message}`);
    }
  }
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

class SettingsTab extends PluginSettingTab {
  plugin: Site41BPlugin;
  constructor(app: App, plugin: Site41BPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Site-41B Authoring' });

    new Setting(containerEl)
      .setName('Anthropic API key')
      .setDesc('Required for the Wiki Generator. Get one at console.anthropic.com.')
      .addText(t => t
        .setPlaceholder('sk-ant-…')
        .setValue(this.plugin.settings.anthropicApiKey)
        .onChange(async v => {
          this.plugin.settings.anthropicApiKey = v.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Model')
      .setDesc('Claude model ID to use for wiki generation.')
      .addText(t => t
        .setPlaceholder('claude-sonnet-4-6')
        .setValue(this.plugin.settings.model)
        .onChange(async v => {
          this.plugin.settings.model = v.trim() || DEFAULT_SETTINGS.model;
          await this.plugin.saveSettings();
        })
      );
  }
}

// ─── Main plugin ──────────────────────────────────────────────────────────────

export default class Site41BPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerView(BUILD_VIEW, leaf => new BuildView(leaf, this));
    this.registerView(WIKI_VIEW,  leaf => new WikiView(leaf,  this));

    this.addCommand({
      id: 'open-build-panel',
      name: 'Open build validator',
      callback: () => this.openView(BUILD_VIEW),
    });

    this.addCommand({
      id: 'open-wiki-generator',
      name: 'Open wiki generator',
      callback: () => this.openView(WIKI_VIEW),
    });

    this.addCommand({
      id: 'run-build-corpus',
      name: 'Run build:corpus',
      callback: () => this.quickBuild(),
    });

    this.addCommand({
      id: 'run-winnable-test',
      name: 'Run winnable test',
      callback: () => this.quickTest(),
    });

    this.addRibbonIcon('check-circle', 'Site-41B: build validator', () => this.openView(BUILD_VIEW));
    this.addRibbonIcon('sparkles',     'Site-41B: wiki generator',  () => this.openView(WIKI_VIEW));

    this.addSettingTab(new SettingsTab(this.app, this));
  }

  private async openView(id: string) {
    const existing = this.app.workspace.getLeavesOfType(id);
    if (existing.length) { this.app.workspace.revealLeaf(existing[0]); return; }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) return;
    await leaf.setViewState({ type: id, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  private async quickBuild() {
    const notice = new Notice('Running build:corpus…', 0);
    const result = await runCmd(repoRootFromApp(this.app), 'npm run build:corpus');
    notice.hide();
    if (result.success) {
      new Notice('✓ build:corpus passed');
    } else {
      new Notice(`✗ build:corpus failed — see Build panel for details`);
      this.openView(BUILD_VIEW);
    }
  }

  private async quickTest() {
    const notice = new Notice('Running winnable test…', 0);
    const result = await runCmd(
      repoRootFromApp(this.app),
      'npx vitest run src/lib/__tests__/real-corpus-winnable.test.ts',
    );
    notice.hide();
    if (result.success) {
      new Notice('✓ Winnable test passed');
    } else {
      new Notice('✗ Winnable test failed — see Build panel for details');
      this.openView(BUILD_VIEW);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() { await this.saveData(this.settings); }
}
