import React from 'react';
import { Header } from '../components/Header';
import '../index.css';

export default function Faq() {
  return (
    <>
      <Header />
      <main className="faq-page unified-font" style={{ maxWidth: 600, margin: '64px auto 56px auto', padding: '24px 18px 32px 18px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(181,124,86,0.10),0 1.5px 6px rgba(0,0,0,0.06)', fontSize: '1.08rem', lineHeight: 1.8, color: '#5A3D28' }}>
        <h1 style={{ color: '#B57C56', fontSize: '1.5em', marginBottom: '0.7em' }}>FAQ（よくある質問）</h1>
        <dl style={{ margin: '0 0 0.5em 0' }}>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. データのバックアップや移行はできますか？</dt>
          <dd style={{ marginBottom: '1.5em' }}>A. 「データのエクスポート」機能でバックアップや他端末への移行が可能です。</dd>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. カレンダーの色分けや進捗表示は？</dt>
          <dd style={{ marginBottom: '1.5em' }}>A. カレンダーでは予定の進捗やカテゴリごとに色分けされ、視覚的に管理できます。</dd>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. スマートフォンでも使えますか？</dt>
          <dd style={{ marginBottom: '1.5em' }}>A. はい、スマートフォンやタブレットにも最適化されています。</dd>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. 使い方や機能で困ったときは？</dt>
          <dd style={{ marginBottom: '1.5em' }}>A. 画面上部の「利用ガイド」やフッターの「お問い合わせ」からご相談いただけます。</dd>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. データはどこに保存されますか？</dt>
          <dd style={{ marginBottom: '1.5em' }}>A. データはクラウド（Firebase）に自動保存されます。同じURLでアクセスすれば、どの端末からでも続きが利用できます。</dd>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. 家族と共有できますか？</dt>
          <dd style={{ marginBottom: '1.5em' }}>A. 画面の「共有」ボタンからURLを発行し、家族やパートナーと共有できます。</dd>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. 予定や子ども情報は後から編集できますか？</dt>
          <dd style={{ marginBottom: '1.5em' }}>A. 追加した予定や子ども情報は、いつでも編集・削除できます。</dd>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. 利用ガイドはありますか？</dt>
          <dd style={{ marginBottom: '1.5em' }}><a href="/guide" style={{ color: '#B57C56', textDecoration: 'underline', fontWeight: 700 }}>こちらのガイド</a>をご覧ください。</dd>
          <dt style={{ fontWeight: 700, color: '#B57C56', marginTop: '2em' }}>Q. お問い合わせはどこからできますか？</dt>
          <dd style={{ marginBottom: '1.5em' }}><a href="https://forms.gle/BTtfyBXu1tWqecM19" target="_blank" rel="noopener" style={{ color: '#B57C56', textDecoration: 'underline', fontWeight: 700 }}>こちらのフォーム</a>からご連絡ください。</dd>
        </dl>
        <div style={{ marginTop: '2.5em', textAlign: 'center' }}>
          <a href="/guide" style={{ color: '#B57C56', textDecoration: 'underline', fontWeight: 700 }}>利用ガイドはこちら</a>
        </div>
      </main>
    </>
  );
}
