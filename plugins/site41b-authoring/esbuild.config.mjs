import esbuild from 'esbuild';
import process from 'process';

const prod = process.argv[2] === 'production';

// Node built-ins available in Electron renderer — mark external so they're
// required at runtime rather than bundled (bundling them would fail anyway).
const NODE_BUILTINS = [
  'child_process', 'path', 'fs', 'util', 'os', 'events', 'stream',
  'buffer', 'crypto', 'tls', 'net', 'http', 'https', 'url', 'zlib',
  'querystring', 'string_decoder', 'assert', 'timers',
];

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@electron/*',
    'codemirror',
    '@codemirror/*',
    ...NODE_BUILTINS,
  ],
  format: 'cjs',
  target: 'es2018',
  platform: 'node',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
  minify: prod,
});

if (prod) {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Build complete.');
} else {
  await ctx.watch();
  console.log('Watching for changes…  (Ctrl-C to stop)');
}
