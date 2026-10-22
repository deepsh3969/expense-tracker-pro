import { monthKey, previousMonthKey } from './dateHelpers.js'

export function sumByType(transactions, type) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
}

export function totalIncome(transactions) {
  return sumByType(transactions, 'income')
}

export function totalExpenses(transactions) {
  return sumByType(transactions, 'expense')
}

export function availableBalance(transactions) {
  return totalIncome(transactions) - totalExpenses(transactions)
}

export function transactionsForMonth(transactions, key) {
  return transactions.filter((t) => monthKey(t.date) === key)
}

export function monthlyIncome(transactions, key) {
  return totalIncome(transactionsForMonth(transactions, key))
}

export function monthlyExpenses(transactions, key) {
  return totalExpenses(transactionsForMonth(transactions, key))
}

export function netSavings(transactions, key) {
  return monthlyIncome(transactions, key) - monthlyExpenses(transactions, key)
}

export function savingsRate(income, expenses) {
  if (!Number.isFinite(income) || income <= 0) return null
  return ((income - expenses) / income) * 100
}

export function budgetRemaining(limit, spent) {
  return Number(limit || 0) - Number(spent || 0)
}

export function budgetUtilization(spent, limit) {
  if (!Number(limit) || limit <= 0) return 0
  return (Number(spent || 0) / Number(limit)) * 100
}

export function budgetStatus(spent, limit) {
  const usage = budgetUtilization(spent, limit)
  if (usage > 100) return 'exceeded'
  if (usage >= 80) return 'warning'
  return 'ok'
}

export function categorySpendingForMonth(transactions, key) {
  const map = new Map()
  transactionsForMonth(transactions, key)
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + Number(t.amount || 0))
    })
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function categorySpendingTotal(transactions, category, key) {
  return transactionsForMonth(transactions, key)
    .filter((t) => t.type === 'expense' && t.category === category)
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
}

export function highestIndividualExpense(transactions, key) {
  const list = transactionsForMonth(transactions, key)
    .filter((t) => t.type === 'expense')
    .sort((a, b) => Number(b.amount) - Number(a.amount))
  return list.length > 0 ? list[0] : null
}

export function mostFrequentExpenseCategory(transactions, key) {
  const counts = new Map()
  transactionsForMonth(transactions, key)
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      counts.set(t.category, (counts.get(t.category) || 0) + 1)
    })
  let best = null
  counts.forEach((count, category) => {
    if (!best || count > best.count) best = { category, count }
  })
  return best
}

export function monthlyTrend(transactions, keys) {
  return keys.map((key) => ({
    key,
    income: monthlyIncome(transactions, key),
    expenses: monthlyExpenses(transactions, key),
  }))
}

export function monthlyComparison(transactions, key) {
  const prev = previousMonthKey(key)
  const current = monthlyExpenses(transactions, key)
  const previous = monthlyExpenses(transactions, prev)
  const difference = current - previous
  const percentChange =
    previous > 0 ? (difference / previous) * 100 : current > 0 ? null : 0
  return { key, previousKey: prev, current, previous, difference, percentChange }
}

export function dailyExpenseSeries(transactions, key) {
  const totals = new Map()
  transactionsForMonth(transactions, key)
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const day = Number(t.date.slice(8, 10))
      totals.set(day, (totals.get(day) || 0) + Number(t.amount || 0))
    })
  return totals
}

export function recentTransactions(transactions, limit = 5) {
  return [...transactions]
    .sort((a, b) => {
      if (a.date === b.date) return (b.createdAt || 0) - (a.createdAt || 0)
      return a.date < b.date ? 1 : -1
    })
    .slice(0, limit)
}

export function filterTransactions(transactions, filters = {}) {
  const { search, type, category, startDate, endDate } = filters
  let result = [...transactions]
  const query = (search || '').trim().toLowerCase()
  if (query) {
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query)) ||
        t.category.toLowerCase().includes(query),
    )
  }
  if (type && type !== 'all') {
    result = result.filter((t) => t.type === type)
  }
  if (category && category !== 'all') {
    result = result.filter((t) => t.category === category)
  }
  if (startDate) {
    result = result.filter((t) => t.date >= startDate)
  }
  if (endDate) {
    result = result.filter((t) => t.date <= endDate)
  }
  return result
}

export function sortTransactions(transactions, sortBy = 'date', sortDir = 'desc') {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...transactions].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'amount') {
      cmp = Number(a.amount) - Number(b.amount)
    } else if (sortBy === 'title') {
      cmp = a.title.localeCompare(b.title)
    } else {
      if (a.date === b.date) {
        cmp = (a.createdAt || 0) - (b.createdAt || 0)
      } else {
        cmp = a.date < b.date ? -1 : 1
      }
    }
    return cmp * dir
  })
}
