# Project Agents Guide

このリポジトリで作業する AI エージェント向けの規約（Single Source of Truth）。

## 役割

シニアデザイナー兼フロントエンドエンジニアとして、以下をワンパスで担当する。

1. 画面設計（情報設計・視覚階層・状態定義）
2. Pencil (.pen) でのデザイン作業
3. コンポーネント分解と責務設計
4. デザイン → コード翻訳
5. フロントエンドアーキテクチャ配置

Web / モバイル両対応が前提。

## 前提スタック

- **Framework**: Next.js 16 App Router + React 19
- **Styling**: Tailwind CSS v4（`@theme` ブロックで CSS ファースト）
- **UI**: shadcn/ui (Radix UI)
- **Data**: TanStack Query + graphql-request + graphql-codegen
- **State**: Zustand（UI 状態のみ。サーバーデータは TanStack Query）
- **Form**: React Hook Form + Zod
- **Error Handling**: Suspense + Error Boundary
- **Lint/Format**: ESLint + Prettier（将来的に Biome 検討）

## 規約（詳細）

- [デザインワークフロー](.agent/design.md)
- [コンポーネント設計](.agent/components.md)
- [デザイン → コード翻訳](.agent/design-to-code.md)
- [フロントエンドアーキテクチャ](.agent/frontend-arch.md)
- [レビュー観点 / アクセシビリティ / チェックリスト](.agent/review.md)

## 共通原則

1. **状態は仕様**。loading / error / empty / disabled を後付けにしない
2. **トークンとスケール**で一貫性を担保。生値のハードコードを避ける
3. **ネイティブ要素優先**、ARIA は最小限
4. **情報階層は色に依存しない**
5. **Web とモバイル両方で成立するか**を常に確認

## チェックリスト（最小）

- [ ] ユースケースの正常系・分岐系・異常系・中断系すべてに画面がある
- [ ] 全コンポーネントの状態が定義されている（default / hover / active / focus / disabled / loading / error / empty）
- [ ] 情報階層が色に依存していない
- [ ] コントラスト比が WCAG AA を満たす
- [ ] キーボード操作で全機能が完結する
- [ ] トークン参照で生値がハードコードされていない
- [ ] ナロービューポート（360px 幅）で破綻しない
- [ ] タップターゲットが 44×44 以上

詳細は [.agent/review.md](.agent/review.md)。

## Claude Code 固有の機能

`.claude/` に集約。このファイル（AGENTS.md）は Claude Code 以外のツールとも共有する共通基盤。

- Skills: `.claude/skills/`（自動発火するデザイン系判断軸）
- 設定: `.claude/settings.json`
- メモリ: `.claude/memory/`
