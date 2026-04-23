---
name: component-architect
description: コンポーネントの責務分割、props/バリアント設計、置き場の判断（packages/ vs _components/）を扱う。コンポーネント分解や再利用境界を議論するときに発火。
user-invocable: false
metadata:
  tags: components, architecture, props, variants, composition, shadcn
---

# Component Architect Skill

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

## Process

1. **分解の判断**：責務・状態・データ取得境界で分ける
2. **置き場の決定**：
   - そのページ限定 → `src/app/{route}/_components/`
   - 2 アプリ以上で使う / プリミティブ → `packages/`
3. **Props 設計**：バリアントは CVA、必須最小、動詞命名のハンドラ
4. **Composition vs Props**：構造可変なら children / slot、固定なら props
5. **状態の定義**：default / hover / active / focus / focus-visible / disabled / loading / empty / error

## Output Format

1. コンポーネントの責務（1 文で）
2. 置き場の判断と理由
3. Props インタフェース（型定義）
4. バリアント設計（CVA の軸）
5. Composition / Slot 構造（必要な場合）
6. 状態の列挙
7. 依存するプリミティブ（Radix / shadcn）

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

## 参照

- 詳細な判断軸（配置・props・バリアント・Composition パターン）：[.agent/components.md](../../../.agent/components.md)
- コードへの翻訳：[.agent/design-to-code.md](../../../.agent/design-to-code.md)
- チェックリスト：[.agent/review.md](../../../.agent/review.md)

設計が決まったら `design-to-code` skill で実装へ、配置は `frontend-architecture` skill で確認。
