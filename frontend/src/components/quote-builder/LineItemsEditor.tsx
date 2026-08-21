import { useCatalogItems } from '@/api/catalog'
import { calculateLineItem, formatMoney } from '@/lib/money'
import { Button } from '@/components/ui/Button'

export interface BuilderLineItem {
  key: string
  catalog_item_id: string | null
  name: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  discount_percent: number
  tax_percent: number
}

interface Props {
  items: BuilderLineItem[]
  onChange: (items: BuilderLineItem[]) => void
  currency: string
}

let keyCounter = 0
export function newLineItem(): BuilderLineItem {
  keyCounter += 1
  return {
    key: `new-${Date.now()}-${keyCounter}`,
    catalog_item_id: null,
    name: '',
    description: '',
    quantity: 1,
    unit: 'unit',
    unit_price: 0,
    discount_percent: 0,
    tax_percent: 0,
  }
}

export function LineItemsEditor({ items, onChange, currency }: Props) {
  const { data: catalogItems } = useCatalogItems()

  function updateItem(key: string, patch: Partial<BuilderLineItem>) {
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  function removeItem(key: string) {
    onChange(items.filter((item) => item.key !== key))
  }

  function move(key: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.key === key)
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function applyCatalogItem(key: string, catalogItemId: string) {
    const catalogItem = catalogItems?.find((c) => c.id === catalogItemId)
    if (!catalogItem) return
    updateItem(key, {
      catalog_item_id: catalogItem.id,
      name: catalogItem.name,
      description: catalogItem.description ?? '',
      unit: catalogItem.unit,
      unit_price: catalogItem.default_price,
      tax_percent: catalogItem.tax_rate,
    })
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="w-64 px-3 py-2 font-medium">Item</th>
              <th className="w-20 px-3 py-2 font-medium">Qty</th>
              <th className="w-24 px-3 py-2 font-medium">Unit</th>
              <th className="w-28 px-3 py-2 font-medium">Unit price</th>
              <th className="w-20 px-3 py-2 font-medium">Disc %</th>
              <th className="w-20 px-3 py-2 font-medium">Tax %</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Line total</th>
              <th className="w-24 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-neutral-500">
                  No line items yet. Add a product or service below.
                </td>
              </tr>
            )}
            {items.map((item, index) => {
              const totals = calculateLineItem(item)
              return (
                <tr key={item.key} className="border-b border-neutral-100 align-top last:border-0">
                  <td className="px-3 py-2">
                    <select
                      value={item.catalog_item_id ?? ''}
                      onChange={(e) => e.target.value && applyCatalogItem(item.key, e.target.value)}
                      aria-label="Load from catalog"
                      className="mb-1 h-8 w-full rounded border border-neutral-200 bg-neutral-50 px-2 text-xs text-neutral-600"
                    >
                      <option value="">Custom item (or pick from catalog)</option>
                      {catalogItems?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(item.key, { name: e.target.value })}
                      placeholder="Item name"
                      aria-label="Item name"
                      className="mb-1 h-8 w-full rounded border border-neutral-300 px-2 text-sm"
                    />
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.key, { description: e.target.value })}
                      placeholder="Description (optional)"
                      aria-label="Item description"
                      rows={2}
                      className="w-full rounded border border-neutral-200 px-2 py-1 text-xs text-neutral-600"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.key, { quantity: Number(e.target.value) })}
                      aria-label="Quantity"
                      className="h-8 w-full rounded border border-neutral-300 px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={item.unit}
                      onChange={(e) => updateItem(item.key, { unit: e.target.value })}
                      aria-label="Unit"
                      className="h-8 w-full rounded border border-neutral-300 px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.key, { unit_price: Number(e.target.value) })}
                      aria-label="Unit price"
                      className="h-8 w-full rounded border border-neutral-300 px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount_percent}
                      onChange={(e) => updateItem(item.key, { discount_percent: Number(e.target.value) })}
                      aria-label="Discount percent"
                      className="h-8 w-full rounded border border-neutral-300 px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.tax_percent}
                      onChange={(e) => updateItem(item.key, { tax_percent: Number(e.target.value) })}
                      aria-label="Tax percent"
                      className="h-8 w-full rounded border border-neutral-300 px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-neutral-900">
                    {formatMoney(totals.lineTotal, currency)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => move(item.key, -1)}
                        disabled={index === 0}
                        aria-label="Move item up"
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(item.key, 1)}
                        disabled={index === items.length - 1}
                        aria-label="Move item down"
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label="Remove item"
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-neutral-200 p-3">
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, newLineItem()])}>
          + Add line item
        </Button>
      </div>
    </div>
  )
}
