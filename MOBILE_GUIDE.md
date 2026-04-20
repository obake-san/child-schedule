# モバイル・レスポンシブ対応ガイド

## 📱 実装内容

このアプリはモバイル（スマートフォン）・タブレット・デスクトップに完全対応しています。

### デバイス検出とUIの自動切り替え
```
モバイル   (< 640px)  → コンパクトレイアウト
タブレット  (640-1023px) → 2列グリッド
デスクトップ (≥ 1024px) → 3列グリッド
```

## 🎨 レスポンシブ機能

### 1. **自動レイアウト調整**
- モバイル: 1列 → 完全スタック表示
- タブレット: 2列 → バランス表示
- デスクトップ: 3列 → 効率的表示

### 2. **タッチ最適化**
- ボタン最小サイズ: 44-48px（iOS/Android 推奨）
- 入力フォント: 16px（iOS 自動ズーム防止）
- タッチアクティベーション対応

### 3. **モーダル最適化**
- モバイル: 95% 幅、フルスクリーン表示
- タブレット: 90% 幅
- デスクトップ: 標準表示

### 4. **カレンダー最適化**
- モバイル: レスポンシブフォント、タッチ操作対応
- スクロール対応: 縦向き完全対応

### 5. **ランドスケープ対応**
- 横向き表示時: 高さ制限、スクロール対応
- モーダル最大高さ: 80vh

## 📐 ブレークポイント

| デバイス | 幅 | CSS クラス |
|---------|-----|-----------|
| モバイル | < 640px | @media (max-width: 639px) |
| タブレット | 640-1023px | @media (min-width: 640px) |
| デスクトップ | ≥ 1024px | @media (min-width: 1024px) |
| 高解像度 | ≥ 1440px | @media (min-width: 1440px) |

## 🚀 使用方法

### ブラウザでテスト
1. デスクトップで開く
2. DevTools を開く（F12）
3. 「デバイスツールバーの切り替え」（Ctrl+Shift+M）
4. デバイスを選択してテスト

### デバイスタイプ判定
```javascript
// utils/responsive.js を使用
import { useDeviceType } from './utils/responsive'

function MyComponent() {
  const deviceType = useDeviceType() // 'mobile', 'tablet', 'desktop'
  
  if (deviceType === 'mobile') {
    return <MobileLayout />
  }
  return <DesktopLayout />
}
```

## 🔧 カスタマイズ

### ブレークポイント変更
`src/utils/responsive.js` の `getDeviceType()` を編集：
```javascript
export const getDeviceType = () => {
  const width = window.innerWidth
  if (width < 600) return 'mobile'      // 変更可能
  if (width < 900) return 'tablet'      // 変更可能
  return 'desktop'
}
```

### CSS メディアクエリ
`src/index.css` の `@media` ブロックを編集

## ✅ テスト済み環境

### メディアクエリ
- ✅ モバイル: 375px, 390px, 412px（iPhone, Android）
- ✅ タブレット: 768px, 810px, 1024px（iPad, Android Tablet）
- ✅ デスクトップ: 1280px, 1440px, 1920px（PC）

### ブラウザ
- ✅ Chrome/Edge（最新）
- ✅ Safari（iOS 12+）
- ✅ Firefox（最新）

### デバイス
- ✅ iPhone 12-15
- ✅ Google Pixel 4-8
- ✅ iPad（9.7"-12.9"）
- ✅ Windows/Mac PC

## 📊 パフォーマンス

- **初期読込**: 119 KB (gzip)
- **レイアウト計算**: デバウンス 150ms
- **リサイズ応答**: スムーズ

## 🎯 今後の改善

- [ ] オフライン対応（Service Worker）
- [ ] ダークモード対応
- [ ] アクセシビリティ強化（WCAG AA対応）
- [ ] PWA 化

## 📞 トラブルシューティング

### モバイルで文字が自動ズーム
**原因**: フォントサイズが小さすぎる
**解決**: `input { font-size: 16px; }` を確認

### ボタンが小さすぎてタップできない  
**原因**: ボタンサイズが 44px 未満
**解決**: `button { min-height: 44px; }` を確認

### CSS メディアクエリが効かない
**原因**: viewport メタタグが設定されていない
**解決**: `index.html` で `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` を確認
