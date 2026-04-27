import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue } from 'firebase/database'
import { DEFAULT_FORM } from './constants'

/**
 * Firebase設定と初期化
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

/**
 * フォームデータを安全に整形
 */
const getSafeFormData = (formData) => ({
  name: formData?.name ?? DEFAULT_FORM.name,
  birthDate: formData?.birthDate ?? DEFAULT_FORM.birthDate,
  gender: formData?.gender ?? DEFAULT_FORM.gender,
  selectedCategories: Array.isArray(formData?.selectedCategories) ? formData.selectedCategories : [],
  prefecture: formData?.prefecture ?? DEFAULT_FORM.prefecture,
  municipality: formData?.municipality ?? DEFAULT_FORM.municipality,
  title: formData?.title ?? DEFAULT_FORM.title,
  date: formData?.date ?? DEFAULT_FORM.date,
  endDate: formData?.endDate ?? DEFAULT_FORM.endDate,
  description: formData?.description ?? DEFAULT_FORM.description,
  category: formData?.category ?? DEFAULT_FORM.category,
  todos: Array.isArray(formData?.todos) ? formData.todos : [],
  supplies: Array.isArray(formData?.supplies) ? formData.supplies : []
})

/**
 * Firebaseにデータを保存
 * 子どもが1人もいない場合は保存しない
 * @param {string} groupId - グループID
 * @param {Object} data - 保存するデータ { children, form }
 * @returns {Promise<{saved: boolean}>} 保存結果
 */
export const saveDataToFirebase = async (groupId, data) => {
  try {
    if (!groupId || !data) {
      throw new Error('groupId and data are required')
    }

    const hasChildren = Array.isArray(data.children) && data.children.length > 0
    if (!hasChildren) {
      return { saved: false }
    }

    const dbRef = ref(database, `groups/${groupId}`)
    const dataToSave = {
      ...data,
      children: data.children,
      updatedAt: new Date().toISOString()
    }
    
    await set(dbRef, dataToSave)
    return { saved: true }
  } catch (error) {
    console.error('Firebase save error:', error.message)
    throw error
  }
}

/**
 * Firebaseからグループを削除
 * @param {string} groupId - グループID
 * @returns {Promise<boolean>} 削除成功フラグ
 */
export const deleteDataFromFirebase = async (groupId) => {
  try {
    if (!groupId) {
      throw new Error('groupId is required')
    }

    const dbRef = ref(database, `groups/${groupId}`)
    await set(dbRef, null)
    return true
  } catch (error) {
    console.error('Firebase delete error:', error.message)
    throw error
  }
}

/**
 * Firebaseからリアルタイムでデータをリスニング
 * @param {string} groupId - グループID
 * @param {Function} callback - データ変更時のコールバック
 * @returns {Function} unsubscribe 関数
 */
export const listenToData = (groupId, callback) => {
  try {
    if (!groupId || !callback) {
      throw new Error('groupId and callback are required')
    }

    const dbRef = ref(database, `groups/${groupId}`)
    
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val()
      
      if (data) {
        const childrenArray = Array.isArray(data.children)
          ? data.children.filter(child => !child._isPlaceholder)
          : []
        
        const safeData = {
          children: childrenArray,
          form: getSafeFormData(data.form)
        }
        callback(safeData)
      } else {
        // データがない場合、children のみ返す（form はリセットしない）
        callback({
          children: [],
          form: undefined  // form を返さない（App.jsx で form をリセットさせない）
        })
      }
    }, (error) => {
      console.error('Firebase listener error:', error.message)
    })
    
    // unsubscribe 関数を返す
    return unsubscribe
  } catch (error) {
    console.error('Firebase listener setup error:', error.message)
    return () => {} // エラー時は空の関数を返す
  }
}

// Firebaseからデータを取得
export const getDataFromFirebase = async (groupId) => {
  try {
    if (!groupId) {
      throw new Error('groupId is required')
    }

    const dbRef = ref(database, `groups/${groupId}`)
    const snapshot = await get(dbRef)
    
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error('Firebase fetch error:', error.message)
    return null
  }
}

// 1年以上アクセスがないグループをチェックして削除
export const checkAndDeleteOldData = async (groupId) => {
  try {
    if (!groupId) {
      throw new Error('groupId is required')
    }

    const data = await getDataFromFirebase(groupId)
    if (!data) {
      return false
    }

    const lastAccessedAt = data.lastAccessedAt ? new Date(data.lastAccessedAt) : null
    const now = new Date()
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    if (lastAccessedAt && lastAccessedAt < oneYearAgo) {
      const groupRef = ref(database, `groups/${groupId}`)
      await set(groupRef, null)
      return true
    }

    if (!lastAccessedAt) {
      await updateLastAccessedAt(groupId)
    }

    return false
  } catch (error) {
    console.error('Old data deletion check error:', error.message)
    return false
  }
}

// 最後のアクセス日時を更新
export const updateLastAccessedAt = async (groupId) => {
  try {
    if (!groupId) {
      throw new Error('groupId is required')
    }

    const groupRef = ref(database, `groups/${groupId}`)
    const snapshot = await get(groupRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      await set(groupRef, {
        ...data,
        lastAccessedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Update last accessed time error:', error.message)
  }
}

// 統計情報を更新（開始時のみ、またはグループ/子ども追加時）
export const initializeStatistics = async () => {
  try {
    const statsRef = ref(database, 'stats')
    const snapshot = await get(statsRef)
    
    if (!snapshot.exists()) {
      // 初回の場合は0で初期化
      await set(statsRef, {
        totalUsers: 0,
        totalChildren: 0
      })
    } else {
      const stats = snapshot.val()
      // totalUsers や totalChildren が存在しない場合は初期化
      if (typeof stats.totalUsers !== 'number') {
        await set(ref(database, 'stats/totalUsers'), stats.totalUsers || 0)
      }
      if (typeof stats.totalChildren !== 'number') {
        await set(ref(database, 'stats/totalChildren'), stats.totalChildren || 0)
      }
    }
  } catch (error) {
    console.error('Statistics initialization error:', error.message)
  }
}

// 利用者数を +1
export const incrementUserCount = async () => {
  try {
    const statsRef = ref(database, 'stats/totalUsers')
    const snapshot = await get(statsRef)
    const currentCount = snapshot.exists() ? (snapshot.val() || 0) : 0
    const newCount = currentCount + 1
    await set(statsRef, newCount)
  } catch (error) {
    console.error('Increment user count error:', error.message)
  }
}

// 子ども数を +1
export const incrementChildCount = async () => {
  try {
    const statsRef = ref(database, 'stats/totalChildren')
    const snapshot = await get(statsRef)
    
    const currentCount = snapshot.exists() ? (snapshot.val() || 0) : 0
    const newCount = currentCount + 1
    await set(statsRef, newCount)
  } catch (error) {
    console.error('Increment child count error:', error.message)
  }
}

// 統計情報をリアルタイムで監視（コールバック関数で更新）
export const listenToStatistics = (callback) => {
  try {
    const statsRef = ref(database, 'stats')
    
    // 初期値を取得して一度実行
    get(statsRef).then((snapshot) => {
      let userCount = 0
      let totalChildren = 0
      
      if (snapshot.exists()) {
        const stats = snapshot.val()
        userCount = stats.totalUsers || 0
        totalChildren = stats.totalChildren || 0
      }
      
      callback({
        userCount,
        totalChildren
      })
    })
    
    const unsubscribe = onValue(statsRef, (snapshot) => {
      let userCount = 0
      let totalChildren = 0
      
      if (snapshot.exists()) {
        const stats = snapshot.val()
        userCount = stats.totalUsers || 0
        totalChildren = stats.totalChildren || 0
      }
      
      callback({
        userCount,
        totalChildren
      })
    }, (error) => {
      console.error('Statistics listener error:', error.message)
    })
    
    return unsubscribe
  } catch (error) {
    console.error('Statistics listener setup error:', error.message)
    return () => {}
  }
}

// 統計情報を取得（ユーザー数と登録された子どもの総数）
export const getStatistics = async () => {
  try {
    const groupsRef = ref(database, 'groups')
    const snapshot = await get(groupsRef)
    
    let userCount = 0
    let totalChildren = 0
    
    if (snapshot.exists()) {
      const allGroups = snapshot.val()
      
      // グループ数 = ユーザー数
      userCount = Object.keys(allGroups).length
      
      // すべてのグループの子どもを合計
      Object.values(allGroups).forEach(group => {
        if (group.children && Array.isArray(group.children)) {
          totalChildren += group.children.length
        }
      })
    }
    
    return {
      userCount,
      totalChildren
    }
  } catch (error) {
    console.error('Statistics fetch error:', error.message)
    return {
      userCount: 0,
      totalChildren: 0
    }
  }
}
