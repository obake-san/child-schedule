// 共通ヘッダー・フッターを静的HTMLに挿入するスクリプト

function insertCommonHeaderFooter() {
  // ヘッダー
  const header = document.createElement('div');
  header.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100vw;height:48px;background:linear-gradient(135deg,#E8B896 0%,#B57C56 100%);color:#fff;display:flex;align-items:center;z-index:1200;box-shadow:0 2px 8px rgba(181,124,86,0.15);padding:0 12px;font-family:'Zen Maru Gothic','Segoe UI',Yu Gothic,'Hiragino Kaku Gothic Pro',sans-serif;">
      <span id="header-title" style="font-weight:700;font-size:1.2rem;letter-spacing:0.05em;text-align:left;cursor:pointer;flex:1;">楽々キッズかれんだぁ</span>
      <nav style="display:flex;align-items:center;">
        <a id="header-guide" href="#" style='color:#fff;text-decoration:none;font-size:0.95rem;font-family:inherit;font-weight:700;'>使い方ガイド</a>
        <!-- FAQは非表示 -->
        <a href="#" id="header-menu-btn" title='メニュー' style='display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;margin-left:8px;border:none;outline:none;background:none;box-shadow:none;text-decoration:none;'>
          <span style="font-weight: bold; font-size: 1.2rem; color: #fff;">≡</span>
        </a>
      </nav>
    </div>
    <div style='height:48px'></div>
  `;
  document.body.prepend(header);

  // ツール名クリックでTopページへ
  header.querySelector('#header-title').onclick = function() {
    window.location.href = '/';
  };
  // 使い方ガイドクリックの挙動をページごとに分岐
  header.querySelector('#header-guide').onclick = function(e) {
    e.preventDefault();
    if (
      window.location.pathname === '/faq.html' ||
      window.location.pathname === '/privacy.html' ||
      window.location.pathname === '/terms.html'
    ) {
      window.location.href = '/guide.html';
    } else {
      window.scrollTo({top:0,behavior:'smooth'});
    }
  };
  // メニューアイコンクリックでメニューポップアップ
  header.querySelector('#header-menu-btn').onclick = function(e) {
    e.preventDefault();
    // シンプルなメニューポップアップ例
    if (document.getElementById('popup-menu')) {
      document.getElementById('popup-menu').remove();
      return;
    }
    const menu = document.createElement('div');
    menu.id = 'popup-menu';
    menu.className = 'floating-menu-popup';
    menu.style.position = 'fixed';
    menu.style.top = '48px';
    menu.style.right = '12px';
    menu.style.zIndex = '2000';
    // インラインbackground完全禁止
    menu.style.background = '';
    menu.innerHTML = `
      <a href="/" style="display:block;padding:12px 32px 12px 24px;text-decoration:none !important;color:var(--color-text-dark);font-size:0.98rem;font-family:inherit;font-weight:700;transition:background 0.2s;">トップ</a>
      <a href="/guide.html" style="display:block;padding:12px 32px 12px 24px;text-decoration:none !important;color:var(--color-text-dark);font-size:0.98rem;font-family:inherit;transition:background 0.2s;">使い方ガイド</a>
      <a href="/faq.html" style="display:block;padding:12px 32px 12px 24px;text-decoration:none !important;color:var(--color-text-dark);font-size:0.98rem;font-family:inherit;transition:background 0.2s;">FAQ</a>
      <a href="https://forms.gle/Pa2Nt4J8qay9nLNA9" style="display:block;padding:12px 32px 12px 24px;text-decoration:none !important;color:var(--color-text-dark);font-size:0.98rem;font-family:inherit;transition:background 0.2s;">お願い箱</a>
      <a href="https://forms.gle/BTtfyBXu1tWqecM19" style="display:block;padding:12px 32px 12px 24px;text-decoration:none !important;color:var(--color-text-dark);font-size:0.98rem;font-family:inherit;transition:background 0.2s;">お問い合わせ</a>
    `;
    menu.style.boxShadow = 'none';
    menu.style.borderTop = 'none';
    menu.onclick = function(e) { e.stopPropagation(); };
    document.body.appendChild(menu);
    setTimeout(() => {
      document.addEventListener('click', function handler() {
        if (document.getElementById('popup-menu')) document.getElementById('popup-menu').remove();
        document.removeEventListener('click', handler);
      });
    }, 10);
  };

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
          <li style='margin-bottom:8px;'><a href='/guide.html' target='_blank' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>使い方ガイド</a></li>
          <li style='margin-bottom:8px;'><a href='/faq.html' target='_blank' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>FAQ</a></li>
          <li style='margin-bottom:8px;'><a href='https://forms.gle/Pa2Nt4J8qay9nLNA9' target='_blank' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>お願い箱</a></li>
          <li style='margin-bottom:8px;'><a href='https://forms.gle/BTtfyBXu1tWqecM19' target='_blank' rel='noopener noreferrer' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>お問い合わせ</a></li>
          <li style='margin-bottom:8px;'><a href='/privacy.html' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>プライバシーポリシー</a></li>
          <li style='margin-bottom:8px;'><a href='/terms.html' style='color:#FFFFFF;text-decoration:none;font-size:0.9rem;transition:color 0.2s;font-family:inherit;'>利用規約</a></li>
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
