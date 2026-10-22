import TransactionItem from './TransactionItem'
import EmptyState from './EmptyState'

export default function TransactionList({
  transactions,
  compact = false,
  emptyTitle = 'No transactions yet',
  emptyMessage = 'Add your first income or expense to get started.',
  emptyAction = null,
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        compact={compact}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    )
  }
  return (
    <ul className={`tx-list${compact ? ' tx-list--compact' : ''}`}>
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} compact={compact} />
      ))}
    </ul>
  )
}
