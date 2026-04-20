import { useState, useMemo } from 'react'
import { isHoliday, generateMonthCalendar } from '../lib/schedule'

export function ChildCalendar({ children, selectedChildIds, onEventClick }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 })
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonthValue, setSelectedMonthValue] = useState(today.getMonth() + 1)

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
    return generateMonthCalendar(currentMonth.year, currentMonth.month, schedule)
  }, [schedule, currentMonth])

  const handlePrevMonth = () => {
    if (currentMonth.month === 1) {
      setCurrentMonth({ year: currentMonth.year - 1, month: 12 })
    } else {
      setCurrentMonth({ ...currentMonth, month: currentMonth.month - 1 })
    }
  }

  const handleNextMonth = () => {
    if (currentMonth.month === 12) {
      setCurrentMonth({ year: currentMonth.year + 1, month: 1 })
    } else {
      setCurrentMonth({ ...currentMonth, month: currentMonth.month + 1 })
    }
  }

  const handleMonthHeaderClick = () => {
    setSelectedYear(currentMonth.year)
    setSelectedMonthValue(currentMonth.month)
    setShowMonthPicker(true)
  }

  const handleMonthPickerConfirm = () => {
    setCurrentMonth({ year: selectedYear, month: selectedMonthValue })
    setShowMonthPicker(false)
  }

  const handleMonthPickerCancel = () => {
    setShowMonthPicker(false)
  }

  return (
    <div className="calendar-view">
      <div className="calendar-navigation">
        <button onClick={handlePrevMonth} className="nav-button">←</button>
        <h3 className="calendar-header" onClick={handleMonthHeaderClick} style={{ cursor: 'pointer' }}>{currentMonth.year}年{currentMonth.month}月</h3>
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
            <div key={`week-${currentMonth.year}-${currentMonth.month}-${weekIndex}`} className="calendar-week">
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
                  return (
                    <div key={day} className={`timeline-day-cell ${isHolidayDay ? 'holiday' : ''}`}>
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
                  gridTemplateColumns: `repeat(7, minmax(0, 1fr))`
                }}
              >
                {/* 月初の場合は前週の枠を空欄で埋める */}
                {Array.from({ length: week.firstWeekday }).map((_, i) => (
                  <div key={`empty-event-${i}`} className="calendar-event empty" />
                ))}
                {week.events.map((event) => {
                  // イベントが週を超えている場合の正規化
                  const displayStartDay = Math.max(event.startDay, week.weekStart)
                  const displayEndDay = Math.min(event.endDay, week.weekEnd)
                  
                  const colStart = week.firstWeekday + displayStartDay - week.weekStart + 1
                  const colEnd = week.firstWeekday + displayEndDay - week.weekStart + 2
                  
                  return (
                  <div
                    key={`${event.date}-${event.title}-${event.startDay}-${event.childId}`}
                    className={`calendar-event category-${event.category}`}
                    style={{
                      gridColumn: `${colStart} / ${colEnd}`,
                      cursor: 'pointer'
                    }}
                    title={`${event.childName}: ${event.title}`}
                    onClick={() => onEventClick && onEventClick(event.childId, event)}
                  >
                    <div className="calendar-event-title">
                      {event.childName}: {event.title}
                    </div>
                    <div className="calendar-event-range">
                      {event.date !== event.endDate ? `${event.date} - ${event.endDate}` : event.date}
                    </div>
                  </div>
                  )
                })}
                {/* 月末の場合は翌月の枠を空欄で埋める */}
                {Array.from({ length: 7 - week.firstWeekday - week.daysInWeek }).map((_, i) => (
                  <div key={`empty-event-end-${i}`} className="calendar-event empty" />
                ))}
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
                  value={selectedMonthValue}
                  onChange={(e) => setSelectedMonthValue(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}月</option>
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
