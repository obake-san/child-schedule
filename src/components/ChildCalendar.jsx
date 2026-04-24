import { useState, useMemo } from 'react'
import { isHoliday, generateMonthCalendar } from '../lib/schedule'

export function ChildCalendar({ children, selectedChildIds, onEventClick }) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  
  const [month, setMonth] = useState({ year: currentYear, month: currentMonth })
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonthValue, setSelectedMonthValue] = useState(currentMonth)

  // 統合スケジュール作成
  const schedule = useMemo(() => {
    const allSchedules = children
      .filter(child => selectedChildIds.length === 0 || selectedChildIds.includes(child.id))
      .flatMap(child => 
        child.schedule.map(item => ({
          ...item,
          childName: item.childName || child.name,
          childId: child.id
        }))
      )
    
    return allSchedules.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [children, selectedChildIds])

  const currentMonthData = useMemo(() => {
    return generateMonthCalendar(month.year, month.month, schedule)
  }, [schedule, month])

  const handlePrevMonth = () => {
    if (month.month === 1) {
      setMonth({ year: month.year - 1, month: 12 })
    } else {
      setMonth({ ...month, month: month.month - 1 })
    }
  }

  const handleNextMonth = () => {
    if (month.month === 12) {
      setMonth({ year: month.year + 1, month: 1 })
    } else {
      setMonth({ ...month, month: month.month + 1 })
    }
  }

  const handleMonthHeaderClick = () => {
    setSelectedYear(month.year)
    setSelectedMonthValue(month.month)
    setShowMonthPicker(true)
  }

  const handleMonthPickerConfirm = () => {
    setMonth({ year: selectedYear, month: selectedMonthValue })
    setShowMonthPicker(false)
  }

  const handleMonthPickerCancel = () => {
    setShowMonthPicker(false)
  }

  return (
    <div className="calendar-view">
      <div className="calendar-navigation">
        <button onClick={handlePrevMonth} className="nav-button">←</button>
        <h3 className="calendar-header" onClick={handleMonthHeaderClick} style={{ cursor: 'pointer' }}>{month.year}年{month.month}月</h3>
        <button onClick={handleNextMonth} className="nav-button">→</button>
      </div>
      <div className="weekday-header">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={`weekday-${i}`} className={`weekday-cell ${i === 0 || i === 6 ? 'weekend' : ''}`}>
            {day}
          </div>
        ))}
      </div>
      {currentMonthData && currentMonthData.weeks.map((week, weekIndex) => (
            <div key={`week-${month.year}-${month.month}-${weekIndex}`} className="calendar-week">
              <div
                className="calendar-timeline-header"
                style={{
                  gridTemplateColumns: `repeat(7, minmax(0, 1fr))`
                }}
              >
                {/* 月初の場合は前週の日付を空欄で埋める */}
                {Array.from({ length: week.firstWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} className="timeline-day-cell empty" />
                ))}
                {/* 実際の日付 */}
                {Array.from({ length: week.daysInWeek }).map((_, index) => {
                  const day = week.weekStart + index
                  const isHolidayDay = isHoliday(week.year, week.month, day)
                  const isTodayDay = today.getFullYear() === week.year && today.getMonth() === week.month - 1 && today.getDate() === day
                  const dayOfWeek = (week.firstWeekday + index) % 7
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // 0=日, 6=土
                  return (
                    <div key={day} className={`timeline-day-cell ${isHolidayDay || isWeekend ? 'holiday' : ''} ${isTodayDay ? 'today' : ''}`}>
                      <span className="timeline-day-number">{day}</span>
                    </div>
                  )
                })}
                {/* 月末の場合は翌月の日付を空欄で埋める */}
                {Array.from({ length: 7 - week.firstWeekday - week.daysInWeek }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="timeline-day-cell empty" />
                ))}
              </div>

              <div
                className="calendar-event-layer"
                style={{
                  gridTemplateColumns: `repeat(7, minmax(0, 1fr))`,
                  display: 'grid',
                  gap: '1px',
                  background: 'white',
                  minHeight: '30px',
                  boxSizing: 'border-box'
                }}
              >
                {(() => {
                  // 各日付ごとのスケジュール数をカウント
                  const eventCountByDay = {}
                  week.events.forEach(event => {
                    const startDay = Math.max(event.startDay, week.weekStart)
                    const endDay = Math.min(event.endDay, week.weekEnd)
                    for (let day = startDay; day <= endDay; day++) {
                      eventCountByDay[day] = (eventCountByDay[day] || 0) + 1
                    }
                  })
                  
                  // 最大スケジュール数を取得
                  let maxRowSpan = 1
                  Object.values(eventCountByDay).forEach(count => {
                    maxRowSpan = Math.max(maxRowSpan, count)
                  })
                  
                  // スケジュール0個か1個の場合は1行、2個以上は対応する行数
                  const finalRowSpan = Math.max(1, maxRowSpan)

                  return (
                    <>
                      {/* 月初の場合は前週の枠を色付きで埋める */}
                      {Array.from({ length: week.firstWeekday }).map((_, i) => (
                        <div 
                          key={`empty-event-${i}`}
                          className={`empty-cell-start row-span-${finalRowSpan}`}
                          style={{ 
                            background: '#E8C4A8',
                            gridColumn: String(i + 1)
                          }} 
                        />
                      ))}
                      {/* イベントを直接マップ */}
                      {week.events.map((event, eventIndex) => {
                        // イベントが週を超えている場合の正規化
                        const displayStartDay = Math.max(event.startDay, week.weekStart)
                        const displayEndDay = Math.min(event.endDay, week.weekEnd)
                        
                        const colStart = week.firstWeekday + displayStartDay - week.weekStart + 1
                        const colEnd = week.firstWeekday + displayEndDay - week.weekStart + 2
                        return (
                          <div
                            key={`${event.id || event.title}-${event.childId}-${weekIndex}-${eventIndex}`}
                            className={`calendar-event category-${event.category}`}
                            style={{
                              gridColumn: `${colStart} / ${colEnd}`,
                              cursor: 'pointer'
                            }}
                            title={`${event.childName}: ${event.title}`}
                            onClick={() => onEventClick && onEventClick(event.childId, event)}
                          >
                            <div className="calendar-event-title">
                              {event.status && (
                                <span className={`calendar-status-label status-${event.status}`}>{event.status}</span>
                              )}
                              {event.childName}: {event.title}
                            </div>
                            <div className="calendar-event-range">
                              {event.date !== event.endDate ? `${event.date} - ${event.endDate}` : event.date}
                            </div>
                          </div>
                        )
                      })}
                      {/* 月末の場合は翌月の枠を色付きで埋める */}
                      {Array.from({ length: 7 - week.firstWeekday - (week.weekEnd - week.weekStart + 1) }).map((_, i) => {
                        const colIndex = week.firstWeekday + (week.weekEnd - week.weekStart + 1) + i + 1
                        return (
                          <div 
                            key={`empty-event-end-${i}`}
                            className={`empty-cell-end row-span-${finalRowSpan}`}
                            style={{ 
                              background: '#E8C4A8', 
                              gridColumn: String(colIndex)
                            }} 
                          />
                        )
                      })}
                    </>
                  )
                })()}
              </div>
            </div>
          ))}
      {showMonthPicker && (
        <div className="month-picker-overlay" onClick={handleMonthPickerCancel}>
          <div className="month-picker-modal" onClick={(e) => e.stopPropagation()}>
            <h3>年月を選択</h3>
            <div className="month-picker-content">
              <div className="picker-section">
                <label htmlFor="year-select">年:</label>
                <input
                  id="year-select"
                  name="year-select"
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  min="2000"
                  max="2100"
                />
              </div>
              <div className="picker-section">
                <label htmlFor="month-select">月:</label>
                <select
                  id="month-select"
                  name="month-select"
                  value={selectedMonthValue}
                  onChange={(e) => setSelectedMonthValue(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="month-picker-buttons">
              <button onClick={handleMonthPickerCancel} className="cancel-btn">キャンセル</button>
              <button onClick={handleMonthPickerConfirm} className="confirm-btn">決定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
