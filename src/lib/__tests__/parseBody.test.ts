// Runtime body tokenizer (C3). The regexes are shared with the build-time
// parser, so these cases double as a guard that runtime and build-time agree on
// what `⟦id⟧` and `[[link]]` mean.

import { describe, it, expect } from 'vitest';
import { parseBody } from '../parseBody.ts';

describe('parseBody', () => {
  it('splits prose, anchors, and wikilinks in source order', () => {
    const segs = parseBody('manifests as ⟦a1⟧, see [[SCP-41B-001]].');
    expect(segs).toEqual([
      { kind: 'text', text: 'manifests as ' },
      { kind: 'anchor', id: 'a1' },
      { kind: 'text', text: ', see ' },
      { kind: 'wikilink', target: 'SCP-41B-001' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('trims ids and targets', () => {
    const segs = parseBody('⟦ a1 ⟧ [[ SCP-41B-002 ]]');
    expect(segs[0]).toEqual({ kind: 'anchor', id: 'a1' });
    expect(segs[2]).toEqual({ kind: 'wikilink', target: 'SCP-41B-002' });
  });

  it('handles a body with no markup as a single text segment', () => {
    expect(parseBody('plain prose')).toEqual([{ kind: 'text', text: 'plain prose' }]);
  });

  it('handles adjacent markup with no text between', () => {
    const segs = parseBody('⟦a1⟧[[SCP-41B-001]]');
    expect(segs).toEqual([
      { kind: 'anchor', id: 'a1' },
      { kind: 'wikilink', target: 'SCP-41B-001' },
    ]);
  });

  it('preserves order when a wikilink precedes an anchor', () => {
    const segs = parseBody('see [[X]] then ⟦a1⟧');
    expect(segs.map((s) => s.kind)).toEqual(['text', 'wikilink', 'text', 'anchor']);
  });

  it('emits no empty text segments', () => {
    const segs = parseBody('⟦a1⟧ ⟦a2⟧');
    expect(segs.some((s) => s.kind === 'text' && s.text === '')).toBe(false);
  });

  // Janitor fix: markup inside an HTML comment must be inert, not parsed as a real
  // anchor token / wikilink (which would dangle the build or render a phantom slot).
  it('ignores anchor tokens and wikilinks inside HTML comments', () => {
    const segs = parseBody('real ⟦a1⟧ <!-- not ⟦a2⟧ nor [[SCP-41B-999]] --> tail');
    expect(segs).toEqual([
      { kind: 'text', text: 'real ' },
      { kind: 'anchor', id: 'a1' },
      { kind: 'text', text: '  tail' },
    ]);
  });

  it('strips a multi-line HTML comment containing markup', () => {
    const segs = parseBody('a ⟦x⟧ <!--\n ⟦buried⟧\n [[SCP-41B-000]]\n--> b');
    expect(segs.filter((s) => s.kind === 'anchor')).toEqual([{ kind: 'anchor', id: 'x' }]);
    expect(segs.some((s) => s.kind === 'wikilink')).toBe(false);
  });
});
