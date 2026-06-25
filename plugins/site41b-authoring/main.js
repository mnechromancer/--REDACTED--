var $=Object.create;var y=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var H=Object.getOwnPropertyNames;var N=Object.getPrototypeOf,O=Object.prototype.hasOwnProperty;var V=(r,s)=>{for(var e in s)y(r,e,{get:s[e],enumerable:!0})},A=(r,s,e,t)=>{if(s&&typeof s=="object"||typeof s=="function")for(let i of H(s))!O.call(r,i)&&i!==e&&y(r,i,{get:()=>s[i],enumerable:!(t=I(s,i))||t.enumerable});return r};var P=(r,s,e)=>(e=r!=null?$(N(r)):{},A(s||!r||!r.__esModule?y(e,"default",{value:r,enumerable:!0}):e,r)),F=r=>A(y({},"__esModule",{value:!0}),r);var K={};V(K,{BuildView:()=>v,WikiView:()=>k,default:()=>B});module.exports=F(K);var a=require("obsidian"),R=require("child_process"),D=require("https"),x=P(require("path")),W=P(require("fs")),S={anthropicApiKey:"",model:"claude-sonnet-4-6"},f="site41b-build",w="site41b-wiki";function U(r){let s=[];for(let e of r.split(`
`)){let t=e.match(/^\s+\[([^\]]+)\]\s+(.+)/);if(!t)continue;let[,i,n]=t,o=n.indexOf(": ");o>-1&&n.slice(0,o).startsWith("SCP-")?s.push({rule:i,file:n.slice(0,o),message:n.slice(o+2)}):s.push({rule:i,file:null,message:n})}return s}function E(r,s){let e=Date.now();return new Promise(t=>{(0,R.exec)(s,{cwd:r},(i,n,o)=>{let c=n+o;t({success:!i,output:c,errors:i?U(c):[],durationMs:Date.now()-e})})})}async function G(r,s){let e=async l=>{try{let h=r.vault.getAbstractFileByPath(l);if(h instanceof a.TFile)return await r.vault.read(h)}catch(h){}return""},t=l=>{try{return W.readFileSync(x.join(s,l),"utf8")}catch(h){return""}},[i,n,o,c,g,u]=await Promise.all([e("docs/planning/handoff_authoring.md"),e("docs/concept_key_registry.md"),e("docs/site_41b.md"),e("entries/SCP-41B-001.md"),e("entries/SCP-41B-009.md"),Promise.resolve(t("src/lib/corpus.ts"))]),d=r.vault.getFiles().filter(l=>l.path.startsWith("entries/SCP-41B-")&&!l.name.startsWith("_")).map(l=>l.basename).sort().join(", "),p=o.slice(0,8e3);return`## CORPUS SCHEMA (src/lib/corpus.ts \u2014 the authoritative type contract)
\`\`\`typescript
${u}
\`\`\`

## AUTHORING RULES (handoff_authoring.md \u2014 read every rule before generating)
${i}

## SETTING BIBLE (site_41b.md \u2014 first section)
${p}

## CONCEPT KEY REGISTRY (concept_key_registry.md \u2014 every key that currently exists)
${n}

## EXAMPLE ENTRY: SCP-41B-001 (the corpus seed, no lure \u2014 teaching-slot pattern)
\`\`\`markdown
${c}
\`\`\`

## EXAMPLE ENTRY: SCP-41B-009 (deep file \u2014 has a lure, Halloran marginalia, careful prose)
\`\`\`markdown
${g}
\`\`\`

## CURRENTLY AUTHORED ENTRIES
${d}
`}async function*q(r,s,e,t){var c,g;let i=JSON.stringify({model:s,max_tokens:4096,system:e,messages:t,stream:!0}),n=await new Promise((u,d)=>{let p=(0,D.request)({hostname:"api.anthropic.com",path:"/v1/messages",method:"POST",headers:{"x-api-key":r,"anthropic-version":"2023-06-01","content-type":"application/json","content-length":Buffer.byteLength(i)}},u);p.on("error",d),p.write(i),p.end()});if(n.statusCode!==200){let u="";for await(let d of n)u+=d.toString("utf8");throw new Error(`Anthropic API ${n.statusCode}: ${u}`)}let o="";for await(let u of n){o+=u.toString("utf8");let d=o.split(`
`);o=(c=d.pop())!=null?c:"";for(let p of d){if(!p.startsWith("data: "))continue;let l=p.slice(6).trim();if(l==="[DONE]")return;try{let h=JSON.parse(l);h.type==="content_block_delta"&&((g=h.delta)==null?void 0:g.type)==="text_delta"&&(yield h.delta.text)}catch(h){}}}}function m(r){let s=r.vault.adapter.basePath;return x.resolve(s,"..")}function C(r){let s=r.vault.getFiles().filter(t=>t.path.startsWith("entries/SCP-41B-")&&!t.name.startsWith("_")).map(t=>parseInt(t.basename.replace("SCP-41B-",""),10)).filter(t=>!isNaN(t)),e=s.length>0?Math.max(...s):-1;return String(e+1).padStart(3,"0")}var v=class extends a.ItemView{constructor(s,e){super(s),this.plugin=e}getViewType(){return f}getDisplayText(){return"Site-41B Build"}getIcon(){return"check-circle"}async onOpen(){let s=this.containerEl.children[1];s.empty(),s.addClass("site41b-panel");let e=s.createDiv("site41b-hdr");e.createEl("h4",{text:"Build Validator"}),this.statusEl=e.createEl("span",{cls:"site41b-status"});let t=s.createDiv("site41b-btn-row"),i=t.createEl("button",{text:"\u25B6 build:corpus",cls:"site41b-btn site41b-btn-primary"}),n=t.createEl("button",{text:"\u25B6 winnable test",cls:"site41b-btn"}),o=t.createEl("button",{text:"\u25B6 both",cls:"site41b-btn"});this.resultsEl=s.createDiv("site41b-results"),i.addEventListener("click",()=>this.runBuild()),n.addEventListener("click",()=>this.runWinnableTest()),o.addEventListener("click",async()=>{await this.runBuild(),await this.runWinnableTest()})}setStatus(s,e){this.statusEl.className=`site41b-status ${e}`,this.statusEl.setText(s)}renderResult(s,e){if(s.success){this.setStatus(`\u2713 ${e}`,"site41b-ok"),this.resultsEl.createDiv({cls:"site41b-no-errors",text:`${e} passed in ${s.durationMs}ms`});return}if(this.setStatus(`\u2717 ${s.errors.length||"?"} error(s)`,"site41b-fail"),this.resultsEl.createEl("p",{text:`${e} failed (${s.durationMs}ms):`,cls:"site41b-label"}),s.errors.length>0){let t=this.resultsEl.createEl("ul",{cls:"site41b-error-list"});for(let i of s.errors){let n=t.createEl("li",{cls:"site41b-error-item"});n.createEl("span",{cls:"site41b-rule-badge",text:i.rule}),i.file?(n.createEl("a",{cls:"site41b-file-link",text:i.file}).addEventListener("click",async()=>{let c=this.app.vault.getAbstractFileByPath(`entries/${i.file}.md`);c instanceof a.TFile&&await this.app.workspace.getLeaf().openFile(c)}),n.createEl("span",{cls:"site41b-err-msg",text:": "+i.message})):n.createEl("span",{cls:"site41b-err-msg",text:" "+i.message})}}else this.resultsEl.createEl("pre",{cls:"site41b-raw-output",text:s.output.slice(0,3e3)})}async runBuild(){this.resultsEl.empty(),this.setStatus("running\u2026","site41b-run");let s=await E(m(this.app),"npm run build:corpus");this.renderResult(s,"build:corpus")}async runWinnableTest(){this.setStatus("running\u2026","site41b-run");let e=await E(m(this.app),"npx vitest run src/lib/__tests__/real-corpus-winnable.test.ts --reporter=verbose");this.renderResult(e,"winnable test")}},L={draft:{label:"Draft a new entry",desc:"Claude writes a complete SCP-41B-### file (frontmatter + body) respecting the schema, concept registry, and winnability spine. The next available number is pre-filled."},expand:{label:"Expand current entry",desc:"Claude appends 2\u20133 addenda to the currently open entry, deepening the grounding surface and adding cast-voice fragments (Halloran marginalia, Vogel memos). Does not touch existing frontmatter."},check:{label:"Check current entry",desc:"Claude audits the currently open entry for schema violations, missing grounding, orphaned concept keys, and winnability issues \u2014 reports in [rule-name]: format matching the build's error output."},"coin-key":{label:"Coin a concept key",desc:"Claude designs a new concept_key_registry.md entry: kebab-case key, cluster membership, 3-index escalation, planned carriers, sibling keys. Paste result directly into the registry."}},k=class extends a.ItemView{constructor(e,t){super(e);this.output="";this.generating=!1;this.messages=[];this.currentSystem="";this.showRaw=!1;this.plugin=t}getViewType(){return w}getDisplayText(){return"Site-41B Wiki Gen"}getIcon(){return"sparkles"}async onOpen(){let e=this.containerEl.children[1];e.empty(),e.addClass("site41b-panel"),e.createDiv("site41b-hdr").createEl("h4",{text:"Wiki Generator"});let t=e.createDiv("site41b-field");t.createDiv({cls:"site41b-label",text:"Action"}),this.actionEl=t.createEl("select",{cls:"site41b-select"});for(let[b,{label:M}]of Object.entries(L)){let _=this.actionEl.createEl("option",{text:M});_.value=b}this.descEl=e.createDiv("site41b-desc"),this.syncDesc(),this.actionEl.addEventListener("change",()=>this.syncDesc());let i=e.createDiv("site41b-field");i.createDiv({cls:"site41b-label",text:"Notes / focus (optional)"}),this.notesEl=i.createEl("textarea",{cls:"site41b-textarea"}),this.notesEl.rows=3,this.notesEl.placeholder='E.g. "Arc: Negative Stacks. Use the-flood-of-71 key. Ground in SCP-41B-008."';let n=e.createDiv("site41b-btn-row");this.genBtn=n.createEl("button",{text:"\u25B6 Generate",cls:"site41b-btn site41b-btn-primary"});let o=n.createEl("button",{text:"Clear",cls:"site41b-btn"});this.genBtn.addEventListener("click",()=>this.generate()),o.addEventListener("click",()=>this.clear()),this.outputWrap=e.createDiv("site41b-output-wrap");let c=this.outputWrap.createDiv("site41b-output-hdr");c.createDiv({cls:"site41b-label",text:"Output"});let g=c.createDiv("site41b-output-hdr-btns");this.copyBtn=g.createEl("button",{text:"Copy",cls:"site41b-btn site41b-btn-sm"}),this.rawToggle=g.createEl("button",{text:"Raw",cls:"site41b-btn site41b-btn-sm"}),this.copyBtn.disabled=!0,this.rawToggle.disabled=!0,this.copyBtn.addEventListener("click",()=>{navigator.clipboard.writeText(this.output),new a.Notice("Copied to clipboard.")}),this.rawToggle.addEventListener("click",()=>{this.showRaw=!this.showRaw,this.rawToggle.setText(this.showRaw?"Preview":"Raw"),this.renderOutput()});let u=this.outputWrap.createDiv("site41b-output");this.outputPre=u.createEl("pre",{cls:"site41b-output-pre"}),this.renderedEl=u.createDiv("site41b-output-rendered"),this.renderedEl.hide();let d=e.createDiv("site41b-btn-row");this.insertBtn=d.createEl("button",{text:"Append to active file",cls:"site41b-btn"}),this.createBtn=d.createEl("button",{text:"Create as new entry\u2026",cls:"site41b-btn"}),this.insertBtn.disabled=!0,this.createBtn.disabled=!0,this.insertBtn.addEventListener("click",()=>this.appendToActive()),this.createBtn.addEventListener("click",()=>this.createFile()),this.feedbackWrap=e.createDiv("site41b-feedback-wrap"),this.feedbackWrap.hide();let p=this.feedbackWrap.createDiv("site41b-field");p.createDiv({cls:"site41b-label",text:"Follow up"}),this.feedbackEl=p.createEl("textarea",{cls:"site41b-textarea"}),this.feedbackEl.rows=2,this.feedbackEl.placeholder='E.g. "Make the lure more subtle." or "Add a Halloran addendum."',this.feedbackEl.addEventListener("keydown",b=>{b.key==="Enter"&&(b.ctrlKey||b.metaKey)&&(b.preventDefault(),this.refine())});let l=this.feedbackWrap.createDiv("site41b-btn-row");this.refineBtn=l.createEl("button",{text:"\u25B6 Refine",cls:"site41b-btn site41b-btn-primary"});let h=l.createEl("button",{text:"New session",cls:"site41b-btn"});this.refineBtn.addEventListener("click",()=>this.refine()),h.addEventListener("click",()=>this.clear())}syncDesc(){let e=this.actionEl.value;this.descEl.setText(L[e].desc)}async renderOutput(){var e,t;if(this.showRaw||!this.output)this.renderedEl.hide(),this.outputPre.show(),this.outputPre.setText(this.output);else{this.outputPre.hide(),this.renderedEl.show(),this.renderedEl.empty();let i=(t=(e=this.getActiveEntry())==null?void 0:e.path)!=null?t:"entries/";await a.MarkdownRenderer.render(this.app,this.output,this.renderedEl,i,this)}}async generate(){if(this.generating)return;let{anthropicApiKey:e,model:t}=this.plugin.settings;if(!e){new a.Notice("Set your Anthropic API key in Site-41B plugin settings first.");return}let i=this.actionEl.value,n=this.notesEl.value.trim();if((i==="expand"||i==="check")&&!this.getActiveEntry()){new a.Notice("Open a vault/entries/SCP-41B-###.md file first.");return}let o=m(this.app),c=await G(this.app,o);this.currentSystem=this.buildSystem(c);let g=await this.buildUserMsg(i,n);this.messages=[{role:"user",content:g}],await this.runStream(t,e)}async refine(){if(this.generating)return;let e=this.feedbackEl.value.trim();if(!e)return;let{anthropicApiKey:t,model:i}=this.plugin.settings;if(!t){new a.Notice("Set your Anthropic API key in Site-41B plugin settings first.");return}this.messages.push({role:"assistant",content:this.output}),this.messages.push({role:"user",content:e}),this.feedbackEl.value="",await this.runStream(i,t)}async runStream(e,t){this.generating=!0,this.genBtn.disabled=!0,this.genBtn.setText("Generating\u2026"),this.refineBtn.disabled=!0,this.insertBtn.disabled=!0,this.createBtn.disabled=!0,this.copyBtn.disabled=!0,this.rawToggle.disabled=!0,this.feedbackWrap.hide(),this.output="",this.renderedEl.hide(),this.outputPre.show(),this.outputPre.className="site41b-output-pre",this.outputPre.setText(""),this.outputWrap.addClass("site41b-streaming");try{for await(let i of q(t,e,this.currentSystem,this.messages)){this.output+=i,this.outputPre.setText(this.output);let n=this.outputWrap.querySelector(".site41b-output");n&&(n.scrollTop=n.scrollHeight)}await this.renderOutput(),this.copyBtn.disabled=!1,this.rawToggle.disabled=!1,this.insertBtn.disabled=!1,this.createBtn.disabled=!1,this.feedbackWrap.show(),this.refineBtn.disabled=!1}catch(i){this.outputPre.show(),this.renderedEl.hide(),this.outputPre.className="site41b-output-pre site41b-err-inline",this.outputPre.setText(`Error: ${i.message}`)}finally{this.generating=!1,this.genBtn.disabled=!1,this.genBtn.setText("\u25B6 Generate"),this.outputWrap.removeClass("site41b-streaming")}}buildSystem(e){return`You are an authoring assistant for Site-41B \u2014 a text-game about a Foundation deep-records annex. Your role is to help author SCP-41B-### entries (Foundation archive documents) that are mechanically correct and narratively consistent.

Always output actual content \u2014 never placeholders like "[insert text here]". Be dense and specific.

Every truth word must be original (not a canon SCP resolution). Every entry you draft must be mechanically sound:
- the truth word grounded in a cited earlier reachable file
- every frontmatter xref mirrored as a [[wikilink]] in the body
- no \u27E6anchor_id\u27E7 token appears more than once
- lure differs from truth (if present)
- body contains zero instructions on how to cite (method belongs to AMBER, not the record)

${e}`}async buildUserMsg(e,t){let i=await this.getActiveEntryContent();switch(e){case"draft":{let n=C(this.app);return`Draft a complete entry file for SCP-41B-${n}.

This is a deep entry (number ${n}), so include a lure word on at least one anchor.

Requirements:
1. The truth word must appear in the clear in an earlier authored file \u2014 state which file and where
2. All frontmatter xrefs must appear as [[wikilinks]] in the body
3. Use at least one concept key from the registry (prefer keys with only one carrier \u2014 orphan risk)
4. Register any new concept key in the concept_key_registry.md (output the registry block separately)
5. Object class: Safe | Euclid | Keter (Series I only; no ACS)
6. Cast only: Vogel, Halloran, Marsh, Sze, Andrade \u2014 no new recurring names
7. Lure must be the entity's signature inversion (erase the human, flip a countermeasure)

${t?`Author's notes:
${t}
`:""}
Output:
1. The complete markdown file content (ready to save as vault/entries/SCP-41B-${n}.md)
2. A NOTE section (not part of the file) explaining: which earlier file grounds each truth word, why each concept key was chosen, and any registry updates needed.`}case"expand":return`Expand this entry by adding 2\u20133 new addenda. Append only \u2014 do not alter existing content.

Current entry:
\`\`\`markdown
${i}
\`\`\`

Rules:
- Append only: start your output from the next addendum section (e.g. ## Addendum XXX.2 \u2014)
- Each addendum deepens the grounding surface: more prose the player can triangulate from
- Use cast voices only: Halloran marginalia (> blockquotes), Vogel memos, recovered fragments
- Add cross-references to sibling-key entries not yet linked (check concept registry)
- Do not explain how to cite \u2014 the body is in-world paperwork, not a tutorial

${t?`Author's focus:
${t}
`:""}
Output only the new addenda to append.`;case"check":return`Audit this entry for mechanical correctness and authoring discipline.

\`\`\`markdown
${i}
\`\`\`

Report every issue in [rule-name]: description format (matching the build's error output). Check:
1. [xref-linked] \u2014 every frontmatter xref has a [[wikilink]] in body
2. [grounding-citeable] \u2014 each teaching anchor's truth word appears in clear prose in its citeIn file(s)
3. [lure-differs] \u2014 lure (if present) differs from truth
4. [token-once] \u2014 each \u27E6id\u27E7 token appears exactly once in body
5. [concept-registry] \u2014 every concept key is in the registry
6. [winnability-chain] \u2014 entry is reachable from SCP-41B-001 via the declared xref chain
7. [entity-self] \u2014 only one file across the corpus may have entity_self: true

Authoring discipline (flag but don't error):
- Body narrates how to cite (companion principle violation)
- Unregistered cast names
- Truth word looks like a canonical SCP resolution (licensing risk)
- No lure despite being a deeper entry (entries beyond 005 should have a lure)

${t?`Additional focus:
${t}
`:""}
End with VERDICT: PASS (if no mechanical errors) or FAIL (list blockers).`;case"coin-key":return`Design a new concept key for concept_key_registry.md.

Concept to capture: ${t||"(not specified \u2014 choose one that fills a gap in the current registry)"}

Design it to:
1. Use a kebab-case name not already in the registry
2. Bridge at least two clusters (no islands \u2014 see \xA74 cross-cluster map)
3. Have \u22652 planned carriers (choose plausible SCP-41B-### numbers not yet authored)
4. 3-index escalation: 0 = mundane bureaucratic reading, 1 = anomalous, 2 = cosmological
5. Sibling keys from the existing registry
6. NOT conflict with reserved placeholder keys

Output:
1. The complete registry entry block, formatted to paste directly into concept_key_registry.md
2. A brief rationale: which gap it fills, why the index escalation works, which entries should author its first carriers`}}getActiveEntry(){let e=this.app.workspace.getActiveFile();return e&&e.path.startsWith("entries/")?e:null}async getActiveEntryContent(){let e=this.getActiveEntry();return e?await this.app.vault.read(e):""}clear(){this.messages=[],this.currentSystem="",this.output="",this.showRaw=!1,this.rawToggle.setText("Raw"),this.outputPre.className="site41b-output-pre",this.outputPre.setText(""),this.outputPre.show(),this.renderedEl.hide(),this.renderedEl.empty(),this.insertBtn.disabled=!0,this.createBtn.disabled=!0,this.copyBtn.disabled=!0,this.rawToggle.disabled=!0,this.feedbackWrap.hide(),this.feedbackEl.value="",this.notesEl.value=""}async appendToActive(){let e=this.app.workspace.getActiveFile();if(!e){new a.Notice("No file is currently open.");return}let t=await this.app.vault.read(e);await this.app.vault.modify(e,t+`

`+this.output),new a.Notice(`Appended to ${e.basename}.`)}async createFile(){let t=`entries/SCP-41B-${C(this.app)}.md`,i=this.output,n=i.match(/```(?:markdown)?\n([\s\S]+?)\n```/);n&&(i=n[1]);let o=i.indexOf(`
---
**NOTE`);o>-1&&(i=i.slice(0,o).trimEnd());try{let c=await this.app.vault.create(t,i+`
`);await this.app.workspace.getLeaf().openFile(c),new a.Notice(`Created ${c.basename} \u2014 run build:corpus to validate.`)}catch(c){new a.Notice(`Could not create file: ${c.message}`)}}},T=class extends a.PluginSettingTab{constructor(s,e){super(s,e),this.plugin=e}display(){let{containerEl:s}=this;s.empty(),s.createEl("h2",{text:"Site-41B Authoring"}),new a.Setting(s).setName("Anthropic API key").setDesc("Required for the Wiki Generator. Get one at console.anthropic.com.").addText(e=>e.setPlaceholder("sk-ant-\u2026").setValue(this.plugin.settings.anthropicApiKey).onChange(async t=>{this.plugin.settings.anthropicApiKey=t.trim(),await this.plugin.saveSettings()})),new a.Setting(s).setName("Model").setDesc("Claude model ID to use for wiki generation.").addText(e=>e.setPlaceholder("claude-sonnet-4-6").setValue(this.plugin.settings.model).onChange(async t=>{this.plugin.settings.model=t.trim()||S.model,await this.plugin.saveSettings()}))}},B=class extends a.Plugin{constructor(){super(...arguments);this.settings=S}async onload(){await this.loadSettings(),this.registerView(f,e=>new v(e,this)),this.registerView(w,e=>new k(e,this)),this.addCommand({id:"open-build-panel",name:"Open build validator",callback:()=>this.openView(f)}),this.addCommand({id:"open-wiki-generator",name:"Open wiki generator",callback:()=>this.openView(w)}),this.addCommand({id:"run-build-corpus",name:"Run build:corpus",callback:()=>this.quickBuild()}),this.addCommand({id:"run-winnable-test",name:"Run winnable test",callback:()=>this.quickTest()}),this.addRibbonIcon("check-circle","Site-41B: build validator",()=>this.openView(f)),this.addRibbonIcon("sparkles","Site-41B: wiki generator",()=>this.openView(w)),this.addSettingTab(new T(this.app,this))}async openView(e){let t=this.app.workspace.getLeavesOfType(e);if(t.length){this.app.workspace.revealLeaf(t[0]);return}let i=this.app.workspace.getRightLeaf(!1);i&&(await i.setViewState({type:e,active:!0}),this.app.workspace.revealLeaf(i))}async quickBuild(){let e=new a.Notice("Running build:corpus\u2026",0),t=await E(m(this.app),"npm run build:corpus");e.hide(),t.success?new a.Notice("\u2713 build:corpus passed"):(new a.Notice("\u2717 build:corpus failed \u2014 see Build panel for details"),this.openView(f))}async quickTest(){let e=new a.Notice("Running winnable test\u2026",0),t=await E(m(this.app),"npx vitest run src/lib/__tests__/real-corpus-winnable.test.ts");e.hide(),t.success?new a.Notice("\u2713 Winnable test passed"):(new a.Notice("\u2717 Winnable test failed \u2014 see Build panel for details"),this.openView(f))}async loadSettings(){this.settings=Object.assign({},S,await this.loadData())}async saveSettings(){await this.saveData(this.settings)}};0&&(module.exports={BuildView,WikiView});
