import { useState } from 'react'
import { useCustomers, useCreateCustomer } from '@/api/customers'
import { CustomerFormModal } from '@/components/customers/CustomerFormModal'
import type { CustomerFormValues } from '@/lib/schemas'

interface Props {
  organizationId: string
  value: string | null
  onChange: (customerId: string) => void
}

export function CustomerSelect({ organizationId, value, onChange }: Props) {
  const { data: customers } = useCustomers()
  const createCustomer = useCreateCustomer()
  const [modalOpen, setModalOpen] = useState(false)

  async function handleCreate(values: CustomerFormValues) {
    const created = await createCustomer.mutateAsync({
      name: values.name,
      company: values.company || null,
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
      notes: values.notes || null,
      organization_id: organizationId,
    })
    onChange(created.id)
    setModalOpen(false)
  }

  return (
    <div className="flex gap-2">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Customer"
        className="h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <option value="" disabled>
          Select a customer…
        </option>
        {customers?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.company ? ` — ${c.company}` : ''}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="whitespace-nowrap rounded-md border border-neutral-300 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
      >
        + New
      </button>

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitting={createCustomer.isPending}
      />
    </div>
  )
}
