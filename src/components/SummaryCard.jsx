export default function SummaryCard({
  label,
  value,
  hint,
  tone = 'ivory',
  icon = null,
  action = null,
}) {
  return (
    <article className={`summary-card summary-card--${tone}`}>
      <div className="summary-card-top">
        <p className="summary-card-label">{label}</p>
        {icon ? (
          <span className="summary-card-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="summary-card-value">{value}</p>
      {hint ? <p className="summary-card-hint">{hint}</p> : null}
      {action ? <div className="summary-card-action">{action}</div> : null}
    </article>
  )
}
