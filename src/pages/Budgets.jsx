import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import BudgetCard from '../components/BudgetCard'
import EmptyState from '../components/EmptyState'
import { validateBudget } from '../utils/validation'
import { EXPENSE_CATEGORIES, OVERALL_BUDGET } from '../utils/categories'
import {
  categorySpendingTotal,
  monthlyExpenses,
  budgetUtilization,
} from '../utils/calculations'
import { currentMonthKey, monthLabel, isValidMonthKey } from '../utils/dateHelpers'
import { formatCurrency } from '../utils/currency'

export default function Budgets() {
  const { budgets, transactions, settings, saveBudget, deleteBudget } = useApp()
  const currency = settings.currency

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [category, setCategory] = useState(OVERALL_BUDGET)
  const [limit, setLimit] = useState('')
  const [errors, setErrors] = useState({})

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === selectedMonth),
    [budgets, selectedMonth],
  )

  const monthExpenses = monthlyExpenses(transactions, selectedMonth)

  const budgetCards = useMemo(() => {
    return monthBudgets
      .map((b) => ({
        budget: b,
        spent:
          b.category === OVERALL_BUDGET
            ? monthExpenses
            : categorySpendingTotal(transactions, b.category, selectedMonth),
      }))
      .sort((a, b) => {
        if (a.budget.category === OVERALL_BUDGET) return -1
        if (b.budget.category === OVERALL_BUDGET) return 1
        return budgetUtilization(b.spent, b.budget.limit) - budgetUtilization(a.spent, a.budget.limit)
      })
  }, [monthBudgets, transactions, selectedMonth, monthExpenses])

  const availableCategories = [
    OVERALL_BUDGET,
    ...EXPENSE_CATEGORIES.filter(
      (c) => !monthBudgets.some((b) => b.category === c) || (editing && editing.category === c),
    ),
  ]

  function openAdd() {
    setEditing(null)
    setCategory(OVERALL_BUDGET)
    setLimit('')
    setErrors({})
    setShowForm(true)
  }

  function openEdit(budget) {
    setEditing(budget)
    setCategory(budget.category)
    setLimit(String(budget.limit))
    setErrors({})
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setErrors({})
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = validateBudget({ category, month: selectedMonth, limit })
    if (!result.valid) {
      setErrors(result.errors)
      return
    }
    const duplicate = monthBudgets.find(
      (b) => b.category === result.data.category && (!editing || b.id !== editing.id),
    )
    if (duplicate) {
      setErrors({ category: 'A budget for this category already exists for the selected month.' })
      return
    }
    saveBudget(result.data)
    closeForm()
  }

  async function handleDelete(id) {
    await deleteBudget(id)
  }

  const totalBudgeted = monthBudgets
    .filter((b) => b.category !== OVERALL_BUDGET)
    .reduce((a, b) => a + b.limit, 0)

  return (
    <div className="page page-budgets">
      <div className="page-head">
        <div>
          <h2 className="page-title">Monthly budgets</h2>
          <p className="page-sub">
            Spending is calculated from your real expense transactions for the selected month.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={showForm && !editing ? closeForm : openAdd}>
          {showForm && !editing ? 'Close form' : 'Add budget'}
        </button>
      </div>

      <section className="panel budgets-toolbar">
        <div className="form-field budgets-month-field">
          <label className="form-label" htmlFor="budget-month">
            Reviewing month
          </label>
          <input
            id="budget-month"
            type="month"
            className="form-input"
            value={selectedMonth}
            onChange={(e) => {
              const v = e.target.value
              if (isValidMonthKey(v)) setSelectedMonth(v)
            }}
          />
        </div>
        <div className="budgets-toolbar-summary">
          <div>
            <p className="budget-card-figure-label">Spent this month</p>
            <p className="budget-card-figure-value is-expense">
              {formatCurrency(monthExpenses, currency)}
            </p>
          </div>
          <div>
            <p className="budget-card-figure-label">Category budgets total</p>
            <p className="budget-card-figure-value">
              {formatCurrency(totalBudgeted, currency)}
            </p>
          </div>
          <div>
            <p className="budget-card-figure-label">Budgets set</p>
            <p className="budget-card-figure-value">{monthBudgets.length}</p>
          </div>
        </div>
      </section>

      {showForm ? (
        <section className="panel form-panel budget-form-panel" aria-label="Budget form">
          <div className="panel-head">
            <h3 className="panel-title">
              {editing ? 'Edit budget' : `New budget · ${monthLabel(selectedMonth)}`}
            </h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={closeForm}>
              Close
            </button>
          </div>
          <form className="budget-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="budget-category">
                  Category <span className="form-required">*</span>
                </label>
                <select
                  id="budget-category"
                  className={`form-input${errors.category ? ' is-invalid' : ''}`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={Boolean(editing)}
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c === OVERALL_BUDGET ? 'Overall (all expenses)' : c}
                    </option>
                  ))}
                </select>
                {errors.category ? (
                  <p className="form-error" role="alert">
                    {errors.category}
                  </p>
                ) : null}
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="budget-limit">
                  Monthly limit <span className="form-required">*</span>
                </label>
                <input
                  id="budget-limit"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  className={`form-input${errors.limit ? ' is-invalid' : ''}`}
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="e.g. 2000"
                />
                {errors.limit ? (
                  <p className="form-error" role="alert">
                    {errors.limit}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Update budget' : 'Save budget'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {budgetCards.length === 0 ? (
        <EmptyState
          title={`No budgets for ${monthLabel(selectedMonth)}`}
          message="Set an overall spending limit and per-category budgets to start tracking your monthly goals."
          action={
            <button type="button" className="btn btn-primary" onClick={openAdd}>
              Add your first budget
            </button>
          }
        />
      ) : (
        <section className="budget-grid" aria-label="Budget cards">
          {budgetCards.map(({ budget, spent }) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={spent}
              currency={currency}
              onEdit={openEdit}
              onDelete={handleDelete}
              monthLabel={
                budget.category === OVERALL_BUDGET ? monthLabel(budget.month) : null
              }
            />
          ))}
        </section>
      )}
    </div>
  )
}
