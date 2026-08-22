import { describe, it, expect } from 'vitest'
import { calculateLineItem, calculateQuoteTotals, formatMoney } from './money'

describe('calculateLineItem', () => {
  it('computes a plain line with no discount or tax', () => {
    const result = calculateLineItem({ quantity: 2, unit_price: 100 })
    expect(result.lineSubtotal).toBe('200.00')
    expect(result.lineDiscount).toBe('0.00')
    expect(result.lineTax).toBe('0.00')
    expect(result.lineTotal).toBe('200.00')
  })

  it('applies a line-level discount before tax', () => {
    // 10 x 1000 = 10000, 10% discount = 1000 off -> taxable 9000, 5% tax = 450
    const result = calculateLineItem({ quantity: 10, unit_price: 1000, discount_percent: 10, tax_percent: 5 })
    expect(result.lineSubtotal).toBe('10000.00')
    expect(result.lineDiscount).toBe('1000.00')
    expect(result.lineTaxable).toBe('9000.00')
    expect(result.lineTax).toBe('450.00')
    expect(result.lineTotal).toBe('9450.00')
  })

  it('avoids classic floating-point rounding errors', () => {
    // 0.1 + 0.2 !== 0.3 in plain JS float math; this must not leak through.
    const result = calculateLineItem({ quantity: 3, unit_price: 0.1 })
    expect(result.lineTotal).toBe('0.30')
  })

  it('handles fractional quantities (e.g. hours)', () => {
    const result = calculateLineItem({ quantity: 2.5, unit_price: 40, tax_percent: 10 })
    expect(result.lineSubtotal).toBe('100.00')
    expect(result.lineTax).toBe('10.00')
    expect(result.lineTotal).toBe('110.00')
  })

  it('treats missing discount/tax as zero rather than throwing', () => {
    const result = calculateLineItem({ quantity: 1, unit_price: 50 })
    expect(result.lineTotal).toBe('50.00')
  })

  it('handles a zero unit price (e.g. a free line item)', () => {
    const result = calculateLineItem({ quantity: 5, unit_price: 0, tax_percent: 10 })
    expect(result.lineTotal).toBe('0.00')
  })
})

describe('calculateQuoteTotals', () => {
  it('sums multiple line items correctly', () => {
    const totals = calculateQuoteTotals({
      items: [
        { quantity: 1, unit_price: 150000, tax_percent: 5 }, // 150000 + 7500 tax
        { quantity: 6, unit_price: 10000, tax_percent: 5 }, // 60000 + 3000 tax
      ],
    })
    expect(totals.subtotal).toBe('210000.00')
    expect(totals.taxTotal).toBe('10500.00')
    expect(totals.total).toBe('220500.00')
  })

  it('applies an additional (quote-level) discount after line discounts', () => {
    // subtotal 1000, no line discount, 10% additional discount -> 900, no tax
    const totals = calculateQuoteTotals({
      items: [{ quantity: 1, unit_price: 1000 }],
      additionalDiscountPercent: 10,
    })
    expect(totals.subtotal).toBe('1000.00')
    expect(totals.additionalDiscount).toBe('100.00')
    expect(totals.total).toBe('900.00')
  })

  it('combines line-level and additional discounts without double-counting', () => {
    // 1000 @ 10% line discount -> 900 taxable-base; 10% additional discount
    // on that 900 -> 90 off -> 810 total (no tax)
    const totals = calculateQuoteTotals({
      items: [{ quantity: 1, unit_price: 1000, discount_percent: 10 }],
      additionalDiscountPercent: 10,
    })
    expect(totals.lineDiscountTotal).toBe('100.00')
    expect(totals.additionalDiscount).toBe('90.00')
    expect(totals.total).toBe('810.00')
  })

  it('returns all zeros for an empty item list', () => {
    const totals = calculateQuoteTotals({ items: [] })
    expect(totals.subtotal).toBe('0.00')
    expect(totals.total).toBe('0.00')
  })
})

describe('formatMoney', () => {
  it('formats PKR with two decimal places and thousands separators', () => {
    expect(formatMoney(157500, 'PKR')).toMatch(/157,500\.00/)
  })

  it('formats a string amount the same as a numeric amount', () => {
    expect(formatMoney('1234.5', 'PKR')).toBe(formatMoney(1234.5, 'PKR'))
  })

  it('formats zero correctly', () => {
    expect(formatMoney(0, 'PKR')).toMatch(/0\.00/)
  })
})
