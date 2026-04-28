import FloatingMenuButton from './components/FloatingMenuButton'
import Header from './components/Header'
import Select from 'react-select'

import { useEffect, useMemo, useState, useRef } from 'react'
import { ChildCalendar } from './components/ChildCalendar'
import Footer from './components/Footer2'
import PolicyModal from './components/PolicyModal'
import { generateSchedule, isHoliday, getAvailableCategories, getCategoryIndex, formatDate, calculateAge, formatRange } from './lib/schedule.js'
import { getLocalSchedules } from './lib/localSchedules.js'
import { saveDataToFirebase, listenToData, checkAndDeleteOldData, updateLastAccessedAt, deleteDataFromFirebase, listenToStatistics, initializeStatistics, incrementUserCount, incrementChildCount, getDataFromFirebase } from './firebase'
import { sanitizeInput, sanitizeObject, validateLength, validateDate, validateUUID } from './utils/security'
import { useDeviceType } from './utils/responsive'
import { STORAGE_KEY, FORM_STORAGE_KEY, GROUP_ID_STORAGE_KEY, INITIAL_EDIT_FORM, getInitialForm, CATEGORY_ORDER } from './constants'
import { useChildrenState, useFormState, useScheduleEditState, useUIState } from './hooks/useAppState'
import { createNewChild, confirmDeleteChild, validateChildEdit, updateChildInfo, validateScheduleForm, createNewSchedule, saveToLocalStorage, exportDataAsJSON, getScheduleFormDefaults, generateShareUrl, copyShareUrlToClipboard, decompressShareData } from './utils/handlers'
import { downloadCalendarFile } from './utils/calendar'
import { importDataFromFile, clearFileInput, validateImportedData } from './utils/importExport'

function App() {
  // まずhooksをすべて先頭で呼び出す
  const { children, setChildren, editingChildId, setEditingChildId, editChildForm, setEditChildForm, resetEditChildForm } = useChildrenState();
  const { form, setForm, error, setError, fieldErrors, setFieldErrors, clearFieldErrors, saveSuccess, setSaveSuccess, resetForm, showError, showSuccess } = useFormState();
  const { editingSchedule, setEditingSchedule, editForm, setEditForm, addingSchedule, setAddingSchedule, selectedChildrenForSchedule, setSelectedChildrenForSchedule, resetEditForm, closeEditor } = useScheduleEditState();
  const { viewMode, setViewMode, groupId, setGroupId, currentCombinedMonth, setCurrentCombinedMonth, resetUI } = useUIState();

  // 動的ロード用: 都道府県→市町村データ
  const [municipalities, setMunicipalities] = useState([]);
  const [prefectureOptions, setPrefectureOptions] = useState([]);
  const [municipalityLoading, setMunicipalityLoading] = useState(false);
  // 編集モーダル用
  const [editMunicipalities, setEditMunicipalities] = useState([]);

  // 初回マウント時に都道府県リストのみロード
  useEffect(() => {
    import('./constants_municipalities_full').then(mod => {
      setPrefectureOptions(Object.keys(mod.PREFECTURES_MUNICIPALITIES).map(pref => ({ value: pref, label: pref })));
    });
  }, []);

  // 都道府県選択時に市町村リストを動的ロード（通常フォーム）
  useEffect(() => {
    if (!form || !form.prefecture) {
      setMunicipalities([]);
      return;
    }
    setMunicipalityLoading(true);
    import('./constants_municipalities_full').then(mod => {
      setMunicipalities(mod.PREFECTURES_MUNICIPALITIES[form.prefecture] || []);
      setMunicipalityLoading(false);
    });
  }, [form && form.prefecture]);

  // 編集モーダル用: 都道府県選択時に市町村リストを動的ロード
  useEffect(() => {
    if (!editChildForm || !editChildForm.prefecture) {
      setEditMunicipalities([]);
      return;
    }
    import('./constants_municipalities_full').then(mod => {
      setEditMunicipalities(mod.PREFECTURES_MUNICIPALITIES[editChildForm.prefecture] || []);
    });
  }, [editChildForm && editChildForm.prefecture]);
        // ステータスフィルター（複数選択対応）
        const STATUS_LIST = ['未対応', '対応中', '完了', '期限切れ'];
        const [statusFilter, setStatusFilter] = useState([...STATUS_LIST]);
      // メニューからやることリスト押下時にviewModeを切り替えるカスタムイベントリスナー
      useEffect(() => {
        const handler = () => setViewMode('list');
        window.addEventListener('setViewModeList', handler);
        return () => window.removeEventListener('setViewModeList', handler);
      }, []);
    // メニューからカレンダー押下時にviewModeを切り替えるカスタムイベントリスナー
    useEffect(() => {
      const handler = () => setViewMode('combined-calendar');
      window.addEventListener('setViewModeCombinedCalendar', handler);
      return () => window.removeEventListener('setViewModeCombinedCalendar', handler);
    }, []);
  const today = new Date().toISOString().slice(0, 10)
  const deviceType = useDeviceType()
  
  // Custom hooks for state management
  const [selectedChildIds, setSelectedChildIds] = useState([]);

  // childrenが変わったら全選択
  useEffect(() => {
    if (children && children.length > 0) {
      setSelectedChildIds(children.map(child => child.id));
    } else {
      setSelectedChildIds([]);
    }
  }, [children])

  // （上記でhooksはすべて宣言済み）
  
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
    category: '育児準備',
    todos: [],
    supplies: [],
    status: '未対応'
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
        // 共有データなし → localStorage から form を読み込む
        const storedForm = window.localStorage.getItem(FORM_STORAGE_KEY)
        if (storedForm) {
          try {
            const parsedForm = JSON.parse(storedForm)
            setForm(parsedForm)
          } catch (error) {
            console.error('form パースエラー:', error)
          }
        }
      }
      
    } catch (error) {
      // エラーの場合も続行
    }
  }, [])

  // フォーム入力内容をリアルタイムで自動保存（子ども追加時のリセットは除外）
  const formSaveSkipRef = useRef(false);
  useEffect(() => {
    if (formSaveSkipRef.current) {
      formSaveSkipRef.current = false;
      return;
    }
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
    
    let unsubscribe = null
    
    const setupFirebase = async () => {
      try {
        const wasDeleted = await checkAndDeleteOldData(groupId)
        if (wasDeleted) {
          // ローカルストレージもクリア
          window.localStorage.removeItem(STORAGE_KEY)
          window.localStorage.removeItem(FORM_STORAGE_KEY)
          const userCountKey = `userCountIncremented_${groupId}`
          window.localStorage.removeItem(userCountKey)
          setChildren([])
          setForm(getInitialForm())
          return
        }
        
        // Firebase からのリアルタイムリスニングを開始（groupId を使用）
        unsubscribe = listenToData(groupId, (firebaseData) => {
          
          // 空配列は falsy なので、Array.isArray だけでチェック
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
    
    // useEffect のクリーンアップ関数
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [groupId])

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
        .map(item => {
          // ステータス自動変換: 終了日が過去かつ完了以外は「期限切れ」
          const todayStr = new Date().toISOString().slice(0, 10)
          let status = item.status || '未対応'
          if (status !== '完了' && item.endDate && item.endDate < todayStr) {
            status = '期限切れ'
          }
          return {
            ...item,
            status,
            childId: child.id,
            childName: child.name
          }
        })
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
    clearFieldErrors()
    
    // 入力値の検証とサニタイゼーション
    const name = form.name.trim()
    let hasError = false

    if (!name || !validateLength(name, 100)) {
      setFieldErrors(prev => ({ ...prev, name: '名前かニックネームを入力してください。' }))
      hasError = true
    }
    
    if (!form.birthDate || !validateDate(form.birthDate)) {
      setFieldErrors(prev => ({ ...prev, birthDate: '正しい生年月日を入力してください。' }))
      hasError = true
    }
    
    if (!form.prefecture || !validateLength(form.prefecture, 50)) {
      setFieldErrors(prev => ({ ...prev, prefecture: '住んでいる都道府県を選択してください。' }))
      hasError = true
    }
    
    if (!form.municipality || !validateLength(form.municipality, 100)) {
      setFieldErrors(prev => ({ ...prev, municipality: '住んでいる市区町村を選択してください。' }))
      hasError = true
    }

    if (form.selectedCategories.length === 0) {
      setFieldErrors(prev => ({ ...prev, selectedCategories: '追加するスケジュールを選択してください。' }))
      hasError = true
    }

    if (hasError) return

    const birthDate = new Date(form.birthDate)
    if (Number.isNaN(birthDate.getTime())) {
      setFieldErrors(prev => ({ ...prev, birthDate: '正しい日付を入力してください。' }))
      return
    }

    const newChild = {
      id: crypto.randomUUID(),
      name: sanitizeInput(name),
      birthDate: birthDate.toISOString().slice(0, 10),
      gender: sanitizeInput(form.gender),
      prefecture: sanitizeInput(form.prefecture),
      municipality: sanitizeInput(form.municipality),
      selectedCategories: form.selectedCategories,
      customSchedules: [],
      excludedScheduleIds: []
    }
    
    const updatedChildren = [...children, newChild]

    setChildren(updatedChildren)

    // ローカルストレージにも保存
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChildren))
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form))
    } catch (error) {
      console.error('ローカルストレージの保存エラー:', error)
    }

    // Firebase に保存
    if (groupId) {
      // 1人目の子供追加時のみ、保存前にグループ存在チェック→カウントアップ
      const userCountKey = `userCountIncremented_${groupId}`;
      const alreadyIncremented = window.localStorage.getItem(userCountKey) === 'true';
      const doIncrementUserCount = !alreadyIncremented && children.length === 0;

      const handleAfterSave = () => {
        // 子ども数をカウント
        incrementChildCount();
        // フォームはリセットしない（入力内容を残す）
        clearFieldErrors();
        showSuccess();
      };

      if (doIncrementUserCount) {
        getDataFromFirebase(groupId).then((existingData) => {
          if (!existingData) {
            incrementUserCount();
          }
          window.localStorage.setItem(userCountKey, 'true');
          saveDataToFirebase(groupId, { children: updatedChildren, form })
            .then(handleAfterSave)
            .catch((error) => {
              console.error('Firebase save error:', error);
              showError('データの保存に失敗しました。もう一度お試しください。');
            });
        });
      } else {
        saveDataToFirebase(groupId, { children: updatedChildren, form })
          .then(handleAfterSave)
          .catch((error) => {
            console.error('Firebase save error:', error);
            showError('データの保存に失敗しました。もう一度お試しください。');
          });
      }
    } else {
      // Firebase なし（ローカルのみ）
      incrementChildCount();
      // フォームはリセットしない（入力内容を残す）
      clearFieldErrors();
      showSuccess();
    }
  }

  const removeChild = async (id) => {
    // window.confirmは使わず、即時削除
    const updatedChildren = children.filter((child) => child.id !== id)
    setChildren(updatedChildren)
    
    // Firebase に保存
    if (groupId) {
      if (updatedChildren.length === 0) {
        // 子どもが全員削除された場合、DBからグループを削除
        try {
          await deleteDataFromFirebase(groupId)
        } catch (error) {
          console.error('Failed to delete group from Firebase:', error)
        }
      } else {
        // 子どもが残っている場合は更新を保存
        saveDataToFirebase(groupId, { children: updatedChildren, form }).catch((error) => {
          console.error('Firebase save error:', error)
        })
      }
    }
  }

  const openEditChild = (child) => {
    setError('')
    clearFieldErrors()
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
    setError('')
    clearFieldErrors()
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
      category: '育児準備',
      todos: [],
      supplies: [],
      status: '未対応'
    });
    setError({ title: '', date: '', children: '' });
  }

  const saveNewSchedule = () => {
    // バリデーション
    // エラー状態を個別に管理
    const errors = {
      title: '',
      date: '',
      children: '',
    };
    if (!addScheduleForm.title || !addScheduleForm.title.trim()) {
      errors.title = 'スケジュール名を入力してください。';
    }
    if (!addScheduleForm.date) {
      errors.date = '開始日を入力してください。';
    }
    if (selectedChildrenForSchedule.length === 0) {
      errors.children = '子どもを選択してください。';
    }
    if (
      addScheduleForm.date &&
      addScheduleForm.endDate &&
      new Date(addScheduleForm.date) > new Date(addScheduleForm.endDate)
    ) {
      errors.date = '開始日は終了日以前の日付を選択してください。';
    }
    // どれか1つでもエラーがあれば表示して終了
    if (errors.title || errors.date || errors.children) {
      setError(errors);
      return;
    }
    setError({ title: '', date: '', children: '' });

    // 複数の子どもで共有するID
    const sharedScheduleId = crypto.randomUUID()

    const updatedChildren = children.map((child) => {
      if (!selectedChildrenForSchedule.includes(child.id)) return child

      const customSchedules = Array.isArray(child.customSchedules) ? [...child.customSchedules] : []
      const newSchedule = {
        id: sharedScheduleId,
        title: addScheduleForm.title.trim(),
        date: addScheduleForm.date,
        endDate: addScheduleForm.endDate || addScheduleForm.date,
        description: addScheduleForm.description || '',
        category: addScheduleForm.category || '育児準備',
        todos: Array.isArray(addScheduleForm.todos) ? addScheduleForm.todos.filter(t => t && t.trim()) : [],
        supplies: Array.isArray(addScheduleForm.supplies) ? addScheduleForm.supplies.filter(s => s && s.trim()) : [],
        status: addScheduleForm.status || '未対応'
      }
      customSchedules.push(newSchedule)

      return { ...child, customSchedules }
    })

    setChildren(updatedChildren)
    
    // Firebase に保存
    if (groupId) {
      saveDataToFirebase(groupId, { children: updatedChildren, form }).catch((error) => {
        console.error('Firebase save error:', error)
        setError(prev => ({ ...prev, firebase: 'スケジュール保存エラーが発生しました。' }));
      })
    }

    // ローカルストレージに自動保存
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChildren))
      const selectedChildren = updatedChildren.filter(c => selectedChildrenForSchedule.includes(c.id))
      const childNames = selectedChildren.map(c => c.name).join('、')
      setSaveSuccess(`スケジュール「${addScheduleForm.title}」を${childNames}に登録しました。`)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('ローカルストレージの保存エラー:', error)
      setError(prev => ({ ...prev, firebase: 'スケジュール保存エラーが発生しました。' }));
      return;
    }

    closeScheduleAdder()
  }

  const saveChildEdit = () => {
    clearFieldErrors()
    
    const name = editChildForm.name.trim()
    let hasError = false

    if (!name || !validateLength(name, 100)) {
      setFieldErrors(prev => ({ ...prev, name: '名前かニックネームを入力してください。' }))
      hasError = true
    }
    
    if (!editChildForm.birthDate || !validateDate(editChildForm.birthDate)) {
      setFieldErrors(prev => ({ ...prev, birthDate: '正しい生年月日を入力してください。' }))
      hasError = true
    }
    
    if (!editChildForm.prefecture || !validateLength(editChildForm.prefecture, 50)) {
      setFieldErrors(prev => ({ ...prev, prefecture: '住んでいる都道府県を選択してください。' }))
      hasError = true
    }
    
    if (!editChildForm.municipality || !validateLength(editChildForm.municipality, 100)) {
      setFieldErrors(prev => ({ ...prev, municipality: '住んでいる市区町村を選択してください。' }))
      hasError = true
    }

    if (editChildForm.selectedCategories.length === 0) {
      setFieldErrors(prev => ({ ...prev, selectedCategories: '追加するスケジュールを選択してください。' }))
      hasError = true
    }

    if (hasError) return

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
    } catch (error) {
      console.error('ローカルストレージの保存エラー:', error)
    }

    // Firebase に保存
    if (groupId) {
      saveDataToFirebase(groupId, { children: updatedChildren, form }).then(() => {
        // 初回保存時のカウント処理
        const userCountKey = `userCountIncremented_${groupId}`
        const alreadyIncremented = window.localStorage.getItem(userCountKey) === 'true'
        
        if (!alreadyIncremented) {
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
        
        // アクセス日時を更新
        updateLastAccessedAt(groupId)
        
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }).catch((error) => {
        console.error('Firebase保存エラー:', error)
      })
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    }

    clearFieldErrors()
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

  // エクスポート（JSON）
  const exportData = () => {
    exportDataAsJSON(children, form);
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
          setSaveSuccess('データをインポートしました')
          setTimeout(() => setSaveSuccess(false), 2000)
        } else {
          setError(prev => ({ ...prev, import: '不正なファイル形式です。' }))
        }
      } catch (error) {
        setError(prev => ({ ...prev, import: 'ファイルの読み込みに失敗しました。' }))
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const openShareModal = (childId = null) => {
    const shareUrlValue = generateShareUrl(children, form, groupId, childId)
    navigator.clipboard.writeText(shareUrlValue).then(() => {
      setSaveSuccess('共有URLをコピーしました！この URLを他の人に送ることでデータが共有できます。')
      setTimeout(() => setSaveSuccess(false), 3000)
    }).catch(() => {
      setError(prev => ({ ...prev, share: 'クリップボードへのコピーに失敗しました。' }))
    })
  }

  // .ics ファイル（カレンダーフォーマット）を生成しダウンロード
// ...existing code...
  // Googleカレンダーエクスポート
  const exportToGoogleCalendar = () => {
    const result = downloadCalendarFile(summary, children);
    if (result) {
      setSaveSuccess('カレンダーファイルをダウンロードしました。Googleカレンダーの「他のカレンダーを追加」から「アップロード」を選択して、ダウンロードしたファイルをインポートしてください。');
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  }

  // Google Calendarにスケジュール登録（自動登録）
  const registerToGoogleCalendar = async () => {
    if (children.length === 0) {
      setError(prev => ({ ...prev, google: '子どもが登録されていません。' }))
      return
    }

    let totalSchedules = 0
    summary.forEach(child => {
      totalSchedules += child.schedule.length
    })

    if (totalSchedules === 0) {
      setError(prev => ({ ...prev, google: '登録されたスケジュールがありません。' }))
      return
    }

    // ユーザーに警告
    // window.confirmは使わず、即時実行

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
            details += `\n\n【やることリスト】`
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
        setError(prev => ({ ...prev, google: `処理完了 開かれたウィンドウ: ${successCount}件, ブロック: ${failCount}件。各ウィンドウで「保存」をクリック後、ウィンドウを手動で閉じてください。ポップアップブロック設定を確認し、再度実行してください。` }))
      } else {
        setSaveSuccess(`${totalSchedules}件のスケジュール登録ウィンドウを開きました。各ウィンドウで「保存」をクリックし、ウィンドウを手動で閉じてください。`)
        setTimeout(() => setSaveSuccess(false), 4000)
      }
    } catch (err) {
      console.error('Calendar registration error:', err)
      setError(prev => ({ ...prev, google: 'Googleカレンダーへの登録に失敗しました。エラー: ' + err.message }))
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
      supplies: scheduleItem.supplies || [],
      status: scheduleItem.status || '未対応'
    })
  }

  const closeScheduleEditor = () => {
    setEditingSchedule(null)
    setEditForm({
      title: '',
      date: '',
      endDate: '',
      description: '',
      category: '育児準備',
      todos: [],
      supplies: []
    });
    setError({ title: '', date: '' });
  }

  const saveScheduleEdit = () => {
    
    // エラー状態を個別に管理
    const errors = {
      title: '',
      date: '',
    };
    const title = editForm.title.trim();
    if (!title || !validateLength(title, 200)) {
      errors.title = 'スケジュール名を入力してください。';
    }
    if (!editForm.date || !validateDate(editForm.date)) {
      errors.date = '正しい開始日を入力してください。';
    }
    if (!editForm.endDate || !validateDate(editForm.endDate)) {
      errors.date = '正しい終了日を入力してください。';
    }
    if (
      editForm.date &&
      editForm.endDate &&
      new Date(editForm.date) > new Date(editForm.endDate)
    ) {
      errors.date = '開始日は終了日以前の日付を選択してください。';
    }
    if (errors.title || errors.date) {
      setError(errors);
      return;
    }
    setError({ title: '', date: '' });

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
        category: sanitizeInput(editForm.category || '育児準備'),
        todos: Array.isArray(editForm.todos) ? editForm.todos.map(t => sanitizeInput(t)) : [],
        supplies: Array.isArray(editForm.supplies) ? editForm.supplies.map(s => sanitizeInput(s)) : [],
        status: editForm.status || '未対応'
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
    
    // Firebase に保存
    if (groupId) {
      saveDataToFirebase(groupId, { children: updatedChildren, form }).catch((error) => {
        console.error('Firebase save error:', error)
        setError('データの保存に失敗しました。もう一度お試しください。')
      })
    }
    
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
    // window.confirmは使わず、即時削除
    
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
    
    // Firebase に保存
    if (groupId) {
      saveDataToFirebase(groupId, { children: updatedChildren, form }).catch((error) => {
        console.error('Firebase save error:', error)
        setError('データの保存に失敗しました。もう一度お試しください。')
      })
    }
    
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
    <>
      <Header childrenCount={children.length} />
      <div style={{ height: '48px' }} /> {/* ヘッダー分の余白 */}
      <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">現役パパが使いたいから作った</p>
          <h1>楽々キッズかれんだぁ</h1>
          <p className="description">
            手続き、ワクチン、保育園…育児の『やること』を、子どもごとに全部見える化。
            <br />
            <small>※ 表示されるスケジュールは目安です。実際の手続き・ワクチンは、役所や医師の最新情報を確認してね。</small>
          </p>
          <div className="statistics">
            <div className="count-up-item">
              <div className="count-up-number">{(statistics.userCount || 0).toLocaleString('ja-JP')}</div>
              <div className="count-up-label">登録してくれた家族</div>
            </div>
            <div className="count-up-item">
              <div className="count-up-number">{(statistics.totalChildren || 0).toLocaleString('ja-JP')}</div>
              <div className="count-up-label">登録済みの子どもたち</div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="panel" id="add-child-section">
          <h2>子どもを追加</h2>
          <form className="input-form" onSubmit={handleSubmit}>
            <label>
              名前（ニックネーム）
              <input
                id="child-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="例: たろう"
                autoComplete="name"
              />
            </label>
            {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}

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
            {fieldErrors.birthDate && <p className="form-error">{fieldErrors.birthDate}</p>}

            <label>
              性別
              <Select
                id="child-gender"
                name="gender"
                options={[
                  { value: 'male', label: '男の子' },
                  { value: 'female', label: '女の子' }
                ]}
                value={form.gender ? { value: form.gender, label: form.gender === 'male' ? '男の子' : '女の子' } : null}
                onChange={option => setForm({ ...form, gender: option ? option.value : '' })}
                placeholder="選択してください"
                classNamePrefix="react-select"
                styles={{
                  placeholder: (base) => ({ ...base, color: '#888' })
                }}
              />
            </label>
            {fieldErrors.gender && <p className="form-error">{fieldErrors.gender}</p>}

            <label>
              住んでいる都道府県
              <Select
                id="child-prefecture"
                name="prefecture"
                options={prefectureOptions}
                value={form.prefecture ? { value: form.prefecture, label: form.prefecture } : null}
                onChange={option => {
                  const prefecture = option ? option.value : ''
                  setForm({ ...form, prefecture, municipality: '' })
                }}
                placeholder="選択または検索してください"
                isClearable
                classNamePrefix="react-select"
                styles={{
                  placeholder: (base) => ({ ...base, color: '#888' })
                }}
              />
            </label>
            {fieldErrors.prefecture && <p className="form-error">{fieldErrors.prefecture}</p>}

            {String(form.prefecture).length > 0 ? (
              <>
                <label>
                  住んでいる市区町村
                  <Select
                    id="child-municipality"
                    name="municipality"
                    options={municipalities.map(city => ({ value: city, label: city }))}
                    value={form.municipality ? { value: form.municipality, label: form.municipality } : null}
                    onChange={option => setForm({ ...form, municipality: option ? option.value : '' })}
                    placeholder={municipalityLoading ? "読み込み中..." : "選択または検索してください"}
                    isClearable
                    isLoading={municipalityLoading}
                    classNamePrefix="react-select"
                    styles={{
                      placeholder: (base) => ({ ...base, color: '#888' })
                    }}
                  />
                </label>
                {fieldErrors.municipality && <p className="form-error">{fieldErrors.municipality}</p>}
              </>
            ) : null}

            <fieldset className="category-fieldset">
              <legend>追加するスケジュール</legend>
              <div className="category-checkboxes">
                <label className="category-checkbox category-checkbox-all">
                  <input
                    id="category-select-all"
                    name="category-select-all"
                    type="checkbox"
                    checked={(form.selectedCategories || []).length === availableCategories.length && availableCategories.length > 0}
                    onChange={(event) => {
                      const { checked } = event.target
                      setForm((prev) => ({
                        ...prev,
                        selectedCategories: checked ? availableCategories : []
                      }))
                    }}
                  />
                  <span>全選択</span>
                </label>
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
            {fieldErrors.selectedCategories && <p className="form-error">{fieldErrors.selectedCategories}</p>}

            <button type="submit">スケジュール管理開始</button>
          </form>
        </section>

        <section className="panel" id="registered-children">
          <div className="section-header">
            <div>
              <h2>登録済みの子ども</h2>
            </div>
          </div>
          {children.length === 0 ? (
            <p className="empty-state">まだ子どもが登録されていません。上のフォームから追加してください。</p>
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


        {children.length > 0 && (
          <section className="panel" id="todo-calendar-section">
            <div className="section-header">
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>
                  {viewMode === 'list' ? 'やることリスト' : 'カレンダー'}
                </h2>
                <button className="add-schedule-button" onClick={openScheduleAdder}>
                  + 追加
                </button>
              </div>
              <div className="view-toggle">
                <button
                  type="button"
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  やることリスト
                </button>
                <button
                  type="button"
                  className={viewMode === 'combined-calendar' ? 'active' : ''}
                  onClick={() => setViewMode('combined-calendar')}
                >
                  カレンダー
                </button>
              </div>
            </div>
            {/* child-filter-tabsの前にモバイル用ラベルを追加 */}
            <span className="child-filter-label-mobile" style={{
              display: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              marginLeft: 0,
              marginBottom: 4
            }}>子ども：</span>
            <div className="child-filter-tabs" style={{
              margin: window.innerWidth > 600 ? '12px 0px 10px' : '0px 0px 20px',
              display: 'flex',
              gap: 8
            }}>
              <span className="child-filter-label">子ども：</span>
              {/* モバイル時のみ表示するCSS */}
              <style>{`
                @media (max-width: 600px) {
                  .child-filter-label,
                  .status-filter-label {
                    display: none !important;
                  }
                  .child-filter-label-mobile {
                    display: inline-block !important;
                    font-weight: 500;
                    font-size: 1rem;
                    margin-left: 0;
                    margin-bottom: 4px;
                  }
                }
              `}</style>
              <button
                type="button"
                className={selectedChildIds.length === 0 || selectedChildIds.length === children.length ? 'active' : ''}
                onClick={() => {
                  // すべてが選択されている場合は全OFF、そうでなければ全ON
                  if (selectedChildIds.length === children.length && children.length > 0) {
                    setSelectedChildIds([]);
                  } else {
                    setSelectedChildIds(children.map(child => child.id));
                  }
                }}
              >
                すべて
              </button>
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  className={selectedChildIds.includes(child.id) ? 'active' : ''}
                  onClick={() => {
                    let newIds;
                    if (selectedChildIds.includes(child.id)) {
                      // 1つだけ選択解除しようとした場合は何もしない（最低1つは選択）
                      if (selectedChildIds.length === 1) return;
                      newIds = selectedChildIds.filter(id => id !== child.id);
                    } else {
                      newIds = [...selectedChildIds, child.id];
                    }
                    // 全て選択されたら全選択状態に
                    if (newIds.length === children.length) {
                      setSelectedChildIds(children.map(child => child.id));
                    } else {
                      setSelectedChildIds(newIds);
                    }
                  }}
                >
                  {child.name}
                </button>
              ))}
            </div>
          {/* モバイル用ステータスラベル */}
          <span className="status-filter-label-mobile" style={{
            display: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            marginLeft: 0,
            marginBottom: 4
          }}>ステータス：</span>
          <div className="status-filter-tabs" style={{
            margin: window.innerWidth > 600 ? '12px 0px 10px' : '0px 0px 20px',
            display: 'flex',
            gap: 8
          }}>
            <span className="status-filter-label">ステータス：</span>
                    {/* モバイル時のみ表示するCSS */}
                    <style>{`
                      @media (max-width: 600px) {
                        .child-filter-label,
                        .status-filter-label {
                          display: none !important;
                        }
                        .status-filter-label-mobile {
                          display: inline-block !important;
                          font-weight: 500;
                          font-size: 1rem;
                          margin-left: 0;
                          margin-bottom: 4px;
                        }
                      }
                    `}</style>
            <button
              type="button"
              className={statusFilter.length === STATUS_LIST.length ? 'active' : ''}
              onClick={() => {
                // すべてが選択されている場合は全OFF、そうでなければ全ON
                if (statusFilter.length === STATUS_LIST.length) {
                  setStatusFilter([]);
                } else {
                  setStatusFilter([...STATUS_LIST]);
                }
              }}
            >
              すべて
            </button>
            {STATUS_LIST.map((status) => (
              <button
                key={status}
                type="button"
                className={statusFilter.includes(status) ? 'active' : ''}
                onClick={() => {
                  let newFilter;
                  if (statusFilter.includes(status)) {
                    // 1つだけ選択解除しようとした場合は何もしない（最低1つは選択）
                    if (statusFilter.length === 1) return;
                    newFilter = statusFilter.filter(s => s !== status);
                  } else {
                    newFilter = [...statusFilter, status];
                  }
                  setStatusFilter(newFilter);
                }}
              >
                {status}
              </button>
            ))}
          </div>
            {/* 表示切り替え */}
            {viewMode === 'list' && (
              summary
                .filter((child) => selectedChildIds.length === 0 || selectedChildIds.includes(child.id))
                .map((child) => {
                  // ステータスフィルター適用（複数選択）
                  const filteredSchedule = statusFilter.length === 0
                    ? []
                    : child.schedule.filter(item => statusFilter.includes(item.status));
                  if (filteredSchedule.length === 0) return null;
                  return (
                    <article key={child.id} className="child-card">
                      <div className="child-header">
                        <div>
                          <h3>{child.name}</h3>
                          <p>生年月日: {formatDate(child.birthDate)}（{calculateAge(child.birthDate)}）</p>
                          <p>性別: {child.gender === 'male' ? '男の子' : '女の子'}</p>
                        </div>
                      </div>
                      <div className="schedule-grid">
                        {filteredSchedule.map((item) => (
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
                              <span className={`item-category status-category status-${item.status || '未対応'}`} style={{ marginLeft: 8 }}>
                                {item.status || '未対応'}
                              </span>
                            </div>
                            <strong>{item.title}</strong>
                            <p>{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })
            )}
            {viewMode === 'combined-calendar' && (
              <ChildCalendar
                children={[
                  {
                    id: 'combined',
                    name: '統合',
                    schedule:
                      (selectedChildIds.length > 0
                        ? combinedSchedule.filter(item => selectedChildIds.includes(item.childId))
                        : combinedSchedule
                      ).filter(item => statusFilter.length === 0 ? false : statusFilter.includes(item.status))
                  }
                ]}
                selectedChildIds={['combined']}
                onEventClick={openScheduleEditor}
              />
            )}
          </section>
        )}


        <section className="panel save-section" id="data-management">
          <div className="section-header">
            <div>
              <h2>データ管理</h2>
            </div>
          </div>
          <div className="save-buttons-group">
            <button className="save-button export-button" onClick={() => openShareModal()}>
              URLで共有
            </button>
            <button className="save-button export-button" onClick={registerToGoogleCalendar}>
              Googleカレンダーに登録
            </button>
            <button className="save-button export-button" onClick={exportData}>
              スケジュールデータをダウンロード
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
              スケジュールデータを読み込み
            </label>
          </div>
          {saveSuccess && <p className="save-success">{typeof saveSuccess === 'string' ? saveSuccess : 'データを保存しました'}</p>}
          {error && error.firebase && (
            <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.firebase}</p>
          )}
          {error && error.import && (
            <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.import}</p>
          )}
          {error && error.share && (
            <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.share}</p>
          )}
          {error && error.google && (
            <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.google}</p>
          )}
          <p className="data-policy" style={{ fontSize: '0.9rem', color: '#666', marginTop: '16px', lineHeight: '1.6', textAlign: 'left' }}>
            <strong>データ保持について：</strong>
            <br />
            データは1年間保存されます。
            <br />
            その後は自動で削除されるので、使わなくなったら『スケジュールデータをダウンロード』で記録を残しておくことをお勧めします。
            <br />
            <br />
            <strong>ブラウザ削除時の注意：</strong>
            <br />
            このアプリへのアクセスIDはブラウザ内に保存されています。
            <br />
            ブラウザをクリアするとID情報が消えてアクセスできなくなります。『URLで共有』でURLを保存しておけば、いつでも復帰できます。
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
                {/* スケジュール名 */}
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
                {error && error.title && (
                  <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.title}</p>
                )}

                {/* カテゴリ */}
                <label>
                  カテゴリ
                  <select
                    id="edit-category"
                    name="category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    autoComplete="off"
                  >
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                {/* ステータス（編集） */}
                <label>
                  ステータス
                  <select
                    id="edit-status"
                    name="status"
                    value={editForm.status || '未対応'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="未対応">未対応</option>
                    <option value="対応中">対応中</option>
                    <option value="完了">完了</option>
                    <option value="期限切れ">期限切れ</option>
                  </select>
                </label>

                {/* 開始日 */}
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
                {error && error.date && (
                  <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.date}</p>
                )}

                {/* 終了日 */}
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

                {/* 説明 */}
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

                {/* やることリスト */}
                <label>
                  やることリスト
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

                {/* 準備物 */}
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
              <div className="edit-form">
                {/* 子どもを選択 */}
                <fieldset className="category-fieldset">
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
                {error && error.children && (
                  <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.children}</p>
                )}

                {/* スケジュール名 */}
                <label>
                  スケジュール名
                  <input
                    id="add-title"
                    name="title"
                    type="text"
                    value={addScheduleForm.title}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, title: e.target.value })}
                    placeholder="スケジュール名を入力"
                    autoComplete="off"
                  />
                </label>
                {error && error.title && (
                  <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.title}</p>
                )}

                {/* カテゴリ */}
                <label>
                  カテゴリ
                  <select
                    id="add-category"
                    name="category"
                    value={addScheduleForm.category}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, category: e.target.value })}
                    autoComplete="off"
                  >
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                {/* ステータス（追加） */}
                <label>
                  ステータス
                  <select
                    id="add-status"
                    name="status"
                    value={addScheduleForm.status || '未対応'}
                    onChange={e => setAddScheduleForm({ ...addScheduleForm, status: e.target.value })}
                  >
                    <option value="未対応">未対応</option>
                    <option value="対応中">対応中</option>
                    <option value="完了">完了</option>
                    <option value="期限切れ">期限切れ</option>
                  </select>
                </label>

                {/* 開始日 */}
                <label>
                  開始日
                  <input
                    id="add-date"
                    name="date"
                    type="date"
                    value={addScheduleForm.date}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, date: e.target.value })}
                    autoComplete="off"
                  />
                </label>
                {error && error.date && (
                  <p className="form-error" style={{ color: '#e53e3e', marginTop: 8 }}>{error.date}</p>
                )}

                {/* 終了日 */}
                <label>
                  終了日
                  <input
                    id="add-endDate"
                    name="endDate"
                    type="date"
                    value={addScheduleForm.endDate}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, endDate: e.target.value })}
                    autoComplete="off"
                  />
                </label>

                {/* 説明 */}
                <label>
                  説明
                  <textarea
                    id="add-description"
                    name="description"
                    value={addScheduleForm.description || ''}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, description: e.target.value })}
                    placeholder="説明を入力"
                    rows={3}
                    autoComplete="off"
                  />
                </label>

                {/* やることリスト */}
                <label>
                  やることリスト
                  <textarea
                    id="add-todos"
                    name="todos"
                    value={addScheduleForm.todos.join('\n')}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, todos: e.target.value.split('\n').filter(item => item.trim()) })}
                    placeholder="各行に1つのタスクを入力してください"
                    rows={3}
                    autoComplete="off"
                  />
                </label>

                {/* 準備物 */}
                <label>
                  準備物
                  <textarea
                    id="add-supplies"
                    name="supplies"
                    value={addScheduleForm.supplies.join('\n')}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, supplies: e.target.value.split('\n').filter(item => item.trim()) })}
                    placeholder="各行に1つの準備物を入力してください"
                    rows={3}
                    autoComplete="off"
                  />
                </label>
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
        </div>
      )}

      {/* 子供情報編集モーダル */}
      {editingChildId && (
        <div className="modal-overlay" onClick={closeEditChild}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEditChild}>×</button>
            <h2>子供情報を編集</h2>
            <div className="modal-body">
              <div className="edit-form">
              <label>
                名前（ニックネーム）
                <input
                  id="edit-child-name"
                  name="name"
                  type="text"
                  value={editChildForm.name}
                  onChange={(e) => setEditChildForm({ ...editChildForm, name: e.target.value })}
                  autoComplete="off"
                />
              </label>
              {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}

              <label>
                生年月日
                <input
                  id="edit-child-birthdate"
                  name="birthDate"
                  type="date"
                  value={editChildForm.birthDate}
                  onChange={(e) => setEditChildForm({ ...editChildForm, birthDate: e.target.value })}
                />
                {editChildForm.birthDate && <p style={{margin: '6px 0 0', fontSize: '0.9rem', color: '#64748b'}}>現在: {calculateAge(editChildForm.birthDate)}</p>}
              </label>
              {fieldErrors.birthDate && <p className="form-error">{fieldErrors.birthDate}</p>}

              <label>
                性別
                <Select
                  id="edit-child-gender"
                  name="gender"
                  options={[
                    { value: 'male', label: '男の子' },
                    { value: 'female', label: '女の子' }
                  ]}
                  value={editChildForm.gender ? { value: editChildForm.gender, label: editChildForm.gender === 'male' ? '男の子' : '女の子' } : null}
                  onChange={option => setForm({ ...form, gender: option ? option.value : '' })}
                  placeholder="選択してください"
                  classNamePrefix="react-select"
                  styles={{
                    placeholder: (base) => ({ ...base, color: '#888' })
                  }}
                />
              </label>
              {fieldErrors.gender && <p className="form-error">{fieldErrors.gender}</p>}

              <label>
                住んでいる都道府県
                <Select
                  id="edit-child-prefecture"
                  name="prefecture"
                  options={prefectureOptions}
                  value={editChildForm.prefecture ? { value: editChildForm.prefecture, label: editChildForm.prefecture } : null}
                  onChange={option => {
                    const prefecture = option ? option.value : ''
                    setEditChildForm({ ...editChildForm, prefecture, municipality: '' })
                  }}
                  placeholder="選択または検索してください"
                  isClearable
                  classNamePrefix="react-select"
                  styles={{
                    placeholder: (base) => ({ ...base, color: '#888' })
                  }}
                />
              </label>
              {fieldErrors.prefecture && <p className="form-error">{fieldErrors.prefecture}</p>}

              {editChildForm.prefecture ? (
                <>
                  <label>
                    住んでいる市区町村
                    <Select
                      id="edit-child-municipality"
                      name="municipality"
                      options={editMunicipalities.map(city => ({ value: city, label: city }))}
                      value={editChildForm.municipality ? { value: editChildForm.municipality, label: editChildForm.municipality } : null}
                      onChange={option => setEditChildForm({ ...editChildForm, municipality: option ? option.value : '' })}
                      placeholder="選択または検索してください"
                      isClearable
                      classNamePrefix="react-select"
                      styles={{
                        placeholder: (base) => ({ ...base, color: '#888' })
                      }}
                    />
                  </label>
                  {fieldErrors.municipality && <p className="form-error">{fieldErrors.municipality}</p>}
                </>
              ) : null}

              <fieldset className="category-fieldset">
                <legend>追加するスケジュール</legend>
                <div className="category-checkboxes">
                  <label className="category-checkbox category-checkbox-all">
                    <input
                      id="edit-select-all-categories"
                      name="edit-select-all-categories"
                      type="checkbox"
                      checked={editChildForm.selectedCategories.length === getAvailableCategories().length && getAvailableCategories().length > 0}
                      onChange={(e) => {
                        setEditChildForm({
                          ...editChildForm,
                          selectedCategories: e.target.checked ? getAvailableCategories() : []
                        })
                      }}
                    />
                    全選択
                  </label>
                  {getAvailableCategories().map((category) => (
                    <label key={category} className="category-checkbox">
                      <input
                        id={`edit-category-${category}`}
                        name={`edit-category-${category}`}
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
              {fieldErrors.selectedCategories && <p className="form-error">{fieldErrors.selectedCategories}</p>}
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

        {/* モバイル時にラベルを非表示・表示にするCSS */}
        <style>{`
          @media (max-width: 600px) {
            .child-filter-label,
            .status-filter-label {
              display: none !important;
            }
            .child-filter-label-mobile,
            .status-filter-label-mobile {
              display: inline-block !important;
              font-weight: 500;
              font-size: 1rem;
              margin-left: 0;
              margin-top: 10px;
              margin-bottom: 0px !important;
            }
          }
        `}</style>

    </div>
    </>
  );
}

export default App;
