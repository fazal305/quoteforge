import Decimal from 'decimal.js'

// Mirrors frontend/src/lib/money.js's calculateLineItem/formatMoney.
// Duplicated rather than shared across the frontend/backend package
// boundary — kept in sync manually since it's a handful of lines.

const toDecimal = (value, fallback = 0) => new Decimal(value ?? fallback)

export function calculateLineItem(item) {
  const quantity = toDecimal(item.quantity)
  const unitPrice = toDecimal(item.unit_price)
  const discountPercent = toDecimal(item.discount_percent, 0)
  const taxPercent = toDecimal(item.tax_percent, 0)

  const lineSubtotal = quantity.times(unitPrice)
  const lineDiscount = lineSubtotal.times(discountPercent).dividedBy(100)
  const lineTaxable = lineSubtotal.minus(lineDiscount)
  const lineTax = lineTaxable.times(taxPercent).dividedBy(100)
  const lineTotal = lineTaxable.plus(lineTax)

  return {
    lineSubtotal: lineSubtotal.toFixed(2),
    lineDiscount: lineDiscount.toFixed(2),
    lineTaxable: lineTaxable.toFixed(2),
    lineTax: lineTax.toFixed(2),
    lineTotal: lineTotal.toFixed(2),
  }
}

const CURRENCY_FORMATTERS = {}

export function formatMoney(amount, currency = 'PKR', locale = 'en-PK') {
  const key = `${locale}:${currency}`
  if (!CURRENCY_FORMATTERS[key]) {
    CURRENCY_FORMATTERS[key] = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
    })
  }
  return CURRENCY_FORMATTERS[key].format(new Decimal(amount).toNumber())
}
