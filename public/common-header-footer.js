// 共通ヘッダー・フッターを静的HTMLに挿入するスクリプト

function insertCommonHeaderFooter() {
  // SPAヘッダーWeb Componentsを挿入
  const customHeader = document.createElement('custom-header');
  document.body.prepend(customHeader);
  // 高さ調整用ダミーdiv
  const spacer = document.createElement('div');
  spacer.style.height = '48px';
  document.body.insertBefore(spacer, customHeader.nextSibling);


  // フッター
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <div class='footer-content' style='max-width:1080px;margin:0 auto;padding:0 24px 40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:40px;'>
      <div class='footer-section'>
        <p class='footer-subtitle' style='color:#FFFFFF;font-size:0.85rem;font-weight:700;margin:0 0 8px;letter-spacing:0.03em;'>現役パパが使いたいから作った</p>
        <p class='footer-title' style='color:#FFFFFF;font-size:1.3rem;font-weight:700;margin:0 0 8px;'>楽々キッズかれんだぁ</p>
        <p class='footer-description' style='color:#FFFFFF;font-size:0.9rem;line-height:1.6;margin:0;'>手続き、ワクチン、保育園…育児の『やること』を、<br>子どもごとに全部見える化。</p>
      </div>
      <div class='footer-section'>
        <h4 style='color:#FFFFFF;font-size:0.95rem;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;'>サービス</h4>
        <ul style='list-style:none;padding:0;margin:0;'>
          <li style='margin-bottom:8px;'><a href='/' target='_self' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>Top</a></li>
          <li style='margin-bottom:8px;'><a href='/guide.html' target='_self' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>利用ガイド</a></li>
          <li style='margin-bottom:8px;'><a href='/faq.html' target='_self' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>FAQ</a></li>
          <li style='margin-bottom:8px;'><a href='https://forms.gle/Pa2Nt4J8qay9nLNA9' target='_self' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>お願い箱</a></li>
          <li style='margin-bottom:8px;'><a href='https://forms.gle/BTtfyBXu1tWqecM19' target='_self' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>お問い合わせ</a></li>
          <li style='margin-bottom:8px;'><a href='/privacy.html' target='_self' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>プライバシーポリシー</a></li>
          <li style='margin-bottom:8px;'><a href='/terms.html' target='_self' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>利用規約</a></li>
        </ul>
      </div>
    </div>
    <div class='footer-bottom' style='max-width:1200px;margin:0 auto;padding:20px 24px 0;border-top:1px solid #9B5A2D;text-align:center;color:#FFFFFF;font-size:0.85rem;'>
      <p style='margin:8px 0;'>&copy; 2026 Nakagawa. All rights reserved.</p>
      <p class='footer-version' style='font-size:0.8rem;color:#FFFFFF;'>Version 1.0.0 - Child Schedule</p>
    </div>
  `;
  document.body.appendChild(footer);
}

document.addEventListener('DOMContentLoaded', insertCommonHeaderFooter);
