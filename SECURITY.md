# セキュリティ対策ドキュメント

## 実装済みのセキュリティ対策

### 1. フロント側（XSS 対策）

#### 入力値のサニタイゼーション
- `sanitizeInput()` - HTML エスケープ
- `sanitizeObject()` - オブジェクト内の全文字列をエスケープ
- スケジュールのタイトル、説明、TODOなどすべてのテキスト入力に適用

#### 入力値のバリデーション
- `validateLength()` - 文字列長の検証（最大制限）
- `validateDate()` - 日付形式（YYYY-MM-DD）の検証
- `validateUUID()` - UUID形式の検証

#### 使用例：
```javascript
import { sanitizeInput, validateLength } from './utils/security'

// 入力のサニタイゼーション
const safeName = sanitizeInput(userInput)

// バリデーション
if (!validateLength(userInput, 100)) {
  setError('100文字以下で入力してください')
}
```

### 2. セキュリティヘッダー（CSP）

#### index.html に実装
```html
<meta http-equiv="Content-Security-Policy" content="...">
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="X-Frame-Options" content="DENY" />
```

#### 効果：
- XSS 防止
- クリックジャッキング・フレーミング攻撃防止
- MIME タイプ嗅ぎ防止

### 3. Firebase セキュリティルール

#### firebase.rules に実装
```json
{
  "rules": {
    "groups": {
      "$groupId": {
        ".read": "ユーザーが $groupId に関連付けられている場合のみ読み取り可能",
        ".write": "同上",
        ".validate": "必須フィールドが存在する場合のみ書き込み可能"
      }
    }
  }
}
```

#### 保護項目：
- グループの読み書きアクセス制限
- 子どもの名前、生年月日などの検証
- 不正なデータ構造の拒否

### 4. バリデーション強化

#### チェック項目：
- 名前：1-100文字
- 生年月日：YYYY-MM-DD形式
- タイトル：1-200文字
- 都道府県：1-50文字
- 市町村：1-100文字

#### 実装位置：
- `handleSubmit()` - 新規作成時
- `saveChildEdit()` - 編集時
- `saveScheduleEdit()` - スケジュール編集時

### 5. トークン管理

#### セッションストレージ使用
```javascript
import { storeSecureToken, getSecureToken } from './utils/security'

// トークン保存
storeSecureToken('firebase_token', token)

// トークン取得
const token = getSecureToken('firebase_token')
```

#### 特徴：
- ブラウザを閉じるとクリア
- XSS 対策で JavaScript からのアクセスから保護

### 6. データ暗号化

#### LocalStorage
- 機密な個人情報は暗号化して保存推奨
- 現在：生年月日などは平文で保存
- 今後の改善項目

#### Firebase
- Firestore/Realtime Database は HTTPS で暗号化可能
- セキュリティルール適用で追加保護

## データ管理

### データ保持について
データは1年間保存されます。その後は自動で削除されるので、使わなくなったら『スケジュールデータをダウンロード』で記録を残しておくことをお勧めします。

## セキュリティベストプラクティス

### ✅ 実装すべき項目
1. ✅ 入力値のサニタイゼーション
2. ✅ バリデーション
3. ✅ CSP ヘッダー
4. ✅ Firebase セキュリティルール
5. ✅ HTTPS（本番環境）

### 🔄 定期的にチェック
- [ ] Firebase セキュリティルール監査月1回
- [ ] 依存ライブラリのセキュリティ更新（月1回）
- [ ] OWASP Top 10 の確認（四半期1回）

### 🚀 本番環境へのデプロイ時
1. .env ファイルが .gitignore に含まれているか確認
2. Firebase セキュリティルールが有効になっているか確認
3. HTTPS が有効になっているか確認
4. CSP ヘッダーが設定されているか確認
5. 環境変数が正しく設定されているか確認

## セキュリティルールのデプロイ方法

### Firebase CLI を使用
```bash
# Firebase ログイン
firebase login

# ルールの確認
firebase rules:list

# ルールのデプロイ
firebase deploy --only database:rules
```

### Firebase Console から
1. Firebase Console を開く
2. Realtime Database → ルール タブ
3. firebase.rules の内容をコピー＆ペースト
4. 公開ボタンをクリック

## よくある脆弱性と対策

### SQL インジェクション
- **対象外**：NoSQL（Firebase）を使用
- **関連攻撃**：NoSQL インジェクション
- **対策**：入力値のバリデーション ✅

### XSS（クロスサイトスクリプティング）
- **対策実装**：
  - 入力値の HTML エスケープ ✅
  - CSP ヘッダー ✅
  - React の自動エスケープ（JSX）✅

### CSRF（クロスサイトリクエスト偽造）
- **Firebase の場合**：CSRF トークン不要
- **理由**：認証ベースのセキュリティ
- **実装**：Firebase Auth + セキュリティルール ✅

### クリックジャッキング
- **対策**：X-Frame-Options: DENY ✅

### 情報公開
- **対策**：エラーメッセージを一般的に ✅
- **例**：「入力エラー」（詳細を隠す）

## リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## サポート

セキュリティに関する質問や問題がある場合は:
1. GitHub Issues を作成
2. セキュリティ監査の依頼
3. ペネトレーションテストの実施
