/**
 * Builds the Obsidian plugin and copies it into vault/.obsidian/plugins/.
 * Run from the repo root: npm run plugin:install
 */
import { execSync }               from 'child_process';
import { cpSync, mkdirSync }      from 'fs';
import { resolve, dirname }       from 'path';
import { fileURLToPath }          from 'url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const repoRoot   = resolve(__dirname, '..');
const pluginSrc  = resolve(repoRoot, 'plugins', 'site41b-authoring');
const pluginDest = resolve(repoRoot, 'vault', '.obsidian', 'plugins', 'site41b-authoring');

console.log('📦 Installing plugin dependencies…');
execSync('npm install', { cwd: pluginSrc, stdio: 'inherit' });

console.log('🔨 Building plugin…');
execSync('node esbuild.config.mjs production', { cwd: pluginSrc, stdio: 'inherit' });

console.log(`📁 Copying to ${pluginDest}…`);
mkdirSync(pluginDest, { recursive: true });
for (const file of ['main.js', 'manifest.json', 'styles.css']) {
  cpSync(resolve(pluginSrc, file), resolve(pluginDest, file));
}

console.log(`
✓ Plugin installed.

Next steps:
1. In Obsidian: Settings → Community plugins → Enable community plugins (if not already on)
2. Scroll to "Installed plugins" → enable "Site-41B Authoring"
3. In plugin settings: paste your Anthropic API key (sk-ant-…)
4. Two ribbon icons appear: check-circle (Build Validator) and sparkles (Wiki Generator)

To rebuild after editing src/main.ts:
  npm run plugin:install
`);
