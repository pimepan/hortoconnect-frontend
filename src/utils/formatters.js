export function formatDateLong(dateString) {
  if (!dateString) return 'N/A'
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return String(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return String(dateString)
  }
}

export function formatCurrencyUSD(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '$0.00'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

