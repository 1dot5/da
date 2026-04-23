---
name: design-to-code
description: デザイン（Pencil/Figma/モック）をコードに翻訳する判断軸。Tailwind CSS v4 + shadcn/ui 前提。意図の翻訳、px→scale、margin→gap、状態=仕様を扱う。
user-invocable: false
metadata:
  tags: design-to-code, implementation, tailwind, shadcn, responsive, translation
---

# Design to Code Skill

Pencil / Figma / モックからコードへ落とす際の規約。Tailwind CSS v4 + shadcn/ui 前提。

## When to Apply

次のような会話で発火する：

- デザインから実装、Figma から実装、Pencil から実装、モックから実装
- Design to code, Figma to code, Pencil to code, mockup to code, implementation
- UI の崩れ修正、レスポンシブ対応、スタイル調整
- shadcn/ui や Tailwind v4 でコンポーネントを書くとき

## Core Principles

- **ピクセル一致ではなく、比率・整合・耐性・一貫性を保つ**
- **transcribe（書き写し）ではなく translate（翻訳）**。デザインの px 値は参照、実装はスケール・比率・構造
- **固定値は例外**。使うなら理由を明示（仕様要件 / メディア / タップターゲット等）

## 翻訳プロセス

### 1) 数値より意図を読む

- 目的（この画面で何を理解 / 操作させたいか）
- 視覚フロー（先に見る → 次 → 最後）
- 強調（hero / supporting / background）
- 階層（親子関係、グルーピング）
- 伸縮意図（Auto Layout / Constraints / Variants）
- 余白ルール（gap / padding のパターン）
- アラインメント（何を何に揃えるか）
- 可変要素（テキスト長、リスト件数、画像比、入力値）

### 2) 実装への変換

| デザイン | 実装 |
|---|---|
| `px` 値 | **スケールに丸める**（4/8/12/16/24/32/40/48）→ Tailwind の `gap-4`, `p-6` など |
| `font-size: 14px` | **役割にマップ**（heading / body / caption）→ `@theme` の `--text-*` トークン |
| 子要素の margin | **親の `gap` / `padding` に集約**。レイアウト構造（flex / grid）で表現 |
| 固定 width / height | **制約に変換**（`min-w-*` / `max-w-*` / `overflow-*` / `truncate`）|
| 幅の設計 | **背景・コンテナ・コンテンツの責務を分離** |

### 3) アラインメント判断

**揃える場面**：

- 繰り返し要素（カード / リスト / フォーム）比較のため
- 本文コラムを通す視線誘導
- 情報量が多い画面（設定 / 管理画面）

**崩してよい場面**：

- hero をあえて浮かせる
- セクション境界の強調
- 装飾・メディアを主役にする

**崩すときのルール**：

- 基準線を最低 1 本残す
- オフセットのパターンは 1〜2 に絞る
- ナロービューポートでは揃える側に寄せる

### 4) 幅の比率を保つ

- **幅配分＝視覚誘導**。primary / secondary / tertiary の列比は意図的
- **安易に `flex-1` を全部に付けない**。全部等幅は hero を殺す
- **基準線揃えと幅配分は別軸**。独立して決める

## Tailwind CSS v4 ルール

### トークン（`@theme` で定義）

```css
@import "tailwindcss";

@theme {
  --color-brand-500: #0ea5e9;
  --text-body: 1rem;
  --radius-card: 0.75rem;
  --spacing-section: 4rem;
}
```

- **色・タイポ・radius・spacing は必ずトークン経由**で参照
- 生 hex / 生 px をクラス名に書かない
- 例外は `review.md` のチェックリストに入れて明示

### タイポグラフィ

- サイズは `rem`（または `clamp()`）。`em` は親サイズと関係ある場合のみ
- `line-height` は単位なし（1.5〜1.7）
- 本文の可読性：`max-w-[60ch]`

### スペーシング

- スケールに丸める（`gap-4`, `p-6`, `space-y-8`）
- 子要素に margin を散らさず、親の `gap` / `padding` に寄せる

### レイアウト

- 1 次元：flex、2 次元：grid、間隔：gap
- `position: absolute` はオーバーレイ・装飾で目的が明確な場合のみ
- 画像はデフォルトでアスペクト比を保つ（`aspect-[16/9]` 等）

### 固定値の例外

- アイコン・サムネイル・タップターゲット・仕様指定のヘッダー高さ
- 「崩れ防止」目的でも、まず `min-*` / `max-*` を検討

## shadcn/ui の使い方

- **追加は CLI で**。手動コピペしない
- **カスタマイズは class 追加か CVA 拡張で**。コアを書き換えない
- **Radix のプリミティブを理解してから shadcn を使う**。Composition パターンを守る

## 状態の実装（必須）

- default / hover / active / focus / focus-visible / disabled / loading / error / empty
- 長文・0 件・ネットワーク失敗・遅延を最初から扱う（後付けしない）
- Tailwind の疑似クラスで表現（`hover:`, `focus-visible:`, `disabled:`, `data-[state=open]:`）

## Output Format

1. 目的（この UI が何を達成するか）
2. 前提（デザイン入力の種類 / 既存規約 / 制約）
3. 翻訳結果（階層・アラインメント・余白ルール・可変要素）
4. 実装方針（レイアウト構造・スケール・例外条件）
5. 状態設計（default / hover / active / focus / disabled / loading / error / empty）
6. 実装コード
7. チェックリスト自己評価（[.agent/review.md](../../../.agent/review.md) 参照）

## よくある失敗

- デザインデータからのピクセル完全一致コピペで、エッジ状態とレスポンシブで壊れる
- margin 調整が増殖し、保守不能になる
- 「見た目一致」を優先し、状態（loading / error / empty）が後付けになる
- Tailwind のクラスに生 px / 生 hex を書き散らす
- shadcn/ui のコアを書き換えて、アップデート追従不能になる

## 参照

- コンポーネント設計：`component-architect` skill
- 配置ルール・Server/Client 境界：`frontend-architecture` skill
- チェックリスト（a11y 含む）：[.agent/review.md](../../../.agent/review.md)
