import React from 'react';
import Header from '../components/Header';

export default function Terms() {
  return (
    <>
      <Header />
      <main className="guide-page unified-font" style={{ maxWidth: 700, margin: '64px auto 56px auto', padding: '24px 18px 32px 18px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(181,124,86,0.10),0 1.5px 6px rgba(0,0,0,0.06)', fontSize: '1.08rem', lineHeight: 1.8, color: '#5A3D28' }}>
        <h1 style={{ color: '#B57C56', fontSize: '1.5em', marginBottom: '0.7em' }}>利用規約</h1>
        <h2>第1条（適用）</h2>
        <p>本規約は、「楽々キッズかれんだぁ」（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。</p>
        <h2>第2条（禁止事項）</h2>
        <ul>
          <li>法令または公序良俗に違反する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>不正アクセスや情報改ざん等の行為</li>
          <li>他のユーザーや第三者の権利を侵害する行為</li>
        </ul>
        <h2>第3条（サービスの提供・変更・中断）</h2>
        <ul>
          <li>本サービスは、予告なく内容の変更・中断・終了を行う場合があります。</li>
          <li>サービスの利用により生じた損害について、運営者は一切の責任を負いません。</li>
        </ul>
        <h2>第4条（知的財産権）</h2>
        <p>本サービスに関する著作権・商標権等の知的財産権は、運営者または正当な権利者に帰属します。</p>
        <h2>第5条（免責事項）</h2>
        <ul>
          <li>本サービスの利用により生じた損害について、運営者は一切の責任を負いません。</li>
          <li>外部サービスへのリンク先でのトラブル等についても責任を負いません。</li>
        </ul>
        <h2>第6条（規約の変更）</h2>
        <p>本規約は、必要に応じて予告なく変更する場合があります。最新の内容は本ページでご確認ください。</p>
        <div style={{ marginTop: '2.5em', textAlign: 'right', fontSize: '0.95em', color: '#B57C56' }}>2026年4月27日 制定</div>
      </main>
    </>
  );
}
