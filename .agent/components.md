# コンポーネント設計

責務分割・props 設計・バリアント・置き場判断の規約。

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

## よくある失敗

- 早すぎる共通化（`packages/` に入れたが横展開されない）
- Boolean prop の爆発（`isLoading`, `isDisabled`, `isError` を並べる）
- コンポーネント内部でデータ取得と表示を混ぜる（テスト困難・再利用不可）
- 状態を `useState` で個別管理（本当は 1 つの state machine）
- バリアント軸が増えすぎて CVA が読めない
