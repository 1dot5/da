---
name: design-to-code
description: デザイン（Pencil/Figma/モック）をコードに翻訳する判断軸。Tailwind CSS v4 + shadcn/ui 前提。意図の翻訳、px→scale、margin→gap、状態=仕様を扱う。
user-invocable: false
metadata:
  tags: design-to-code, implementation, tailwind, shadcn, responsive, translation
---

# Design to Code Skill

## When to Apply

次のような会話で発火する：

- デザインから実装、Figma から実装、Pencil から実装、モックから実装
- Design to code, Figma to code, Pencil to code, mockup to code, implementation
- UI の崩れ修正、レスポンシブ対応、スタイル調整
- shadcn/ui や Tailwind v4 でコンポーネントを書くとき

## Core Principles

1. **ピクセル一致ではなく、比率・整合・耐性・一貫性**を保つ
2. **Transcribe ではなく Translate**。px は参照、実装はスケール・比率・構造
3. **固定値は例外**。使うなら理由を明示（仕様 / メディア / タップターゲット）

## Process

### 1. 意図を読む（数値より先に）

- 目的 / 視覚フロー / 強調 / 階層 / 伸縮意図 / 余白ルール / アラインメント / 可変要素

### 2. 実装へ変換

- `px` → スケール（4/8/12/16/24/32/40/48）
- `font-size` → 役割（heading / body / caption）
- 子の margin → 親の `gap` / `padding`
- 固定 width/height → `min-*` / `max-*` / `overflow-*`

### 3. Tailwind v4 ルール

- 色・余白・radius・typography は `@theme` のトークン経由
- クラスに生 px / 生 hex を書かない
- `rem` / `clamp()` でタイポ、`line-height` は単位なし

### 4. 状態の実装

- Tailwind の疑似クラス（`hover:`, `focus-visible:`, `disabled:`, `data-[state=open]:`）
- default / hover / active / focus / focus-visible / disabled / loading / empty / error

### 5. shadcn/ui

- 追加は CLI で
- カスタマイズは class 追加か CVA 拡張（コアを書き換えない）
- Radix の Composition パターンを守る

## Output Format

1. 目的（この UI が何を達成するか）
2. 前提（入力デザインの種類 / 既存規約 / 制約）
3. 翻訳結果（階層・アラインメント・余白・可変要素）
4. 実装方針（レイアウト構造・スケール・例外条件）
5. 状態設計
6. 実装コード
7. チェックリスト自己評価

## 参照

- 翻訳プロセスの詳細・Tailwind v4 / shadcn ルール：[.agent/design-to-code.md](../../../.agent/design-to-code.md)
- コンポーネント設計：[.agent/components.md](../../../.agent/components.md)
- 配置ルール・Server/Client 境界：[.agent/frontend-arch.md](../../../.agent/frontend-arch.md)
- チェックリスト（a11y 含む）：[.agent/review.md](../../../.agent/review.md)
