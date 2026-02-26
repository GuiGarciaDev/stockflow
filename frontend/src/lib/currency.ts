export function currencyDigitsOnly(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  return digits.replace(/^0+(?=\d)/, "")
}

export function formatCurrencyFromDigits(digits: string) {
  if (!digits) return ""
  const cents = Number(digits)
  if (!Number.isFinite(cents)) return ""
  return (cents / 100).toFixed(2)
}

export function parseCurrencyFromDigits(digits: string) {
  if (!digits) return Number.NaN
  const cents = Number(digits)
  if (!Number.isFinite(cents)) return Number.NaN
  return cents / 100
}

export function digitsFromNumber(value: number) {
  if (!Number.isFinite(value)) return ""
  return String(Math.round(value * 100))
}
