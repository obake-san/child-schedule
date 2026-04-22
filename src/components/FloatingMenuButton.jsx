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


// App.jsxのviewModeを切り替えるためのカスタムイベントを使う
const setTodoListViewAndScroll = () => {
  window.dispatchEvent(new CustomEvent('setViewModeList'));
  setTimeout(() => scrollToSection('todo-list'), 0);
};

const setCalendarViewAndScroll = () => {
  window.dispatchEvent(new CustomEvent('setViewModeCombinedCalendar'));
  setTimeout(() => scrollToSection('calendar-section'), 0);
};


// childrenCountを受け取ってメニューを動的生成
function getMenuItems(childrenCount) {
  const items = [
    { label: 'トップ', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: '子供を追加', action: () => scrollToSection('add-child-section') },
    { label: '登録済みの子ども', action: () => scrollToSection('registered-children') },
  ];
  if (childrenCount > 0) {
    items.push(
      { label: 'やることリスト', action: setTodoListViewAndScroll },
      { label: 'カレンダー', action: setCalendarViewAndScroll }
    );
  }
  items.push(
    { label: 'データ管理', action: () => scrollToSection('data-management') },
    { label: 'お願い箱', action: () => window.open('https://forms.gle/Pa2Nt4J8qay9nLNA9', '_blank') },
    { label: 'お問い合わせ', action: () => window.open('https://docs.google.com/forms/d/e/1FAIpQLSeq1ra0qFQbCvJ97m1uF_QU77QOFqvoIVga6Bdt386M4MEvnw/viewform', '_blank') }
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
