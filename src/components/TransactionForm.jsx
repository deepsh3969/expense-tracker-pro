import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { categoriesForType } from '../utils/categories'
import { currencyMeta } from '../utils/currency'
import { validateTransaction } from '../utils/validation'
import { todayISO } from '../utils/dateHelpers'

export default function TransactionForm({ initialData = null, submitLabel }) {
  const { addTransaction, updateTransaction, showToast, settings } = useApp()
  const navigate = useNavigate()
  const formId = useId()

  const [type, setType] = useState(initialData?.type || 'expense')
  const [title, setTitle] = useState(initialData?.title || '')
  const [amount, setAmount] = useState(
    initialData ? String(initialData.amount) : '',
  )
  const [category, setCategory] = useState(
    initialData?.category || categoriesForType(initialData?.type || 'expense')[0],
  )
  const [date, setDate] = useState(initialData?.date || todayISO())
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleTypeChange(nextType) {
    setType(nextType)
    setCategory(categoriesForType(nextType)[0])
    setErrors((prev) => ({ ...prev, type: undefined, category: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    const result = validateTransaction({ title, amount, type, category, date, notes })
    if (!result.valid) {
      setErrors(result.errors)
      const firstKey = Object.keys(result.errors)[0]
      const field = event.target.elements.namedItem(firstKey)
      if (field && typeof field.focus === 'function') field.focus()
      showToast('Please fix the highlighted fields.', 'error')
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      if (initialData && initialData.id) {
        updateTransaction(initialData.id, result.data)
        navigate('/transactions')
      } else {
        addTransaction(result.data)
        navigate('/transactions')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    navigate(-1)
  }

  return (
    <form className="tx-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="tx-form-type">
        <legend className="form-label">Transaction type</legend>
        <div className="segmented" role="radiogroup" aria-label="Transaction type">
          <button
            type="button"
            role="radio"
            aria-checked={type === 'expense'}
            className={`segmented-btn${type === 'expense' ? ' is-active is-expense' : ''}`}
            onClick={() => handleTypeChange('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={type === 'income'}
            className={`segmented-btn${type === 'income' ? ' is-active is-income' : ''}`}
            onClick={() => handleTypeChange('income')}
          >
            Income
          </button>
        </div>
        {errors.type ? (
          <p className="form-error" role="alert">
            {errors.type}
          </p>
        ) : null}
      </fieldset>

      <div className="form-grid">
        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor={`${formId}-title`}>
            Title <span className="form-required">*</span>
          </label>
          <input
            id={`${formId}-title`}
            name="title"
            type="text"
            className={`form-input${errors.title ? ' is-invalid' : ''}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cafeteria lunch"
            maxLength={80}
            autoComplete="off"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${formId}-title-error` : undefined}
          />
          {errors.title ? (
            <p id={`${formId}-title-error`} className="form-error" role="alert">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor={`${formId}-amount`}>
            Amount <span className="form-required">*</span>
          </label>
          <div className="form-input-affix">
            <span aria-hidden="true">{currencyMeta(settings.currency).symbol}</span>
            <input
              id={`${formId}-amount`}
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              className={`form-input${errors.amount ? ' is-invalid' : ''}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? `${formId}-amount-error` : undefined}
            />
          </div>
          {errors.amount ? (
            <p id={`${formId}-amount-error`} className="form-error" role="alert">
              {errors.amount}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor={`${formId}-date`}>
            Date <span className="form-required">*</span>
          </label>
          <input
            id={`${formId}-date`}
            name="date"
            type="date"
            className={`form-input${errors.date ? ' is-invalid' : ''}`}
            value={date}
            max={todayISO()}
            min="2000-01-01"
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? `${formId}-date-error` : undefined}
          />
          {errors.date ? (
            <p id={`${formId}-date-error`} className="form-error" role="alert">
              {errors.date}
            </p>
          ) : null}
        </div>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor={`${formId}-category`}>
            Category <span className="form-required">*</span>
          </label>
          <select
            id={`${formId}-category`}
            name="category"
            className={`form-input${errors.category ? ' is-invalid' : ''}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-invalid={Boolean(errors.category)}
          >
            {categoriesForType(type).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category ? (
            <p className="form-error" role="alert">
              {errors.category}
            </p>
          ) : null}
        </div>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor={`${formId}-notes`}>
            Notes <span className="form-muted">(optional)</span>
          </label>
          <textarea
            id={`${formId}-notes`}
            name="notes"
            className={`form-input form-textarea${errors.notes ? ' is-invalid' : ''}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a short note…"
            rows={3}
            maxLength={300}
            aria-invalid={Boolean(errors.notes)}
          />
          <div className="form-field-footer">
            {errors.notes ? (
              <p className="form-error" role="alert">
                {errors.notes}
              </p>
            ) : (
              <span />
            )}
            <span className="form-counter">{notes.length}/300</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel || (initialData ? 'Update Transaction' : 'Save Transaction')}
        </button>
      </div>
    </form>
  )
}
