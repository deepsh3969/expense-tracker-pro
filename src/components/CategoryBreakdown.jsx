import { categoryColor } from '../utils/categories'
import { formatCurrency, formatPercent } from '../utils/currency'

export default function CategoryBreakdown({ items, currency, total, emptyMessage }) {
  if (!items || items.length === 0) {
    return (
      <div className="breakdown-empty">
        <p>{emptyMessage || 'No expenses recorded for this period.'}</p>
      </div>
    )
  }

  const safeTotal = total > 0 ? total : items.reduce((a, i) => a + i.amount, 0)

  const radius = 54
  const stroke = 20
  const size = 160
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  let offsetAcc = 0
  const segments = items.map((item, index) => {
    const fraction = safeTotal > 0 ? item.amount / safeTotal : 0
    const length = fraction * circumference
    const segment = {
      key: item.category,
      color: categoryColor(item.category, index),
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -offsetAcc,
      percent: fraction * 100,
      amount: item.amount,
      category: item.category,
    }
    offsetAcc += length
    return segment
  })

  return (
    <div className="breakdown">
      <div className="breakdown-chart">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          role="img"
          aria-label="Expense category breakdown chart"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-sage-soft)"
            strokeWidth={stroke}
          />
          {segments.map((seg) => (
            <circle
              key={seg.key}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
            >
              <title>{`${seg.category}: ${formatCurrency(seg.amount, currency)} (${formatPercent(seg.percent)})`}</title>
            </circle>
          ))}
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            className="breakdown-center-label"
          >
            Total
          </text>
          <text
            x={center}
            y={center + 16}
            textAnchor="middle"
            className="breakdown-center-value"
          >
            {formatCurrency(safeTotal, currency, { maximumFractionDigits: 0 })}
          </text>
        </svg>
      </div>
      <ul className="breakdown-legend">
        {segments.map((seg) => (
          <li key={seg.key} className="breakdown-legend-item">
            <span
              className="breakdown-legend-swatch"
              style={{ background: seg.color }}
              aria-hidden="true"
            />
            <span className="breakdown-legend-name">{seg.category}</span>
            <span className="breakdown-legend-amount">
              {formatCurrency(seg.amount, currency, { maximumFractionDigits: 0 })}
            </span>
            <span className="breakdown-legend-percent">{formatPercent(seg.percent)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
