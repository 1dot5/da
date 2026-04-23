---
name: frontend-architecture
description: Next.js 16 App Router のディレクトリ設計、Server/Client 境界、TanStack Query + Suspense/Error Boundary、Zustand、キャッシュ戦略。
user-invocable: false
metadata:
  tags: frontend, architecture, nextjs, app-router, tanstack-query, zustand, cache
---

# Frontend Architecture Skill

`tenpct/frontend-template` 準拠。Next.js 16 App Router を主軸に、配置・境界・データフロー・キャッシュ戦略を定義する。

## When to Apply

次のような会話で発火する：

- ディレクトリ設計、共通化、データフロー、Server/Client 境界、キャッシュ戦略
- Directory structure, data flow, server/client boundary, cache strategy, state management
- App Router のページ設計、Suspense/Error Boundary の配置、TanStack Query、Zustand、Form + Zod
- `packages/` と `_components/` の置き場判断

## Core Principles

1. **Server Component をまず書く**。Client は葉に寄せる
2. **サーバーデータは TanStack Query、UI 状態は Zustand**。混ぜない
3. **Suspense + Error Boundary で UI を集約**。`isLoading` / `error` / `data` の三状態手書きを避ける

## 前提スタック

- Next.js 16 App Router + React 19
- Tailwind CSS v4 / shadcn/ui (Radix)
- TanStack Query + graphql-request + graphql-codegen
- Zustand（UI 状態のみ）
- React Hook Form + Zod
- Suspense + Error Boundary

## ディレクトリ構成

```
apps/app/
└── src/
    ├── api/                       # API クライアント関数・GraphQL 定義
    │   └── posts.ts
    ├── app/                       # Next.js App Router
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── providers.tsx          # QueryClientProvider, ErrorBoundary など
    │   ├── error.tsx              # Root Error Boundary
    │   ├── global-error.tsx
    │   ├── not-found.tsx
    │   ├── loading.tsx
    │   └── {route}/
    │       ├── page.tsx
    │       ├── loading.tsx        # Suspense fallback
    │       ├── error.tsx          # Error Boundary
    │       ├── actions.ts         # Server Actions
    │       └── _components/       # このページ専用
    ├── hooks/                     # アプリ共通のカスタムフック
    ├── store/                     # Zustand store（UI 状態のみ）
    └── utils/
        └── env.ts                 # t3-env で型安全な env
```

共通 UI は workspace の `packages/` に定義（shadcn/ui ベース）。

## 配置ルール

| 配置 | 用途 | 判断基準 |
|---|---|---|
| `src/app/{route}/_components/` | そのページ専用 | 特定ルートに強く結びつく |
| `packages/` | 2 アプリ以上で使う共通 UI | プリミティブに近い / shadcn ベース |
| `src/hooks/` | アプリ全体のフック | ロジックの再利用 |
| `src/store/` | グローバル UI 状態（Zustand） | 複数コンポーネント間で共有 |
| `src/api/` | API クライアント・GraphQL 定義 | |
| `src/utils/` | 副作用のないユーティリティ | |

## Server / Client 境界

### Server Component（デフォルト）

- データ取得・初期レンダリング
- 認証チェック・リダイレクト
- Markdown レンダリングなど静的処理

### Client Component（`'use client'` を明示）

- インタラクション（クリック、入力、hover）
- ブラウザ API（`window`, `localStorage`, `IntersectionObserver`）
- 状態管理（`useState`, `useReducer`, TanStack Query, Zustand）
- Context 利用

### 境界の引き方

1. **Server Component をまず書く**。必要になってから Client にする
2. **Client Component を葉にする**。ツリーの末端に寄せる
3. **Server → Client に props として渡せるのは serializable なもののみ**
4. **`_components/` 内は Client が多い**が、Server でも構わない（データ取得を寄せられる場合）

## データ取得戦略

### サーバー側取得

- Server Component 内で直接 `fetch` / GraphQL クライアントを呼ぶ
- `loading.tsx` / `error.tsx` で Suspense / Error Boundary 境界を張る
- Server Actions は mutation に限定（書き込み専用）

### クライアント側取得（TanStack Query）

- 操作後の再取得、キャッシュ無効化、楽観的更新が必要な場面
- `useSuspenseQuery` + 親の Suspense 境界でローディング UI を集約
- `useMutation` で書き込み → `invalidateQueries` でキャッシュ更新
- GraphQL は `graphql-request` + `graphql-codegen` で型保証

### 使い分け

| ケース | 方法 |
|---|---|
| 初回表示で決まる | Server Component で fetch / GraphQL |
| 操作後に更新が必要 | TanStack Query + `useMutation` + `invalidateQueries` |
| 画面間で短時間共有 | TanStack Query（QueryCache） |
| マスタ系（変更頻度低） | Server Component + `cache` / `'use cache'` |

## エラー処理

### Suspense + Error Boundary で UI を集約

- `isLoading` / `error` / `data` の三状態を手書きしない
- 親で Suspense / Error Boundary を張り、子は成功系だけ書く
- `react-error-boundary` の `ErrorBoundary` を活用

### 境界の粒度

- ページ全体：`app/{route}/loading.tsx` / `error.tsx`
- セクション単位：`<Suspense>` / `<ErrorBoundary>` を手動で張る
- `packages/query-boundary.tsx` のような共通コンポーネントで Suspense + Error Boundary をまとめて提供

## 状態管理の使い分け

| 種類 | 置き場 |
|---|---|
| サーバーデータ（一覧・詳細・マスター） | TanStack Query の QueryCache |
| フォーム入力 | React Hook Form（ローカル） |
| URL に乗る状態（検索条件・ページ番号・タブ） | `useSearchParams` ベースの hook |
| UI 状態（モーダル開閉・サイドバー・テーマ） | Zustand |
| 純粋な描画内部状態 | `useState` |

**Zustand は UI 状態のみ**。サーバーデータを入れない。

## キャッシュ戦略（Next.js 16）

### サーバー側

| 層 | 用途 | 例 |
|---|---|---|
| Request Memoization | 同一リクエスト内の重複 fetch 排除 | 複数コンポーネントが叩く `getUser()` |
| Data Cache | 変更頻度が低い普遍的データ | マスタ・料金プラン・国コード |
| Full Route Cache | 描画済み HTML + RSC | 規約・ヘルプ・ダッシュ雛形 |
| Router Cache | 訪問済みページの即時復元 | 一覧 → 詳細 → 戻る |

### クライアント側

- TanStack Query の QueryCache：操作後の再取得・部分更新・画面間共有
- `staleTime` / `gcTime` を用途ごとに調整

### Cache Components（Next.js 16）

- `'use cache'` ディレクティブ + `cacheLife` / `cacheTag` / `updateTag` で粒度制御
- `unstable_cache` からの移行は Vercel 公式ガイド参照

## Form

- React Hook Form + Zod
- `zodResolver` でバリデーション
- 送信：Server Action または `useMutation`
- エラーは `aria-describedby` で関連付け（レビュー観点は `review.md` 参照）

## 環境変数

- `@t3-oss/env-nextjs` で型安全化
- クライアント公開は `NEXT_PUBLIC_*` のみ、Zod スキーマで検証

## Lint / Format

- ESLint + Prettier（将来 Biome 検討）
- `eslint-plugin-query` で TanStack Query のアンチパターン検知
- `prettier-plugin-tailwindcss` でクラス順整列

## Output Format

1. 目的（何を達成するか）
2. 配置判断（どこに置くか、理由）
3. Server / Client 境界
4. データ取得方法（Server or TanStack Query）
5. 状態管理（Zustand / RHF / URL / useState）
6. Suspense / Error Boundary の粒度
7. キャッシュ戦略（必要に応じて）

## よくある失敗

- Server Component で `useState` を使おうとする（境界違反）
- TanStack Query にサーバーデータではなく UI 状態を入れる
- Zustand にサーバーデータを入れて TanStack Query と二重管理
- Suspense 境界が細かすぎて loading が点滅する
- `'use client'` をツリー上位で付け、ツリー全体が Client になる
- `packages/` に早期に共通化して、1 箇所でしか使われないまま放置

## 参照

- コンポーネント設計：`component-architect` skill
- デザイン → コード翻訳：`design-to-code` skill
- チェックリスト：[.agent/review.md](../../../.agent/review.md)
- 技術選定の背景：`tenpct/frontend-template` の TECHNICAL-DECISION.md / Framework.md
