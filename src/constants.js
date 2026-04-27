

// =============================
// アプリケーション全体の定数
// =============================

// ローカルストレージキー
export const STORAGE_KEY = 'kodomo-schedule.children';
export const FORM_STORAGE_KEY = 'kodomo-schedule.form';
export const GROUP_ID_STORAGE_KEY = 'kodomo-schedule.groupId';

// カテゴリー順序（デフォルト）
export const CATEGORY_ORDER = [
  '行政手続き', '育児準備', '健康診断', '予防接種', '保育園',
  '幼稚園', '生活・成長', '教育・発達', '入学準備', '学校関連', '行事・記念イベント'
];

// デフォルトフォームデータ
export const DEFAULT_FORM = {
  name: '',
  birthDate: new Date().toISOString().slice(0, 10),
  gender: 'male',
  selectedCategories: [],
  prefecture: '',
  municipality: '',
  title: '',
  date: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  description: '',
  category: '育児準備',
  todos: [],
  supplies: []
};

// 子どもフォームのデフォルト値
export const DEFAULT_CHILD_FORM = {
  name: '',
  birthDate: new Date().toISOString().slice(0, 10),
  gender: '',
  prefecture: '',
  municipality: '',
  selectedCategories: []
};

// スケジュール編集フォームのデフォルト値
export const INITIAL_EDIT_FORM = {
  title: '',
  date: '',
  endDate: '',
  description: '',
  category: '育児準備',
  todos: [],
  supplies: []
};

// 初期フォーム（ユーティリティ関数）
export const getInitialForm = () => ({
  ...DEFAULT_FORM,
  selectedCategories: [...CATEGORY_ORDER]
});

// 都道府県・市区町村データ
