---
name: pencil-design-flow
description: Pencil MCP で .pen ファイルを扱うデザインワークフロー。探索 → 骨格 → 状態 → 書き出しの手順と、変数・コンポーネント運用を定義。.pen を開く/作るときに発火。
user-invocable: false
metadata:
  tags: pencil, design-tool, mcp, workflow, pen-file
---

# Pencil Design Flow Skill

## When to Apply

次のような会話で発火する：

- .pen ファイルを開く / 作る / 編集する
- Pencil で画面を作る、コンポーネントを描く、デザインを書き出す
- Open a .pen file, create a new .pen, design with Pencil, export from Pencil

## Core Principles

1. **.pen は Pencil MCP 経由でのみ読み書き**する。`Read` / `Grep` は使わない（暗号化されている）
2. **作業前に現在の editor state を確認**する（`get_editor_state`）
3. **設計は「骨格 → 状態 → 書き出し」の順**。状態定義を飛ばさない

## Process

### 1. 現状把握

- `get_editor_state({ include_schema: true })` で active な .pen と選択状態を確認
- 新規なら `open_document('new')`、既存なら `open_document(filePath)` を使う
- 必要に応じて `get_guidelines()` で設計ガイドを読む

### 2. 探索（既存ファイル）

- `batch_get(patterns, nodeIds)` でノードを取得
- 画面構造・既存コンポーネント・変数（tokens）を把握
- `search_all_unique_properties` で再利用可能なプロパティを確認
- `get_variables` で既存のトークンセットを確認

### 3. 骨格を作る

- 情報設計（[.agent/design.md](../../../.agent/design.md)）に従って構造を決める
- `batch_design` で一括挿入（1 コール最大 25 operations）
- 繰り返し要素はコンポーネント化（後で `replace_all_matching_properties` で一括更新）

### 4. 状態を定義する

- default / hover / active / focus / disabled / loading / empty / error の各バリアント
- Pencil の Variants 機能でまとめる
- 可変要素（テキスト長 / リスト件数 / 画像比）を確認

### 5. トークンを揃える

- 色・余白・typography は `set_variables` でトークン化
- 生値のハードコードを排除
- Tailwind v4 の `@theme` に写せる命名（`--color-brand-500`, `--spacing-section`）を意識

### 6. レイアウトスナップショット / 書き出し

- `snapshot_layout` でレイアウト検証
- `find_empty_space_on_canvas` で新規配置場所を探す
- `export_nodes` でコード / 画像として書き出す
- `get_screenshot` で視覚確認

## Output Format

1. 現在の editor state（active 文書・選択）
2. 情報設計（目的・優先度・構造）
3. 骨格の構築結果（作成したノードの要約）
4. 状態定義（各バリアントの存在確認）
5. トークン一覧（色・余白・typography）
6. 書き出し結果 or 次ステップ

## Pencil へのプロンプト設計

Pencil でワイヤー/UI を生成させるときは、次の構造でプロンプトを渡すと精度が上がる。

```
[コンテキスト] 誰が、いつ、何のために使う画面か
[ゴール] この画面で達成したい成果
[必須要素] 表示すべき情報・アクション
[制約] デバイス、文字数、既存 UI との整合
[除外] 含めないもの（重要）
```

**「除外」を明記する**ことで、AI 特有の「過剰な親切」を抑制できる。

## フェーズ間を一気に飛ばさない

Pencil はワイヤー→ローファイ→ハイファイの変換を一気に行えるが、**各フェーズで検証すべき問いに答え切ってから次へ**進む（フェーズの目的については `ui-designer` を参照）。

- **ワイヤー → ローファイ**: 色数を最小（グレースケール + 1 アクセント）に絞って生成。レイアウトの骨格を先に確定
- **ローファイ → ハイファイ**: ブランドトークン（色・タイポ・角丸・影）を事前に Pencil に渡す。**スタイルの一貫性は AI ではなく人間の設計で固定する**

AI に任せてよいのは「適用」であり、「決定」ではない。

## AI でコンポーネントを扱うときの注意

- **AI が生成した UI を、そのまま「新規コンポーネント」にしない**。必ず既存システムに照らし「既存で表現できないか」を先に確認
- **AI は「それっぽいもの」を返す**。軸の直交性・誤用防止・状態網羅は人間が確認
- **トークンを参照したコードを生成させる**。生の HEX / px が紛れ込んだらレビューで落とす
- **Pencil のライブラリに取り込む前**に、`component-architect` の設計過程を踏む。設計のない登録はコンポーネントシステムの汚染

## よくある失敗

- `Read` / `Grep` で .pen を読もうとする（暗号化のため不可）
- `get_editor_state` を省略して状態不明のまま操作する
- `batch_design` のオペレーション構文を間違える（tool description を必ず確認）
- 状態定義（hover / error / empty）を Variants 化せず、別ノードで複製する
- 生値をトークン化せず、後からの一括変更ができなくなる
- フェーズを飛ばして一気にハイファイまで生成させる
- AI 生成物をそのままライブラリ化する

## 参照

- 情報設計・視覚階層・コンポーネント設計の判断軸：`ui-designer` skill / [.agent/design.md](../../../.agent/design.md)
- コンポーネントの責務分割・配置：`component-architect` skill
- チェックリスト：[.agent/review.md](../../../.agent/review.md)
- Pencil MCP ツール定義は会話中の MCP 指示に従う（`batch_design` の構文を必ず守る）
