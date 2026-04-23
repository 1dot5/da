---
name: component-architect
description: コンポーネントの責務分割、props/バリアント設計、置き場の判断（packages/ vs _components/）を扱う。コンポーネント分解や再利用境界を議論するときに発火。
user-invocable: false
metadata:
  tags: components, architecture, props, variants, composition, shadcn
---

# Component Architect Skill

責務分割・props 設計・バリアント・置き場判断の規約。

## When to Apply

次のような会話で発火する：

- コンポーネント分解、責務分割、再利用境界、props 設計、バリアント設計
- Component decomposition, props design, variants, composition, component boundaries
- shadcn/ui のコンポーネントを拡張・カスタマイズするとき
- `packages/` に置くか `_components/` に置くか迷ったとき

## Core Principles

1. **責務は 1 つ**。複数の関心を持ったら分ける
2. **迷ったら `_components/` に置く**。2 箇所目の利用が出てから `packages/` へ昇格
3. **Boolean prop の羅列は state machine のサイン**。`status: 'idle' | 'loading' | 'error'` に集約

## 置き場の判断

`tenpct/frontend-template` の配置ルールに従う。

| 配置 | 用途 | 判断基準 |
|---|---|---|
| `packages/` | アプリ横断の共通 UI（shadcn/ui ベース） | 2 アプリ以上で使う / プリミティブに近い |
| `src/app/{route}/_components/` | そのページでしか使わないコンポーネント | 特定ルートに強く結びつく |
| `src/hooks/` | アプリ全体で使うカスタムフック | ロジックの再利用 |
| `src/store/` | グローバルな UI 状態（Zustand） | 複数コンポーネント間で共有する UI 状態 |
| `src/api/` | API クライアント関数・GraphQL 定義 | |

**迷ったら `_components/` に置く**。横断利用が 2 箇所目で出てきてから `packages/` に昇格させる。早期共通化は害。

## コンポーネント分解の判断軸

1. **責務は 1 つ**。複数の関心を持ったら分ける
2. **状態とプレゼンテーションを分ける**。ロジックは hook、表示は component
3. **データ取得は境界を明確に**。Suspense + Error Boundary で包む単位がコンポーネント境界
4. **props で制御するか、children で渡すか**
   - 構造が固定なら props（variant, size, disabled）
   - 構造が可変なら children / slot（Radix の Composition パターン）

## Props 設計

- **バリアントは CVA (class-variance-authority) で定義**。shadcn/ui 準拠
- **必須 props は最小に**。デフォルト値を持てるものは optional
- **Boolean prop の羅列を避ける**（`isLoading && isDisabled && isError` → `status: 'loading' | 'error' | 'idle'`）
- **on* ハンドラは動詞で命名**（`onSubmit`, `onSelect`）
- **data prop は型を狭く**。GraphQL codegen の型を使う

## 状態の扱い

全コンポーネントで以下を必ず定義：

- `default` / `hover` / `active` / `focus` / `focus-visible` / `disabled`
- データ系: `loading` / `empty` / `error` / `success`
- 権限系: `no-permission`（該当時）

**状態の表現手段の優先順位**：

1. ネイティブ属性（`disabled`, `aria-pressed`, `aria-expanded`）
2. data 属性（`data-state="open"` など、Radix 慣習）
3. クラス名での切り替え

## バリアント設計

- **バリアント軸は直交させる**（`variant` × `size` × `tone`）
- **軸が 3 本を超えたら分割を検討**。複雑すぎるコンポーネントは分ける兆候
- **size は spacing scale と連動**（sm/md/lg を勝手に増やさない）

## Composition パターン（Radix 流）

構造が可変な場合は複合コンポーネントで提供：

```tsx
<Card>
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

- 各サブコンポーネントは単体でも意味を持つ
- props drilling を避けられる
- shadcn/ui の多くがこのパターン

## Form コンポーネント

- React Hook Form + Zod 前提
- `<Label htmlFor>` と `<Input id>` を必ず紐付ける
- エラーは `aria-describedby` で関連付け
- placeholder を label 代わりにしない

## 判断フロー

```
このコンポーネントは何の責務を持つか？
├── 複数 → 分解する
└── 1 つ
    ├── 2 箇所以上で使う？
    │   ├── Yes → packages/ に昇格候補
    │   └── No  → _components/ に置く
    └── 構造は可変か？
        ├── Yes → Composition (children / slot)
        └── No  → Props (variant, size, tone)
```

## Output Format

1. コンポーネントの責務（1 文で）
2. 置き場の判断と理由
3. Props インタフェース（型定義）
4. バリアント設計（CVA の軸）
5. Composition / Slot 構造（必要な場合）
6. 状態の列挙
7. 依存するプリミティブ（Radix / shadcn）

## よくある失敗

- 早すぎる共通化（`packages/` に入れたが横展開されない）
- Boolean prop の爆発（`isLoading`, `isDisabled`, `isError` を並べる）
- コンポーネント内部でデータ取得と表示を混ぜる（テスト困難・再利用不可）
- 状態を `useState` で個別管理（本当は 1 つの state machine）
- バリアント軸が増えすぎて CVA が読めない

## 参照

- コードへの翻訳：`design-to-code` skill
- 配置ルール：`frontend-architecture` skill
- チェックリスト：[.agent/review.md](../../../.agent/review.md)

設計が決まったら `design-to-code` skill で実装へ、配置は `frontend-architecture` skill で確認。
