import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import TransactionForm from '../components/TransactionForm'
import EmptyState from '../components/EmptyState'

export default function AddTransaction() {
  const [searchParams] = useSearchParams()
  const { transactions } = useApp()

  const editId = searchParams.get('edit')
  const initialType = searchParams.get('type')
  const transaction = editId
    ? transactions.find((t) => t.id === editId)
    : null

  if (editId && !transaction) {
    return (
      <div className="page page-add-transaction">
        <EmptyState
          title="Transaction not found"
          message="This transaction may have been deleted."
          action={
            <Link to="/transactions" className="btn btn-primary">
              Back to transactions
            </Link>
          }
        />
      </div>
    )
  }

  const initialData = transaction
    ? { ...transaction }
    : initialType === 'income' || initialType === 'expense'
      ? { type: initialType }
      : null

  return (
    <div className="page page-add-transaction">
      <div className="page-head">
        <div>
          <h2 className="page-title">
            {transaction ? 'Edit transaction' : 'Add a transaction'}
          </h2>
          <p className="page-sub">
            {transaction
              ? 'Update the details below — every calculation refreshes automatically.'
              : 'Record income or an expense. Fields marked with * are required.'}
          </p>
        </div>
        <Link to="/transactions" className="btn btn-ghost">
          View all
        </Link>
      </div>

      <section className="panel form-panel">
        <TransactionForm
          key={transaction ? transaction.id : `new-${initialType || 'default'}`}
          initialData={initialData}
          submitLabel={transaction ? 'Update Transaction' : 'Save Transaction'}
        />
      </section>
    </div>
  )
}
