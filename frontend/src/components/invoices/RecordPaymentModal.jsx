import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, FieldError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const TODAY = () => new Date().toISOString().slice(0, 10)

export function RecordPaymentModal({ open, onClose, onSubmit, maxAmount, submitting }) {
  const [amount, setAmount] = useState('')
  const [paidAt, setPaidAt] = useState(TODAY())
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  function reset() {
    setAmount('')
    setPaidAt(TODAY())
    setMethod('')
    setReference('')
    setNotes('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    if (maxAmount != null && numericAmount > maxAmount + 0.005) {
      setError(`Amount exceeds the remaining balance (${maxAmount.toFixed(2)}).`)
      return
    }
    try {
      await onSubmit({ amount: numericAmount, paidAt, method, reference, notes })
      reset()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Record payment">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-amount" className="mb-1 block text-sm font-medium text-neutral-700">
              Amount *
            </label>
            <Input id="p-amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label htmlFor="p-date" className="mb-1 block text-sm font-medium text-neutral-700">
              Date *
            </label>
            <Input id="p-date" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required />
          </div>
        </div>
        <div>
          <label htmlFor="p-method" className="mb-1 block text-sm font-medium text-neutral-700">
            Method
          </label>
          <Input id="p-method" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="e.g. Bank transfer, Cash, Card" />
        </div>
        <div>
          <label htmlFor="p-reference" className="mb-1 block text-sm font-medium text-neutral-700">
            Reference
          </label>
          <Input id="p-reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction ID, cheque number, etc." />
        </div>
        <div>
          <label htmlFor="p-notes" className="mb-1 block text-sm font-medium text-neutral-700">
            Notes
          </label>
          <textarea
            id="p-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
        </div>
        <FieldError message={error} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => { reset(); onClose() }}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Recording…' : 'Record payment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
