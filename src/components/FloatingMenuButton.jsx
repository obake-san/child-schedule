import React from 'react';


const baseStyle = {
  position: 'fixed',
  top: '16px',
  zIndex: 1000,
  background: 'linear-gradient(135deg, #E8B896 0%, #B57C56 100%)',
  color: 'white',
  border: 'none',
  boxShadow: '0 6px 20px rgba(181, 124, 86, 0.4)',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const pcStyle = {
  background: 'none',
  border: 'none',
  boxShadow: 'none',
  color: 'white',
  padding: 0,
  margin: 0,
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const mobileStyle = {
  background: 'none',
  border: 'none',
  boxShadow: 'none',
  color: 'white',
  padding: 0,
  margin: 0,
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};


// メディアクエリで端末判定
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 600px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};



const HEADER_OFFSET = 55;
const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};



// トップ画面に遷移してから該当セクションへスクロール＋viewMode切替
function goToTopAnd(action) {
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    window.location.href = '/';
    // 遷移後のスクロールはonloadで実行（静的HTMLでもSPAでも）
    window.sessionStorage.setItem('afterTopAction', action);
  } else {
    // SPA内なら即実行
    runTopAction(action);
  }
}

function runTopAction(action) {
  switch (action) {
    case 'scroll-add-child':
      scrollToSection('add-child-section');
      break;
    case 'scroll-registered-children':
      scrollToSection('registered-children');
      break;
    case 'show-todo-list':
      window.dispatchEvent(new CustomEvent('setViewModeList'));
      setTimeout(() => scrollToSection('todo-calendar-section'), 0);
      break;
    case 'show-calendar':
      window.dispatchEvent(new CustomEvent('setViewModeCombinedCalendar'));
      setTimeout(() => scrollToSection('todo-calendar-section'), 0);
      break;
    case 'scroll-data-management':
      scrollToSection('data-management');
      break;
    default:
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ページロード時にafterTopActionがあれば実行
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const action = window.sessionStorage.getItem('afterTopAction');
    if (action) {
      setTimeout(() => runTopAction(action), 100);
      window.sessionStorage.removeItem('afterTopAction');
    }
  });
}

function getMenuItems(childrenCount) {
  const items = [
    { label: 'トップ', action: () => goToTopAnd('top') },
    { label: '子どもを追加', action: () => goToTopAnd('scroll-add-child') },
    { label: '登録済みの子供', action: () => goToTopAnd('scroll-registered-children') },
  ];
  if (childrenCount > 0) {
    items.push(
      { label: 'やることリスト', action: () => goToTopAnd('show-todo-list') },
      { label: 'カレンダー', action: () => goToTopAnd('show-calendar') }
    );
  }
  items.push(
    { label: 'データ管理', action: () => goToTopAnd('scroll-data-management') },
    { label: 'FAQ', action: () => window.location.href = '/faq.html' },
    { label: 'お願い箱', action: () => window.location.href = 'https://forms.gle/Pa2Nt4J8qay9nLNA9' },
    { label: 'お問い合わせ', action: () => window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSeq1ra0qFQbCvJ97m1uF_QU77QOFqvoIVga6Bdt386M4MEvnw/viewform' }
  );
  return items;
}



const FloatingMenuButton = ({ childrenCount = 0 }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  // メニュー外クリックで閉じる
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('.floating-menu-root')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="floating-menu-root" style={{ position: 'relative' }}>
      <button
        style={isMobile ? mobileStyle : pcStyle}
        aria-label="メニュー"
        onClick={() => setOpen(v => !v)}
      >
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>≡</span>
      </button>
      {open && (
        <div
          className="floating-menu-popup"
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
          }}
        >
          {getMenuItems(childrenCount).map(item => (
            <button
              key={item.label}
              style={{
                display: 'block',
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                padding: '10px 20px',
                fontSize: '1rem',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'background 0.2s',
                borderRadius: 0,
              }}
              onClick={() => {
                setOpen(false);
                setTimeout(item.action, 100);
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--color-primary-lighter)')}
              onMouseOut={e => (e.currentTarget.style.background = 'none')}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FloatingMenuButton;
