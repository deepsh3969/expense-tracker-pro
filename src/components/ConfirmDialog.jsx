import { useEffect, useRef } from 'react'

export default function ConfirmDialog({ state, onAnswer }) {
  const cancelRef = useRef(null)
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!state) return undefined
    const previouslyFocused = document.activeElement
    cancelRef.current?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onAnswer(false)
      }
      if (event.key === 'Tab') {
        const node = event.shiftKey ? cancelRef.current : confirmRef.current
        const other = event.shiftKey ? confirmRef.current : cancelRef.current
        if (event.shiftKey && document.activeElement === cancelRef.current) {
          event.preventDefault()
          confirmRef.current?.focus()
        } else if (!event.shiftKey && document.activeElement === confirmRef.current) {
          event.preventDefault()
          cancelRef.current?.focus()
        }
        node?.focus()
        other?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [state, onAnswer])

  if (!state) return null

  return (
    <div className="dialog-overlay" onClick={() => onAnswer(false)}>
      <div
        className={`dialog${state.danger ? ' dialog--danger' : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="dialog-title">
          {state.title}
        </h2>
        <p id="confirm-dialog-message" className="dialog-message">
          {state.message}
        </p>
        <div className="dialog-actions">
          <button
            type="button"
            ref={cancelRef}
            className="btn btn-ghost"
            onClick={() => onAnswer(false)}
          >
            {state.cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={`btn ${state.danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => onAnswer(true)}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
