---
name: frontend-architecture
description: Next.js 16 App Router のディレクトリ設計、Server/Client 境界、TanStack Query + Suspense/Error Boundary、Zustand、キャッシュ戦略。
user-invocable: false
metadata:
  tags: frontend, architecture, nextjs, app-router, tanstack-query, zustand, cache
---

# Frontend Architecture Skill

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

## 前提スタック（tenpct/frontend-template 準拠）

- Next.js 16 App Router + React 19
- Tailwind CSS v4 / shadcn/ui (Radix)
- TanStack Query + graphql-request + graphql-codegen
- Zustand（UI 状態のみ）
- React Hook Form + Zod
- Suspense + Error Boundary

## 配置ルール

| 配置 | 用途 |
|---|---|
| `src/app/{route}/_components/` | そのページ専用 |
| `packages/` | 2 アプリ以上で使う共通 UI |
| `src/hooks/` | アプリ全体のフック |
| `src/store/` | グローバル UI 状態（Zustand） |
| `src/api/` | API クライアント・GraphQL 定義 |
| `src/utils/` | 副作用のないユーティリティ |

## 判断ルール

### Server / Client

- Server: データ取得・初期レンダリング・認証・静的処理
- Client: インタラクション・ブラウザ API・状態管理・Context
- `'use client'` は葉に寄せ、ツリー全体が Client にならないようにする

### データ取得

| ケース | 方法 |
|---|---|
| 初回表示で決まる | Server Component で fetch / GraphQL |
| 操作後に更新が必要 | TanStack Query + `useMutation` + `invalidateQueries` |
| 画面間で短時間共有 | TanStack Query（QueryCache） |
| マスタ系（変更頻度低） | Server Component + cache |

### 状態管理

| 種類 | 置き場 |
|---|---|
| サーバーデータ | TanStack Query |
| フォーム | React Hook Form |
| URL 状態 | `useSearchParams` ベースの hook |
| UI 状態（モーダル開閉等） | Zustand |
| 描画内部 | `useState` |

## Output Format

1. 目的（何を達成するか）
2. 配置判断（どこに置くか、理由）
3. Server / Client 境界
4. データ取得方法（Server or TanStack Query）
5. 状態管理（Zustand / RHF / URL / useState）
6. Suspense / Error Boundary の粒度
7. キャッシュ戦略（必要に応じて）

## 参照

- 詳細なディレクトリ構成・境界判断・キャッシュ戦略：[.agent/frontend-arch.md](../../../.agent/frontend-arch.md)
- コンポーネント設計：[.agent/components.md](../../../.agent/components.md)
- デザイン → コード翻訳：[.agent/design-to-code.md](../../../.agent/design-to-code.md)
- チェックリスト：[.agent/review.md](../../../.agent/review.md)
- 技術選定の背景：`tenpct/frontend-template` の TECHNICAL-DECISION.md / Framework.md
