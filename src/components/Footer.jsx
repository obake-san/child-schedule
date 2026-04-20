/**
 * フッターコンポーネント
 */

export const Footer = ({ onPolicyClick, onTermsClick }) => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="footer-subtitle">現役パパが考えた、子育てを楽にするスケジュール管理</p>
          <p className="footer-title">子供スケジュール</p>
          <p className="footer-description">子どもの成長段階に合わせた予定管理ツール</p>
        </div>
        
        <div className="footer-section">
          <h4>サービス</h4>
          <ul>
            <li><button onClick={onPolicyClick} className="link-button">プライバシーポリシー</button></li>
            <li><button onClick={onTermsClick} className="link-button">利用規約</button></li>
            <li><a href="https://forms.gle/Uuaub4kX8y6Mv6TLA" target="_blank" rel="noopener noreferrer">お問い合わせ</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Ryota Nakagawa. All rights reserved.</p>
        <p className="footer-version">Version 1.0.0 - Child Schedule</p>
      </div>
    </footer>
  )
}
