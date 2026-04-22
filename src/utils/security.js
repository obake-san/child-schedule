/**
 * セキュリティ関連のユーティリティ関数
 */

/**
 * 入力値をサニタイズして XSS を防ぐ
 * @param {string} str - サニタイズする文字列
 * @returns {string} サニタイズされた文字列
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return ''
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return str.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * 複数の入力値をサニタイズ
 * @param {object} obj - キーバリューペアのオブジェクト
 * @returns {object} サニタイズされたオブジェクト
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      )
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * 入力値の長さを検証
 * @param {string} str - 検証する文字列
 * @param {number} maxLength - 最大長
 * @returns {boolean} 有効な場合 true
 */
export const validateLength = (str, maxLength = 500) => {
  return typeof str === 'string' && str.trim().length > 0 && str.length <= maxLength
}

/**
 * 日付形式（YYYY-MM-DD）を検証
 * @param {string} date - 日付文字列
 * @returns {boolean} 有効な場合 true
 */
export const validateDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) return false
  const d = new Date(date)
  return d instanceof Date && !isNaN(d)
}

/**
 * グループ ID（UUID形式）を検証
 * @param {string} groupId - グループID
 * @returns {boolean} 有効な場合 true
 */
export const validateUUID = (groupId) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(groupId)
}

/**
 * スケジュール ID を検証
 * 未使用: 現在のアーキテクチャでは必要ない
 */
// export const validateScheduleId = (id) => {
//   return typeof id === 'string' && id.length > 0 && id.length <= 200
// }

/**
 * 安全な整数値を取得
 * 未使用: 現在のアーキテクチャでは必要ない
 */
// export const getSafeInteger = (value, defaultValue = 0) => {
//   const num = parseInt(value, 10)
//   return isNaN(num) ? defaultValue : num
// }

/**
 * 危険な文字列をマスク
 * 未使用: 現在のアーキテクチャでは必要ない
 */
// export const maskSensitiveData = (str, visibleChars = 4) => {
//   if (!str || typeof str !== 'string') return ''
//   if (str.length <= visibleChars) return '*'.repeat(str.length)
//   return str.substring(0, visibleChars) + '*'.repeat(str.length - visibleChars)
// }

/**
 * CSRF トークン用のランダム文字列生成
 * 未使用: 現在のアーキテクチャでは必要ない
 */
// export const generateCsrfToken = () => {
//   return Array.from(crypto.getRandomValues(new Uint8Array(32)))
//     .map(b => b.toString(16).padStart(2, '0'))
//     .join('')
// }

/**
 * ローカルストレージへのアクセスが安全か確認
 * 未使用: 現在のアーキテクチャでは必要ない
 */
// export const isLocalStorageAvailable = () => {
//   try {
//     const test = '__storage_test__'
//     localStorage.setItem(test, test)
//     localStorage.removeItem(test)
//     return true
//   } catch {
//     return false
//   }
// }

/**
 * セッションストレージにトークンを安全に保存
 * 未使用: 現在のアーキテクチャでは必要ない
 */
// export const storeSecureToken = (key, token) => {
//   try {
//     sessionStorage.setItem(key, token)
//   } catch (error) {
//     console.error('セッションストレージへの保存に失敗:', error)
//   }
// }

/**
 * セッションストレージからトークンを取得
 * 未使用: 現在のアーキテクチャでは必要ない
 */
// export const getSecureToken = (key) => {
//   try {
//     return sessionStorage.getItem(key)
//   } catch (error) {
//     console.error('セッションストレージからの取得に失敗:', error)
//     return null
//   }
// }
