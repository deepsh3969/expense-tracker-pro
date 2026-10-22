import { useId } from 'react'

export default function SpendingChart({ data, formatValue, height = 190 }) {
  const titleId = useId()
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>Not enough data to draw a chart yet.</p>
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.value), 1)
  const width = 100
  const gap = data.length > 20 ? 1.2 : 2.4
  const barWidth = (width - gap * (data.length - 1)) / data.length

  const gridLines = [0.25, 0.5, 0.75, 1]

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${width} 40`}
        preserveAspectRatio="none"
        style={{ height }}
        role="img"
        aria-labelledby={titleId}
        className="chart-svg"
      >
        <title id={titleId}>Spending over time</title>
        {gridLines.map((g) => (
          <line
            key={g}
            x1="0"
            x2={width}
            y1={40 - g * 38}
            y2={40 - g * 38}
            className="chart-gridline"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {data.map((d, i) => {
          const barHeight = max > 0 ? (d.value / max) * 36 : 0
          const x = i * (barWidth + gap)
          const y = 38 - barHeight
          return (
            <g key={`${d.label || 'b'}-${i}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, d.value > 0 ? 0.6 : 0)}
                rx={0.8}
                className={`chart-bar${d.highlight ? ' chart-bar--highlight' : ''}`}
              >
                <title>{`${d.fullLabel || d.label || `Bar ${i + 1}`}: ${formatValue ? formatValue(d.value) : d.value}`}</title>
              </rect>
            </g>
          )
        })}
      </svg>
      <div className="chart-labels" aria-hidden="true">
        {data
          .map((d, i) => ({ d, i }))
          .filter(({ i }) => {
            const step = data.length > 20 ? Math.ceil(data.length / 6) : Math.ceil(data.length / 8)
            return i % step === 0 || i === data.length - 1
          })
          .map(({ d, i }) => (
            <span key={`${d.label || 'l'}-${i}`} className="chart-label">
              {d.label}
            </span>
          ))}
      </div>
      <p className="chart-caption">
        Peak: {formatValue ? formatValue(max) : max}
      </p>
    </div>
  )
}
