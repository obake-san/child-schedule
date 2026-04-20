# 子供のスケジュール管理アプリ

子どもの出生後の手続きやスケジュールを効率的に管理するアプリケーション。

## 🎯 主な機能

- **複数の子どもに対応**: 兄弟姉妹の管理が可能
- **自動スケジュール生成**: 出生日から自動計算
- **自治体別手続き**: 都道府県・市町村ごとの自動スケジュール
- **カレンダー表示**: 月別カレンダーで一目で確認
- **グループ共有**: URL で家族間でデータ共有
- **データエクスポート**: JSON 形式でバックアップ可能

## 📁 プロジェクト構造

```
src/
├── App.jsx                    # メインアプリケーション
├── main.jsx                   # エントリーポイント
├── index.css                  # グローバルスタイル
├── constants.js               # 定数（都道府県など）
├── firebase.js                # Firebase 設定・操作
│
├── components/
│   ├── ChildCalendar.jsx      # カレンダー表示コンポーネント
│   └── [その他コンポーネント]
│
├── hooks/
│   └── useAppState.js         # アプリケーション状態管理
│
├── lib/
│   ├── schedule.js            # スケジュール生成ロジック
│   └── localSchedules.js      # 自治体別スケジュール定義
│
└── utils/
    └── security.js            # セキュリティユーティリティ
```

## 🚀 クイックスタート

### インストール
```bash
npm install
```

### 開発サーバー起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

## 🔐 セキュリティ機能

- ✅ XSS 対策: 入力値のサニタイゼーション
- ✅ バリデーション: 厳格な入力検証
- ✅ CSP ヘッダー: Content Security Policy 設定
- ✅ Firebase セキュリティルール: アクセス制御

詳細は [SECURITY.md](./SECURITY.md) を参照

## 📋 API リファレンス

### Constants (`constants.js`)
- `PREFECTURES_MUNICIPALITIES`: 全都道府県と市町村
- `INITIAL_FORM`: フォーム初期値
- `STORAGE_KEY`: LocalStorage キー

### Hooks (`hooks/useAppState.js`)
- `useChildrenState()`: 子ども管理
- `useFormState()`: フォーム管理
- `useScheduleEditState()`: スケジュール編集
- `useUIState()`: UI 状態管理

### Functions (`lib/schedule.js`)
- `generateSchedule(child)`: 子どものスケジュール自動生成
- `generateMonthCalendar(year, month, schedule)`: カレンダー生成
- `isHoliday(year, month, day)`: 祝日判定

### Security (`utils/security.js`)
- `sanitizeInput(str)`: HTML エスケープ
- `validateLength(str, maxLength)`: 長さ検証
- `validateDate(date)`: 日付検証
- `validateUUID(groupId)`: UUID 検証

## 🗂️ ファイル別責務

| ファイル | 責務 |
|---------|------|
| App.jsx | UI ロジック・状態管理 |
| firebase.js | Firebase 通信 |
| schedule.js | スケジュール計算ロジック |
| localSchedules.js | 自治体別手続き定義 |
| security.js | 入力検証・サニタイゼーション |
| constants.js | アプリケーション定数 |

## 📚 データ構造

### Child オブジェクト
```javascript
{
  id: "uuid",                          // 子どもの ID
  name: "太郎",                        // 名前
  birthDate: "2026-04-19",            // 生年月日
  gender: "男",                       // 性別
  prefecture: "東京都",               // 都道府県
  municipality: "千代田区",           // 市町村
  selectedCategories: ["行政手続き"], // 表示カテゴリー
  customSchedules: [],                // ユーザー作成スケジュール
  excludedScheduleIds: [],            // 非表示スケジュール
  schedule: []                        // 生成されたスケジュール
}
```

### Schedule オブジェクト
```javascript
{
  id: "auto-0-出生届提出",
  title: "出生届提出",
  date: "2026-04-19",
  endDate: "2026-04-26",
  description: "出生後14日以内に提出",
  category: "行政手続き",
  todos: ["書類準備", "窓口提出"],
  supplies: ["出生証明書"]
}
```

## 🌍 環境変数

`.env.example` から `.env` を作成:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_DATABASE_URL=YOUR_DATABASE_URL
```

## 🧪 テスト

> テスト環境は未実装。Jest + React Testing Library で テストを追加予定

```bash
npm run test
```

## 📦 本番環境へのデプロイ

### Netlify
```bash
netlify deploy
```
→ netlify.toml に CSP ヘッダー設定が必要

### Vercel
```bash
vercel
```
→ vercel.json に CSP ヘッダー設定が必要

### Firebase Hosting
```bash
firebase deploy
```

詳細は [CSP_PRODUCTION.js](./docs/CSP_PRODUCTION.js) 参照

## 🐛 既知の問題

- [ ] カレンダー月末背景色が反映されていない（CSS キャッシュ問題）
- [ ] モバイル表示の最適化が不十分

## 🎨 カスタマイズ

### 新しいカテゴリーを追加
`schedule.js` の `scheduleTemplate` に追加

### 新しい自治体を追加
`localSchedules.js` に手続き定義を追加

### テーマ色を変更
`index.css` の CSS 変数を編集

## 📖 参考資料

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [OWASP Security Guidelines](https://owasp.org)

## 📄 ライセンス

MIT License

## 👥 貢献

プルリクエストを歓迎します。大きな変更の場合は、まず Issue を開いて変更内容を議論してください。

## 📞 サポート

問題が発生した場合：
1. [GitHub Issues](./issues) を確認
2. Issue を作成する場合は、詳細な説明とスクリーンショットを添付

## 🔄 更新履歴

- **v1.0.0** (2026-04-20)
  - ✅ セキュリティ強化
  - ✅ コード整理
  - ✅ ドキュメント完成
