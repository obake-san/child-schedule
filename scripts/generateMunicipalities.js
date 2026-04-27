// 都道府県・市区町村データをGeolonia APIから取得し、PREFECTURES_MUNICIPALITIES形式で出力するスクリプト
import fs from 'fs';
import https from 'https';

const API_URL = 'https://geolonia.github.io/japanese-addresses/api/ja.json';

https.get(API_URL, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    // { "北海道": { "札幌市": {...}, ... }, ... }
    const result = {};
    for (const pref in json) {
      result[pref] = json[pref]; // 市区町村名の配列をそのまま格納
    }
    const output =
      '// 自動生成: 全市区町村データ\n' +
      'export const PREFECTURES_MUNICIPALITIES = ' +
      JSON.stringify(result, null, 2) + ';\n';
    fs.writeFileSync('./src/constants_municipalities_full.js', output, 'utf8');
    console.log('完了: src/constants_municipalities_full.js に市区町村名で出力しました');
  });
}).on('error', (err) => {
  console.error('API取得エラー:', err);
});
