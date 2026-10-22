export default function ProgressBar({ value, status = 'ok', label }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className={`progress progress--${status}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress'}
    >
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  )
}
