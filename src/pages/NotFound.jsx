import React from 'react';

export default function NotFound() {
  return (
    <div style={{ padding: '48px 16px', textAlign: 'center' }}>
      <h2 style={{ color: '#B57C56', marginBottom: '1em' }}>ページが見つかりません</h2>
      <p style={{ marginBottom: '2em' }}>
        お探しのページは存在しないか、URLが間違っている可能性があります。
      </p>
      <a href="/" style={{ color: '#B57C56', textDecoration: 'underline', fontWeight: 700 }}>
        トップページへ戻る
      </a>
    </div>
  );
}
