import Decimal from 'decimal.js'

/**
 * Centralized money/calculation utilities. All quote and invoice totals
 * MUST go through these functions — never re-implement subtotal/discount/
 * tax/total math inline in a component. Uses Decimal.js to avoid float
 * rounding errors (e.g. 0.1 + 0.2 !== 0.3) on currency math.
 *
 * Line items are plain objects using snake_case fields (quantity,
 * unit_price, discount_percent, tax_percent) to match the DB row shape
 * used throughout the app.
 */

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

export function calculateQuoteTotals({ items, additionalDiscountPercent = 0 }) {
  let subtotal = new Decimal(0)
  let lineDiscountTotal = new Decimal(0)
  let taxTotal = new Decimal(0)

  for (const item of items) {
    const computed = calculateLineItem(item)
    subtotal = subtotal.plus(computed.lineSubtotal)
    lineDiscountTotal = lineDiscountTotal.plus(computed.lineDiscount)
    taxTotal = taxTotal.plus(computed.lineTax)
  }

  const afterLineDiscounts = subtotal.minus(lineDiscountTotal)
  const additionalDiscount = afterLineDiscounts
    .times(toDecimal(additionalDiscountPercent, 0))
    .dividedBy(100)

  const total = afterLineDiscounts.minus(additionalDiscount).plus(taxTotal)

  return {
    subtotal: subtotal.toFixed(2),
    lineDiscountTotal: lineDiscountTotal.toFixed(2),
    additionalDiscount: additionalDiscount.toFixed(2),
    taxTotal: taxTotal.toFixed(2),
    total: total.toFixed(2),
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
