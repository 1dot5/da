#!/usr/bin/env node
import { parseArgs } from "node:util";
import {
  access,
  copyFile,
  mkdir,
  readdir,
  readFile,
  realpath,
  stat,
} from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const FILE_SOURCES = ["AGENTS.md"];
const DIR_SOURCES = [".claude/skills"];

// dest path (in target project) -> source path (in this package).
// Repo uses symlinks for these; tarballs don't preserve symlinks reliably, so
// the installer synthesizes them by copying from the underlying source.
export const ALIASES = {
  ".agent/components.md": ".claude/skills/component-architect/SKILL.md",
  ".agent/design-to-code.md": ".claude/skills/design-to-code/SKILL.md",
  ".agent/design.md": ".claude/skills/ui-designer/SKILL.md",
  ".agent/frontend-arch.md": ".claude/skills/frontend-architecture/SKILL.md",
  ".agent/review.md": ".claude/skills/design-review/SKILL.md",
  ".claude/CLAUDE.md": "AGENTS.md",
};

const HELP = `${pkg.name} v${pkg.version}
${pkg.description}

Usage
  npx ${pkg.name} [dir] [options]

Arguments
  dir                Target directory (default: ".")

Options
  -f, --force        Overwrite existing files
  -n, --dry-run      Show what would be written without writing
  -h, --help         Show this help
  -v, --version      Print version

Examples
  npx ${pkg.name}                 Install into the current directory
  npx ${pkg.name} ./my-app        Install into ./my-app
  npx ${pkg.name} --dry-run       Preview the file list
  npx ${pkg.name} --force         Overwrite existing files

Exit codes
  0  success (all files written, or already up to date)
  1  some files were skipped due to conflicts (rerun with --force)
  2  invalid arguments
`;

function parse() {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        force: { type: "boolean", short: "f", default: false },
        "dry-run": { type: "boolean", short: "n", default: false },
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", short: "v", default: false },
      },
    });
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n\n${HELP}`);
    process.exit(2);
  }
}

async function walk(absRoot, rel = "") {
  const abs = rel ? join(absRoot, rel) : absRoot;
  const st = await stat(abs);
  if (st.isFile()) return [rel];
  if (!st.isDirectory()) return [];
  const out = [];
  for (const entry of await readdir(abs)) {
    out.push(...(await walk(absRoot, rel ? join(rel, entry) : entry)));
  }
  return out;
}

async function collectOps() {
  const ops = [];
  for (const rel of FILE_SOURCES) ops.push({ src: rel, dst: rel });
  for (const dir of DIR_SOURCES) {
    const inner = await walk(join(PKG_ROOT, dir));
    for (const rel of inner) {
      const full = join(dir, rel);
      ops.push({ src: full, dst: full });
    }
  }
  for (const [dst, src] of Object.entries(ALIASES)) {
    ops.push({ src, dst });
  }
  return ops;
}

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function sameContent(a, b) {
  const [bufA, bufB] = await Promise.all([readFile(a), readFile(b)]);
  return bufA.equals(bufB);
}

async function main() {
  const { values, positionals } = parse();

  if (values.help) {
    process.stdout.write(HELP);
    return 0;
  }
  if (values.version) {
    process.stdout.write(`${pkg.version}\n`);
    return 0;
  }

  const target = resolve(process.cwd(), positionals[0] ?? ".");
  const dryRun = values["dry-run"];
  const force = values.force;

  const ops = await collectOps();

  const toWrite = [];
  const toSkip = [];
  const unchanged = [];

  for (const op of ops) {
    const srcAbs = join(PKG_ROOT, op.src);
    const dstAbs = join(target, op.dst);
    if (!(await exists(dstAbs))) {
      toWrite.push({ ...op, srcAbs, dstAbs, kind: "create" });
      continue;
    }
    if (await sameContent(srcAbs, dstAbs)) {
      unchanged.push(op.dst);
      continue;
    }
    if (force) toWrite.push({ ...op, srcAbs, dstAbs, kind: "overwrite" });
    else toSkip.push(op.dst);
  }

  process.stdout.write(`target: ${target}\n`);

  if (toSkip.length) {
    process.stdout.write(
      `\nskipped ${toSkip.length} existing file(s) (use --force to overwrite):\n`,
    );
    for (const rel of toSkip) process.stdout.write(`  - ${rel}\n`);
  }

  if (unchanged.length) {
    process.stdout.write(`\nunchanged: ${unchanged.length} file(s)\n`);
  }

  if (toWrite.length === 0) {
    process.stdout.write(
      toSkip.length ? "\nnothing to write.\n" : "\nalready up to date.\n",
    );
    return toSkip.length ? 1 : 0;
  }

  process.stdout.write(
    `\n${dryRun ? "would write" : "writing"} ${toWrite.length} file(s):\n`,
  );
  for (const op of toWrite) {
    process.stdout.write(`  ${op.kind === "overwrite" ? "*" : "+"} ${op.dst}\n`);
  }

  if (dryRun) return 0;

  for (const op of toWrite) {
    await mkdir(dirname(op.dstAbs), { recursive: true });
    await copyFile(op.srcAbs, op.dstAbs);
  }

  process.stdout.write(`\ndone.\n`);
  return toSkip.length ? 1 : 0;
}

// Only run main() when invoked as a script, not when imported by tests.
// realpath normalizes /tmp → /private/tmp on macOS so this works via npx too.
const invokedAs = process.argv[1]
  ? await realpath(process.argv[1]).catch(() => process.argv[1])
  : "";
if (invokedAs === fileURLToPath(import.meta.url)) {
  try {
    process.exit((await main()) ?? 0);
  } catch (err) {
    process.stderr.write(`error: ${err.stack ?? err.message ?? err}\n`);
    process.exit(1);
  }
}
