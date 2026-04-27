import React from 'react';
import { Header } from '../components/Header';
import '../index.css';

export default function Guide() {
  return (
    <>
      <Header />
      <main className="guide-page unified-font" style={{ maxWidth: 600, margin: '64px auto 56px auto', padding: '24px 18px 32px 18px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(181,124,86,0.10),0 1.5px 6px rgba(0,0,0,0.06)', fontSize: '1.08rem', lineHeight: 1.8, color: '#5A3D28' }}>
        <h1 style={{ color: '#B57C56', fontSize: '1.5em', marginBottom: '0.7em' }}>利用ガイド</h1>
        <section style={{ marginBottom: '2.5em' }}>
          <h2 style={{ fontSize: '1.15em', marginBottom: '0.7em', color: '#B57C56' }}>■ 利用開始時</h2>
          <ol style={{ paddingLeft: '1.2em', margin: 0 }}>
            <li style={{ marginBottom: '1.2em' }}><b>子供の追加方法</b><br />画面上部またはメニューの「子供を追加」ボタンをクリックし、名前・生年月日・性別・都道府県・市区町村などを入力して「登録」してください。</li>
            <li style={{ marginBottom: '1.2em' }}><b>スケジュールの追加方法</b><br />「やることリスト」や「カレンダー」画面で「予定を追加」ボタンを押し、内容を入力して保存します。</li>
            <li style={{ marginBottom: '1.2em' }}><b>やることリスト表示</b><br />メニューの「やることリスト」から、子供ごとのやること一覧を確認できます。カテゴリやステータスで絞り込みも可能です。</li>
            <li style={{ marginBottom: '1.2em' }}><b>カレンダーの使い方</b><br />「カレンダー」画面では、月ごと・子供ごとに予定を一覧できます。色分けで進捗も一目で分かります。</li>
            <li style={{ marginBottom: '1.2em' }}><b>データの保存・共有</b><br />データは自動でクラウド保存され、URLを共有すれば家族と一緒に編集できます。</li>
          </ol>
        </section>
        <section style={{ marginBottom: '2.5em' }}>
          <h2 style={{ fontSize: '1.15em', marginBottom: '0.7em', color: '#B57C56' }}>■ 登録内容の修正・削除</h2>
          <ol style={{ paddingLeft: '1.2em', margin: 0 }}>
            <li style={{ marginBottom: '1.2em' }}><b>子供情報の編集・削除</b><br />やることリストの各子供の「編集」ボタンから情報を修正できます。削除も同様です。</li>
            <li style={{ marginBottom: '1.2em' }}><b>予定の編集・削除</b><br />やることリストやカレンダーの各予定の「編集」ボタンから内容を修正・削除できます。</li>
            <li style={{ marginBottom: '1.2em' }}><b>カテゴリ・ステータスの変更</b><br />予定ごとにカテゴリや進捗ステータスを変更できます。進捗管理に便利です。</li>
          </ol>
        </section>
        <section style={{ marginBottom: '2.5em' }}>
          <h2 style={{ fontSize: '1.15em', marginBottom: '0.7em', color: '#B57C56' }}>■ その他便利な機能</h2>
          <ol style={{ paddingLeft: '1.2em', margin: 0 }}>
            <li style={{ marginBottom: '1.2em' }}><b>データのエクスポート・インポート</b><br />「データのエクスポート」機能でバックアップや他端末への移行ができます。</li>
            <li style={{ marginBottom: '1.2em' }}><b>お問い合わせ・要望送信</b><br />ご意見・ご要望はフッターの「お願い箱」や「お問い合わせ」から送信できます。</li>
          </ol>
        </section>
        <div style={{ marginTop: '2.5em', textAlign: 'center' }}>
          <a href="/faq" style={{ color: '#B57C56', textDecoration: 'underline', fontWeight: 700 }}>FAQ（よくある質問）はこちら</a>
        </div>
      </main>
    </>
  );
}
