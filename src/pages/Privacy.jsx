import React from 'react';
import Header from '../components/Header';

export default function Privacy() {
  return (
    <>
      <Header />
      <main className="guide-page unified-font" style={{ maxWidth: 700, margin: '64px auto 56px auto', padding: '24px 18px 32px 18px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(181,124,86,0.10),0 1.5px 6px rgba(0,0,0,0.06)', fontSize: '1.08rem', lineHeight: 1.8, color: '#5A3D28' }}>
        <h1 style={{ color: '#B57C56', fontSize: '1.5em', marginBottom: '0.7em' }}>プライバシーポリシー</h1>
        <p>「楽々キッズかれんだぁ」（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーは、本サービスにおける個人情報の取扱いについて定めるものです。</p>
        <h2>1. 取得する情報</h2>
        <ul>
          <li>本サービスは、ユーザーが入力した子ども情報やスケジュール情報など、サービス利用に必要な情報のみを取得します。</li>
          <li>Googleアカウント等による個人認証情報は取得・保存しません。</li>
          <li>アクセス解析のため、Google Analytics等のツールを利用する場合がありますが、個人を特定できる情報は取得しません。</li>
        </ul>
        <h2>2. 情報の利用目的</h2>
        <ul>
          <li>サービス提供・利便性向上のため</li>
          <li>不正利用防止・セキュリティ確保のため</li>
          <li>サービス改善・新機能開発のための統計的分析</li>
        </ul>
        <h2>3. 情報の管理・第三者提供</h2>
        <ul>
          <li>取得した情報は適切に管理し、法令等に基づく場合を除き、第三者に提供しません。</li>
          <li>Firebase等のクラウドサービスを利用する場合、サービス提供元のプライバシーポリシーも適用されます。</li>
        </ul>
        <h2>4. 免責事項</h2>
        <ul>
          <li>ユーザー自身が入力・公開した情報については、ユーザーの責任となります。</li>
          <li>外部サービスへのリンク先での情報取扱いについては、本サービスは責任を負いません。</li>
        </ul>
        <h2>5. ポリシーの変更</h2>
        <p>本ポリシーは、必要に応じて予告なく変更する場合があります。最新の内容は本ページでご確認ください。</p>
        <div style={{ marginTop: '2.5em', textAlign: 'right', fontSize: '0.95em', color: '#B57C56' }}>2026年4月27日 制定</div>
      </main>
    </>
  );
}
