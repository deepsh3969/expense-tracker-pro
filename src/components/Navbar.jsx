import { Link, useLocation } from 'react-router-dom'
import { formatDateLong, todayISO } from '../utils/dateHelpers'

const TITLES = [
  { match: (p) => p === '/', title: 'Dashboard' },
  { match: (p) => p.startsWith('/transactions'), title: 'Transactions' },
  { match: (p) => p.startsWith('/add-transaction'), title: 'Add Transaction' },
  { match: (p) => p.startsWith('/budgets'), title: 'Budgets' },
  { match: (p) => p.startsWith('/reports'), title: 'Reports & Analytics' },
  { match: (p) => p.startsWith('/settings'), title: 'Settings' },
]

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const entry = TITLES.find((t) => t.match(pathname))
  const title = entry ? entry.title : 'Not Found'

  return (
    <header className="navbar">
      <button
        type="button"
        className="navbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div className="navbar-titles">
        <h1 className="navbar-title">{title}</h1>
        <p className="navbar-date">{formatDateLong(todayISO())}</p>
      </div>

      <div className="navbar-actions">
        <Link to="/add-transaction?type=income" className="btn btn-soft btn-sm">
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M11 17h2v-6h6v-2h-6V3H9v6H3v2h6v6z" fill="currentColor" />
          </svg>
          Income
        </Link>
        <Link to="/add-transaction?type=expense" className="btn btn-primary btn-sm">
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" fill="currentColor" />
          </svg>
          Expense
        </Link>
      </div>
    </header>
  )
}
