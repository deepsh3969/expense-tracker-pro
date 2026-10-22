import assert from 'node:assert'
import {
  totalIncome,
  totalExpenses,
  availableBalance,
  monthlyIncome,
  monthlyExpenses,
  netSavings,
  savingsRate,
  budgetRemaining,
  budgetUtilization,
  budgetStatus,
  categorySpendingForMonth,
  highestIndividualExpense,
  mostFrequentExpenseCategory,
  monthlyComparison,
  filterTransactions,
  sortTransactions,
  dailyExpenseSeries,
} from '../src/utils/calculations.js'
import {
  validateTransaction,
  validateBudget,
} from '../src/utils/validation.js'
import {
  monthKey,
  isValidISODate,
  listRecentMonthKeys,
  daysInMonth,
  previousMonthKey,
} from '../src/utils/dateHelpers.js'
import { formatCurrency } from '../src/utils/currency.js'

const tx = [
  { id: '1', title: 'A', amount: 1000, type: 'income', category: 'Pocket Money', date: '2026-10-01', notes: '', createdAt: 1 },
  { id: '2', title: 'B', amount: 250, type: 'expense', category: 'Food', date: '2026-10-03', notes: 'lunch', createdAt: 2 },
  { id: '3', title: 'C', amount: 150, type: 'expense', category: 'Food', date: '2026-10-10', notes: '', createdAt: 3 },
  { id: '4', title: 'D', amount: 400, type: 'expense', category: 'Transportation', date: '2026-09-20', notes: '', createdAt: 4 },
  { id: '5', title: 'E', amount: 500, type: 'income', category: 'Scholarship', date: '2026-09-05', notes: '', createdAt: 5 },
]

// Totals
assert.strictEqual(totalIncome(tx), 1500)
assert.strictEqual(totalExpenses(tx), 800)
assert.strictEqual(availableBalance(tx), 700)

// Monthly
assert.strictEqual(monthlyIncome(tx, '2026-10'), 1000)
assert.strictEqual(monthlyExpenses(tx, '2026-10'), 400)
assert.strictEqual(netSavings(tx, '2026-10'), 600)
assert.strictEqual(monthlyExpenses(tx, '2026-09'), 400)

// Savings rate + zero income
assert.strictEqual(savingsRate(1000, 400), 60)
assert.strictEqual(savingsRate(0, 100), null)

// Budgets
assert.strictEqual(budgetRemaining(1000, 400), 600)
assert.strictEqual(budgetUtilization(400, 1000), 40)
assert.strictEqual(budgetUtilization(400, 0), 0)
assert.strictEqual(budgetStatus(790, 1000), 'ok')
assert.strictEqual(budgetStatus(800, 1000), 'warning')
assert.strictEqual(budgetStatus(1001, 1000), 'exceeded')

// Category
const breakdown = categorySpendingForMonth(tx, '2026-10')
assert.strictEqual(breakdown.length, 1)
assert.deepStrictEqual(breakdown[0], { category: 'Food', amount: 400 })

// Highest + frequent
assert.strictEqual(highestIndividualExpense(tx, '2026-10').title, 'B')
assert.deepStrictEqual(mostFrequentExpenseCategory(tx, '2026-10'), { category: 'Food', count: 2 })

// Comparison (Sep 400 -> Oct 400 = 0% change)
const cmp = monthlyComparison(tx, '2026-10')
assert.strictEqual(cmp.previousKey, '2026-09')
assert.strictEqual(cmp.difference, 0)

// Filters
assert.strictEqual(filterTransactions(tx, { search: 'lunch' }).length, 1)
assert.strictEqual(filterTransactions(tx, { type: 'income' }).length, 2)
assert.strictEqual(filterTransactions(tx, { category: 'Food' }).length, 2)
assert.strictEqual(filterTransactions(tx, { startDate: '2026-10-01', endDate: '2026-10-05' }).length, 2)

// Sorting
const sorted = sortTransactions(tx, 'amount', 'desc')
assert.strictEqual(sorted[0].amount, 1000)
const sortedAsc = sortTransactions(tx, 'date', 'asc')
assert.strictEqual(sortedAsc[0].date, '2026-09-05')

// Daily series
const daily = dailyExpenseSeries(tx, '2026-10')
assert.strictEqual(daily.get(3), 250)
assert.strictEqual(daily.get(10), 150)

// Date helpers
assert.strictEqual(monthKey('2026-10-15'), '2026-10')
assert.strictEqual(isValidISODate('2026-02-30'), false)
assert.strictEqual(isValidISODate('2026-02-28'), true)
assert.strictEqual(isValidISODate('not-a-date'), false)
assert.deepStrictEqual(listRecentMonthKeys(3, '2026-01'), ['2025-11', '2025-12', '2026-01'])
assert.strictEqual(previousMonthKey('2026-01'), '2025-12')
assert.strictEqual(daysInMonth('2026-02'), 28)
assert.strictEqual(daysInMonth('2024-02'), 29)

// Currency
assert.strictEqual(formatCurrency(1500, 'INR'), '₹1,500')
assert.strictEqual(formatCurrency(-250, 'INR'), '-₹250')
assert.strictEqual(formatCurrency(250, 'USD'), '$250')
assert.strictEqual(formatCurrency(10, 'EUR'), '€10')
assert.strictEqual(formatCurrency(NaN, 'INR'), '—')

// Validation — valid
const ok = validateTransaction({
  title: 'Lunch', amount: '120.50', type: 'expense', category: 'Food', date: '2026-10-10', notes: '',
})
assert.strictEqual(ok.valid, true)
assert.strictEqual(ok.data.amount, 120.5)

// Validation — errors
const bad = validateTransaction({
  title: '', amount: '-5', type: 'expense', category: 'Food', date: '2026-13-40', notes: '',
})
assert.strictEqual(bad.valid, false)
assert.ok(bad.errors.title)
assert.ok(bad.errors.amount)
assert.ok(bad.errors.date)

// Future date rejected
const future = validateTransaction({
  title: 'X', amount: '10', type: 'income', category: 'Pocket Money', date: '2099-01-01', notes: '',
})
assert.strictEqual(future.valid, false)

// Wrong category for type
const wrongCat = validateTransaction({
  title: 'X', amount: '10', type: 'income', category: 'Food', date: '2026-10-01', notes: '',
})
assert.strictEqual(wrongCat.valid, false)

// Budget validation
assert.strictEqual(validateBudget({ category: 'Food', month: '2026-10', limit: '0' }).valid, false)
assert.strictEqual(validateBudget({ category: 'Food', month: '2026-10', limit: '-100' }).valid, false)
assert.strictEqual(validateBudget({ category: 'Food', month: '2026-10', limit: '500' }).valid, true)
assert.strictEqual(validateBudget({ category: 'Food', month: 'bad', limit: '500' }).valid, false)

console.log('ALL CALCULATION & VALIDATION TESTS PASSED ✓')
