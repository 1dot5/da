# design-assistant

Next.js 16 + React 19 プロジェクト向けに、シニアデザイナー兼フロントエンドエンジニアとしての規約・Skill・ワークフローを一式ばらまくための CLI。

- `AGENTS.md` — エージェント共通の Single Source of Truth
- `.agent/*.md` — Claude Code 以外のツール（Cursor / Codex / OpenHands 等）から参照するビュー
- `.claude/skills/**/SKILL.md` — Claude Code 用の自動発火 Skill
- `.claude/CLAUDE.md` — Claude Code 用のエントリ（`AGENTS.md` と同一内容）

## 使い方

既存プロジェクトの直下で一発で展開する。

```sh
# 現在のディレクトリに展開
npx @1dot5/design-assistant

# 別のディレクトリに展開
npx @1dot5/design-assistant ./path/to/app

# 何が書かれるかだけ確認
npx @1dot5/design-assistant --dry-run

# 既存ファイルを上書き（更新したいとき）
npx @1dot5/design-assistant --force
```

pnpm / yarn / bun でも等価に動く。

```sh
pnpm dlx @1dot5/design-assistant
yarn dlx @1dot5/design-assistant
bunx @1dot5/design-assistant
```

## 動作

- 既存ファイルがあり内容が同一なら **何もしない**（`unchanged`）。
- 既存ファイルがあり内容が異なるなら **スキップ**し、末尾に差分一覧を表示する。`--force` で上書き可能。
- `.agent/*.md` と `.claude/CLAUDE.md` は、リポジトリ上はシンボリックリンクだが、インストール時には **実ファイルとしてコピー**される。これにより npm tarball やクロスプラットフォーム環境で壊れない。

### コマンド

```
Usage
  npx @1dot5/design-assistant [dir] [options]

Arguments
  dir                Target directory (default: ".")

Options
  -f, --force        Overwrite existing files
  -n, --dry-run      Show what would be written without writing
  -h, --help         Show this help
  -v, --version      Print version

Exit codes
  0  success (all files written, or already up to date)
  1  some files were skipped due to conflicts (rerun with --force)
  2  invalid arguments
```

## 展開後の構成

```
<target>/
├── AGENTS.md
├── .agent/
│   ├── components.md
│   ├── design-to-code.md
│   ├── design.md
│   ├── frontend-arch.md
│   └── review.md
└── .claude/
    ├── CLAUDE.md
    └── skills/
        ├── component-architect/SKILL.md
        ├── design-review/SKILL.md
        ├── design-to-code/SKILL.md
        ├── frontend-architecture/SKILL.md
        ├── pencil-design-flow/SKILL.md
        └── ui-designer/SKILL.md
```

## 更新

このパッケージが更新されたら、プロジェクト側で再実行すれば差分だけ取り込める。

```sh
npx @1dot5/design-assistant --dry-run   # まずは差分確認
npx @1dot5/design-assistant --force     # 納得したら上書き
```

プロジェクト側で `AGENTS.md` や Skill を **カスタマイズしている場合は `--force` を使わない**。デフォルト動作は安全側で、衝突時はスキップ＋exit 1 を返す。

## ライセンス

MIT
