const CURRENCY_META = {
  INR: { locale: 'en-IN', symbol: '₹', name: 'Indian Rupee' },
  USD: { locale: 'en-US', symbol: '$', name: 'US Dollar' },
  EUR: { locale: 'en-IE', symbol: '€', name: 'Euro' },
}

export const CURRENCIES = Object.keys(CURRENCY_META)

export function currencyMeta(code) {
  return CURRENCY_META[code] || CURRENCY_META.INR
}

export function formatCurrency(amount, currency = 'INR', options = {}) {
  const { signed = false, maximumFractionDigits } = options
  const value = Number(amount)
  if (!Number.isFinite(value)) return '—'
  const meta = currencyMeta(currency)
  const abs = Math.abs(value)
  const digits =
    typeof maximumFractionDigits === 'number'
      ? maximumFractionDigits
      : abs >= 1000
        ? 0
        : 2
  let text
  try {
    text = new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }).format(abs)
  } catch {
    text = `${meta.symbol}${abs.toFixed(digits)}`
  }
  if (!signed) return value < 0 ? `-${text}` : text
  if (value > 0) return `+${text}`
  if (value < 0) return `-${text}`
  return text
}

export function formatPercent(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${Math.round(n * 10) / 10}%`
}
