export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Education',
  'Shopping',
  'Entertainment',
  'Mobile and Internet',
  'Accommodation',
  'Healthcare',
  'Other',
]

export const INCOME_CATEGORIES = [
  'Pocket Money',
  'Scholarship',
  'Part-time Work',
  'Freelancing',
  'Other Income',
]

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export const OVERALL_BUDGET = 'Overall'

export function categoriesForType(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

const CATEGORY_COLORS = {
  Food: '#C98B72',
  Transportation: '#86A487',
  Education: '#6F8E9B',
  Shopping: '#C4899B',
  Entertainment: '#B79A5D',
  'Mobile and Internet': '#7E93B5',
  Accommodation: '#9B8AAE',
  Healthcare: '#B65F69',
  Other: '#8B918A',
  'Pocket Money': '#547D59',
  Scholarship: '#6E8F63',
  'Part-time Work': '#86A487',
  Freelancing: '#4F7360',
  'Other Income': '#747B72',
}

const FALLBACK_COLORS = ['#86A487', '#B8CEB3', '#C4899B', '#B79A5D', '#7E93B5', '#8B918A']

export function categoryColor(category, index = 0) {
  return (
    CATEGORY_COLORS[category] ||
    FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  )
}
