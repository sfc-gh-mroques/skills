// Build: bundles the film into one self-contained HTML page.
//   dist/film.html   -> artifact body (no doctype/html/head/body: the host adds the skeleton)
//   dist/index.html  -> same content wrapped in a skeleton that mimics the host, for local tests
import { build } from 'esbuild';
import fs from 'fs';
import { K } from './src/content.js';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const dev = process.argv.includes('--dev');
const b64 = (p) => fs.readFileSync(p).toString('base64');
const font = (family, file, weight) =>
  `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${b64(file)}) format('woff2');font-weight:${weight};font-style:normal;font-display:block}`;

const fonts = [
  font('Inter', 'node_modules/@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2', '100 900'),
  font('Open Sans', 'node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2', '300 800'),
  font('IBM Plex Mono', 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', '400'),
  font('IBM Plex Mono', 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', '500'),
].join('\n');

const result = await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'esm',
  minify: !dev,
  write: false,
  target: 'es2022',
  loader: { '.png': 'dataurl' },
  define: { __DEV__: String(dev) },
  // Keep code lines short. Minified output otherwise holds runs of many thousand characters without a single
  // space (three.js' export lists), and the host's publish-time checks read such a run as one oversized HTML attribute
  // value when a generated variable name happens to be `id` / `iD` (it then rejects the page as a malformed review page).
  lineLimit: 400,
  logLevel: 'warning',
});
const js = result.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const css = fs.readFileSync('src/styles.css', 'utf8');
const markup = fs.readFileSync('src/markup.html', 'utf8');

const body = `<meta charset="utf-8"><link rel="icon" href="data:,"><title>${esc(K.meta.title)}</title>
<style>
${css}
${fonts}
</style>
${markup}
<script type="module">
${js}
</script>
`;
// Guard for the same publish-time check: no `id=` followed by a long run without whitespace or '>' may remain.
{
  const hit = /(?<![\w-])id=[^\s>]{1200,}/i.exec(body);
  if (hit) { console.error(`build: an "id=" token is followed by ${hit[0].length}+ characters without a break (at ${hit.index}): ${JSON.stringify(hit[0].slice(0, 90))}…`); process.exit(1); }
}
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/film.html', body);

// Local wrapper reproducing the host skeleton (charset, viewport, small reset).
const skeleton = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif;background:#faf9f7}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>${body}</body></html>`;
fs.writeFileSync('dist/index.html', skeleton);
console.log(`built: ${(body.length / 1024).toFixed(0)} KB (js ${(js.length / 1024).toFixed(0)} KB)`);
