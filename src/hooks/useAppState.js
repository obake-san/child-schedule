/**
 * カスタムフック: アプリケーション状態管理
 */

import { useState } from 'react'
import { getInitialForm, DEFAULT_CHILD_FORM, INITIAL_EDIT_FORM } from '../constants'

/**
 * 子ども管理の状態
 */
export const useChildrenState = () => {
  const [children, setChildren] = useState([])
  const [editingChildId, setEditingChildId] = useState(null)
  const [editChildForm, setEditChildForm] = useState(DEFAULT_CHILD_FORM)

  return {
    children,
    setChildren,
    editingChildId,
    setEditingChildId,
    editChildForm,
    setEditChildForm,
    resetEditChildForm: () => setEditChildForm(DEFAULT_CHILD_FORM)
  }
}

/**
 * フォーム管理の状態
 */
export const useFormState = () => {
  const [form, setForm] = useState(getInitialForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    birthDate: '',
    prefecture: '',
    municipality: '',
    selectedCategories: ''
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  const clearFieldErrors = () => {
    setFieldErrors({
      name: '',
      birthDate: '',
      prefecture: '',
      municipality: '',
      selectedCategories: ''
    })
  }

  return {
    form,
    setForm,
    error,
    setError,
    fieldErrors,
    setFieldErrors,
    clearFieldErrors,
    saveSuccess,
    setSaveSuccess,
    resetForm: () => setForm(getInitialForm()),
    showError: (message) => {
      setError(message)
      setTimeout(() => setError(''), 3000)
    },
    showSuccess: () => {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    }
  }
}

/**
 * スケジュール編集管理の状態
 */
export const useScheduleEditState = () => {
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM)
  const [addingSchedule, setAddingSchedule] = useState(false)
  const [selectedChildrenForSchedule, setSelectedChildrenForSchedule] = useState([])

  return {
    editingSchedule,
    setEditingSchedule,
    editForm,
    setEditForm,
    addingSchedule,
    setAddingSchedule,
    selectedChildrenForSchedule,
    setSelectedChildrenForSchedule,
    resetEditForm: () => setEditForm(INITIAL_EDIT_FORM),
    closeEditor: () => {
      setEditingSchedule(null)
      setEditForm(INITIAL_EDIT_FORM)
    }
  }
}

/**
 * UI状態管理
 */
export const useUIState = () => {
  const [viewMode, setViewMode] = useState('list')
  const [groupId, setGroupId] = useState(null)
  const [selectedChildIds, setSelectedChildIds] = useState([])
  const [currentCombinedMonth, setCurrentCombinedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })

  return {
    viewMode,
    setViewMode,
    groupId,
    setGroupId,
    selectedChildIds,
    setSelectedChildIds,
    currentCombinedMonth,
    setCurrentCombinedMonth,
    resetUI: () => {
      setViewMode('list')
      setSelectedChildIds([])
    }
  }
}
