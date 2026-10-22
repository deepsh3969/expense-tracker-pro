export default function EmptyState({ title, message, action = null, compact = false }) {
  return (
    <div className={`empty-state${compact ? ' empty-state--compact' : ''}`}>
      <span className="empty-state-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="44" height="44">
          <rect x="6" y="10" width="36" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path d="M6 20h36" stroke="currentColor" strokeWidth="2.4" />
          <path d="M16 30h8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      <h3 className="empty-state-title">{title}</h3>
      {message ? <p className="empty-state-message">{message}</p> : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  )
}
