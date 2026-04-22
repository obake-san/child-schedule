/**
 * フッターコンポーネント
 */

import { memo } from 'react'

const FooterContent = ({ onPolicyClick, onTermsClick }) => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="footer-subtitle">現役パパが使いたいから作った</p>
          <p className="footer-title">楽々キッズかれんだぁ</p>
          <p className="footer-description">手続き、ワクチン、保育園…育児の『やること』を、<br />子どもごとに全部見える化。</p>
        </div>
        
        <div className="footer-section">
          <h4>サービス</h4>
          <ul>
            <li><a href="https://forms.gle/Pa2Nt4J8qay9nLNA9" target="_blank" rel="noopener noreferrer">お願い箱</a></li>
            <li><a href="https://forms.gle/BTtfyBXu1tWqecM19" target="_blank" rel="noopener noreferrer">お問い合わせ</a></li>
            <li><button onClick={onPolicyClick} className="link-button">プライバシーポリシー</button></li>
            <li><button onClick={onTermsClick} className="link-button">利用規約</button></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Nakagawa. All rights reserved.</p>
        <p className="footer-version">Version 1.0.0 - Child Schedule</p>
      </div>
    </footer>
  )
}

export const Footer = memo(FooterContent)
