import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Input, FieldError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { catalogItemSchema } from '@/lib/schemas'

const EMPTY = {
  type: 'SERVICE',
  name: '',
  sku: '',
  description: '',
  unit: 'unit',
  default_price: 0,
  tax_rate: 0,
  active: true,
}

export function CatalogItemFormModal({ open, onClose, onSubmit, initial, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(catalogItemSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              type: initial.type,
              name: initial.name,
              sku: initial.sku ?? '',
              description: initial.description ?? '',
              unit: initial.unit,
              default_price: initial.default_price,
              tax_rate: initial.tax_rate,
              active: initial.active,
            }
          : EMPTY
      )
    }
  }, [open, initial, reset])

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit item' : 'New catalog item'}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values)
        })}
        className="space-y-4"
        noValidate
      >
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="PRODUCT" {...register('type')} /> Product
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="SERVICE" {...register('type')} /> Service
          </label>
        </div>
        <div>
          <label htmlFor="i-name" className="mb-1 block text-sm font-medium text-neutral-700">
            Name *
          </label>
          <Input id="i-name" {...register('name')} error={errors.name?.message} />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="i-sku" className="mb-1 block text-sm font-medium text-neutral-700">
              SKU / Code
            </label>
            <Input id="i-sku" {...register('sku')} />
          </div>
          <div>
            <label htmlFor="i-unit" className="mb-1 block text-sm font-medium text-neutral-700">
              Unit *
            </label>
            <Input id="i-unit" {...register('unit')} placeholder="e.g. hour, month, unit" error={errors.unit?.message} />
            <FieldError message={errors.unit?.message} />
          </div>
        </div>
        <div>
          <label htmlFor="i-description" className="mb-1 block text-sm font-medium text-neutral-700">
            Description
          </label>
          <textarea
            id="i-description"
            {...register('description')}
            rows={2}
            className="w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="i-price" className="mb-1 block text-sm font-medium text-neutral-700">
              Default price *
            </label>
            <Input id="i-price" type="number" step="0.01" min="0" {...register('default_price', { valueAsNumber: true })} error={errors.default_price?.message} />
            <FieldError message={errors.default_price?.message} />
          </div>
          <div>
            <label htmlFor="i-tax" className="mb-1 block text-sm font-medium text-neutral-700">
              Tax rate (%)
            </label>
            <Input id="i-tax" type="number" step="0.01" min="0" max="100" {...register('tax_rate', { valueAsNumber: true })} error={errors.tax_rate?.message} />
            <FieldError message={errors.tax_rate?.message} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('active')} /> Active (selectable in the quote builder)
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
