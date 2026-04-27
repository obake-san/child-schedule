// 自治体別スケジュール定義
// 各自治体特有の手続き、健診時期、助成金情報を定義

export const localitySchedules = {
  // 東京都
  '東京都': {
    '中央区': {
      name: '中央区',
      customSchedules: [
        {
          months: 1,
          durationDays: 7,
          title: '中央区こんにちは赤ちゃん訪問',
          description: '生後2週間以降に保健師が訪問します。予約が必要です。',
          category: '健康診断',
          todos: ['保健センターに連絡', '訪問予約', '保健師の訪問'],
          supplies: ['母子健康手帳']
        }
      ]
    },
    '渋谷区': {
      name: '渋谷区',
      customSchedules: []
    }
  },
  // 大阪府
  '大阪府': {
    '大阪市': {
      name: '大阪市',
      customSchedules: [
        {
          months: 0,
          durationDays: 14,
          title: '大阪市出生届（24時間受付）',
          description: '大阪市内の各区役所で24時間受付。夜間・休日でも届け出可能。',
          category: '行政手続き',
          todos: ['最寄りの区役所に訪問', '出生届提出', '戸籍登録'],
          supplies: ['出生届', '出生証明書', '親の印鑑', '本人確認書類']
        }
      ]
    }
  },
  // 愛知県
  '愛知県': {
    '名古屋市': {
      name: '名古屋市',
      customSchedules: [
        {
          months: 0,
          durationDays: 30,
          title: '名古屋市新規出生届受付',
          description: '名古屋市では独自の出産祝い金制度があります。',
          category: '行政手続き',
          todos: ['区役所で出生届提出', '出産祝い金の手続き', '健康保険登録'],
          supplies: ['出生届', '出生証明書', '印鑑']
        }
      ]
    }
  },
  // 福岡県
  '福岡県': {
    '福岡市': {
      name: '福岡市',
      customSchedules: [
        {
          months: 1,
          durationDays: 30,
          title: '福岡市乳児家庭全戸訪問事業',
          description: '生後2週間〜3か月に保健福祉センターから訪問があります。',
          category: '健康診断',
          todos: ['保健福祉センターからの訪問連絡を待つ', '訪問時の健康相談'],
          supplies: ['母子健康手帳', '健康保険証']
        }
      ]
    }
  }
}

// 自治体からスケジュールを取得
export function getLocalSchedules(prefecture, municipality) {
  const prefectureMun = localitySchedules[prefecture]
  if (!prefectureMun) return []
  
  const municipalityData = prefectureMun[municipality]
  if (!municipalityData) return []
  
  return municipalityData.customSchedules || []
}

// すべての登録済み自治体を取得
export function getRegisteredMunicipalities() {
  const registered = {}
  Object.entries(localitySchedules).forEach(([prefecture, municipalities]) => {
    registered[prefecture] = Object.keys(municipalities)
  })
  return registered
}
