/**
 * データのインポート/エクスポート機能
 */

/**
 * JSON ファイルからデータをインポート
 */
export const importDataFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result || '')
        
        if (!importedData.children || !Array.isArray(importedData.children)) {
          reject(new Error('不正なファイル形式です。'))
          return
        }

        resolve({
          children: importedData.children,
          form: importedData.form || {}
        })
      } catch (error) {
        reject(new Error('ファイルの読み込みに失敗しました。'))
      }
    }

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました。'))
    }

    reader.readAsText(file)
  })
}

/**
 * ファイル入力要素をクリア
 */
export const clearFileInput = (inputElement) => {
  if (inputElement) {
    inputElement.value = ''
  }
}

/**
 * データベースからのデータ取得時のバリデーション
 */
export const validateImportedData = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'データ形式が不正です。' }
  }

  if (!Array.isArray(data.children)) {
    return { valid: false, error: 'children が配列ではありません。' }
  }

  return { valid: true }
}
