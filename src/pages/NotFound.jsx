import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page page-not-found">
      <div className="notfound-card">
        <span className="notfound-art" aria-hidden="true">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <rect x="12" y="24" width="96" height="72" rx="14" fill="var(--color-pink)" />
            <rect x="12" y="24" width="96" height="20" rx="10" fill="var(--color-sage)" />
            <circle cx="44" cy="68" r="10" fill="var(--color-forest-sage)" />
            <circle cx="76" cy="68" r="10" fill="var(--color-forest-sage)" />
            <path d="M44 88c8 6 24 6 32 0" stroke="var(--color-forest-sage)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M92 16l6-8M102 24l8-4M86 8l2-8" stroke="var(--color-forest-sage)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
        <p className="notfound-code">404</p>
        <h2 className="notfound-title">This page wandered off</h2>
        <p className="notfound-message">
          The page you are looking for does not exist — perhaps a typo in the URL, or a link
          that has moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
