import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requestSchema, suggestionSchema } from '../netlify/functions/ai-quote-assistant.js'

test('requestSchema rejects a description that is too short', () => {
  const result = requestSchema.safeParse({ prompt: 'too short' })
  assert.equal(result.success, false)
})

test('requestSchema accepts a reasonable prompt', () => {
  const result = requestSchema.safeParse({ prompt: 'Client needs a restaurant website with online ordering.' })
  assert.equal(result.success, true)
})

test('requestSchema rejects a wildly oversized prompt (abuse/cost guard)', () => {
  const result = requestSchema.safeParse({ prompt: 'x'.repeat(5000) })
  assert.equal(result.success, false)
})

test('suggestionSchema rejects an AI response with zero items', () => {
  const result = suggestionSchema.safeParse({ items: [] })
  assert.equal(result.success, false)
})

test('suggestionSchema rejects an item missing required fields', () => {
  const result = suggestionSchema.safeParse({ items: [{ name: 'Website' }] })
  assert.equal(result.success, false)
})

test('suggestionSchema rejects a negative unit_price (a plausible AI hallucination)', () => {
  const result = suggestionSchema.safeParse({
    items: [{ name: 'Hosting', quantity: 1, unit: 'unit', unit_price: -500, tax_percent: 0 }],
  })
  assert.equal(result.success, false)
})

test('suggestionSchema defaults tax_percent and description when the model omits them', () => {
  const result = suggestionSchema.safeParse({
    items: [{ name: 'Website Development', quantity: 1, unit: 'project', unit_price: 150000 }],
  })
  assert.equal(result.success, true)
  assert.equal(result.data.items[0].tax_percent, 0)
  assert.equal(result.data.items[0].description, null)
})

test('suggestionSchema rejects more than 20 items (runaway-response guard)', () => {
  const items = Array.from({ length: 21 }, (_, i) => ({
    name: `Item ${i}`,
    quantity: 1,
    unit: 'unit',
    unit_price: 10,
  }))
  const result = suggestionSchema.safeParse({ items })
  assert.equal(result.success, false)
})

test('suggestionSchema accepts a well-formed multi-item AI response', () => {
  const result = suggestionSchema.safeParse({
    items: [
      { name: 'Website Development', description: 'Full build', quantity: 1, unit: 'project', unit_price: 180000, tax_percent: 5 },
      { name: 'Hosting — 1 Year', quantity: 1, unit: 'year', unit_price: 20000, tax_percent: 5 },
    ],
  })
  assert.equal(result.success, true)
  assert.equal(result.data.items.length, 2)
})
