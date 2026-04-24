import React from 'react';

/**
 * 共通フィルター＆切り替えボタン行
 *
 * @param {Object} props
 * @param {Array} children 子供リスト
 * @param {Array} selectedChildIds 選択中の子供IDリスト
 * @param {Function} setSelectedChildIds 子供ID選択変更
 * @param {Array} statusFilter ステータスフィルター
 * @param {Function} setStatusFilter ステータスフィルター変更
 * @param {string} viewMode 表示モード
 * @param {Function} setViewMode 表示モード変更
 * @param {boolean} showViewToggle 切り替えボタン表示
 */
const FilterRow = ({
  children,
  selectedChildIds,
  setSelectedChildIds,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  showViewToggle = true,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 12, flexWrap: 'wrap', width: '100%', minHeight: 38 }}>
      {/* 子供フィルター */}
      <div className="child-filter-tabs" style={{ display: 'flex', gap: 8, height: '100%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <button
          type="button"
          className={selectedChildIds.length === 0 ? 'active' : ''}
          onClick={() => setSelectedChildIds([])}
          style={filterButtonStyle(selectedChildIds.length === 0)}
        >すべて</button>
        {children.length >= 3
          ? children.map((child) => (
              <button
                key={child.id}
                type="button"
                className={selectedChildIds.includes(child.id) ? 'active' : ''}
                onClick={() => {
                  if (selectedChildIds.includes(child.id)) {
                    setSelectedChildIds(selectedChildIds.filter(id => id !== child.id))
                  } else {
                    setSelectedChildIds([...selectedChildIds, child.id])
                  }
                }}
                style={filterButtonStyle(selectedChildIds.includes(child.id))}
              >
                {child.name}
              </button>
            ))
          : children.map((child) => (
              <button
                key={child.id}
                type="button"
                className={selectedChildIds.includes(child.id) ? 'active' : ''}
                onClick={() => setSelectedChildIds([child.id])}
                style={filterButtonStyle(selectedChildIds.includes(child.id))}
              >
                {child.name}
              </button>
            ))}
      </div>
      {/* ステータスフィルター */}
      <div className="status-filter-tabs" style={{ display: 'flex', gap: 8, marginLeft: 'auto', height: '100%', alignItems: 'flex-start' }}>
        <button
          type="button"
          className={statusFilter.length === 4 ? 'active' : ''}
          onClick={() => setStatusFilter(['未対応', '対応中', '完了', '期限切れ'])}
          style={filterButtonStyle(statusFilter.length === 4)}
        >すべて</button>
        {['未対応', '対応中', '完了', '期限切れ'].map(status => (
          <button
            key={status}
            type="button"
            className={statusFilter.includes(status) ? 'active' : ''}
            onClick={() => {
              if (statusFilter.includes(status)) {
                // 1つだけ選択解除しようとした場合は何もしない（最低1つは選択）
                if (statusFilter.length === 1) return;
                setStatusFilter(statusFilter.filter(s => s !== status));
              } else {
                const newFilter = [...statusFilter, status];
                setStatusFilter(newFilter.length === 4 ? ['未対応', '対応中', '完了', '期限切れ'] : newFilter);
              }
            }}
            style={filterButtonStyle(statusFilter.includes(status))}
          >
            {status}
          </button>
        ))}
      </div>
      {/* 切り替えボタン */}
      {showViewToggle && (
        <div className="view-toggle" style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
          <button
            type="button"
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            style={filterButtonStyle(viewMode === 'list')}
          >
            やることリスト
          </button>
          <button
            type="button"
            className={viewMode === 'combined-calendar' ? 'active' : ''}
            onClick={() => setViewMode('combined-calendar')}
            style={filterButtonStyle(viewMode === 'combined-calendar')}
          >
            カレンダー
          </button>
        </div>
      )}
    </div>
  );
};

function filterButtonStyle(active) {
  return {
    padding: '6px 18px',
    borderRadius: 999,
    border: 'none',
    background: active ? '#B57C56' : '#eee',
    color: active ? '#fff' : '#7A5B4F',
    fontWeight: 600,
    fontSize: '1em',
    cursor: 'pointer',
    boxShadow: active ? '0 2px 8px rgba(181,124,86,0.10)' : 'none',
    transition: 'all 0.15s',
    minWidth: 64,
    height: '100%',
    lineHeight: '1.2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export default FilterRow;
