import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import SummaryCard from '../components/SummaryCard'
import TransactionList from '../components/TransactionList'
import ProgressBar from '../components/ProgressBar'
import CategoryBreakdown from '../components/CategoryBreakdown'
import SpendingChart from '../components/SpendingChart'
import EmptyState from '../components/EmptyState'
import { formatCurrency } from '../utils/currency'
import {
  totalIncome,
  totalExpenses,
  availableBalance,
  monthlyExpenses,
  monthlyIncome,
  netSavings,
  recentTransactions,
  categorySpendingForMonth,
  dailyExpenseSeries,
  budgetUtilization,
  budgetStatus,
  transactionsForMonth,
} from '../utils/calculations'
import {
  currentMonthKey,
  monthLabel,
  daysInMonth,
  formatDateLong,
  todayISO,
} from '../utils/dateHelpers'
import { OVERALL_BUDGET } from '../utils/categories'

function greetingForHour(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { transactions, budgets, profile, settings } = useApp()
  const currency = settings.currency
  const month = currentMonthKey()
  const today = todayISO()

  const income = totalIncome(transactions)
  const expenses = totalExpenses(transactions)
  const balance = availableBalance(transactions)
  const mExpenses = monthlyExpenses(transactions, month)
  const mIncome = monthlyIncome(transactions, month)
  const savings = netSavings(transactions, month)
  const recent = recentTransactions(transactions, 6)
  const breakdown = categorySpendingForMonth(transactions, month)
  const monthTx = transactionsForMonth(transactions, month)

  const dayCount = daysInMonth(month)
  const todayDay = Number(today.slice(8, 10))
  const dailyMap = dailyExpenseSeries(transactions, month)
  const dailyData = []
  for (let d = 1; d <= dayCount; d += 1) {
    const label = String(d)
    dailyData.push({
      label: d % 5 === 0 || d === 1 ? label : '',
      fullLabel: `Day ${d}`,
      value: dailyMap.get(d) || 0,
      highlight: d === todayDay,
    })
  }

  const overallBudget = budgets.find(
    (b) => b.month === month && b.category === OVERALL_BUDGET,
  )
  const monthBudgets = budgets.filter((b) => b.month === month)
  const categoryBudgetsWithSpend = monthBudgets
    .filter((b) => b.category !== OVERALL_BUDGET)
    .map((b) => {
      const spent = monthTx
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((a, t) => a + Number(t.amount), 0)
      return { budget: b, spent, status: budgetStatus(spent, b.limit) }
    })

  const warnings = []
  if (overallBudget) {
    const st = budgetStatus(mExpenses, overallBudget.limit)
    if (st !== 'ok') {
      warnings.push({
        label: 'Overall budget',
        status: st,
        usage: budgetUtilization(mExpenses, overallBudget.limit),
      })
    }
  }
  categoryBudgetsWithSpend.forEach(({ budget, spent, status }) => {
    if (status !== 'ok') {
      warnings.push({
        label: budget.category,
        status,
        usage: budgetUtilization(spent, budget.limit),
      })
    }
  })

  const hasData = transactions.length > 0

  return (
    <div className="page page-dashboard">
      <section className="welcome-banner">
        <div>
          <p className="welcome-kicker">{greetingForHour(new Date().getHours())},</p>
          <h2 className="welcome-title">{profile.name}!</h2>
          <p className="welcome-sub">
            Here is how your money is doing today — {formatDateLong(today)}.
          </p>
        </div>
        <div className="welcome-actions">
          <Link to="/add-transaction?type=expense" className="btn btn-primary">
            Quick Add Expense
          </Link>
          <Link to="/add-transaction?type=income" className="btn btn-soft">
            Quick Add Income
          </Link>
        </div>
      </section>

      {!hasData ? (
        <EmptyState
          title="Welcome to Expense Tracker Pro"
          message="You have not recorded any transactions yet. Add your first income or expense, or restore the sample demonstration data from Settings."
          action={
            <Link to="/add-transaction" className="btn btn-primary">
              Add your first transaction
            </Link>
          }
        />
      ) : null}

      <section className="summary-grid" aria-label="Financial summary">
        <SummaryCard
          tone="forest"
          label="Available balance"
          value={formatCurrency(balance, currency)}
          hint={`${transactions.length} total transactions`}
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm2 0v3h14V7H5zm12 6a1.2 1.2 0 1 0 0 2.4A1.2 1.2 0 0 0 17 13z"
                fill="currentColor"
              />
            </svg>
          }
        />
        <SummaryCard
          tone="sage"
          label="Total income"
          value={formatCurrency(income, currency)}
          hint="All time"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M11 17h2v-6h6v-2h-6V3H9v6H3v2h6v6z" fill="currentColor" />
            </svg>
          }
        />
        <SummaryCard
          tone="pink"
          label="Total expenses"
          value={formatCurrency(expenses, currency)}
          hint="All time"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" fill="currentColor" />
            </svg>
          }
        />
        <SummaryCard
          tone="ivory"
          label={`Spent in ${monthLabel(month, { short: true })}`}
          value={formatCurrency(mExpenses, currency)}
          hint={`${monthTx.filter((t) => t.type === 'expense').length} expenses this month`}
        />
      </section>

      <section className="dash-grid">
        <article className="panel panel--span2">
          <div className="panel-head">
            <h3 className="panel-title">Monthly budget progress</h3>
            <Link to="/budgets" className="panel-link">
              Manage budgets
            </Link>
          </div>
          {overallBudget ? (
            <div className="dash-budget-overall">
              <div className="dash-budget-row">
                <span>Overall spending limit</span>
                <strong>
                  {formatCurrency(mExpenses, currency)} /{' '}
                  {formatCurrency(overallBudget.limit, currency)}
                </strong>
              </div>
              <ProgressBar
                value={budgetUtilization(mExpenses, overallBudget.limit)}
                status={budgetStatus(mExpenses, overallBudget.limit)}
                label="Overall budget usage"
              />
            </div>
          ) : (
            <p className="panel-note">
              No overall budget set for {monthLabel(month)}.{' '}
              <Link to="/budgets">Set one now</Link>.
            </p>
          )}

          {categoryBudgetsWithSpend.length > 0 ? (
            <ul className="dash-budget-list">
              {categoryBudgetsWithSpend.map(({ budget, spent, status }) => (
                <li key={budget.id} className="dash-budget-item">
                  <div className="dash-budget-row">
                    <span>{budget.category}</span>
                    <strong>
                      {formatCurrency(spent, currency)} /{' '}
                      {formatCurrency(budget.limit, currency)}
                    </strong>
                  </div>
                  <ProgressBar
                    value={budgetUtilization(spent, budget.limit)}
                    status={status}
                    label={`${budget.category} budget usage`}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Budget alerts</h3>
          </div>
          {warnings.length === 0 ? (
            <p className="panel-note">
              All budgets are on track. Nice work staying within your limits.
            </p>
          ) : (
            <ul className="alert-list">
              {warnings.map((w) => (
                <li key={w.label} className={`alert-item alert-item--${w.status}`}>
                  <strong>{w.label}</strong>
                  <span>
                    {w.status === 'exceeded'
                      ? 'Limit exceeded'
                      : 'Nearing the limit'}{' '}
                    · {Math.round(w.usage)}% used
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="panel-footnote">
            <p>
              Net savings this month:{' '}
              <strong className={savings >= 0 ? 'is-income' : 'is-expense'}>
                {formatCurrency(savings, currency, { signed: true })}
              </strong>
            </p>
            <p>
              Income {formatCurrency(mIncome, currency)} · Expenses{' '}
              {formatCurrency(mExpenses, currency)}
            </p>
          </div>
        </article>

        <article className="panel panel--span2">
          <div className="panel-head">
            <h3 className="panel-title">Daily spending · {monthLabel(month)}</h3>
          </div>
          {mExpenses > 0 ? (
            <SpendingChart
              data={dailyData}
              formatValue={(v) => formatCurrency(v, currency, { maximumFractionDigits: 0 })}
            />
          ) : (
            <p className="panel-note">No expenses recorded this month yet.</p>
          )}
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Category breakdown</h3>
            <Link to="/reports" className="panel-link">
              Full report
            </Link>
          </div>
          <CategoryBreakdown
            items={breakdown}
            currency={currency}
            total={mExpenses}
            emptyMessage="Add some expenses this month to see your category split."
          />
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Recent transactions</h3>
            <Link to="/transactions" className="panel-link">
              View all
            </Link>
          </div>
          <TransactionList
            transactions={recent}
            compact
            emptyTitle="Nothing here yet"
            emptyMessage="Your latest transactions will appear here."
          />
        </article>
      </section>
    </div>
  )
}
