import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Input, FieldError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { customerSchema } from '@/lib/schemas'

const EMPTY = { name: '', company: '', email: '', phone: '', address: '', notes: '' }

export function CustomerFormModal({ open, onClose, onSubmit, initial, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(customerSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              name: initial.name,
              company: initial.company ?? '',
              email: initial.email ?? '',
              phone: initial.phone ?? '',
              address: initial.address ?? '',
              notes: initial.notes ?? '',
            }
          : EMPTY
      )
    }
  }, [open, initial, reset])

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit customer' : 'New customer'}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values)
        })}
        className="space-y-4"
        noValidate
      >
        <div>
          <label htmlFor="c-name" className="mb-1 block text-sm font-medium text-neutral-700">
            Name *
          </label>
          <Input id="c-name" {...register('name')} error={errors.name?.message} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label htmlFor="c-company" className="mb-1 block text-sm font-medium text-neutral-700">
            Company
          </label>
          <Input id="c-company" {...register('company')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="c-email" className="mb-1 block text-sm font-medium text-neutral-700">
              Email
            </label>
            <Input id="c-email" type="email" {...register('email')} error={errors.email?.message} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label htmlFor="c-phone" className="mb-1 block text-sm font-medium text-neutral-700">
              Phone
            </label>
            <Input id="c-phone" {...register('phone')} />
          </div>
        </div>
        <div>
          <label htmlFor="c-address" className="mb-1 block text-sm font-medium text-neutral-700">
            Address
          </label>
          <Input id="c-address" {...register('address')} />
        </div>
        <div>
          <label htmlFor="c-notes" className="mb-1 block text-sm font-medium text-neutral-700">
            Notes
          </label>
          <textarea
            id="c-notes"
            {...register('notes')}
            rows={3}
            className="w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create customer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
