import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import TransactionList from '../components/TransactionList'
import { formatCurrency } from '../utils/currency'
import {
  filterTransactions,
  sortTransactions,
  totalIncome,
  totalExpenses,
} from '../utils/calculations'
import { ALL_CATEGORIES } from '../utils/categories'
import { todayISO } from '../utils/dateHelpers'

export default function Transactions() {
  const { transactions, settings } = useApp()
  const currency = settings.currency

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = useMemo(() => {
    const result = filterTransactions(transactions, {
      search,
      type,
      category,
      startDate,
      endDate,
    })
    return sortTransactions(result, sortBy, sortDir)
  }, [transactions, search, type, category, startDate, endDate, sortBy, sortDir])

  const filteredIncome = totalIncome(filtered)
  const filteredExpenses = totalExpenses(filtered)

  const hasActiveFilters =
    search || type !== 'all' || category !== 'all' || startDate || endDate

  function resetFilters() {
    setSearch('')
    setType('all')
    setCategory('all')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="page page-transactions">
      <div className="page-head">
        <div>
          <h2 className="page-title">All transactions</h2>
          <p className="page-sub">
            {filtered.length} of {transactions.length} transactions shown
          </p>
        </div>
        <Link to="/add-transaction" className="btn btn-primary">
          Add transaction
        </Link>
      </div>

      <section className="panel filters-panel" aria-label="Filter transactions">
        <div className="filters-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="filter-search">
              Search
            </label>
            <input
              id="filter-search"
              type="search"
              className="form-input"
              placeholder="Search title or notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="filter-type">
              Type
            </label>
            <select
              id="filter-type"
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="filter-category">
              Category
            </label>
            <select
              id="filter-category"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="filter-start">
              From
            </label>
            <input
              id="filter-start"
              type="date"
              className="form-input"
              value={startDate}
              max={endDate || todayISO()}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="filter-end">
              To
            </label>
            <input
              id="filter-end"
              type="date"
              className="form-input"
              value={endDate}
              min={startDate}
              max={todayISO()}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="filter-sort">
              Sort by
            </label>
            <div className="sort-row">
              <select
                id="filter-sort"
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
              </select>
              <button
                type="button"
                className="btn btn-ghost sort-dir-btn"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                aria-label={`Sort ${sortDir === 'asc' ? 'ascending' : 'descending'}, click to toggle`}
              >
                {sortDir === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>
        </div>
        <div className="filters-footer">
          <div className="filter-totals">
            <span className="is-income">
              Income {formatCurrency(filteredIncome, currency)}
            </span>
            <span className="is-expense">
              Expenses {formatCurrency(filteredExpenses, currency)}
            </span>
            <span>
              Net{' '}
              <strong
                className={filteredIncome - filteredExpenses >= 0 ? 'is-income' : 'is-expense'}
              >
                {formatCurrency(filteredIncome - filteredExpenses, currency, {
                  signed: true,
                })}
              </strong>
            </span>
          </div>
          {hasActiveFilters ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <TransactionList
          transactions={filtered}
          emptyTitle={hasActiveFilters ? 'No matching transactions' : 'No transactions yet'}
          emptyMessage={
            hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'Add your first income or expense to get started.'
          }
          emptyAction={
            hasActiveFilters ? (
              <button type="button" className="btn btn-ghost" onClick={resetFilters}>
                Clear filters
              </button>
            ) : (
              <Link to="/add-transaction" className="btn btn-primary">
                Add transaction
              </Link>
            )
          }
        />
      </section>
    </div>
  )
}
