import ProgressBar from './ProgressBar'
import { formatCurrency } from '../utils/currency'
import {
  budgetStatus,
  budgetUtilization,
  budgetRemaining,
} from '../utils/calculations'

const STATUS_LABEL = {
  ok: 'On track',
  warning: 'Approaching limit',
  exceeded: 'Exceeded',
}

export default function BudgetCard({
  budget,
  spent,
  currency,
  onEdit,
  onDelete,
  monthLabel,
}) {
  const usage = budgetUtilization(spent, budget.limit)
  const remaining = budgetRemaining(budget.limit, spent)
  const status = budgetStatus(spent, budget.limit)
  const isOverall = budget.category === 'Overall'

  return (
    <article className={`budget-card budget-card--${status}`}>
      <div className="budget-card-head">
        <div>
          <p className="budget-card-category">
            {isOverall ? 'Overall spending' : budget.category}
          </p>
          {monthLabel ? <p className="budget-card-month">{monthLabel}</p> : null}
        </div>
        <span className={`badge badge--${status}`}>{STATUS_LABEL[status]}</span>
      </div>

      <ProgressBar
        value={usage}
        status={status}
        label={`${budget.category} budget usage`}
      />

      <div className="budget-card-figures">
        <div>
          <p className="budget-card-figure-label">Spent</p>
          <p className="budget-card-figure-value is-expense">
            {formatCurrency(spent, currency)}
          </p>
        </div>
        <div>
          <p className="budget-card-figure-label">Budget</p>
          <p className="budget-card-figure-value">
            {formatCurrency(budget.limit, currency)}
          </p>
        </div>
        <div>
          <p className="budget-card-figure-label">
            {remaining >= 0 ? 'Remaining' : 'Over by'}
          </p>
          <p
            className={`budget-card-figure-value ${
              remaining >= 0 ? 'is-income' : 'is-expense'
            }`}
          >
            {formatCurrency(Math.abs(remaining), currency)}
          </p>
        </div>
      </div>

      <div className="budget-card-footer">
        <span className="budget-card-usage">
          {Math.round(usage)}% of budget used
        </span>
        <div className="budget-card-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(budget)}
            aria-label={`Edit ${budget.category} budget`}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-ghost-danger"
            onClick={() => onDelete(budget.id)}
            aria-label={`Delete ${budget.category} budget`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
