/**
 * App.jsx のハンドラー関数群
 * 児童情報とスケジュール管理のビジネスロジック
 */

import LZ from 'lz-string'
import bs58 from 'bs58'
import { sanitizeInput, validateLength, validateDate } from './security'
import { STORAGE_KEY, FORM_STORAGE_KEY } from '../constants'

/**
 * 新規子ども追加時のバリデーションと作成
 */
export const createNewChild = (formData, getAvailableCategories) => {
  const name = formData.name.trim()
  
  if (!name || !validateLength(name, 100)) {
    return { error: '名前は1文字以上100文字以下で入力してください。' }
  }
  
  if (!formData.birthDate || !validateDate(formData.birthDate)) {
    return { error: '正しい生年月日を入力してください。' }
  }
  
  if (!formData.prefecture || !validateLength(formData.prefecture, 50)) {
    return { error: '有効な都道府県を選択してください。' }
  }
  
  if (!formData.municipality || !validateLength(formData.municipality, 100)) {
    return { error: '有効な市町村を選択してください。' }
  }

  const birthDate = new Date(formData.birthDate)
  if (Number.isNaN(birthDate.getTime())) {
    return { error: '正しい日付を入力してください。' }
  }

  return {
    child: {
      id: crypto.randomUUID(),
      name: sanitizeInput(name),
      birthDate: birthDate.toISOString().slice(0, 10),
      gender: sanitizeInput(formData.gender),
      prefecture: sanitizeInput(formData.prefecture),
      municipality: sanitizeInput(formData.municipality),
      selectedCategories: formData.selectedCategories.length > 0 ? formData.selectedCategories : getAvailableCategories(),
      customSchedules: [],
      excludedScheduleIds: []
    }
  }
}

/**
 * 子ども削除確認
 */
export const confirmDeleteChild = () => {
  return window.confirm('この子供を削除してもよろしいですか？')
}

/**
 * 子ども情報編集時のバリデーション
 */
export const validateChildEdit = (editForm) => {
  const name = editForm.name.trim()
  
  if (!name || !validateLength(name, 100)) {
    return { error: '名前は1文字以上100文字以下で入力してください。' }
  }
  
  if (!editForm.birthDate || !validateDate(editForm.birthDate)) {
    return { error: '正しい生年月日を入力してください。' }
  }
  
  if (!editForm.prefecture || !validateLength(editForm.prefecture, 50)) {
    return { error: '有効な都道府県を選択してください。' }
  }
  
  if (!editForm.municipality || !validateLength(editForm.municipality, 100)) {
    return { error: '有効な市町村を選択してください。' }
  }

  return { valid: true }
}

/**
 * 子ども情報の更新
 */
export const updateChildInfo = (child, editForm) => {
  return {
    ...child,
    name: sanitizeInput(editForm.name.trim()),
    birthDate: editForm.birthDate,
    gender: sanitizeInput(editForm.gender),
    prefecture: sanitizeInput(editForm.prefecture),
    municipality: sanitizeInput(editForm.municipality),
    selectedCategories: editForm.selectedCategories,
    customSchedules: child.customSchedules || [],
    excludedScheduleIds: child.excludedScheduleIds || []
  }
}

/**
 * 新規スケジュール作成時のバリデーション
 */
export const validateScheduleForm = (formData, selectedChildren) => {
  if (!formData.title || !formData.title.trim()) {
    return { error: 'スケジュール名を入力してください。' }
  }
  
  if (!formData.date) {
    return { error: '開始日を入力してください。' }
  }
  
  if (selectedChildren.length === 0) {
    return { error: '子どもを選択してください。' }
  }

  return { valid: true }
}

/**
 * 新規スケジュール作成
 */
export const createNewSchedule = (formData) => {
  return {
    id: crypto.randomUUID(),
    title: formData.title.trim(),
    date: formData.date,
    endDate: formData.endDate || formData.date,
    description: formData.description || '',
    category: formData.category || '準備',
    todos: Array.isArray(formData.todos) ? formData.todos.filter(t => t && t.trim()) : [],
    supplies: Array.isArray(formData.supplies) ? formData.supplies.filter(s => s && s.trim()) : []
  }
}

/**
 * ローカルストレージへの保存
 */
export const saveToLocalStorage = (children, form) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(children))
    window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form))
    return { success: true }
  } catch (error) {
    console.error('ローカルストレージの保存エラー:', error)
    return { success: false, error: error.message }
  }
}

/**
 * データのエクスポート（JSON）
 */
export const exportDataAsJSON = (children, form) => {
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

/**
 * フォーム初期化（デフォルト値）
 */
const getTodayDate = () => new Date().toISOString().slice(0, 10)

export const getScheduleFormDefaults = () => ({
  title: '',
  date: getTodayDate(),
  endDate: getTodayDate(),
  description: '',
  category: '育児準備',
  todos: [],
  supplies: []
})

/**
 * 共有URL生成（超コンパクト版 - パス形式）
 */
export const generateShareUrl = (children, form, groupId, childId = null) => {
  let dataToShare
  if (childId) {
    const childToShare = children.find(c => c.id === childId)
    dataToShare = { c: childToShare ? [childToShare] : [], f: form, g: groupId }
  } else {
    dataToShare = { c: children, f: form, g: groupId }
  }
  
  try {
    // JSON を圧縮
    const compressed = LZ.compressToUint8Array(JSON.stringify(dataToShare))
    
    // Uint8Array を Base58 エンコード
    const bytes = Array.from(compressed)
    const encoded = bs58.encode(Buffer.isBuffer ? Buffer.from(bytes) : new Uint8Array(bytes))
    
    // パス形式: /s/... （最短形式）
    return `${window.location.origin}/s/${encoded}`
  } catch (error) {
    console.error('URL生成エラー:', error)
    // フォールバック
    try {
      const fallback = LZ.compressToEncodedURIComponent(JSON.stringify(dataToShare))
      return `${window.location.origin}/s/${fallback}`
    } catch (err) {
      return window.location.origin
    }
  }
}

/**
 * 共有URLからデータを復号化
 */
export const decompressShareData = (encodedData) => {
  try {
    if (!encodedData) {
      return { error: 'データが見つかりません。' }
    }
    
    try {
      // Base58デコードを試みる
      const buffer = bs58.decode(encodedData)
      const uint8Array = new Uint8Array(buffer)
      const decompressed = LZ.decompressFromUint8Array(uint8Array)
      
      if (decompressed) {
        const data = JSON.parse(decompressed)
        // 短いキー名を元に戻す
        return { data: { children: data.c, form: data.f, groupId: data.g } }
      }
    } catch (e) {
      // Base58デコード失敗、フォールバック
    }
    
    // フォールバック: LZ-stringのみで復号化
    const decompressed = LZ.decompressFromEncodedURIComponent(encodedData)
    if (!decompressed) {
      return { error: 'データの復号化に失敗しました。' }
    }
    const data = JSON.parse(decompressed)
    return { data: { children: data.c || data.children, form: data.f || data.form, groupId: data.g || data.groupId } }
  } catch (error) {
    console.error('データ復号化エラー:', error)
    return { error: 'データの復号化に失敗しました。' }
  }
}

/**
 * 共有URLをクリップボードにコピー
 */
export const copyShareUrlToClipboard = async (shareUrl) => {
  try {
    await navigator.clipboard.writeText(shareUrl)
    alert('共有URLをコピーしました！この URLを他の人に送ることでデータが共有できます。')
    return { success: true }
  } catch (error) {
    alert('クリップボードへのコピーに失敗しました。')
    return { success: false, error: error.message }
  }
}
