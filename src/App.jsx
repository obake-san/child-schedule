import { useEffect, useMemo, useState, useRef } from 'react'
import { ChildCalendar } from './components/ChildCalendar'
import { Footer } from './components/Footer'
import { PolicyModal } from './components/PolicyModal'
import { generateSchedule, formatDate, formatRange, groupScheduleByMonth, groupScheduleByWeek, isHoliday, getAvailableCategories, getCategoryIndex, calculateAge } from './lib/schedule.js'
import { getLocalSchedules } from './lib/localSchedules.js'
import { initializeFirebase, saveDataToFirebase, listenToData, checkAndDeleteOldData, updateLastAccessedAt, deleteDataFromFirebase, listenToStatistics, initializeStatistics, incrementUserCount, incrementChildCount, getDataFromFirebase } from './firebase'
import { sanitizeInput, sanitizeObject, validateLength, validateDate, validateUUID } from './utils/security'
import { useDeviceType } from './utils/responsive'
import { STORAGE_KEY, FORM_STORAGE_KEY, GROUP_ID_STORAGE_KEY, PREFECTURES_MUNICIPALITIES, INITIAL_FORM, INITIAL_EDIT_FORM, INITIAL_EDIT_CHILD_FORM } from './constants'
import { useChildrenState, useFormState, useScheduleEditState, useUIState } from './hooks/useAppState'
import { createNewChild, confirmDeleteChild, validateChildEdit, updateChildInfo, validateScheduleForm, createNewSchedule, saveToLocalStorage, exportDataAsJSON, getScheduleFormDefaults, generateShareUrl, copyShareUrlToClipboard, decompressShareData } from './utils/handlers'
import { downloadCalendarFile } from './utils/calendar'
import { importDataFromFile, clearFileInput, validateImportedData } from './utils/importExport'

function App() {
  const today = new Date().toISOString().slice(0, 10)
  const deviceType = useDeviceType()
  
  // Custom hooks for state management
  const { children, setChildren, editingChildId, setEditingChildId, editChildForm, setEditChildForm, resetEditChildForm } = useChildrenState()
  const { form, setForm, error, setError, saveSuccess, setSaveSuccess, resetForm, showError, showSuccess } = useFormState()
  const { editingSchedule, setEditingSchedule, editForm, setEditForm, addingSchedule, setAddingSchedule, selectedChildrenForSchedule, setSelectedChildrenForSchedule, resetEditForm, closeEditor } = useScheduleEditState()
  const { viewMode, setViewMode, groupId, setGroupId, selectedChildIds, setSelectedChildIds, currentCombinedMonth, setCurrentCombinedMonth, resetUI } = useUIState()
  
  // ポリシーモーダル状態
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [policyType, setPolicyType] = useState(null)
  
  // 統計情報
  const [statistics, setStatistics] = useState({ userCount: 0, totalChildren: 0 })
  
  // Local state for add schedule form
  const [addScheduleForm, setAddScheduleForm] = useState({
    title: '',
    date: today,
    endDate: today,
    description: '',
    category: '準備',
    todos: [],
    supplies: []
  })

  useEffect(() => {
    // 初期化時のみローカルストレージから読み込む
    try {
      // URL共有からのデータをチェック
      const params = new URLSearchParams(window.location.search)
      
      // パス形式の共有URL（/s/xxx）から共有IDを抽出
      const pathname = window.location.pathname
      const pathMatch = pathname.match(/^\/(?:index\.html)?(?:\/)?s\/([^\/]+)$/)
      let encodedData = null
      
      if (pathMatch && pathMatch[1]) {
        // パス形式: /s/xxx
        encodedData = pathMatch[1]
      } else {
        // クエリパラメータ形式（旧互換性）
        encodedData = params.get('s') || params.get('d') || params.get('data')
      }
      
      let sharedData = null
      let sharedGroupId = null
      if (encodedData) {
        const result = decompressShareData(encodedData)
        if (!result.error && result.data) {
          sharedData = result.data
          sharedGroupId = result.data.groupId
        }
      }
      
      // groupId を決定（共有URLから取得 > URLパラメータから取得 > ローカルストレージ > 新規生成）
      let urlGroupId = sharedGroupId || params.get('g') || params.get('groupId')
      if (!urlGroupId) {
        const storedGroupId = window.localStorage.getItem(GROUP_ID_STORAGE_KEY)
        if (storedGroupId) {
          urlGroupId = storedGroupId
        } else {
          urlGroupId = 'group-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        }
      }
      
      // groupId をローカルストレージに保存
      window.localStorage.setItem(GROUP_ID_STORAGE_KEY, urlGroupId)
      setGroupId(urlGroupId)
      
      // 共有URLからのデータがある場合はそれを使用、なければローカルストレージから読み込む
      if (sharedData) {
        // 共有データを使用
        if (Array.isArray(sharedData.children)) {
          const migratedChildren = sharedData.children.map(child => ({
            ...child,
            excludedScheduleIds: child.excludedScheduleIds || []
          }))
          setChildren(migratedChildren)
        }
        if (sharedData.form) {
          setForm(sharedData.form)
        }
      } else {
        // Firebase が起動するまで、ローカルストレージから初期データを読み込む
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            const migratedChildren = parsed.map(child => ({
              ...child,
              excludedScheduleIds: child.excludedScheduleIds || []
            }))
            setChildren(migratedChildren)
          } catch (error) {
            // パースエラー（コンソール抑制中）
          }
        }

        // formを読み込む
        const storedForm = window.localStorage.getItem(FORM_STORAGE_KEY)
        if (storedForm) {
          try {
            const parsedForm = JSON.parse(storedForm)
            setForm(parsedForm)
          } catch (error) {
            // パースエラー（コンソール抑制中）
          }
        }
      }
      
    } catch (error) {
      // エラーの場合も続行
    }
  }, [])

  // フォーム入力内容をリアルタイムで自動保存
  useEffect(() => {
    try {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form))
    } catch (error) {
      // フォーム保存エラー
    }
  }, [form])

  // 統計情報のリアルタイムリスニング（最初のマウント時のみ）
  useEffect(() => {
    // 統計情報を初期化
    initializeStatistics()
    
    const unsubscribe = listenToStatistics((stats) => {
      setStatistics(stats)
    })

    return () => unsubscribe()
  }, [])

  // Firebase 初期化と リアルタイム同期
  useEffect(() => {
    if (!groupId) return // groupId がなければ待機
    
    const setupFirebase = async () => {
      try {
        // Firebase を初期化
        await initializeFirebase()
        
        const wasDeleted = await checkAndDeleteOldData(groupId)
        if (wasDeleted) {
          // ローカルストレージもクリア
          window.localStorage.removeItem(STORAGE_KEY)
          window.localStorage.removeItem(FORM_STORAGE_KEY)
          const userCountKey = `userCountIncremented_${groupId}`
          window.localStorage.removeItem(userCountKey)
          setChildren([])
          setForm(INITIAL_FORM)
          return
        }
        
        // Firebase からのリアルタイムリスニングを開始（groupId を使用）
        listenToData(groupId, (firebaseData) => {
          
          // ⚠️ 空配列は falsy なので、Array.isArray だけでチェック
          if (Array.isArray(firebaseData.children)) {
            setChildren(firebaseData.children)
          } else {
            // children が配列ではない場合
          }
          
          // Firebase から form データがある場合のみセット
          // firebaseData.form が undefined または空の場合は、現在の form を保持（リセットしない）
          if (firebaseData.form && typeof firebaseData.form === 'object' && Object.keys(firebaseData.form).length > 0) {
            setForm(firebaseData.form)
          }
          // firebaseData.form がない場合は、現在の form を保持（リセットしない）
        })
      } catch (error) {
        console.error('Firebase セットアップエラー:', error)
      }
    }
    
    setupFirebase()
  }, [groupId])

  const prevDataRef = useRef(null)

  // データが変更されたときに localStorage と Firebase に自動保存
  useEffect(() => {
    try {
      // Firebase からの更新時の無限ループを防ぐため、データが本当に変わったかチェック
      const currentData = JSON.stringify({ children, form })
      if (prevDataRef.current === currentData) {
        return // 変わっていなければ保存しない
      }
      prevDataRef.current = currentData

      // ローカルストレージに保存
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(children))
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form))
      
      // Firebase に保存（グループIDを使用）
      if (groupId) {
        // グループの初回保存かどうかを判定
        const userCountKey = `userCountIncremented_${groupId}`
        const alreadyIncremented = window.localStorage.getItem(userCountKey) === 'true'
        
        // 子どもがいて、かつまだカウントしていない場合
        if (Array.isArray(children) && children.length > 0 && !alreadyIncremented) {
          // 先に DB に存在するかチェック
          getDataFromFirebase(groupId).then((existingData) => {
            if (!existingData) {
              // DB に存在しない新規グループなので、利用者カウント
              incrementUserCount()
            }
            // フラグを保存（既存グループでもカウント済みフラグ保存）
            window.localStorage.setItem(userCountKey, 'true')
          })
        }
        
        saveDataToFirebase(groupId, { children, form }).then((result) => {
          // Firebase 保存成功後、アクセス日時を更新
          updateLastAccessedAt(groupId)
        }).catch(err => {
          console.warn('Firebase 保存失敗（ローカルストレージは保存済）:', err.message)
        })
      }
    } catch (error) {
      console.error('データ保存エラー:', error)
    }
  }, [children, form, groupId])

  const summary = useMemo(() => {
    return children.map((child) => {
      const autoSchedule = generateSchedule(child)
      
      // 自治体別スケジュールを取得
      const localitySchedules = getLocalSchedules(child.prefecture, child.municipality)
      
      // 自治体別スケジュールに基本情報を追加
      const localityScheduleWithCalculatedDates = localitySchedules.map(schedule => {
        const startDate = new Date(child.birthDate)
        startDate.setMonth(startDate.getMonth() + schedule.months)
        
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + (schedule.durationDays || 0))
        
        return {
          ...schedule,
          id: `locality-${child.prefecture}-${child.municipality}-${schedule.title}`,
          date: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10)
        }
      })
      
      const customSchedule = child.customSchedules || []
      const excludedIds = new Set(child.excludedScheduleIds || [])
      
      // カスタムスケジュールのIDリストを取得
      const customIds = new Set(customSchedule.map(s => s.id))
      
      // 自動生成スケジュールでカスタムに変換されたものを除外、および削除対象を除外
      const filteredAutoSchedule = autoSchedule.filter(s => !customIds.has(s.id) && !excludedIds.has(s.id))
      
      // ローカルスケジュールも excludedIds でフィルタリング
      const filteredLocalitySchedule = localityScheduleWithCalculatedDates.filter(s => !excludedIds.has(s.id))
      
      const combined = [...filteredAutoSchedule, ...filteredLocalitySchedule, ...customSchedule]
        .map(item => ({
          ...item,
          childId: child.id,
          childName: child.name
        }))
        .filter(item => {
          // カスタムスケジュールは常に表示
          const isCustom = customIds.has(item.id)
          if (isCustom) {
            return true
          }
          
          // 自動生成スケジュール・ローカルスケジュールはカテゴリでフィルタリング
          // selectedCategoriesが空の場合はすべてのカテゴリを表示
          // そうでない場合は選択されたカテゴリのみを表示
          if (!child.selectedCategories || child.selectedCategories.length === 0) {
            return true
          }
          return child.selectedCategories.includes(item.category)
        })
        .sort((a, b) => {
          // 開始日で比較（早い順）
          const dateComparison = new Date(a.date) - new Date(b.date)
          if (dateComparison !== 0) return dateComparison
          
          // 開始日が同じ場合は終了日で比較（早い順）
          const endDateComparison = new Date(a.endDate) - new Date(b.endDate)
          if (endDateComparison !== 0) return endDateComparison
          
          // 開始日と終了日が同じ場合はカテゴリの優先順で比較
          const categoryComparison = getCategoryIndex(a.category) - getCategoryIndex(b.category)
          if (categoryComparison !== 0) return categoryComparison
          
          // すべてが同じ場合は ID の辞書順で比較（安定ソート）
          return a.id.localeCompare(b.id)
        })
      
      return {
        ...child,
        schedule: combined
      }
    })
  }, [children])

  const combinedSchedule = useMemo(() => {
    const allSchedules = summary.flatMap(child => {
      return child.schedule.map(item => ({
        ...item,
        childName: child.name,
        childId: child.id
      }))
    })
    return allSchedules.sort((a, b) => {
      // カテゴリ順を優先
      const categoryDiff = getCategoryIndex(a.category) - getCategoryIndex(b.category)
      if (categoryDiff !== 0) return categoryDiff
      // 同じカテゴリ内では日付順
      return new Date(a.date) - new Date(b.date)
    })
  }, [summary])

  const availableCategories = useMemo(() => getAvailableCategories(), [])

  const handleSubmit = (event) => {
    event.preventDefault()
    
    // 入力値の検証とサニタイゼーション
    const name = form.name.trim()
    if (!name || !validateLength(name, 100)) {
      setError('名前は1文字以上100文字以下で入力してください。')
      return
    }
    
    if (!form.birthDate || !validateDate(form.birthDate)) {
      setError('正しい生年月日を入力してください。')
      return
    }
    
    if (!form.prefecture || !validateLength(form.prefecture, 50)) {
      setError('有効な都道府県を選択してください。')
      return
    }
    
    if (!form.municipality || !validateLength(form.municipality, 100)) {
      setError('有効な市町村を選択してください。')
      return
    }

    const birthDate = new Date(form.birthDate)
    if (Number.isNaN(birthDate.getTime())) {
      setError('正しい日付を入力してください。')
      return
    }

    const newChild = {
      id: crypto.randomUUID(),
      name: sanitizeInput(name),
      birthDate: birthDate.toISOString().slice(0, 10),
      gender: sanitizeInput(form.gender),
      prefecture: sanitizeInput(form.prefecture),
      municipality: sanitizeInput(form.municipality),
      selectedCategories: form.selectedCategories.length > 0 ? form.selectedCategories : getAvailableCategories(),
      customSchedules: [],
      excludedScheduleIds: []
    }
    
    setChildren((current) => {
      const updated = [...current, newChild]
      return updated
    })
    
    // 統計情報に子ども数をカウント
    incrementChildCount()
    
    // フォームの内容を全て保持
    setError('')
  }

  const removeChild = (id) => {
    if (!window.confirm('この子供を削除してもよろしいですか？')) {
      return
    }
    const updatedChildren = children.filter((child) => child.id !== id)
    setChildren(updatedChildren)
    
    // 子どもが全員削除された場合、DBからグループを削除
    if (updatedChildren.length === 0) {
      try {
        deleteDataFromFirebase(groupId)
      } catch (error) {
        console.error('Failed to delete group from Firebase:', error)
      }
    }
  }

  const openEditChild = (child) => {
    setEditingChildId(child.id)
    setEditChildForm({
      name: child.name,
      birthDate: child.birthDate,
      gender: child.gender,
      selectedCategories: child.selectedCategories || [],
      prefecture: child.prefecture || '',
      municipality: child.municipality || ''
    })
  }

  const closeEditChild = () => {
    setEditingChildId(null)
    setEditChildForm({
      name: '',
      birthDate: new Date().toISOString().slice(0, 10),
      gender: 'male',
      selectedCategories: [],
      prefecture: '',
      municipality: ''
    })
  }

  const openScheduleAdder = () => {
    setAddingSchedule(true)
    setSelectedChildrenForSchedule([])
  }

  const closeScheduleAdder = () => {
    setAddingSchedule(false)
    setSelectedChildrenForSchedule([])
    setAddScheduleForm({
      title: '',
      date: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      description: '',
      category: '準備',
      todos: [],
      supplies: []
    })
  }

  const saveNewSchedule = () => {
    // バリデーション
    if (!addScheduleForm.title || !addScheduleForm.title.trim()) {
      alert('スケジュール名を入力してください。')
      return
    }
    
    if (!addScheduleForm.date) {
      alert('開始日を入力してください。')
      return
    }
    
    if (selectedChildrenForSchedule.length === 0) {
      alert('子どもを選択してください。')
      return
    }

    const updatedChildren = children.map((child) => {
      if (!selectedChildrenForSchedule.includes(child.id)) return child

      const customSchedules = Array.isArray(child.customSchedules) ? [...child.customSchedules] : []
      const newSchedule = {
        id: crypto.randomUUID(),
        title: addScheduleForm.title.trim(),
        date: addScheduleForm.date,
        endDate: addScheduleForm.endDate || addScheduleForm.date,
        description: addScheduleForm.description || '',
        category: addScheduleForm.category || '準備',
        todos: Array.isArray(addScheduleForm.todos) ? addScheduleForm.todos.filter(t => t && t.trim()) : [],
        supplies: Array.isArray(addScheduleForm.supplies) ? addScheduleForm.supplies.filter(s => s && s.trim()) : []
      }
      customSchedules.push(newSchedule)

      return { ...child, customSchedules }
    })

    setChildren(updatedChildren)
    
    // ローカルストレージに自動保存
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChildren))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      
      // スケジュール追加成功を通知
      const selectedChildren = updatedChildren.filter(c => selectedChildrenForSchedule.includes(c.id))
      const childNames = selectedChildren.map(c => c.name).join('、')
      alert(`✓ スケジュール「${addScheduleForm.title}」を${childNames}に登録しました。`)
    } catch (error) {
      console.error('ローカルストレージの保存エラー:', error)
      alert('スケジュール保存エラーが発生しました。')
    }

    closeScheduleAdder()
  }

  const saveChildEdit = () => {
    
    const name = editChildForm.name.trim()
    if (!name || !validateLength(name, 100)) {
      setError('名前は1文字以上100文字以下で入力してください。')
      return
    }
    
    if (!editChildForm.birthDate || !validateDate(editChildForm.birthDate)) {
      setError('正しい生年月日を入力してください。')
      return
    }
    
    if (!editChildForm.prefecture || !validateLength(editChildForm.prefecture, 50)) {
      setError('有効な都道府県を選択してください。')
      return
    }
    
    if (!editChildForm.municipality || !validateLength(editChildForm.municipality, 100)) {
      setError('有効な市町村を選択してください。')
      return
    }

    const updatedChildren = children.map((child) => {
      if (child.id !== editingChildId) return child
      return {
        ...child,
        name: sanitizeInput(name),
        birthDate: editChildForm.birthDate,
        gender: sanitizeInput(editChildForm.gender),
        prefecture: sanitizeInput(editChildForm.prefecture),
        municipality: sanitizeInput(editChildForm.municipality),
        selectedCategories: editChildForm.selectedCategories,
        customSchedules: child.customSchedules || [],
        excludedScheduleIds: child.excludedScheduleIds || []
      }
    })

    setChildren(updatedChildren)
    
    // ローカルストレージに自動保存
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChildren))
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('ローカルストレージの保存エラー:', error)
    }

    setError('')
    closeEditChild()
  }

  const saveToStorage = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(children))
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('ローカルストレージの保存エラー:', error)
    }
  }

  const exportData = () => {
    const dataToExport = { children, form }
    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kodomo-schedule-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result || '')
        if (importedData.children && Array.isArray(importedData.children)) {
          setChildren(importedData.children)
          if (importedData.form) {
            setForm(importedData.form)
          }
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2000)
        } else {
          alert('不正なファイル形式です。')
        }
      } catch (error) {
        alert('ファイルの読み込みに失敗しました。')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const openShareModal = (childId = null) => {
    const shareUrlValue = generateShareUrl(children, form, groupId, childId)
    
    // クリップボードにコピー
    navigator.clipboard.writeText(shareUrlValue).then(() => {
      alert('共有URLをコピーしました！この URLを他の人に送ることでデータが共有できます。')
    }).catch(() => {
      alert('クリップボードへのコピーに失敗しました。')
    })
  }

  // .ics ファイル（カレンダーフォーマット）を生成しダウンロード
  const exportToGoogleCalendar = () => {
    // スケジュールの総数を数える（自動生成+手動追加）
    let totalSchedules = 0
    let scheduleCounts = []
    
    summary.forEach(child => {
      const count = child.schedule.length
      totalSchedules += count
      if (count > 0) {
        scheduleCounts.push(`${child.name}: ${count}件`)
      }
    })

    if (children.length === 0) {
      alert('子どもが登録されていません。先に子どもを登録してください。')
      return
    }

    if (totalSchedules === 0) {
      const childrenNames = children.map(c => c.name).join('、')
      alert(`登録されたスケジュールがありません。\n\n登録済みの子ども: ${childrenNames}\n\n各子どもの「スケジュール追加」ボタンからスケジュールを登録してください。\n（自動生成されるスケジュールもあります）`)
      return
    }

    // .ics ファイル内容を生成
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

    // 全てのスケジュールをカレンダーイベントに変換（自動生成+手動追加）
    summary.forEach(child => {
      child.schedule.forEach((schedule, idx) => {
        const startDate = new Date(schedule.date + 'T000000')
        const endDate = new Date(schedule.endDate ? schedule.endDate + 'T235959' : schedule.date + 'T235959')
        
        // ISO 8601 形式に変換（YYYYMMDDTHHMMSS）
        const formatDateForIcs = (date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          return `${year}${month}${day}T${hours}${minutes}${seconds}`
        }

        const eventSummary = `${child.name}：${schedule.title}`
        const eventDescription = `カテゴリ：${schedule.category}\n${schedule.description || ''}`
        const uid = `${child.id}-${schedule.date}-${idx}@kodomo-schedule.local`

        icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDateForIcs(now)}Z
DTSTART:${formatDateForIcs(startDate)}
DTEND:${formatDateForIcs(endDate)}
SUMMARY:${eventSummary}
DESCRIPTION:${eventDescription.replace(/\n/g, '\\n')}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
`
      })
    })

    icsContent += `END:VCALENDAR`

    // ファイルをダウンロード
    const element = document.createElement('a')
    const file = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `子供のスケジュール_${new Date().toISOString().slice(0, 10)}.ics`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    alert('カレンダーファイルをダウンロードしました。\nGoogleカレンダーの「他のカレンダーを追加」から「アップロード」を選択して、ダウンロードしたファイルをインポートしてください。')
  }

  // Google Calendarにスケジュール登録（自動登録）
  const registerToGoogleCalendar = async () => {
    if (children.length === 0) {
      alert('子どもが登録されていません。')
      return
    }

    let totalSchedules = 0
    summary.forEach(child => {
      totalSchedules += child.schedule.length
    })

    if (totalSchedules === 0) {
      alert('登録されたスケジュールがありません。')
      return
    }

    // ユーザーに警告
    const confirmed = window.confirm(
      `${totalSchedules}件のスケジュールを Google カレンダーに追加します。\n\n` +
      `複数のウィンドウが順番に開きます。\n` +
      `各ウィンドウで「保存」をクリックしてください。\n\n` +
      `ポップアップブロック設定を確認してください。`
    )

    if (!confirmed) return

    try {
      // Google Calendar イベント作成URL を生成
      const eventUrls = []
      
      for (const child of summary) {
        for (const schedule of child.schedule) {
          // 日付フォーマット: YYYYMMDD（全日イベント）
          const startDate = schedule.date.replace(/-/g, '')
          
          // 終了日は+1日（Google Calendar の全日イベント形式）
          const endDateObj = new Date(schedule.endDate || schedule.date)
          endDateObj.setDate(endDateObj.getDate() + 1)
          const formattedEndDate = endDateObj.toISOString().slice(0, 10).replace(/-/g, '')
          
          const title = `${child.name}：${schedule.title}`
          
          // 詳細情報を組み立て
          let details = `【カテゴリ】${schedule.category}`
          
          if (schedule.description) {
            details += `\n\n【説明】\n${schedule.description}`
          }
          
          if (schedule.todos && Array.isArray(schedule.todos) && schedule.todos.length > 0) {
            details += `\n\n【Todoリスト】`
            schedule.todos.forEach(todo => {
              details += `\n・${todo}`
            })
          }
          
          if (schedule.supplies && Array.isArray(schedule.supplies) && schedule.supplies.length > 0) {
            details += `\n\n【準備物】`
            schedule.supplies.forEach(supply => {
              details += `\n・${supply}`
            })
          }
          
          const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(title)}&dates=${startDate}/${formattedEndDate}&details=${encodeURIComponent(details)}`
          eventUrls.push(url)
        }
      }

      // URL の順序を逆順にする
      eventUrls.reverse()

      // 全ウィンドウを短時間隔で開く
      const openedWindows = []
      let successCount = 0
      let failCount = 0

      for (let i = 0; i < eventUrls.length; i++) {
        const win = window.open(eventUrls[i], `calendar_${i}`, 'width=800,height=600')
        if (win) {
          successCount++
          openedWindows.push(win)
        } else {
          failCount++
        }
        
        // 100msの遅延で次を開く
        if (i < eventUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      if (failCount > 0) {
        alert(
          `✓ 処理完了\n\n` +
          `開かれたウィンドウ: ${successCount}件\n` +
          `ブロックされたウィンドウ: ${failCount}件\n\n` +
          `各ウィンドウで「保存」をクリック後、ウィンドウを手動で閉じてください。\n` +
          `ポップアップブロック設定を確認し、再度実行してください。`
        )
      } else {
        alert(
          `✓ ${totalSchedules}件のスケジュール登録ウィンドウを開きました。\n\n` +
          `【操作手順】\n` +
          `1. 各ウィンドウで「保存」をクリック\n` +
          `2. ウィンドウを手動で閉じる\n` +
          `3. 全て完了後、Googleカレンダーを確認`
        )
      }
    } catch (err) {
      console.error('Calendar registration error:', err)
      alert('Googleカレンダーへの登録に失敗しました。\n\nエラー: ' + err.message)
    }
  }

  const openScheduleEditor = (childId, scheduleItem) => {
    setEditingSchedule({ childId, scheduleItem })
    setEditForm({
      title: scheduleItem.title,
      date: scheduleItem.date,
      endDate: scheduleItem.endDate,
      description: scheduleItem.description || '',
      category: scheduleItem.category,
      todos: scheduleItem.todos || [],
      supplies: scheduleItem.supplies || []
    })
  }

  const closeScheduleEditor = () => {
    setEditingSchedule(null)
    setEditForm({
      title: '',
      date: '',
      endDate: '',
      description: '',
      category: '準備',
      todos: [],
      supplies: []
    })
  }

  const saveScheduleEdit = () => {
    
    const title = editForm.title.trim()
    if (!title || !validateLength(title, 200)) {
      setError('タイトルは1文字以上200文字以下で入力してください。')
      return
    }
    
    if (!editForm.date || !validateDate(editForm.date)) {
      setError('正しい開始日を入力してください。')
      return
    }
    
    if (!editForm.endDate || !validateDate(editForm.endDate)) {
      setError('正しい終了日を入力してください。')
      return
    }
    
    if (new Date(editForm.date) > new Date(editForm.endDate)) {
      setError('開始日は終了日以前の日付を選択してください。')
      return
    }

    // scheduleItem から実際の childId を取得
    // カレンダーの場合は "combined" が渡されるため、childName から検索
    // Todo側の場合は直接 childId が含まれているため使用
    const actualChildId = (() => {
      if (editingSchedule.scheduleItem.childId === 'combined') {
        // カレンダー表示用の "combined" の場合、childName から実際のIDを検索
        return children.find(c => c.name === editingSchedule.scheduleItem.childName)?.id
      } else if (editingSchedule.scheduleItem.childId) {
        // scheduleItemに childId がある場合（修正後のTodo側）
        return editingSchedule.scheduleItem.childId
      } else {
        // 以前のコード互換性：editingSchedule.childId を使用
        return editingSchedule.childId
      }
    })()
    
    const updatedChildren = children.map((child) => {
      if (child.id !== actualChildId) return child

      const customSchedules = child.customSchedules || []
      const excludedIds = new Set(child.excludedScheduleIds || [])
      const existingIndex = customSchedules.findIndex(
        (s) => s.id === editingSchedule.scheduleItem.id
      )

      // editForm の undefined を削除とサニタイゼーション
      const cleanedEditForm = {
        title: sanitizeInput(title),
        date: editForm.date,
        endDate: editForm.endDate,
        description: sanitizeInput(editForm.description || ''),
        category: sanitizeInput(editForm.category || '準備'),
        todos: Array.isArray(editForm.todos) ? editForm.todos.map(t => sanitizeInput(t)) : [],
        supplies: Array.isArray(editForm.supplies) ? editForm.supplies.map(s => sanitizeInput(s)) : []
      }

      if (existingIndex >= 0) {
        // 既存のカスタムスケジュールを更新
        customSchedules[existingIndex] = {
          ...customSchedules[existingIndex],
          ...cleanedEditForm
        }
      } else {
        // 新しいスケジュールを追加（自動生成されたものをカスタムに変換）
        const newSchedule = {
          id: editingSchedule.scheduleItem.id || crypto.randomUUID(),
          ...cleanedEditForm
        }
        customSchedules.push(newSchedule)
        // 自動生成スケジュールを非表示にするため excludedScheduleIds に追加
        excludedIds.add(editingSchedule.scheduleItem.id)
      }

      return { 
        ...child, 
        customSchedules,
        excludedScheduleIds: Array.from(excludedIds)
      }
    })

    setChildren(updatedChildren)
    
    // ローカルストレージに自動保存
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChildren))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('ローカルストレージの保存エラー:', error)
    }

    closeScheduleEditor()
  }

  const deleteSchedule = () => {
    if (!window.confirm('このスケジュールを削除してもよろしいですか？')) {
      return
    }
    
    // scheduleItem から実際の childId を取得
    const actualChildId = (() => {
      if (editingSchedule.scheduleItem.childId === 'combined') {
        return children.find(c => c.name === editingSchedule.scheduleItem.childName)?.id
      } else if (editingSchedule.scheduleItem.childId) {
        return editingSchedule.scheduleItem.childId
      } else {
        return editingSchedule.childId
      }
    })()
    
    const scheduleId = editingSchedule.scheduleItem.id
    
    const updatedChildren = children.map((child) => {
      if (child.id !== actualChildId) return child
      
      // カスタムスケジュールに含まれているかをチェック（優先）
      const isInCustomSchedules = (child.customSchedules || []).some(s => s.id === scheduleId)
      
      if (isInCustomSchedules) {
        // カスタムスケジュールから削除
        const customSchedules = (child.customSchedules || []).filter(
          (s) => s.id !== scheduleId
        )
        // 同時に excludedScheduleIds に追加して、自動生成版も表示しないようにする
        const excludedScheduleIds = child.excludedScheduleIds || []
        if (!excludedScheduleIds.includes(scheduleId)) {
          excludedScheduleIds.push(scheduleId)
        }
        return { ...child, customSchedules, excludedScheduleIds }
      } else {
        // 自動生成スケジュールの場合、excludedScheduleIdsに追加
        const excludedScheduleIds = child.excludedScheduleIds || []
        if (!excludedScheduleIds.includes(scheduleId)) {
          excludedScheduleIds.push(scheduleId)
        }
        return { ...child, excludedScheduleIds }
      }
    })

    setChildren(updatedChildren)
    
    // ローカルストレージに自動保存
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChildren))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('ローカルストレージの保存エラー:', error)
    }

    closeScheduleEditor()
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">現役パパが考えた、子育てを楽にするスケジュール管理</p>
          <h1>子供スケジュール</h1>
          <p className="description">
            役所手続き、予防接種、保育園準備まで。子どもごとに必要なスケジュールを一目で確認できます。
            <br />
            <small>※ 本アプリで表示されるスケジュールはあくまで目安です。実際の手続きや予防接種日程は児童福祉施設や保健サービスの指示に従ってください。</small>
          </p>
          <div className="statistics">
            <div className="count-up-item">
              <div className="count-up-number">{(statistics.userCount || 0).toLocaleString('ja-JP')}</div>
              <div className="count-up-label">利用者</div>
            </div>
            <div className="count-up-item">
              <div className="count-up-number">{(statistics.totalChildren || 0).toLocaleString('ja-JP')}</div>
              <div className="count-up-label">登録された子ども</div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="panel">
          <h2>子供を登録する</h2>
          <form className="input-form" onSubmit={handleSubmit}>
            <label>
              名前（ニックネーム可）
              <input
                id="child-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="例: はなこ"
                autoComplete="name"
              />
            </label>

            <label>
              生年月日
              <input
                id="child-birthdate"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
                autoComplete="off"
              />
            </label>

            <label>
              性別
              <select
                id="child-gender"
                name="gender"
                value={form.gender}
                onChange={(event) => setForm({ ...form, gender: event.target.value })}
              >
                <option value="male">男の子</option>
                <option value="female">女の子</option>
              </select>
            </label>

            <label>
              居住地（都道府県）
              <select
                id="child-prefecture"
                name="prefecture"
                value={form.prefecture}
                onChange={(event) => {
                  const prefecture = event.target.value
                  setForm({ ...form, prefecture, municipality: '' })
                }}
                autoComplete="off"
              >
                <option value="">選択してください</option>
                {Object.keys(PREFECTURES_MUNICIPALITIES).map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </label>

            {String(form.prefecture).length > 0 ? (
              <label>
                居住地（市町村）
                <select
                  id="child-municipality"
                  name="municipality"
                  value={form.municipality}
                  onChange={(event) => setForm({ ...form, municipality: event.target.value })}
                  autoComplete="off"
                >
                  <option value="">選択してください</option>
                {PREFECTURES_MUNICIPALITIES[form.prefecture] && PREFECTURES_MUNICIPALITIES[form.prefecture].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <fieldset className="category-fieldset">
              <legend>表示するスケジュールのカテゴリ（選択なしで全て表示）</legend>
              <div className="category-checkboxes">
                {availableCategories.map((category) => (
                  <label key={category} className="category-checkbox">
                    <input
                      id={`category-${category}`}
                      name={`category-${category}`}
                      type="checkbox"
                      checked={(form.selectedCategories || []).includes(category)}
                      onChange={(event) => {
                        const { checked } = event.target
                        setForm((prev) => ({
                          ...prev,
                          selectedCategories: checked
                            ? [...prev.selectedCategories, category]
                            : prev.selectedCategories.filter((c) => c !== category)
                        }))
                      }}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit">登録してスケジュールを見る</button>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <h2>登録済みの子供</h2>
            </div>
          </div>
          {children.length === 0 ? (
            <p className="empty-state">まだ子供が登録されていません。上のフォームから追加してください。</p>
          ) : (
            <div className="combined-children-info">
              {children.map((child) => (
                <div key={child.id} className="combined-child-card">
                  <div className="combined-child-header">
                    <div>
                      <h4>{child.name}</h4>
                      <p>
                        生年月日: {formatDate(child.birthDate)}（{calculateAge(child.birthDate)}）
                      </p>
                      <p>
                        性別: {child.gender === 'male' ? '男の子' : '女の子'}
                      </p>
                      {(child.prefecture || child.municipality) && (
                        <p>
                          居住地: {child.prefecture}{child.municipality ? ` ${child.municipality}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="button-group">
                      <button className="edit-button" onClick={() => openEditChild(child)}>
                        編集
                      </button>
                      <button className="remove-button" onClick={() => removeChild(child.id)}>
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {viewMode === 'list' && children.length > 0 && (
          <section className="panel">
            <div className="section-header">
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Todo</h2>
                <button className="add-schedule-button" onClick={openScheduleAdder}>
                  + 追加
                </button>
              </div>
              {children.length > 0 && (
                <div className="view-toggle">
                  <button
                    type="button"
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    Todo
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'combined-calendar' ? 'active' : ''}
                    onClick={() => setViewMode('combined-calendar')}
                  >
                    カレンダー
                  </button>
                </div>
              )}
            </div>
            {children.length > 0 && (
              <div className="child-filter-tabs">
                <button
                  type="button"
                  className={selectedChildIds.length === 0 ? 'active' : ''}
                  onClick={() => setSelectedChildIds([])}
                >
                  すべて
                </button>
                {children.length >= 3 ? (
                  children.map((child) => (
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
                    >
                      {child.name}
                    </button>
                  ))
                ) : (
                  children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={selectedChildIds.includes(child.id) ? 'active' : ''}
                      onClick={() => setSelectedChildIds([child.id])}
                    >
                      {child.name}
                    </button>
                  ))
                )}
              </div>
            )}
            <>
              {summary
                .filter((child) => selectedChildIds.length === 0 || selectedChildIds.includes(child.id))
                .map((child) => (
                  <article key={child.id} className="child-card">
                  <div className="child-header">
                    <div>
                      <h3>{child.name}</h3>
                      <p>生年月日: {formatDate(child.birthDate)}（{calculateAge(child.birthDate)}）</p>
                      <p>性別: {child.gender === 'male' ? '男の子' : '女の子'}</p>
                    </div>
                  </div>

                  <div className="schedule-grid">
                    {child.schedule.map((item) => (
                      <div
                        key={`${child.id}-${item.date}-${item.title}`}
                        className="schedule-item"
                        onClick={() => openScheduleEditor(child.id, item)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="item-meta">
                          <span className="item-date">{formatRange(item.date, item.endDate)}</span>
                          <span className={`item-category category-${item.category}`}>
                            {item.category}
                          </span>
                        </div>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </>
          </section>
        )}

        {viewMode === 'combined-calendar' && children.length > 0 && (
          <section className="panel">
            <div className="section-header">
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>カレンダー</h2>
                <button className="add-schedule-button" onClick={openScheduleAdder}>
                  + 追加
                </button>
              </div>
              {children.length > 0 && (
                <div className="view-toggle">
                  <button
                    type="button"
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    Todo
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'combined-calendar' ? 'active' : ''}
                    onClick={() => setViewMode('combined-calendar')}
                  >
                    カレンダー
                  </button>
                </div>
              )}
            </div>
            {children.length > 0 && (
              <div className="child-filter-tabs">
                <button
                  type="button"
                  className={selectedChildIds.length === 0 ? 'active' : ''}
                  onClick={() => setSelectedChildIds([])}
                >
                  すべて
                </button>
                {children.length >= 3 ? (
                  children.map((child) => (
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
                    >
                      {child.name}
                    </button>
                  ))
                ) : (
                  children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={selectedChildIds.includes(child.id) ? 'active' : ''}
                      onClick={() => setSelectedChildIds([child.id])}
                    >
                      {child.name}
                    </button>
                  ))
                )}
              </div>
            )}
            <ChildCalendar
              children={[
                {
                  id: 'combined',
                  name: '統合',
                  schedule: selectedChildIds.length > 0
                    ? combinedSchedule.filter(item => selectedChildIds.includes(item.childId))
                    : combinedSchedule
                }
              ]}
              selectedChildIds={['combined']}
              onEventClick={openScheduleEditor}
            />
          </section>
        )}

        <section className="panel save-section">
          <h2>データ管理</h2>
          <div className="save-buttons-group">
            <button className="save-button export-button" onClick={() => openShareModal()}>
              URLで共有
            </button>
            <button className="save-button export-button" onClick={registerToGoogleCalendar} style={{ backgroundColor: '#1F2937' }}>
              Googleカレンダーに登録
            </button>
            <button className="save-button export-button" onClick={exportData}>
              データをエクスポート
            </button>
            <label className="import-button-label">
              <input
                id="import-file"
                name="importFile"
                type="file"
                accept=".json"
                onChange={importData}
                style={{ display: 'none' }}
              />
              データをインポート
            </label>
          </div>
          {saveSuccess && <p className="save-success">✓ データを保存しました</p>}
          <p className="data-policy" style={{ fontSize: '0.9rem', color: '#666', marginTop: '16px', lineHeight: '1.6' }}>
            ℹ️ <strong>データ保持について：</strong>
            <br />
            本アプリのデータは1年間保持されます。1年以上アクセスがない場合、データは自動的に削除されます。
            <br />
            1年以上アプリを使用する予定がない場合は、事前に「データをエクスポート」でバックアップを取ることをお勧めします。
            <br />
            <br />
            ⚠️ <strong>重要：ブラウザのキャッシュ削除について：</strong>
            <br />
            本アプリのデータへのアクセスIDはブラウザのキャッシュに保存されています。
            <br />
            ブラウザのキャッシュやクッキーを削除すると、ID情報も削除され、データを呼び出すことができなくなります。
            <br />
            ブラウザのキャッシュを削除する前に、必ず「URLで共有」ボタンからURLを控えてください。
            <br />
            その URLを使えば、削除後でも同じデータにアクセスできます。
          </p>
        </section>
      </main>

      {editingSchedule && (
        <div className="modal-overlay" onClick={closeScheduleEditor}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>スケジュールを編集</h3>
              <button className="modal-close" onClick={closeScheduleEditor}>×</button>
            </div>

            <div className="modal-body">
              <div className="edit-form">
                <label>
                  スケジュール名
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="スケジュール名を入力"
                    autoComplete="off"
                  />
                </label>

                <label>
                  開始日
                  <input
                    id="edit-date"
                    name="date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    autoComplete="off"
                  />
                </label>

                <label>
                  終了日
                  <input
                    id="edit-endDate"
                    name="endDate"
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    autoComplete="off"
                  />
                </label>

                <label>
                  カテゴリ
                  <select
                    id="edit-category"
                    name="category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    autoComplete="off"
                  >
                    <option value="手続き">手続き</option>
                    <option value="予防接種">予防接種</option>
                    <option value="保育園">保育園</option>
                    <option value="準備">準備</option>
                    <option value="行事">行事</option>
                    <option value="入学準備">入学準備</option>
                  </select>
                </label>

                <label>
                  説明
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="説明を入力"
                    rows={3}
                    autoComplete="off"
                  />
                </label>

                <label>
                  Todoリスト
                  <textarea
                    id="edit-todos"
                    name="todos"
                    value={editForm.todos.join('\n')}
                    onChange={(e) => setEditForm({ ...editForm, todos: e.target.value.split('\n').filter(item => item.trim()) })}
                    placeholder="各行に1つのタスクを入力してください"
                    rows={3}
                    autoComplete="off"
                  />
                </label>

                <label>
                  準備物
                  <textarea
                    id="edit-supplies"
                    name="supplies"
                    value={editForm.supplies.join('\n')}
                    onChange={(e) => setEditForm({ ...editForm, supplies: e.target.value.split('\n').filter(item => item.trim()) })}
                    placeholder="各行に1つの準備物を入力してください"
                    rows={3}
                    autoComplete="off"
                  />
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="delete-button" onClick={deleteSchedule}>
                削除
              </button>
              <div className="modal-actions">
                <button className="cancel-button" onClick={closeScheduleEditor}>
                  キャンセル
                </button>
                <button className="save-button" onClick={saveScheduleEdit}>
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* スケジュール追加モーダル */}
      {addingSchedule && (
        <div className="modal-overlay" onClick={closeScheduleAdder}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>スケジュールを追加</h3>
              <button className="modal-close" onClick={closeScheduleAdder}>×</button>
            </div>

            <div className="modal-body">
              <fieldset>
                <legend>子どもを選択（複数選択可能）</legend>
                <div className="children-selection">
                  {children.map((child) => (
                    <label key={child.id} className="child-checkbox">
                      <input
                        id={`child-check-${child.id}`}
                        name={`child-check-${child.id}`}
                        type="checkbox"
                        checked={selectedChildrenForSchedule.includes(child.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChildrenForSchedule([...selectedChildrenForSchedule, child.id])
                          } else {
                            setSelectedChildrenForSchedule(selectedChildrenForSchedule.filter(id => id !== child.id))
                          }
                        }}
                      />
                      <span>{child.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="edit-form">
                <label>
                  スケジュール名
                  <input
                    type="text"
                    value={addScheduleForm.title}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, title: e.target.value })}
                    placeholder="スケジュール名を入力"
                    autoComplete="off"
                  />
                </label>

                <label>
                  開始日
                  <input
                    type="date"
                    value={addScheduleForm.date}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, date: e.target.value })}
                    autoComplete="off"
                  />
                </label>

                <label>
                  終了日
                  <input
                    type="date"
                    value={addScheduleForm.endDate}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, endDate: e.target.value })}
                    autoComplete="off"
                  />
                </label>

                <label>
                  カテゴリ
                  <select
                    value={addScheduleForm.category}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, category: e.target.value })}
                    autoComplete="off"
                  >
                    <option value="手続き">手続き</option>
                    <option value="予防接種">予防接種</option>
                    <option value="保育園">保育園</option>
                    <option value="準備">準備</option>
                    <option value="行事">行事</option>
                    <option value="入学準備">入学準備</option>
                    <option value="健康診断">健康診断</option>
                    <option value="行政手続き">行政手続き</option>
                    <option value="生活・成長">生活・成長</option>
                    <option value="教育・発達">教育・発達</option>
                    <option value="記念イベント">記念イベント</option>
                    <option value="学校関連">学校関連</option>
                  </select>
                </label>

                <label>
                  説明
                  <textarea
                    value={addScheduleForm.description || ''}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, description: e.target.value })}
                    placeholder="説明を入力"
                    rows={3}
                    autoComplete="off"
                  />
                </label>

                <label>
                  Todoリスト
                  <textarea
                    value={addScheduleForm.todos.join('\n')}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, todos: e.target.value.split('\n').filter(item => item.trim()) })}
                    placeholder="各行に1つのタスクを入力してください"
                    rows={3}
                    autoComplete="off"
                  />
                </label>

                <label>
                  準備物
                  <textarea
                    value={addScheduleForm.supplies.join('\n')}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, supplies: e.target.value.split('\n').filter(item => item.trim()) })}
                    placeholder="各行に1つの準備物を入力してください"
                    rows={3}
                    autoComplete="off"
                  />
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-actions">
                <button className="cancel-button" onClick={closeScheduleAdder}>
                  キャンセル
                </button>
                <button className="save-button" onClick={saveNewSchedule}>
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 子供情報編集モーダル */}
      {editingChildId && (
        <div className="modal-overlay" onClick={closeEditChild}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEditChild}>×</button>
            <h2>子供情報を編集</h2>
            <div className="edit-form">
              <label>
                名前（ニックネーム可）
                <input
                  type="text"
                  value={editChildForm.name}
                  onChange={(e) => setEditChildForm({ ...editChildForm, name: e.target.value })}
                />
              </label>

              <label>
                生年月日
                <input
                  type="date"
                  value={editChildForm.birthDate}
                  onChange={(e) => setEditChildForm({ ...editChildForm, birthDate: e.target.value })}
                />
                {editChildForm.birthDate && <p style={{margin: '6px 0 0', fontSize: '0.9rem', color: '#64748b'}}>現在: {calculateAge(editChildForm.birthDate)}</p>}
              </label>

              <label>
                性別
                <select
                  value={editChildForm.gender}
                  onChange={(e) => setEditChildForm({ ...editChildForm, gender: e.target.value })}
                >
                  <option value="male">男の子</option>
                  <option value="female">女の子</option>
                </select>
              </label>

              <label>
                居住地（都道府県）
                <select
                  value={editChildForm.prefecture}
                  onChange={(e) => {
                    const prefecture = e.target.value
                    setEditChildForm({ ...editChildForm, prefecture, municipality: '' })
                  }}
                >
                  <option value="">選択してください</option>
                  {Object.keys(PREFECTURES_MUNICIPALITIES).map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
              </label>

              {editChildForm.prefecture ? (
                <label>
                  居住地（市町村）
                  <select
                    value={editChildForm.municipality}
                    onChange={(e) => setEditChildForm({ ...editChildForm, municipality: e.target.value })}
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES_MUNICIPALITIES[editChildForm.prefecture] && PREFECTURES_MUNICIPALITIES[editChildForm.prefecture].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <fieldset>
                <legend>表示するスケジュールのカテゴリ（選択なしで全て表示）</legend>
                <div className="category-checkboxes">
                  {getAvailableCategories().map((category) => (
                    <label key={category} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={editChildForm.selectedCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditChildForm({
                              ...editChildForm,
                              selectedCategories: [...editChildForm.selectedCategories, category]
                            })
                          } else {
                            setEditChildForm({
                              ...editChildForm,
                              selectedCategories: editChildForm.selectedCategories.filter(cat => cat !== category)
                            })
                          }
                        }}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="modal-footer">
              <div className="modal-actions">
                <button className="cancel-button" onClick={closeEditChild}>
                  キャンセル
                </button>
                <button className="save-button" onClick={saveChildEdit}>
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ポリシーモーダル */}
      {showPolicyModal && (
        <PolicyModal 
          type={policyType} 
          onClose={() => {
            setShowPolicyModal(false)
            setPolicyType(null)
          }}
        />
      )}

      {/* フッター */}
      <Footer 
        onPolicyClick={() => {
          setPolicyType('policy')
          setShowPolicyModal(true)
        }}
        onTermsClick={() => {
          setPolicyType('terms')
          setShowPolicyModal(true)
        }}
      />

    </div>
  )
}

export default App
