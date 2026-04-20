/**
 * カレンダーエクスポート機能
 * Google Calendar 互換の .ics 形式でエクスポート
 */

/**
 * ICS 形式の日時をフォーマット
 */
const formatDateForIcs = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

/**
 * スケジュール情報から VEVENT を生成
 */
const createVEvent = (schedule, child, index) => {
  const startDate = new Date(schedule.date + 'T000000')
  const endDate = new Date(schedule.endDate ? schedule.endDate + 'T235959' : schedule.date + 'T235959')
  const now = new Date()

  const eventSummary = `${child.name}：${schedule.title}`
  const eventDescription = `カテゴリ：${schedule.category}\n${schedule.description || ''}`
  const uid = `${child.id}-${schedule.date}-${index}@kodomo-schedule.local`

  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDateForIcs(now)}Z
DTSTART:${formatDateForIcs(startDate)}
DTEND:${formatDateForIcs(endDate)}
SUMMARY:${eventSummary}
DESCRIPTION:${eventDescription}
LOCATION:
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT`
}

/**
 * カレンダーデータから ICS ファイル内容を生成
 */
export const generateIcsContent = (summary) => {
  const now = new Date()
  
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//子供のスケジュール//
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:子供のスケジュール
X-WR-TIMEZONE:Asia/Tokyo
BEGIN:VTIMEZONE
TZID:Asia/Tokyo
BEGIN:STANDARD
TZOFFSETFROM:+0900
TZOFFSETTO:+0900
TZNAME:JST
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE
`

  summary.forEach(child => {
    child.schedule.forEach((schedule, idx) => {
      icsContent += createVEvent(schedule, child, idx)
    })
  })

  icsContent += 'END:VCALENDAR'
  return icsContent
}

/**
 * カレンダーデータをダウンロード
 */
export const downloadCalendarFile = (summary, children) => {
  if (children.length === 0) {
    alert('子どもが登録されていません。先に子どもを登録してください。')
    return false
  }

  let totalSchedules = 0
  let scheduleCounts = []
  
  summary.forEach(child => {
    const count = child.schedule.length
    totalSchedules += count
    if (count > 0) {
      scheduleCounts.push(`${child.name}: ${count}件`)
    }
  })

  if (totalSchedules === 0) {
    const childrenNames = children.map(c => c.name).join('、')
    alert(`登録されたスケジュールがありません。\n\n登録済みの子ども: ${childrenNames}\n\n各子どもの「スケジュール追加」ボタンからスケジュールを登録してください。\n（自動生成されるスケジュールもあります）`)
    return false
  }

  const icsContent = generateIcsContent(summary)
  const dataBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `kodomo-schedule-${new Date().toISOString().slice(0, 10)}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}
