// No bundler needed: the sources are plain browser/Node modules. Copy them into dist/.
import { copyFile, lstat, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'dist');
try {
  if ((await lstat(out)).isSymbolicLink()) throw new Error('Refusing to build into a linked directory.');
  try { await lstat(path.join(out, 'data')); throw new Error('Refusing to build over plugin data. Move it to a safe location first.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await Promise.all([
  ...['main.js', 'backend.cjs', 'overview.cjs', 'topics.cjs', 'styles.css'].map(file => copyFile(path.join(root, 'src', file), path.join(out, file))),
  ...['manifest.json', 'README.md', 'LICENSE'].map(file => copyFile(path.join(root, file), path.join(out, file))),
]);
console.log(`Built ${out}`);
