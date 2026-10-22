import { useState, useEffect, useCallback } from 'react'

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return { exists: false, value: fallback }
    const parsed = JSON.parse(raw)
    if (parsed === null || parsed === undefined) return { exists: true, value: fallback }
    return { exists: true, value: parsed }
  } catch (err) {
    console.warn(`ExpenseTrackerPro: could not read localStorage key "${key}"`, err)
    return { exists: false, value: fallback, corrupted: true }
  }
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const { value } = readStorage(key, initialValue)
    return value
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (err) {
      console.warn(`ExpenseTrackerPro: could not write localStorage key "${key}"`, err)
    }
  }, [key, storedValue])

  const setValue = useCallback((value) => {
    setStoredValue((prev) => (typeof value === 'function' ? value(prev) : value))
  }, [])

  const resetValue = useCallback(() => {
    setStoredValue(initialValue)
  }, [initialValue])

  return [storedValue, setValue, resetValue]
}
