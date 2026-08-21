import { useState } from 'react'
import { PageHeader, EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CatalogItemFormModal } from '@/components/catalog/CatalogItemFormModal'
import { useCatalogItems, useCreateCatalogItem, useUpdateCatalogItem, useDeleteCatalogItem } from '@/api/catalog'
import { useProfile } from '@/api/organization'
import { formatMoney } from '@/lib/money'
import type { CatalogItemRow } from '@/types/database'
import type { CatalogItemFormValues } from '@/lib/schemas'

export function Catalog() {
  const [search, setSearch] = useState('')
  const { data: profile } = useProfile()
  const { data: items, isLoading, error } = useCatalogItems(search)
  const createItem = useCreateCatalogItem()
  const updateItem = useUpdateCatalogItem()
  const deleteItem = useDeleteCatalogItem()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogItemRow | null>(null)
  const [deleting, setDeleting] = useState<CatalogItemRow | null>(null)

  const currency = profile?.organization.currency ?? 'PKR'

  async function handleSubmit(values: CatalogItemFormValues) {
    const cleaned = {
      type: values.type,
      name: values.name,
      sku: values.sku || null,
      description: values.description || null,
      unit: values.unit,
      default_price: values.default_price,
      tax_rate: values.tax_rate,
      active: values.active,
    }
    if (editing) {
      await updateItem.mutateAsync({ id: editing.id, updates: cleaned })
    } else if (profile) {
      await createItem.mutateAsync({ ...cleaned, organization_id: profile.organization.id })
    }
    setModalOpen(false)
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteItem.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div>
      <PageHeader
        title="Product & Service Catalog"
        description="Reusable line items for faster quote building."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            New item
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-4 max-w-sm">
          <Input placeholder="Search catalog…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search catalog" />
        </div>

        {isLoading && <div className="p-6 text-sm text-neutral-500">Loading catalog…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load catalog: {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && items?.length === 0 && (
          <EmptyState
            title={search ? 'No matching items' : 'No catalog items yet'}
            description={
              search ? 'Try a different search term.' : 'Add products or services so they can be selected directly in the quote builder.'
            }
          />
        )}

        {!isLoading && items && items.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Unit</th>
                  <th className="px-4 py-2.5 font-medium">Price</th>
                  <th className="px-4 py-2.5 font-medium">Tax</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-medium text-neutral-900">{item.name}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{item.type === 'PRODUCT' ? 'Product' : 'Service'}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{item.unit}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{formatMoney(item.default_price, currency)}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{item.tax_rate}%</td>
                    <td className="px-4 py-2.5">
                      <span className={item.active ? 'text-status-approved' : 'text-neutral-400'}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => {
                          setEditing(item)
                          setModalOpen(true)
                        }}
                        className="mr-3 text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => setDeleting(item)} className="text-red-600 hover:underline">
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

      <CatalogItemFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        submitting={createItem.isPending || updateItem.isPending}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete catalog item"
        description={`Delete ${deleting?.name}? This won't affect quotes that already use it.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
        loading={deleteItem.isPending}
      />
    </div>
  )
}
