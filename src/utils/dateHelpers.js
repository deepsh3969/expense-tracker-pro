export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO() {
  return toISODate(new Date())
}

export function monthKey(dateOrISO) {
  const iso = typeof dateOrISO === 'string' ? dateOrISO : toISODate(dateOrISO)
  return iso.slice(0, 7)
}

export function currentMonthKey() {
  return monthKey(new Date())
}

export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const date = new Date(y, m - 1, d)
  return (
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
  )
}

export function isValidMonthKey(value) {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
}

export function daysInMonth(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function monthLabel(key, options = {}) {
  const { short = false, withYear = true } = options
  const [y, m] = key.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString('en-US', {
    month: short ? 'short' : 'long',
    year: withYear ? 'numeric' : undefined,
  })
}

export function formatDateLong(iso) {
  if (!isValidISODate(iso)) return iso
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(iso) {
  if (!isValidISODate(iso)) return iso
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function listRecentMonthKeys(count, fromKey = currentMonthKey()) {
  const [y, m] = fromKey.split('-').map(Number)
  const result = []
  let cy = y
  let cm = m
  for (let i = 0; i < count; i += 1) {
    result.unshift(`${cy}-${String(cm).padStart(2, '0')}`)
    cm -= 1
    if (cm === 0) {
      cm = 12
      cy -= 1
    }
  }
  return result
}

export function previousMonthKey(key) {
  return listRecentMonthKeys(2, key)[0]
}

export function clampDateToRange(iso, minISO, maxISO) {
  if (minISO && iso < minISO) return minISO
  if (maxISO && iso > maxISO) return maxISO
  return iso
}

export function relativeDayLabel(iso) {
  const today = todayISO()
  if (iso === today) return 'Today'
  const [y, m, d] = iso.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const diff = Math.round(
    (new Date(ty, tm - 1, td) - new Date(y, m - 1, d)) / 86400000,
  )
  if (diff === 1) return 'Yesterday'
  if (diff === -1) return 'Tomorrow'
  return null
}
