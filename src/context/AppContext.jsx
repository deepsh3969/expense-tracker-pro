import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useLocalStorage, readStorage } from '../hooks/useLocalStorage'
import {
  createSampleBudgets,
  createSampleTransactions,
  generateId,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
} from '../utils/sampleData'
import { todayISO } from '../utils/dateHelpers'

const STORAGE_KEYS = {
  transactions: 'expenseTrackerPro.transactions',
  budgets: 'expenseTrackerPro.budgets',
  profile: 'expenseTrackerPro.profile',
  settings: 'expenseTrackerPro.settings',
  seeded: 'expenseTrackerPro.seeded',
}

function sanitizeProfile(value) {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PROFILE }
  const name =
    typeof value.name === 'string' && value.name.trim()
      ? value.name.trim().slice(0, 40)
      : DEFAULT_PROFILE.name
  return { name }
}

function sanitizeSettings(value) {
  if (!value || typeof value !== 'object') return { ...DEFAULT_SETTINGS }
  const currency = ['INR', 'USD', 'EUR'].includes(value.currency)
    ? value.currency
    : DEFAULT_SETTINGS.currency
  const theme = ['light', 'dark'].includes(value.theme)
    ? value.theme
    : DEFAULT_SETTINGS.theme
  return { currency, theme }
}

function isValidTransaction(t) {
  return (
    t &&
    typeof t === 'object' &&
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    Number.isFinite(Number(t.amount)) &&
    (t.type === 'income' || t.type === 'expense') &&
    typeof t.category === 'string' &&
    typeof t.date === 'string'
  )
}

function isValidBudget(b) {
  return (
    b &&
    typeof b === 'object' &&
    typeof b.id === 'string' &&
    typeof b.month === 'string' &&
    typeof b.category === 'string' &&
    Number.isFinite(Number(b.limit))
  )
}

const AppContext = createContext(null)

function getInitialData() {
  const seeded = readStorage(STORAGE_KEYS.seeded, false)
  const hasSeeded = seeded.exists && seeded.value === true
  const txRead = readStorage(STORAGE_KEYS.transactions, null)
  const budgetRead = readStorage(STORAGE_KEYS.budgets, null)

  if (!hasSeeded && !txRead.exists) {
    const transactions = createSampleTransactions()
    const budgets = createSampleBudgets()
    try {
      window.localStorage.setItem(STORAGE_KEYS.seeded, JSON.stringify(true))
      window.localStorage.setItem(
        STORAGE_KEYS.transactions,
        JSON.stringify(transactions),
      )
      window.localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets))
    } catch {
      /* storage may be unavailable; state still works in memory */
    }
    return { transactions, budgets, didSeed: true }
  }
  return {
    transactions: Array.isArray(txRead.value) ? txRead.value : [],
    budgets: Array.isArray(budgetRead.value) ? budgetRead.value : [],
    didSeed: false,
  }
}

export function AppProvider({ children }) {
  const initial = useMemo(getInitialData, [])
  const [transactions, setTransactions] = useLocalStorage(
    STORAGE_KEYS.transactions,
    initial.transactions,
  )
  const [budgets, setBudgets] = useLocalStorage(
    STORAGE_KEYS.budgets,
    initial.budgets,
  )
  const [profile, setProfile] = useLocalStorage(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE,
  )
  const [settings, setSettings] = useLocalStorage(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  )
  const [isSeeded, setIsSeeded] = useLocalStorage(STORAGE_KEYS.seeded, true)

  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const safeTransactions = useMemo(
    () => (Array.isArray(transactions) ? transactions.filter(isValidTransaction) : []),
    [transactions],
  )
  const safeBudgets = useMemo(
    () => (Array.isArray(budgets) ? budgets.filter(isValidBudget) : []),
    [budgets],
  )
  const safeProfile = useMemo(() => sanitizeProfile(profile), [profile])
  const safeSettings = useMemo(() => sanitizeSettings(settings), [settings])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', safeSettings.theme)
    document.documentElement.style.colorScheme = safeSettings.theme
  }, [safeSettings.theme])

  useEffect(() => {
    if (!isSeeded) setIsSeeded(true)
  }, [isSeeded, setIsSeeded])

  const showToast = useCallback((message, tone = 'success') => {
    const id = generateId()
    setToasts((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const requestConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        danger: options.danger !== false,
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback((answer) => {
    setConfirmState((state) => {
      if (state && typeof state.resolve === 'function') state.resolve(answer)
      return null
    })
  }, [])

  const addTransaction = useCallback(
    (data) => {
      const now = Date.now()
      const transaction = {
        id: generateId(),
        title: data.title.trim(),
        amount: Number(data.amount),
        type: data.type,
        category: data.category,
        date: data.date,
        notes: (data.notes || '').trim(),
        createdAt: now,
        updatedAt: now,
      }
      setTransactions((prev) => [transaction, ...(Array.isArray(prev) ? prev : [])])
      showToast(`"${transaction.title}" added.`)
      return transaction
    },
    [setTransactions, showToast],
  )

  const updateTransaction = useCallback(
    (id, data) => {
      setTransactions((prev) =>
        (Array.isArray(prev) ? prev : []).map((t) =>
          t.id === id
            ? {
                ...t,
                title: data.title.trim(),
                amount: Number(data.amount),
                type: data.type,
                category: data.category,
                date: data.date,
                notes: (data.notes || '').trim(),
                updatedAt: Date.now(),
              }
            : t,
        ),
      )
      showToast(`"${data.title.trim()}" updated.`)
    },
    [setTransactions, showToast],
  )

  const deleteTransaction = useCallback(
    async (id) => {
      const target = safeTransactions.find((t) => t.id === id)
      const label = target ? `"${target.title}"` : 'This transaction'
      const ok = await requestConfirm({
        title: 'Delete transaction?',
        message: `${label} will be permanently removed from your records.`,
        confirmLabel: 'Delete',
      })
      if (!ok) return false
      setTransactions((prev) =>
        (Array.isArray(prev) ? prev : []).filter((t) => t.id !== id),
      )
      showToast('Transaction deleted.', 'info')
      return true
    },
    [safeTransactions, requestConfirm, setTransactions, showToast],
  )

  const saveBudget = useCallback(
    (data) => {
      const month = data.month
      const category = data.category
      const limit = Number(data.limit)
      const existing = (Array.isArray(budgets) ? budgets : []).find(
        (b) => b.month === month && b.category === category,
      )
      if (existing) {
        setBudgets((prev) =>
          (Array.isArray(prev) ? prev : []).map((b) =>
            b.id === existing.id ? { ...b, limit } : b,
          ),
        )
        showToast(`${category} budget updated.`)
        return existing.id
      }
      const budget = { id: generateId(), month, category, limit }
      setBudgets((prev) => [...(Array.isArray(prev) ? prev : []), budget])
      showToast(`${category} budget saved.`)
      return budget.id
    },
    [budgets, setBudgets, showToast],
  )

  const deleteBudget = useCallback(
    async (id) => {
      const target = (Array.isArray(budgets) ? budgets : []).find((b) => b.id === id)
      const label = target ? `the ${target.category} budget for ${target.month}` : 'this budget'
      const ok = await requestConfirm({
        title: 'Remove budget?',
        message: `You are about to remove ${label}.`,
        confirmLabel: 'Remove',
      })
      if (!ok) return false
      setBudgets((prev) => (Array.isArray(prev) ? prev : []).filter((b) => b.id !== id))
      showToast('Budget removed.', 'info')
      return true
    },
    [budgets, requestConfirm, setBudgets, showToast],
  )

  const clearAllData = useCallback(async () => {
    const ok = await requestConfirm({
      title: 'Clear all application data?',
      message:
        'All transactions, budgets, and preferences stored in this browser will be permanently deleted. This cannot be undone.',
      confirmLabel: 'Clear everything',
    })
    if (!ok) return false
    setTransactions([])
    setBudgets([])
    setProfile({ ...DEFAULT_PROFILE })
    setSettings({ ...DEFAULT_SETTINGS })
    showToast('All application data has been cleared.', 'info')
    return true
  }, [requestConfirm, setTransactions, setBudgets, setProfile, setSettings, showToast])

  const restoreSampleData = useCallback(async () => {
    const ok = await requestConfirm({
      title: 'Restore sample data?',
      message:
        'Your current transactions and budgets will be replaced with fresh demonstration data.',
      confirmLabel: 'Restore sample data',
    })
    if (!ok) return false
    setTransactions(createSampleTransactions())
    setBudgets(createSampleBudgets())
    setIsSeeded(true)
    showToast('Sample demonstration data restored.')
    return true
  }, [requestConfirm, setTransactions, setBudgets, setIsSeeded, showToast])

  const updateProfile = useCallback(
    (name) => {
      const clean = (name || '').trim().slice(0, 40) || DEFAULT_PROFILE.name
      setProfile({ name: clean })
      showToast('Profile updated.')
    },
    [setProfile, showToast],
  )

  const setCurrency = useCallback(
    (currency) => {
      setSettings((prev) => ({ ...sanitizeSettings(prev), currency }))
      showToast(`Currency changed to ${currency}.`)
    },
    [setSettings, showToast],
  )

  const setTheme = useCallback(
    (theme) => {
      setSettings((prev) => ({ ...sanitizeSettings(prev), theme }))
    },
    [setSettings],
  )

  const value = useMemo(
    () => ({
      transactions: safeTransactions,
      budgets: safeBudgets,
      profile: safeProfile,
      settings: safeSettings,
      today: todayISO(),
      addTransaction,
      updateTransaction,
      deleteTransaction,
      saveBudget,
      deleteBudget,
      clearAllData,
      restoreSampleData,
      updateProfile,
      setCurrency,
      setTheme,
      toasts,
      showToast,
      dismissToast,
      confirmState,
      requestConfirm,
      handleConfirm,
    }),
    [
      safeTransactions,
      safeBudgets,
      safeProfile,
      safeSettings,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      saveBudget,
      deleteBudget,
      clearAllData,
      restoreSampleData,
      updateProfile,
      setCurrency,
      setTheme,
      toasts,
      showToast,
      dismissToast,
      confirmState,
      requestConfirm,
      handleConfirm,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
