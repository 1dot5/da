#!/usr/bin/env node
// Ensures the ALIASES map in bin/cli.js matches the repo's actual symlinks.
// Run in CI so the installer never drifts from what developers see locally.
import { readlink, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ALIASES } from "../bin/cli.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

async function resolveSymlink(relPath) {
  const abs = resolve(ROOT, relPath);
  const target = await readlink(abs);
  const resolved = resolve(dirname(abs), target);
  return relative(ROOT, resolved);
}

for (const [alias, expected] of Object.entries(ALIASES)) {
  let actual;
  try {
    actual = await resolveSymlink(alias);
  } catch (err) {
    console.error(`FAIL ${alias}: not a symlink (${err.code ?? err.message})`);
    failed++;
    continue;
  }
  if (actual !== expected) {
    console.error(`FAIL ${alias}: symlink → ${actual}, ALIASES says ${expected}`);
    failed++;
  }
  try {
    await stat(resolve(ROOT, expected));
  } catch {
    console.error(`FAIL ${alias}: target ${expected} does not exist`);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} alias check(s) failed.`);
  process.exit(1);
}
console.log(`ok: ${Object.keys(ALIASES).length} aliases match repo symlinks.`);
