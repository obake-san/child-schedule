// カテゴリの優先順序を定義
const CATEGORY_ORDER = [
  '手続き',
  '行政手続き',
  '準備',
  '健康診断',
  '予防接種',
  '保育園',
  '生活・成長',
  '教育・発達',
  '入学準備',
  '学校関連',
  '記念イベント',
  '行事'
]

const scheduleTemplate = [
  // ==================== 手続き（誕生後の最初の対応） ====================
  {
    months: 0,
    durationDays: 14,
    title: '出生届の提出',
    description: '生後14日以内に市区町村役場へ出生届を提出します。',
    category: '手続き',
    todos: [
      '市区町村役場で出生届の用紙をもらう',
      '医師の出生証明書を準備',
      '両親と立ち会い人の印鑑を用意',
      '出生届を提出'
    ],
    supplies: [
      '出生届用紙',
      '出生証明書',
      '両親の印鑑',
      '本人確認書類'
    ]
  },
  {
    months: 1,
    durationDays: 14,
    title: '母子健康手帳で健診を確認',
    description: '母子健康手帳に予防接種や健診の予定を記録し、必要書類を確認します。',
    category: '手続き',
    todos: [
      '母子健康手帳を確認',
      '1か月健診の予約',
      '予防接種スケジュールを記録',
      '健診時に持参する書類をまとめる'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '予防接種記録票'
    ]
  },
  {
    months: 24,
    durationDays: 14,
    title: '1歳半健診の準備',
    description: '1歳6か月健診の日時や持ち物を確認します。',
    category: '手続き',
    todos: [
      '1歳半健診の日時確認',
      '必要書類の準備',
      '健診前の健康確認',
      '発育・発達の記録整理'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      'タオル',
      '着替え'
    ]
  },
  
  // ==================== 行政手続き（役所・政府関連） ====================
  {
    months: 0,
    durationDays: 30,
    title: '児童手当の手続き',
    description: '出生後15日以内に役所で児童手当の手続きを行います。',
    category: '行政手続き',
    todos: [
      '市役所・区役所で児童手当申請書入手',
      '必要書類を集める',
      '申請書に記入',
      '手続き完了確認'
    ],
    supplies: [
      '出生証明書',
      '母子健康手帳',
      'マイナンバーカード',
      '健康保険証'
    ]
  },
  {
    months: 0,
    durationDays: 30,
    title: '健康保険の手続き',
    description: '出生届提出時に健康保険の手続きも同時に行います。',
    category: '行政手続き',
    todos: [
      '健康保険証を申請',
      '必要書類を準備',
      '健康保険加入完了確認',
      '証券を保管'
    ],
    supplies: [
      '出生証明書',
      '親の健康保険証',
      '本人確認書類'
    ]
  },
  {
    months: 1,
    durationDays: 30,
    title: 'マイナンバーカード取得',
    description: '出生後2週間～1ヶ月以内にマイナンバーカードを取得します。',
    category: '行政手続き',
    todos: [
      'マイナンバーカード申請書を入手',
      '申請書記入',
      '申請窓口へ提出',
      'カード受け取り（数週間後）'
    ],
    supplies: [
      '申請書',
      '出生証明書',
      '親のマイナンバーカード'
    ]
  },
  
  // ==================== 準備（育児用品・衣類） ====================
  {
    months: 2,
    durationDays: 30,
    title: '育児用品・衣服のサイズ確認',
    description: '成長にあわせて洋服やベビー用品を準備します。',
    category: '準備',
    todos: [
      '現在のベビー服サイズを確認',
      'オムツのサイズを確認',
      '成長に合わせた衣服を購入',
      'ベビー用品の在庫を確認'
    ],
    supplies: [
      'ベビー服（70-80サイズ）',
      'オムツ（新生児次サイズ）',
      'タオル・おくるみ',
      'ベビー用寝具'
    ]
  },
  
  // ==================== 健康診断（定期健診） ====================
  {
    months: 1,
    durationDays: 7,
    title: '1ヶ月健診',
    description: '生後1ヶ月の乳児健診を受けます。',
    category: '健康診断',
    todos: [
      '小児科に健診予約',
      '健診前に健康状態の確認',
      '質問事項をまとめる',
      '結果を母子手帳に記入'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      'タオル',
      'おむつ'
    ]
  },
  {
    months: 2,
    durationDays: 7,
    title: '2ヶ月健診',
    description: '生後2ヶ月の乳児健診を受けます。',
    category: '健康診断',
    todos: [
      '小児科に健診予約',
      '体重・身長を計測',
      '予防接種の予定確認',
      '育児相談'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証'
    ]
  },
  {
    months: 4,
    durationDays: 7,
    title: '4ヶ月健診',
    description: '生後4ヶ月の乳児健診を受けます。',
    category: '健康診断',
    todos: [
      '健診予約',
      '発育状況の確認',
      '予防接種予定の確認',
      '栄養・離乳食相談'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '身長計・体重計'
    ]
  },
  {
    months: 6,
    durationDays: 7,
    title: '6ヶ月健診',
    description: '生後6ヶ月の乳児健診を受けます。',
    category: '健康診断',
    todos: [
      '健診予約',
      '離乳食進捗確認',
      '歯が出ているかチェック',
      '発達状況の相談'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '離乳食の記録'
    ]
  },
  {
    months: 9,
    durationDays: 7,
    title: '9ヶ月健診',
    description: '生後9ヶ月の乳児健診を受けます。',
    category: '健康診断',
    todos: [
      '健診予約',
      '離乳食状況報告',
      '歯磨き相談',
      '予防接種の進捗確認'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証'
    ]
  },
  {
    months: 12,
    durationDays: 7,
    title: '1歳健診',
    description: '生後12ヶ月の乳児健診を受けます。',
    category: '健康診断',
    todos: [
      '健診予約',
      '1歳時点の発达確認',
      '予防接種の全スケジュール確認',
      'フォローアップ相談'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証'
    ]
  },
  {
    months: 18,
    durationDays: 7,
    title: '1歳6ヶ月健診',
    description: '1歳6ヶ月の幼児健診を受けます。',
    category: '健康診断',
    todos: [
      '健診予約',
      '言語発達の確認',
      '歯科検診',
      '発達スクリーニング受検'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '視力検査票'
    ]
  },
  {
    months: 24,
    durationDays: 7,
    title: '2歳健診',
    description: '2歳の幼児健診を受けます。',
    category: '健康診断',
    todos: [
      '健診予約',
      '行動観察',
      '歯科検診',
      '栄養相談'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証'
    ]
  },
  {
    months: 36,
    durationDays: 7,
    title: '3歳健診',
    description: '3歳の幼児健診を受けます。',
    category: '健康診断',
    todos: [
      '健診予約',
      '視力・聴力検査',
      '歯科検診',
      '言語発達の評価'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '視力検査票'
    ]
  },
  {
    months: 72,
    durationDays: 30,
    title: '就学時健診',
    description: '小学校入学前の健康診断を受けます。',
    category: '健康診断',
    todos: [
      '学校から健診通知受け取り',
      '健診日時確認',
      '事前問診票に記入',
      '健診当日の食事・睡眠確認'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '問診票',
      'ぞうきん等学用品'
    ]
  },
  
  // ==================== 予防接種 ====================
  {
    months: 3,
    durationDays: 14,
    title: '予防接種: BCG / ヒブ / 小児肺炎球菌',
    description: '生後3か月前後に接種するスケジュールを確認しましょう。',
    category: '予防接種',
    todos: [
      '小児科で予防接種スケジュール確認',
      'BCG接種の予約',
      'ヒブワクチン接種予約',
      '小児肺炎球菌ワクチン接種予約'
    ],
    supplies: [
      '健康保険証',
      '予防接種手帳',
      '母子健康手帳',
      '体温計'
    ]
  },
  {
    months: 6,
    durationDays: 14,
    title: '予防接種: 4種混合 / B型肝炎',
    description: '6か月頃に予定されるワクチン接種を確認します。',
    category: '予防接種',
    todos: [
      '4種混合ワクチン接種予約',
      'B型肝炎ワクチン接種予約',
      '接種前の健康確認',
      '接種後の経過観察スケジュール'
    ],
    supplies: [
      '健康保険証',
      '予防接種手帳',
      '母子健康手帳'
    ]
  },
  {
    months: 9,
    durationDays: 30,
    title: 'インフルエンザ予防接種',
    description: '毎年10月～12月頃にインフルエンザワクチンを接種します。',
    category: '予防接種',
    todos: [
      '予防接種の予約',
      '毎年の接種スケジュール確認',
      '事前に体調確認',
      '2回目の接種予約（初回の場合）'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '予防接種記録票'
    ]
  },
  {
    months: 12,
    durationDays: 14,
    title: '予防接種: 水痘ワクチン（1回目）',
    description: '1歳頃に水痘ワクチンの1回目を接種します。',
    category: '予防接種',
    todos: [
      '小児科に接種予約',
      '体調確認',
      '接種前の問診票記入',
      '接種後の経過観察'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '予防接種記録票'
    ]
  },
  {
    months: 12,
    durationDays: 14,
    title: '予防接種: MR（麻疹・風疹）ワクチン（1回目）',
    description: '1歳頃にMRワクチンの1回目を接種します。',
    category: '予防接種',
    todos: [
      '小児科に接種予約',
      '体調確認',
      '問診票記入',
      '接種後の経過観察スケジュール確認'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '予防接種記録票'
    ]
  },
  {
    months: 15,
    durationDays: 14,
    title: '予防接種: 水痘ワクチン（2回目）',
    description: '1歳3ヶ月頃に水痘ワクチンの2回目を接種します。',
    category: '予防接種',
    todos: [
      '小児科に接種予約',
      '1回目接種から間隔確認',
      '体調確認',
      '接種後の経過観察'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '予防接種記録票'
    ]
  },
  {
    months: 36,
    durationDays: 14,
    title: '予防接種: DT（ジフテリア・破傷風）ワクチン',
    description: '3歳頃にDTワクチンを接種します。',
    category: '予防接種',
    todos: [
      '小児科に接種予約',
      '定期予防接種スケジュール確認',
      '体調確認',
      '接種後の経過観察'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '予防接種記録票'
    ]
  },
  {
    months: 48,
    durationDays: 14,
    title: '予防接種: DT（ジフテリア・破傷風）ワクチン（2回目）',
    description: '4歳頃にDTワクチンの2回目を接種します。',
    category: '予防接種',
    todos: [
      '小児科に接種予約',
      '1回目接種から間隔確認',
      '体調確認',
      '小学校入学前に完了確認'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '予防接種記録票'
    ]
  },
  {
    months: 60,
    durationDays: 14,
    title: '予防接種: MR（麻疹・風疹）ワクチン（2回目）',
    description: '5-6歳頃にMRワクチンの2回目を接種します。',
    category: '予防接種',
    todos: [
      '小児科に接種予約',
      '1回目接種から間隔確認',
      '体調確認',
      '就学前に完了'
    ],
    supplies: [
      '母子健康手帳',
      '健康保険証',
      '予防接種記録票'
    ]
  },
  
  // ==================== 保育園 ====================
  {
    months: 12,
    durationDays: 60,
    title: '保育園入園情報を集める',
    description: '保育園の募集要項や入園申込のタイミングを調べましょう。',
    category: '保育園',
    todos: [
      '市区町村の保育園募集要項を確認',
      '希望地域の保育園リストアップ',
      '保育園の見学予定を相談',
      'オンライン説明会に参加'
    ],
    supplies: [
      '筆記用具',
      '保育園リスト作成用ノート',
      '地図・アクセス情報'
    ]
  },
  {
    months: 18,
    durationDays: 45,
    title: '保育園見学や入園相談',
    description: '地域の保育園を見学し、必要書類を準備します。',
    category: '保育園',
    todos: [
      '保育園見学の予約',
      '園見学時の質問リスト作成',
      '必要書類の確認',
      '入園願書の準備'
    ],
    supplies: [
      'カメラ・スマートフォン',
      '筆記用具',
      '入園願書',
      '家族構成表'
    ]
  },
  
  // ==================== 生活・成長 ====================
  {
    months: 5,
    durationDays: 30,
    title: '離乳食開始',
    description: '生後5-6ヶ月頃から離乳食を開始します。',
    category: '生活・成長',
    todos: [
      '小児科で離乳食開始のタイミング相談',
      '離乳食初期食の準備',
      'スプーン・食器の準備',
      '初日の様子を記録'
    ],
    supplies: [
      'ベビーフード',
      'プラスチック食器',
      'シリコンスプーン',
      'エプロン',
      '赤ちゃん用おせんべい'
    ]
  },
  {
    months: 12,
    durationDays: 30,
    title: '歯医者デビュー',
    description: '1歳前後で初めての歯医者に行きます。',
    category: '生活・成長',
    todos: [
      '小児歯科を探す',
      '予約を取る',
      '歯磨きの習慣づけ',
      '初診時の検査'
    ],
    supplies: [
      '健康保険証',
      '母子健康手帳',
      '子供用歯ブラシ',
      '子供用歯磨き粉'
    ]
  },
  {
    months: 24,
    durationDays: 60,
    title: 'おむつはずれ',
    description: '2-3歳頃におむつはずれのトレーニングを開始します。',
    category: '生活・成長',
    todos: [
      'おむつはずれのサイン確認',
      'トレーニングパンツ購入',
      '保育施設・家庭での連携確認',
      'ストレスのない進め方'
    ],
    supplies: [
      'トレーニングパンツ',
      'おまる・補助便座',
      'ステップ台',
      '報酬用シール帳'
    ]
  },
  {
    months: 24,
    durationDays: 60,
    title: 'トイレトレーニング',
    description: '2-3歳頃にトイレトレーニングを開始します。',
    category: '生活・成長',
    todos: [
      'トイレの使用方法を説明',
      'トレーニング用絵本購入',
      '自宅のトイレ環境を整備',
      '園や保育所との連携'
    ],
    supplies: [
      '補助便座',
      'ステップ台',
      'トイレットペーパー',
      'トレーニング用絵本'
    ]
  },
  {
    months: 36,
    durationDays: 30,
    title: '眼科検診',
    description: '3歳頃から視力検査を受けます。',
    category: '生活・成長',
    todos: [
      '眼科医を探す',
      '予約を取る',
      'C字視力表を使った検査',
      '眼鏡・コンタクト必要判定'
    ],
    supplies: [
      '健康保険証',
      '子供用メガネ（必要な場合）'
    ]
  },
  {
    months: 36,
    durationDays: 30,
    title: '習い事開始',
    description: '水泳、英語、音楽などの習い事を開始します。',
    category: '生活・成長'
  },
  
  // ==================== 教育・発達 ====================
  {
    months: 6,
    durationDays: 30,
    title: '育児相談',
    description: '地域の保健センターで育児に関する相談を行います。',
    category: '教育・発達',
    todos: [
      '保健センターの相談日程確認',
      '相談予約',
      '質問事項をまとめる',
      '育児の困りごとをメモ'
    ],
    supplies: [
      '母子健康手帳',
      '育児に関する質問リスト'
    ]
  },
  {
    months: 6,
    durationDays: 30,
    title: '早期教育プログラム',
    description: '親子教室やベビーマッサージなどの早期教育に参加します。',
    category: '教育・発達',
    todos: [
      '親子教室の情報を集める',
      'プログラムを選定',
      '登録・受講開始',
      'プログラムの進行状況を記録'
    ],
    supplies: [
      '着替え',
      'タオル',
      'おむつ',
      'スポーツウェア'
    ]
  },
  {
    months: 12,
    durationDays: 30,
    title: '発達相談',
    description: '子供の発達が気になる場合、専門機関に相談します。',
    category: '教育・発達',
    todos: [
      '発達相談の必要性判断',
      '相談機関を探す',
      '予約を取る',
      '発達記録を準備'
    ],
    supplies: [
      '母子健康手帳',
      '発達の記録',
      'ビデオ・写真（補足資料）'
    ]
  },
  {
    months: 24,
    durationDays: 30,
    title: '言語聴覚士相談',
    description: '言葉の発達が気になる場合、言語聴覚士に相談します。',
    category: '教育・発達',
    todos: [
      '言語聴覚士の相談予約',
      'お子さんの言語発達情報をまとめる',
      'ビデオ記録を準備',
      'アドバイスを受けてトレーニング'
    ],
    supplies: [
      '母子健康手帳',
      'ビデオ・音声記録',
      '発達記録ノート'
    ]
  },
  {
    months: 36,
    durationDays: 60,
    title: '幼稚園入園準備',
    description: '幼稚園の入園説明会、見学、願書提出を行います。',
    category: '教育・発達',
    todos: [
      '幼稚園の情報収集',
      '園の見学予約',
      '入園説明会への参加',
      '願書作成・提出'
    ],
    supplies: [
      'メモ帳・筆記用具',
      'カメラ',
      '願書用写真',
      '入園料・教材費'
    ]
  },
  
  // ==================== 入学準備（小学校） ====================
  {
    months: 48,
    durationDays: 30,
    title: '小学校準備（年長児）',
    description: '小学校入学に向けた準備期間。学習机やランドセルなどの準備を始めましょう。',
    category: '入学準備',
    todos: [
      'ランドセルの選定・購入',
      '学習机の準備',
      '上履き・体操着のサイズ確認',
      '通学路の確認'
    ],
    supplies: [
      'ランドセル',
      '学習机',
      '椅子',
      '学習道具'
    ]
  },
  {
    months: 72,
    durationDays: 60,
    title: '小学校入学準備',
    description: '小学校入学前の最終準備。制服や通学用品の準備、慣らし保育など。',
    category: '入学準備',
    todos: [
      '制服の採寸・購入',
      '上履き・体操着の購入',
      '教科書・ノート・筆記用具の準備',
      '登校班の打ち合わせ',
      '学校説明会への参加'
    ],
    supplies: [
      '制服上下',
      '上履き',
      '体操着',
      '帽子',
      '筆記用具',
      '名札'
    ]
  },
  
  // ==================== 学校関連 ====================
  {
    months: 71,
    durationDays: 30,
    title: '小学校入学説明会',
    description: '1月～2月頃に開催される入学説明会に参加します。',
    category: '学校関連'
  },
  {
    months: 71,
    durationDays: 30,
    title: '小学校見学',
    description: '入学前に小学校を見学します。',
    category: '学校関連'
  },
  {
    months: 72,
    durationDays: 30,
    title: '制服採寸・購入',
    description: '2月～3月に制服の採寸と購入を行います。',
    category: '学校関連'
  },
  {
    months: 72,
    durationDays: 14,
    title: '教科書配布',
    description: '3月下旬に教科書が配布されます。',
    category: '学校関連'
  },
  {
    months: 72,
    durationDays: 7,
    title: '小学校入学式',
    description: '4月上旬に小学校の入学式が行われます。',
    category: '学校関連'
  },
  
  // ==================== 行事・記念イベント ====================
  {
    months: 3,
    durationDays: 7,
    title: '100日祝い',
    description: '生後100日の成長をお祝いします。',
    category: '記念イベント',
    specialDays: 100
  },
  {
    months: 6,
    durationDays: 7,
    title: 'ハーフバースデー',
    description: '生後6ヶ月の記念日をお祝いします。',
    category: '記念イベント'
  },
  {
    months: 12,
    durationDays: 7,
    title: '初誕生日',
    description: '初めての誕生日をお祝いします。',
    category: '記念イベント'
  },
  {
    months: 36,
    durationDays: 30,
    title: '七五三（3歳）',
    description: '子供の健やかな成長を祝う伝統的な行事です。写真撮影や神社参拝の準備をしましょう。',
    category: '行事',
    todos: [
      '写真館の予約・撮影',
      '衣装のレンタル・購入',
      '神社参拝の予定確認',
      'お参り後の食事場所確保'
    ],
    supplies: [
      '七五三衣装',
      'ヴィザ・写真館会員カード',
      'お参り用の髪飾り',
      'ご祝儀袋'
    ]
  },
  {
    months: 60,
    durationDays: 30,
    title: '七五三（5歳）',
    description: '子供の健やかな成長を祝う伝統的な行事です。写真撮影や神社参拝の準備をしましょう。',
    category: '行事',
    todos: [
      '七五三写真撮影予約',
      '衣装の準備',
      '神社参拝の予定確認',
      '親戚への報告'
    ],
    supplies: [
      '七五三衣装',
      'ご祝儀',
      '髪飾り',
      'ヘアセット予約'
    ]
  },
  {
    months: 84,
    durationDays: 30,
    title: '七五三（7歳）',
    description: '子供の健やかな成長を祝う伝統的な行事です。写真撮影や神社参拝の準備をしましょう。',
    category: '行事',
    todos: [
      '帯または帯留めの選定',
      '髪型の相談',
      '写真館の予約',
      '神社でのお参り手配'
    ],
    supplies: [
      '七五三衣装',
      '帯・帯留め',
      'ご祝儀',
      '髪飾り'
    ]
  }
]

function addMonths(baseDate, months) {
  const date = new Date(baseDate.getTime())
  const month = date.getMonth() + months
  date.setMonth(month)

  if (date.getMonth() !== ((month % 12) + 12) % 12) {
    date.setDate(0)
  }

  return date
}

function addDays(baseDate, days) {
  const date = new Date(baseDate.getTime())
  date.setDate(date.getDate() + days)
  return date
}

export function generateSchedule(child) {
  const birthDate = new Date(child.birthDate)
  const genderLabel = child.gender === 'female' ? '女の子' : '男の子'

  const customEvent = {
    months: 2,
    durationDays: 30,
    title: `${genderLabel}の衣類・準備品を確認`,
    description: `${genderLabel}の成長にあわせて洋服やおでかけグッズを整えます。`,
    category: '準備'
  }

  let items = [...scheduleTemplate, customEvent]

  // 初節句イベントを追加
  const hasHatsuSekku = items.some(item => item.title.includes('初節句'))
  if (!hasHatsuSekku) {
    if (child.gender === 'female') {
      // 女の子：ひな祭り（3月3日）
      const hatsusekku = new Date(birthDate.getFullYear(), 2, 3) // 3月3日
      if (hatsusekku >= birthDate) {
        items.push({
          id: 'auto-hatsusekku-female',
          months: -1,
          durationDays: 7,
          title: '初節句（ひな祭り）',
          description: '女の子の初めてのひな祭りをお祝いします。',
          category: '記念イベント',
          specialDate: hatsusekku.toISOString().slice(0, 10)
        })
      } else {
        // 翌年の3月3日
        const nextyear = new Date(birthDate.getFullYear() + 1, 2, 3)
        items.push({
          id: 'auto-hatsusekku-female',
          months: -1,
          durationDays: 7,
          title: '初節句（ひな祭り）',
          description: '女の子の初めてのひな祭りをお祝いします。',
          category: '記念イベント',
          specialDate: nextyear.toISOString().slice(0, 10)
        })
      }
    } else {
      // 男の子：こどもの日（5月5日）
      const hatsusekku = new Date(birthDate.getFullYear(), 4, 5) // 5月5日
      if (hatsusekku >= birthDate) {
        items.push({
          id: 'auto-hatsusekku-male',
          months: -1,
          durationDays: 7,
          title: '初節句（こどもの日）',
          description: '男の子の初めてのこどもの日をお祝いします。',
          category: '記念イベント',
          specialDate: hatsusekku.toISOString().slice(0, 10)
        })
      } else {
        // 翌年の5月5日
        const nextyear = new Date(birthDate.getFullYear() + 1, 4, 5)
        items.push({
          id: 'auto-hatsusekku-male',
          months: -1,
          durationDays: 7,
          title: '初節句（こどもの日）',
          description: '男の子の初めてのこどもの日をお祝いします。',
          category: '記念イベント',
          specialDate: nextyear.toISOString().slice(0, 10)
        })
      }
    }
  }

  // 保育園申請スケジュール（生年月日の年 + 2年の4月入園を想定）
  const entranceYear = birthDate.getFullYear() + 2
  const applicationStartDate = new Date(entranceYear - 1, 8, 1) // 前年9月1日
  const applicationEndDate = new Date(entranceYear - 1, 10, 30) // 前年11月30日
  const resultDate = new Date(entranceYear - 1, 11, 1) // 前年12月1日
  const entranceDate = new Date(entranceYear, 3, 1) // 4月1日

  items.push({
    id: 'auto-daycare-application-start',
    months: -1,
    durationDays: 90,
    title: `保育園申請期間（${applicationStartDate.getFullYear()}年度入園）`,
    description: `${entranceYear}年4月入園の申請期間です。市区町村の保育課で申請手続きを行いましょう。`,
    category: '保育園',
    specialDate: applicationStartDate.toISOString().slice(0, 10),
    specialEndDate: applicationEndDate.toISOString().slice(0, 10),
    todos: [
      '保育園入園申請書を入手',
      '必要書類を準備（住民票、親の就業証明など）',
      '希望園を選択・優先順位を決定',
      '市区町村保育課に申請提出'
    ],
    supplies: [
      '入園申請書',
      '住民票',
      '親の就業証明書',
      '健康診断書',
      'マイナンバーカード'
    ]
  })

  items.push({
    id: 'auto-daycare-result',
    months: -1,
    durationDays: 30,
    title: `保育園入園結果発表（${entranceYear}年度）`,
    description: `${entranceYear}年4月入園の結果が発表されます。`,
    category: '保育園',
    specialDate: resultDate.toISOString().slice(0, 10),
    todos: [
      '結果確認',
      '入園決定通知書を受け取る',
      '不承諾時は再申請検討',
      '承諾時は次のステップを確認'
    ]
  })

  items.push({
    id: 'auto-daycare-entrance-prep',
    months: -1,
    durationDays: 90,
    title: `保育園入園準備（${entranceYear}年度）`,
    description: `${entranceYear}年4月入園に向けた準備を進めます。`,
    category: '保育園',
    specialDate: new Date(entranceYear - 1, 11, 15).toISOString().slice(0, 10),
    todos: [
      '園からの入園手続き書類を整理',
      '昼寝布団などの用品手配',
      '通園バッグ・着替え準備',
      '園での慣らし保育スケジュール確認',
      '予防接種やアレルギー対応の事前報告'
    ],
    supplies: [
      '昼寝布団（敷布団・掛布団）',
      'タオル・ハンカチ',
      '通園バッグ',
      'お弁当箱・水筒',
      '着替え（下着・靴下・上下衣類）'
    ]
  })

  // カテゴリフィルタリング
  if (child.selectedCategories && child.selectedCategories.length > 0) {
    items = items.filter(item => child.selectedCategories.includes(item.category))
  }

  items = items.map((item) => {
    let startDate, endDate
    
    // specialDays（100日など）プロパティがある場合
    if (item.specialDays) {
      startDate = addDays(birthDate, item.specialDays - 1)
      endDate = addDays(startDate, item.durationDays - 1)
    }
    // specialDate（初節句など）がある場合
    else if (item.specialDate) {
      startDate = new Date(item.specialDate)
      // specialEndDateがあればそれを使う、なければdurationDaysで計算
      if (item.specialEndDate) {
        endDate = new Date(item.specialEndDate)
      } else {
        endDate = addDays(startDate, item.durationDays - 1)
      }
    }
    // 通常の月数ベース
    else {
      startDate = addMonths(birthDate, item.months)
      endDate = addDays(startDate, item.durationDays - 1)
    }

    return {
      id: item.id || `auto-${item.months}-${item.title.replace(/\s+/g, '-').toLowerCase()}`,
      ...item,
      title: item.title,
      date: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      _startDate: startDate  // ソート用に保持
    }
  })
  
  // 過去のスケジュールは除外（本日以降のみ）
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  items = items.filter(item => item._startDate >= today)
  
  // _startDateプロパティを削除
  items = items.map(({ _startDate, ...rest }) => rest)

  return items
}

export function groupScheduleByMonth(schedule) {
  const allDates = new Set()
  schedule.forEach((item) => {
    const start = new Date(item.date)
    const end = new Date(item.endDate)
    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
      allDates.add(current.toISOString().slice(0, 7))
    }
  })

  const monthKeys = Array.from(allDates).sort()

  return monthKeys.map((monthKey) => {
    const [year, month] = monthKey.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month - 1, daysInMonth)

    const events = schedule
      .map((item) => {
        const start = new Date(item.date)
        const end = new Date(item.endDate)
        if (end < monthStart || start > monthEnd) {
          return null
        }

        const startDay = start < monthStart ? 1 : start.getDate()
        const endDay = end > monthEnd ? daysInMonth : end.getDate()

        return {
          ...item,
          startDay,
          endDay
        }
      })
      .filter(Boolean)

    return {
      year,
      month,
      daysInMonth,
      firstWeekday: firstDay.getDay(),
      events
    }
  })
}

export function groupScheduleByWeek(schedule) {
  const monthData = groupScheduleByMonth(schedule)
  const weeks = []

  monthData.forEach(({ year, month, daysInMonth, firstWeekday, events }) => {
    let currentDay = 1
    let weekNumber = 0

    // 最初の週（月初が日曜日でない場合は前月の日を含める）
    while (currentDay <= daysInMonth) {
      const weekStart = currentDay
      const daysInWeek = 7 - (weekNumber === 0 ? firstWeekday : 0)
      const weekEnd = Math.min(currentDay + daysInWeek - 1, daysInMonth)

      const weekEvents = events.filter((event) => {
        return !(event.endDay < weekStart || event.startDay > weekEnd)
      })

      weeks.push({
        year,
        month,
        daysInMonth,
        firstWeekday: weekNumber === 0 ? firstWeekday : 0,
        weekStart,
        weekEnd,
        daysInWeek: weekEnd - weekStart + 1,
        events: weekEvents
      })

      currentDay = weekEnd + 1
      weekNumber++
    }
  })

  return weeks
}

export function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function calculateAge(birthDateStr) {
  const birthDate = new Date(birthDateStr)
  const today = new Date()
  
  if (Number.isNaN(birthDate.getTime())) {
    return ''
  }
  
  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()
  
  // 月がマイナスの場合は年から1引いて月に12を足す
  if (months < 0) {
    years--
    months += 12
  }
  
  // 日付がまだ来ていない場合は月から1引く
  if (today.getDate() < birthDate.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }
  
  return `${years}歳${months}ヶ月`
}

export function formatRange(start, end) {
  if (start === end) {
    return formatDate(start)
  }
  return `${formatDate(start)} 〜 ${formatDate(end)}`
}

function getNthWeekday(year, month, weekday, n) {
  const firstDay = new Date(year, month - 1, 1)
  const firstWeekday = firstDay.getDay()
  const offset = (weekday - firstWeekday + 7) % 7
  return 1 + offset + (n - 1) * 7
}

function getSpringEquinox(year) {
  // 春分の日計算（近似式）
  const springEquinox = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
  return springEquinox
}

function getAutumnEquinox(year) {
  // 秋分の日計算（近似式）
  const autumnEquinox = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
  return autumnEquinox
}

export function isHoliday(year, month, day) {
  const date = new Date(year, month - 1, day)
  const weekday = date.getDay()

  // 土日
  if (weekday === 0 || weekday === 6) return true

  // 固定祝日
  const fixedHolidays = {
    '1-1': '元日',
    '2-11': '建国記念の日',
    '2-23': '天皇誕生日',
    '4-29': '昭和の日',
    '5-3': '憲法記念日',
    '5-4': 'みどりの日',
    '5-5': 'こどもの日',
    '8-11': '山の日',
    '11-3': '文化の日',
    '11-23': '勤労感謝の日'
  }

  const key = `${month}-${day}`
  if (fixedHolidays[key]) return true

  // ハッピーマンデー
  const happyMondays = {
    '1-2': '成人の日', // 1月の第2月曜日
    '7-3': '海の日',   // 7月の第3月曜日
    '9-3': '敬老の日', // 9月の第3月曜日
    '10-2': '体育の日' // 10月の第2月曜日
  }

  if (happyMondays[key]) {
    const expectedDay = getNthWeekday(year, month, 1, parseInt(key.split('-')[1]))
    return day === expectedDay
  }

  // 春分の日・秋分の日
  if (month === 3 && day === getSpringEquinox(year)) return true
  if (month === 9 && day === getAutumnEquinox(year)) return true

  return false
}

export function getCategoryIndex(category) {
  const index = CATEGORY_ORDER.indexOf(category)
  return index === -1 ? CATEGORY_ORDER.length : index
}

export function getAvailableCategories() {
  const categories = new Set()
  scheduleTemplate.forEach(item => {
    categories.add(item.category)
  })
  return CATEGORY_ORDER.filter(category => categories.has(category))
}

export function generateMonthCalendar(year, month, schedule) {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = firstDay.getDay()
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month - 1, daysInMonth, 23, 59, 59, 999)

  // イベントをフィルタリング
  const events = schedule
    .map((item) => {
      const start = new Date(item.date)
      const end = new Date(item.endDate)
      end.setHours(23, 59, 59, 999) // 終了日の終わりまでを対象にする
      
      if (end < monthStart || start > monthEnd) {
        return null
      }

      const startDay = start < monthStart ? 1 : start.getDate()
      // 異月の場合は適切に処理
      let endDay
      if (end > monthEnd) {
        endDay = daysInMonth
      } else if (end.getMonth() !== month - 1) {
        // 異月の場合、その月の最後の日を使用
        endDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate()
      } else {
        endDay = end.getDate()
      }

      return {
        ...item,
        startDay,
        endDay
      }
    })
    .filter(Boolean)

  // 週を生成
  const weeks = []
  let currentDay = 1
  let weekNumber = 0

  while (currentDay <= daysInMonth) {
    const weekStart = currentDay
    const daysInWeek = 7 - (weekNumber === 0 ? firstWeekday : 0)
    const weekEnd = Math.min(currentDay + daysInWeek - 1, daysInMonth)

    const weekEvents = events.filter((event) => {
      return !(event.endDay < weekStart || event.startDay > weekEnd)
    })

    weeks.push({
      year,
      month,
      daysInMonth,
      firstWeekday: weekNumber === 0 ? firstWeekday : 0,
      weekStart,
      weekEnd,
      daysInWeek: weekEnd - weekStart + 1,
      events: weekEvents
    })

    currentDay = weekEnd + 1
    weekNumber++
  }

  return {
    year,
    month,
    weeks
  }
}

