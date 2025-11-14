# Stone Engine Web - MVP

stone_engineのWeb版MVP実装です。横書き日本語テキストの基本的なレンダリングを実現します。

## 🎯 MVP機能

- ✅ 横書き (LrTb) レイアウト
- ✅ 日本語・Latin・Emojiの文字種別フォント選択
- ✅ Canvas 2D APIによる描画
- ✅ 自動改行処理
- ✅ Unicode Script分類

## 🚀 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開くと、デモページが表示されます。

## 🏗️ ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

## 📦 プロジェクト構成

```
stone-engine-web/
├── src/
│   ├── core/           # データモデル (Types, Context)
│   ├── font/           # フォント管理
│   ├── parser/         # テキスト→Run変換
│   ├── layout/         # レイアウトエンジン
│   ├── renderer/       # Canvas描画
│   ├── utils/          # ユーティリティ
│   ├── index.ts        # エントリーポイント
│   └── main.ts         # デモアプリ
├── index.html          # デモページ
└── package.json
```

## 💻 基本的な使い方

```typescript
import { createLabel } from './index';

const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;

createLabel(canvas, '吾輩は猫である。名前はまだ無い。', {
  fontSize: 18,
  lineHeight: 1.8,
});
```

## 📋 次のステップ (Phase 1)

- [ ] 縦書き (TbRl) レイアウト
- [ ] 禁則処理
- [ ] 約物処理 (whole/half/stone)
- [ ] 縦中横
- [ ] HarfBuzz統合の検討

詳細は [`WEB_MIGRATION_PLAN.md`](../WEB_MIGRATION_PLAN.md) を参照してください。

## 📄 ライセンス

MIT License - Nihon Design Center
