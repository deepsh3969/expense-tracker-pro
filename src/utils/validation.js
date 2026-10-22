import { categoriesForType } from './categories.js'
import { isValidISODate, isValidMonthKey, todayISO } from './dateHelpers.js'

const MAX_AMOUNT = 100000000
const MIN_DATE = '2000-01-01'
const MAX_NOTES_LENGTH = 300
const MAX_TITLE_LENGTH = 80

export function validateTransaction(values) {
  const errors = {}
  const title = (values.title || '').trim()
  const amountRaw = values.amount
  const type = values.type
  const category = values.category
  const date = values.date
  const notes = (values.notes || '').trim()

  if (!title) {
    errors.title = 'Title is required.'
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`
  }

  if (amountRaw === '' || amountRaw === null || amountRaw === undefined) {
    errors.amount = 'Amount is required.'
  } else {
    const amount = Number(amountRaw)
    if (!Number.isFinite(amount)) {
      errors.amount = 'Amount must be a valid number.'
    } else if (amount <= 0) {
      errors.amount = 'Amount must be greater than zero.'
    } else if (amount > MAX_AMOUNT) {
      errors.amount = 'Amount is too large.'
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(amountRaw).trim())) {
      errors.amount = 'Use at most two decimal places.'
    }
  }

  if (type !== 'income' && type !== 'expense') {
    errors.type = 'Choose income or expense.'
  } else if (!category) {
    errors.category = 'Category is required.'
  } else if (!categoriesForType(type).includes(category)) {
    errors.category = `Choose a valid ${type} category.`
  }

  if (!date) {
    errors.date = 'Date is required.'
  } else if (!isValidISODate(date)) {
    errors.date = 'Enter a valid date.'
  } else if (date < MIN_DATE) {
    errors.date = 'Date cannot be before 2000-01-01.'
  } else if (date > todayISO()) {
    errors.date = 'Date cannot be in the future.'
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      title,
      amount: Number(amountRaw),
      type,
      category,
      date,
      notes,
    },
  }
}

export function validateBudget(values) {
  const errors = {}
  const category = values.category
  const month = values.month
  const limitRaw = values.limit

  if (!category) {
    errors.category = 'Category is required.'
  }
  if (!month) {
    errors.month = 'Month is required.'
  } else if (!isValidMonthKey(month)) {
    errors.month = 'Enter a valid month.'
  }
  if (limitRaw === '' || limitRaw === null || limitRaw === undefined) {
    errors.limit = 'Budget amount is required.'
  } else {
    const limit = Number(limitRaw)
    if (!Number.isFinite(limit)) {
      errors.limit = 'Budget must be a valid number.'
    } else if (limit <= 0) {
      errors.limit = 'Budget must be greater than zero.'
    } else if (limit > MAX_AMOUNT) {
      errors.limit = 'Budget amount is too large.'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { category, month, limit: Number(limitRaw) },
  }
}
