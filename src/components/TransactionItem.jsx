import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency } from '../utils/currency'
import { categoryColor } from '../utils/categories'
import { formatDateShort, relativeDayLabel } from '../utils/dateHelpers'

export default function TransactionItem({ transaction, compact = false }) {
  const { settings, deleteTransaction } = useApp()
  const navigate = useNavigate()
  const isIncome = transaction.type === 'income'
  const rel = relativeDayLabel(transaction.date)

  function handleEdit() {
    navigate(`/add-transaction?edit=${transaction.id}`)
  }

  async function handleDelete() {
    await deleteTransaction(transaction.id)
  }

  return (
    <li className={`tx-item${compact ? ' tx-item--compact' : ''}`}>
      <span
        className="tx-item-dot"
        style={{ background: categoryColor(transaction.category) }}
        aria-hidden="true"
      />
      <div className="tx-item-main">
        <p className="tx-item-title" title={transaction.title}>
          {transaction.title}
        </p>
        <p className="tx-item-meta">
          <span>{transaction.category}</span>
          <span aria-hidden="true">·</span>
          <span>{rel || formatDateShort(transaction.date)}</span>
          {transaction.notes ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="tx-item-notes" title={transaction.notes}>
                {transaction.notes}
              </span>
            </>
          ) : null}
        </p>
      </div>
      <p className={`tx-item-amount ${isIncome ? 'is-income' : 'is-expense'}`}>
        {formatCurrency(isIncome ? transaction.amount : -transaction.amount, settings.currency, {
          signed: true,
        })}
      </p>
      {!compact ? (
        <div className="tx-item-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleEdit}
            aria-label={`Edit ${transaction.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-ghost-danger"
            onClick={handleDelete}
            aria-label={`Delete ${transaction.title}`}
          >
            Delete
          </button>
        </div>
      ) : null}
    </li>
  )
}
