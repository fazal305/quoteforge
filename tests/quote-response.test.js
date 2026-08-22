import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bodySchema } from '../netlify/functions/quote-response.js'

test('bodySchema requires a non-empty token', () => {
  const result = bodySchema.safeParse({ token: '', action: 'APPROVE', customerName: 'Ahmed' })
  assert.equal(result.success, false)
})

test('bodySchema only accepts the three defined actions', () => {
  const result = bodySchema.safeParse({ token: 'abc', action: 'DELETE_EVERYTHING', customerName: 'Ahmed' })
  assert.equal(result.success, false)
})

test('bodySchema requires a customer name (accountability for the approval record)', () => {
  const result = bodySchema.safeParse({ token: 'abc', action: 'APPROVE', customerName: '' })
  assert.equal(result.success, false)
})

test('bodySchema allows message to be omitted for APPROVE/REJECT', () => {
  const result = bodySchema.safeParse({ token: 'abc', action: 'APPROVE', customerName: 'Ahmed' })
  assert.equal(result.success, true)
})

test('bodySchema accepts a well-formed CHANGE_REQUEST with a message', () => {
  const result = bodySchema.safeParse({
    token: 'abc',
    action: 'CHANGE_REQUEST',
    customerName: 'Ahmed',
    message: 'Please remove hosting and extend maintenance to 12 months.',
  })
  assert.equal(result.success, true)
})

test('bodySchema rejects an oversized message (abuse guard)', () => {
  const result = bodySchema.safeParse({
    token: 'abc',
    action: 'CHANGE_REQUEST',
    customerName: 'Ahmed',
    message: 'x'.repeat(5000),
  })
  assert.equal(result.success, false)
})
