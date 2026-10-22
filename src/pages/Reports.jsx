import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import SummaryCard from '../components/SummaryCard'
import CategoryBreakdown from '../components/CategoryBreakdown'
import SpendingChart from '../components/SpendingChart'
import EmptyState from '../components/EmptyState'
import { formatCurrency, formatPercent } from '../utils/currency'
import {
  monthlyIncome,
  monthlyExpenses,
  netSavings,
  savingsRate,
  categorySpendingForMonth,
  highestIndividualExpense,
  mostFrequentExpenseCategory,
  monthlyTrend,
  monthlyComparison,
} from '../utils/calculations'
import {
  currentMonthKey,
  listRecentMonthKeys,
  monthLabel,
  formatDateShort,
  isValidMonthKey,
} from '../utils/dateHelpers'

export default function Reports() {
  const { transactions, settings } = useApp()
  const currency = settings.currency
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey())

  const income = monthlyIncome(transactions, selectedMonth)
  const expenses = monthlyExpenses(transactions, selectedMonth)
  const savings = netSavings(transactions, selectedMonth)
  const rate = savingsRate(income, expenses)
  const breakdown = categorySpendingForMonth(transactions, selectedMonth)
  const highest = highestIndividualExpense(transactions, selectedMonth)
  const frequent = mostFrequentExpenseCategory(transactions, selectedMonth)
  const comparison = monthlyComparison(transactions, selectedMonth)

  const trendKeys = listRecentMonthKeys(6, selectedMonth)
  const trend = monthlyTrend(transactions, trendKeys)
  const trendData = trend.map((row) => ({
    label: monthLabel(row.key, { short: true, withYear: false }),
    value: row.expenses,
    fullLabel: monthLabel(row.key),
  }))
  const maxTrend = trend.reduce(
    (best, row) => (row.expenses > best.expenses ? row : best),
    { key: null, expenses: -1 },
  )

  const hasAnyData = transactions.length > 0
  const hasMonthData = income > 0 || expenses > 0

  return (
    <div className="page page-reports">
      <div className="page-head">
        <div>
          <h2 className="page-title">Reports &amp; analytics</h2>
          <p className="page-sub">
            Understand where your money goes, month by month.
          </p>
        </div>
        <div className="form-field reports-month-field">
          <label className="form-label" htmlFor="report-month">
            Reporting month
          </label>
          <input
            id="report-month"
            type="month"
            className="form-input"
            value={selectedMonth}
            onChange={(e) => {
              const v = e.target.value
              if (isValidMonthKey(v)) setSelectedMonth(v)
            }}
          />
        </div>
      </div>

      {!hasAnyData ? (
        <EmptyState
          title="No data to analyze"
          message="Add a few transactions and your reports will come alive."
        />
      ) : null}

      {hasAnyData && !hasMonthData ? (
        <p className="panel-note reports-empty-month">
          No transactions recorded in {monthLabel(selectedMonth)}. Pick another month or add
          transactions for this one.
        </p>
      ) : null}

      <section className="summary-grid" aria-label="Monthly summary">
        <SummaryCard
          tone="sage"
          label="Monthly income"
          value={formatCurrency(income, currency)}
          hint={monthLabel(selectedMonth)}
        />
        <SummaryCard
          tone="pink"
          label="Monthly expenses"
          value={formatCurrency(expenses, currency)}
          hint={monthLabel(selectedMonth)}
        />
        <SummaryCard
          tone="forest"
          label="Net savings"
          value={formatCurrency(savings, currency, { signed: true })}
          hint={savings >= 0 ? 'You spent less than you earned' : 'Expenses exceeded income'}
        />
        <SummaryCard
          tone="ivory"
          label="Savings rate"
          value={rate === null ? '—' : formatPercent(rate)}
          hint={
            rate === null
              ? 'Needs income > 0'
              : rate >= 20
                ? 'Great job saving!'
                : rate >= 0
                  ? 'Try to save at least 20%'
                  : 'Spending exceeded income'
          }
        />
      </section>

      <section className="dash-grid">
        <article className="panel panel--span2">
          <div className="panel-head">
            <h3 className="panel-title">Spending trend · last 6 months</h3>
          </div>
          {expenses > 0 || trend.some((r) => r.expenses > 0) ? (
            <SpendingChart
              data={trendData.map((d) => ({
                ...d,
                highlight: d.label === monthLabel(selectedMonth, { short: true, withYear: false }),
              }))}
              formatValue={(v) => formatCurrency(v, currency, { maximumFractionDigits: 0 })}
              height={200}
            />
          ) : (
            <p className="panel-note">No expense history yet for the last six months.</p>
          )}
          {maxTrend.key && maxTrend.expenses > 0 ? (
            <p className="panel-footnote-inline">
              Highest spending month:{' '}
              <strong>
                {monthLabel(maxTrend.key)} ({formatCurrency(maxTrend.expenses, currency)})
              </strong>
            </p>
          ) : null}
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Month comparison</h3>
          </div>
          <div className="compare-block">
            <div className="compare-row">
              <span>{monthLabel(comparison.previousKey, { short: true })}</span>
              <strong>{formatCurrency(comparison.previous, currency)}</strong>
            </div>
            <div className="compare-row compare-row--current">
              <span>{monthLabel(comparison.key, { short: true })}</span>
              <strong>{formatCurrency(comparison.current, currency)}</strong>
            </div>
            <p
              className={`compare-delta ${
                comparison.difference <= 0 ? 'is-income' : 'is-expense'
              }`}
            >
              {comparison.previous === 0 && comparison.current === 0
                ? 'No expenses in either month.'
                : comparison.percentChange === null
                  ? `New spending this month: ${formatCurrency(comparison.difference, currency)}`
                  : `${comparison.difference >= 0 ? '↑' : '↓'} ${formatPercent(Math.abs(comparison.percentChange))} ${
                      comparison.difference >= 0 ? 'more' : 'less'
                    } than ${monthLabel(comparison.previousKey, { short: true })}`}
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Highlights</h3>
          </div>
          <ul className="highlight-list">
            <li>
              <span className="highlight-label">Highest individual expense</span>
              {highest ? (
                <span className="highlight-value">
                  {formatCurrency(highest.amount, currency)} · {highest.title}{' '}
                  <em>({formatDateShort(highest.date)})</em>
                </span>
              ) : (
                <span className="highlight-value">None this month</span>
              )}
            </li>
            <li>
              <span className="highlight-label">Most used expense category</span>
              <span className="highlight-value">
                {frequent
                  ? `${frequent.category} · ${frequent.count} transaction${frequent.count === 1 ? '' : 's'}`
                  : 'None this month'}
              </span>
            </li>
            <li>
              <span className="highlight-label">Top spending category</span>
              <span className="highlight-value">
                {breakdown[0]
                  ? `${breakdown[0].category} · ${formatCurrency(breakdown[0].amount, currency)}`
                  : 'None this month'}
              </span>
            </li>
          </ul>
        </article>

        <article className="panel panel--span2">
          <div className="panel-head">
            <h3 className="panel-title">Category-wise expense breakdown</h3>
          </div>
          <CategoryBreakdown
            items={breakdown}
            currency={currency}
            total={expenses}
            emptyMessage={`No expenses recorded in ${monthLabel(selectedMonth)}.`}
          />
        </article>
      </section>
    </div>
  )
}
