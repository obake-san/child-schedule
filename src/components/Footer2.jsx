import React from 'react';
import { memo } from 'react'

const FooterContent = ({ onPolicyClick, onTermsClick }) => {
  // 100vwフッターの副作用でbodyに横スクロールや下余白が出るのを防ぐ
  // bodyにoverflowX:hiddenを適用
  if (typeof document !== 'undefined') {
    document.body.style.overflowX = 'hidden';
  }
  return (
    <footer className="app-footer" style={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', marginBottom: 0, paddingBottom: 0 }}>
      <div className="footer-content">
        <div className="footer-section">
          <p className="footer-subtitle">現役パパが使いたいから作った</p>
          <p className="footer-title">楽々キッズかれんだぁ</p>
          <p className="footer-description">手続き、ワクチン、保育園…育児の『やること』を、<br />子どもごとに全部見える化。</p>
        </div>
        <div className="footer-section">
          <h4>サービス</h4>
          <ul>
            <li><a href="/" target="_self" rel="noopener noreferrer">Top</a></li>
            <li><a href="/guide.html" target="_self" rel="noopener noreferrer">利用ガイド</a></li>
            {/* FAQリンクを「お願い箱」と「お問い合わせ」の間に追加 */}
            <li><a href="/faq.html" target="_self" rel="noopener noreferrer">FAQ</a></li>
            <li><a href="https://forms.gle/Pa2Nt4J8qay9nLNA9" target="_self" rel="noopener noreferrer">お願い箱</a></li>
            <li><a href="https://forms.gle/BTtfyBXu1tWqecM19" target="_self" rel="noopener noreferrer">お問い合わせ</a></li>
            <li><a href="/privacy.html" target="_self" rel="noopener noreferrer">プライバシーポリシー</a></li>
            <li><a href="/terms.html" target="_self" rel="noopener noreferrer">利用規約</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom" style={{marginBottom: 0, paddingBottom: 0}}>
        <p>&copy; 2026 Nakagawa. All rights reserved.</p>
        <p className="footer-version">Version 1.0.0 - Child Schedule</p>
      </div>
    </footer>
  )
}

const Footer = memo(FooterContent);
export default Footer;