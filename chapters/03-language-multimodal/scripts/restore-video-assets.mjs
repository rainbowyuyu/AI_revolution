#!/usr/bin/env node
/** Offline restoration of the exact V10 assets. Never contacts a service. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const chapter = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targetRoot = path.join(chapter, 'public');
const manifest = JSON.parse(fs.readFileSync(path.join(chapter, 'assets/video-manifest.json'), 'utf8'));
const args = process.argv.slice(2);
const help = `Restore the chapter's external media from an original public folder.

  node scripts/restore-video-assets.mjs --check
  node scripts/restore-video-assets.mjs --check --bundled-only
  node scripts/restore-video-assets.mjs --source "<original-project>/public" --dry-run
  node scripts/restore-video-assets.mjs --source "<original-project>/public"

--check          Verify sizes and SHA-256 hashes; missing media exits with code 1.
--bundled-only   Verify only the small images distributed with the repository.
--source PATH    User-supplied local public directory. No download occurs.
--dry-run        Validate the complete source set without copying any files.
--overwrite      Replace a destination asset only when it differs from the manifest.
`;
if (args.includes('--help')) { console.log(help); process.exit(0); }
let source;
const flags = new Set();
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--source') {
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('--source requires a directory.');
    source = path.resolve(args[++i]);
  } else if (['--check', '--bundled-only', '--dry-run', '--overwrite'].includes(args[i])) flags.add(args[i]);
  else throw new Error(`Unknown argument: ${args[i]}`);
}
if (!source && !flags.has('--check')) { console.error(help); process.exit(2); }
if (source && flags.has('--check')) throw new Error('Use --source or --check, not both.');
if (flags.has('--bundled-only') && !flags.has('--check')) throw new Error('--bundled-only requires --check.');
if (flags.has('--dry-run') && !source) throw new Error('--dry-run requires --source.');

function contained(root, file) {
  const rel = path.relative(root, file);
  return rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel);
}
function safePath(root, relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.includes(':') || relative.startsWith('/') || relative.split('/').some(x => !x || x === '.' || x === '..')) throw new Error(`Unsafe manifest path: ${relative}`);
  const file = path.resolve(root, ...relative.split('/'));
  if (!contained(root, file)) throw new Error(`Path escapes asset root: ${relative}`);
  return file;
}
async function sha256(file) {
  const digest = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(file)) digest.update(chunk);
  return digest.digest('hex');
}
async function status(root, asset) {
  const file = safePath(root, asset.path);
  if (!fs.existsSync(file)) return 'missing';
  if (!contained(fs.realpathSync(root), fs.realpathSync(file))) return 'symlink-outside-root';
  const info = fs.statSync(file);
  if (!info.isFile() || info.size !== asset.bytes) return 'size-mismatch';
  return await sha256(file) === asset.sha256 ? 'ok' : 'hash-mismatch';
}
const assets = manifest.assets.filter(x => !flags.has('--bundled-only') || x.distribution === 'bundled');
const seen = new Set();
for (const asset of assets) {
  safePath(targetRoot, asset.path);
  if (seen.has(asset.path)) throw new Error(`Duplicate manifest path: ${asset.path}`);
  if (!Number.isSafeInteger(asset.bytes) || asset.bytes < 0 || !/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error(`Invalid size or SHA-256: ${asset.path}`);
  seen.add(asset.path);
}
if (flags.has('--check')) {
  let valid = 0, failed = 0;
  for (const asset of assets) {
    const result = await status(targetRoot, asset);
    if (result === 'ok') valid++;
    else { console.error(`${result}: ${asset.path}`); failed++; }
  }
  console.log(`Verified ${valid}/${assets.length} assets. Missing or different: ${failed}.`);
  if (flags.has('--bundled-only')) console.log('This checks repository images only, not full render readiness.');
  process.exitCode = failed ? 1 : 0;
} else {
  if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) throw new Error('The source public directory does not exist.');
  const pending = [], failures = [];
  for (const asset of assets) {
    const destinationStatus = await status(targetRoot, asset);
    if (destinationStatus === 'ok') continue;
    if (destinationStatus !== 'missing' && !flags.has('--overwrite')) {
      failures.push(`${destinationStatus} at destination: ${asset.path}; inspect it or use --overwrite.`);
      continue;
    }
    const sourceStatus = await status(source, asset);
    if (sourceStatus !== 'ok') failures.push(`${sourceStatus} at source: ${asset.path}`);
    else pending.push(asset);
  }
  if (failures.length) {
    failures.forEach(x => console.error(x));
    console.error('Nothing copied: source validation must succeed first.');
    process.exitCode = 1;
  } else if (flags.has('--dry-run')) {
    console.log(`Validated ${pending.length} assets (${pending.reduce((s, x) => s + x.bytes, 0)} bytes) for offline copying. Nothing written.`);
  } else {
    fs.mkdirSync(targetRoot, {recursive: true});
    for (const asset of pending) {
      const src = safePath(source, asset.path), dst = safePath(targetRoot, asset.path);
      fs.mkdirSync(path.dirname(dst), {recursive: true});
      if (!contained(fs.realpathSync(targetRoot), fs.realpathSync(path.dirname(dst)))) throw new Error(`Destination parent escapes public: ${asset.path}`);
      const temporary = dst + `.restore-${process.pid}.tmp`;
      try {
        fs.copyFileSync(src, temporary, fs.constants.COPYFILE_EXCL);
        if (fs.statSync(temporary).size !== asset.bytes || await sha256(temporary) !== asset.sha256) throw new Error(`Copy verification failed: ${asset.path}`);
        fs.renameSync(temporary, dst);
      } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
      console.log(`Restored: ${asset.path}`);
    }
    console.log(`Restored ${pending.length} assets. Run --check before rendering.`);
  }
}
