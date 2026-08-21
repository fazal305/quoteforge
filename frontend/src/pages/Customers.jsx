import { useState } from 'react'
import { PageHeader, EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CustomerFormModal } from '@/components/customers/CustomerFormModal'
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/api/customers'
import { useProfile } from '@/api/organization'

export function Customers() {
  const [search, setSearch] = useState('')
  const { data: profile } = useProfile()
  const { data: customers, isLoading, error } = useCustomers(search)
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const deleteCustomer = useDeleteCustomer()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(customer) {
    setEditing(customer)
    setModalOpen(true)
  }

  async function handleSubmit(values) {
    const cleaned = {
      name: values.name,
      company: values.company || null,
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
      notes: values.notes || null,
    }
    if (editing) {
      await updateCustomer.mutateAsync({ id: editing.id, updates: cleaned })
    } else if (profile) {
      await createCustomer.mutateAsync({ ...cleaned, organization_id: profile.organization.id })
    }
    setModalOpen(false)
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteCustomer.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Businesses and contacts you send quotes to."
        action={<Button size="sm" onClick={openCreate}>New customer</Button>}
      />

      <div className="p-6">
        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search customers"
          />
        </div>

        {isLoading && <div className="p-6 text-sm text-neutral-500">Loading customers…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load customers: {error.message}
          </div>
        )}

        {!isLoading && !error && customers?.length === 0 && (
          <EmptyState
            title={search ? 'No matching customers' : 'No customers yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'Add your first customer to start creating quotes for them.'
            }
            action={!search && <Button size="sm" onClick={openCreate}>New customer</Button>}
          />
        )}

        {!isLoading && customers && customers.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Company</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Phone</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-medium text-neutral-900">{c.name}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{c.company || '—'}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{c.email || '—'}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{c.phone || '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => openEdit(c)}
                        className="mr-3 text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => setDeleting(c)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        submitting={createCustomer.isPending || updateCustomer.isPending}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete customer"
        description={`Delete ${deleting?.name}? This cannot be undone. Quotes already linked to this customer are kept for record-keeping.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
        loading={deleteCustomer.isPending}
      />
    </div>
  )
}
