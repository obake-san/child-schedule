# コード整理ガイド - 子供のスケジュール管理アプリ

## 📋 プロジェクト構造

```
src/
├── App.jsx                     # メインコンポーネント（1528行）
├── index.css                   # グローバルスタイル
├── main.jsx                    # エントリーポイント
├── firebase.js                 # Firebase 初期化・通信
├── constants.js                # 定数定義（都道府県、初期値）
├── hooks/
│   └── useAppState.js         # カスタムフック群
│       ├── useChildrenState()         # 子ども管理状態
│       ├── useFormState()             # フォーム管理状態
│       ├── useScheduleEditState()     # スケジュール編集状態
│       └── useUIState()               # UI状態管理
├── lib/
│   ├── schedule.js            # スケジュール生成ロジック
│   └── localSchedules.js      # 自治体別スケジュール
├── utils/
│   ├── security.js            # セキュリティ関連
│   │   ├── sanitizeInput()
│   │   ├── validateLength()
│   │   └── validateDate()等
│   ├── handlers.js            # NEW - ハンドラー関数分割
│   │   ├── createNewChild()
│   │   ├── validateChildEdit()
│   │   ├── createNewSchedule()
│   │   └── 他ハンドラー
│   ├── calendar.js            # NEW - カレンダーエクスポート
│   │   └── downloadCalendarFile()
│   ├── importExport.js        # NEW - データ import/export
│   │   └── importDataFromFile()
│   └── responsive.js          # NEW - レスポンシブ検出
│       ├── useDeviceType()           # デバイスタイプ判定フック
│       ├── getDeviceType()           # ブレークポイント判定
│       └── isTouchDevice()などのユーティリティ
└── components/                # 将来のコンポーネント分割用
```

## 🎯 実施された整理内容

### ✅ 第1段階：定数と状態の整理
- **constants.js**: PREFECTURES_MUNICIPALITIES, INITIAL_FORM等を集約
- **useAppState.js**: 28個の useState を4つのカスタムフックに統合

### ✅ 第2段階：ビジネスロジックの分割
- **utils/handlers.js**: 
  - App.jsx から 児童・スケジュール関連のハンドラー抽出
  - validateChildEdit, createNewSchedule 等を独立関数化
  
- **utils/calendar.js**:
  - Google Calendar互換の ICS ファイル生成
  - generateIcsContent(), downloadCalendarFile()
  
- **utils/importExport.js**:
  - JSON データのインポート/エクスポート機能
  - importDataFromFile(), validateImportedData()

### ✅ 第3段階：セキュリティ
- **utils/security.js**: XSS対策、入力検証
- **firebase.rules**: Firebaseセキュリティルール

## 🚀 今後の改善ポイント

### コンポーネント分割（推奨）
```jsx
// 提案される分割:
<App/> 
├── <ChildrenList/>       # 児童一覧表示
├── <ChildForm/>          # 児童追加/編集フォーム
├── <ScheduleCalendar/>   # カレンダー表示
├── <ScheduleForm/>       # スケジュール追加フォーム
├── <ScheduleList/>       # スケジュール一覧
├── <ScheduleDetail/>     # スケジュール詳細表示
└── <ShareModal/>         # データ共有モーダル
```

### 状態管理の深掘り（Context API推奨）
- Redux 導入を検討
- または Context API + useReducer で複雑な状態を管理

### パフォーマンス最適化
- React.memo() の活用
- useCallback, useMemo の活用
- 仮想リスト（大量データ表示時）

### テストの追加
- Jest + React Testing Library
- ハンドラー関数のユニットテスト
- コンポーネントのインテグレーションテスト

## 📝 使用例：App.jsx でのハンドラー活用

```jsx
import { createNewChild, validateChildEdit } from './utils/handlers'
import { downloadCalendarFile } from './utils/calendar'
import { importDataFromFile } from './utils/importExport'

// スケジュール保存
const saveNewSchedule = () => {
  const result = validateScheduleForm(addScheduleForm, selectedChildrenForSchedule)
  if (result.error) {
    setError(result.error)
    return
  }
  // ... 処理続行
}

// カレンダーエクスポート
const handleExportCalendar = () => {
  downloadCalendarFile(summary, children)
}

// データインポート
const handleImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    const data = await importDataFromFile(file)
    setChildren(data.children)
    setForm(data.form)
  } catch (error) {
    alert(error.message)
  }
}
```

## 🔍 動作確認チェックリスト

- [ ] 児童の追加・編集・削除が正常に動作
- [ ] スケジュール表示が正常に動作
- [ ] カレンダーエクスポートが正常に動作
- [ ] データインポート/エクスポートが正常に動作
- [ ] Firebase 同期が正常に動作
- [ ] XSS 対策が有効に動作
- [ ] ブラウザのコンソールにエラーなし

## � レスポンシブ対応

### 実装されたデバイス対応
```
モバイル   (< 640px)  → 1列レイアウト、タッチ最適化
タブレット (640-1023px) → 2列グリッド
デスクトップ (≥ 1024px) → 3列グリッド
```

### 実装ファイル
- **src/utils/responsive.js**: デバイス検出、レスポンシブフック
- **src/index.css**: メディアクエリとレスポンシブスタイル
  - モバイル: @media (max-width: 639px)
  - タブレット: @media (640px-1023px)
  - デスクトップ: @media (min-width: 1024px)

### デバイス検出の使用
```jsx
import { useDeviceType } from './utils/responsive'

function MyComponent() {
  const deviceType = useDeviceType() // 'mobile', 'tablet', 'desktop'
  
  return (
    <div className={`layout-${deviceType}`}>
      {deviceType === 'mobile' && <MobileView />}
      {deviceType !== 'mobile' && <DesktopView />}
    </div>
  )
}
```

### タッチ最適化対応
- ✅ ボタン最小サイズ: 44-48px（iOS/Android 推奨）
- ✅ フォント: 16px（iOS 自動ズーム防止）
- ✅ モーダル: レスポンシブ幅調整
- ✅ グリッド: デバイスに応じた列数自動調整

### テスト方法
DevTools > デバイスツールバーの切り替え（Ctrl+Shift+M）で複数デバイスでエミュレートテスト可能

詳細は [RESPONSIVE_TEST.md](RESPONSIVE_TEST.md) を参照

## 📚 参考資料

- [Firebase セキュリティルール](firebase.rules)
- [セキュリティ実装ガイド](SECURITY.md)
- [プロジェクト概要](README.md)
- [モバイル対応ガイド](MOBILE_GUIDE.md)
- [レスポンシブテストガイド](RESPONSIVE_TEST.md)
