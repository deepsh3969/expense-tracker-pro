import { NavLink } from 'react-router-dom'

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z"
        fill="currentColor"
      />
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M7 7h10v2l4-3-4-3v2H5v6h2V7zm10 10H7v-2l-4 3 4 3v-2h12v-6h-2v4z"
        fill="currentColor"
      />
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"
        fill="currentColor"
      />
    </svg>
  ),
  budgets: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 3a9 9 0 1 0 9 9h-9V3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M14 2v7h7a7 7 0 0 0-7-7z" fill="currentColor" opacity="0.55" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M4 20h16v2H2V2h2v18zm3-3V9h3v8H7zm5 0V4h3v13h-3zm5 0v-6h3v6h-3z"
        fill="currentColor"
      />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6a.5.5 0 0 0 .1-.6l-2-3.4a.5.5 0 0 0-.6-.2l-2.4 1a7.3 7.3 0 0 0-1.7-1l-.4-2.6a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.4 2.6c-.6.3-1.2.6-1.7 1l-2.4-1a.5.5 0 0 0-.6.2l-2 3.4a.5.5 0 0 0 .1.6L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.1.6l2 3.4c.1.2.4.3.6.2l2.4-1c.5.4 1.1.7 1.7 1l.4 2.6c0 .2.2.4.5.4h4c.3 0 .5-.2.5-.4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.4 1c.2.1.5 0 .6-.2l2-3.4a.5.5 0 0 0-.1-.6L19.4 13zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5z"
        fill="currentColor"
      />
    </svg>
  ),
}

const LINKS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/transactions', label: 'Transactions', icon: 'transactions' },
  { to: '/add-transaction', label: 'Add Transaction', icon: 'add' },
  { to: '/budgets', label: 'Budgets', icon: 'budgets' },
  { to: '/reports', label: 'Reports', icon: 'reports' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ open, onClose, studentName }) {
  return (
    <>
      <div
        className={`sidebar-overlay${open ? ' is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26">
              <path
                d="M16 6c-5.5 0-9 4-9 9.5C7 21 10.8 25 16 26c5.2-1 9-5 9-10.5C25 10 21.5 6 16 6z"
                fill="#FFFBF5"
                opacity="0.9"
              />
              <path
                d="M16 9v13M16 15c-2.2-.5-3.7-2-4.2-4M16 19c2.2-.5 3.7-2 4.2-4"
                stroke="#86A487"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
          <div className="sidebar-brand-text">
            <strong>Expense Tracker</strong>
            <span>Pro · Student Edition</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' is-active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{ICONS[link.icon]}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-label">Signed in as</p>
          <p className="sidebar-footer-name">{studentName || 'Student'}</p>
          <p className="sidebar-footer-note">Data saved in this browser only</p>
        </div>
      </aside>
    </>
  )
}
