import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/ui/EmptyState'
import { Input, FieldError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useProfile, useUpdateOrganization } from '@/api/organization'
import { organizationSchema } from '@/lib/schemas'

export function Settings() {
  const { data: profile, isLoading } = useProfile()
  const updateOrg = useUpdateOrganization()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(organizationSchema) })

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.organization.name,
        address: profile.organization.address ?? '',
        phone: profile.organization.phone ?? '',
        email: profile.organization.email ?? '',
        website: profile.organization.website ?? '',
        currency: profile.organization.currency,
        primary_color: profile.organization.primary_color,
        secondary_color: profile.organization.secondary_color,
        footer_text: profile.organization.footer_text ?? '',
        default_terms: profile.organization.default_terms ?? '',
        payment_instructions: profile.organization.payment_instructions ?? '',
      })
    }
  }, [profile, reset])

  if (isLoading || !profile) {
    return <div className="p-6 text-sm text-neutral-500">Loading settings…</div>
  }

  async function onSubmit(values) {
    setSaved(false)
    await updateOrg.mutateAsync({
      id: profile.organization.id,
      updates: {
        name: values.name,
        address: values.address || null,
        phone: values.phone || null,
        email: values.email || null,
        website: values.website || null,
        currency: values.currency,
        primary_color: values.primary_color,
        secondary_color: values.secondary_color,
        footer_text: values.footer_text || null,
        default_terms: values.default_terms || null,
        payment_instructions: values.payment_instructions || null,
      },
    })
    setSaved(true)
  }

  return (
    <div>
      <PageHeader title="Business Settings" description="Branding, contact information, and default quote terms." />

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6 p-6" noValidate>
        <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="s-name" className="mb-1 block text-sm font-medium text-neutral-700">
                Business name *
              </label>
              <Input id="s-name" {...register('name')} error={errors.name?.message} />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <label htmlFor="s-address" className="mb-1 block text-sm font-medium text-neutral-700">
                Address
              </label>
              <Input id="s-address" {...register('address')} placeholder="[PLACEHOLDER — business address]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="s-phone" className="mb-1 block text-sm font-medium text-neutral-700">
                  Phone
                </label>
                <Input id="s-phone" {...register('phone')} placeholder="[PLACEHOLDER]" />
              </div>
              <div>
                <label htmlFor="s-email" className="mb-1 block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <Input id="s-email" type="email" {...register('email')} error={errors.email?.message} />
                <FieldError message={errors.email?.message} />
              </div>
            </div>
            <div>
              <label htmlFor="s-website" className="mb-1 block text-sm font-medium text-neutral-700">
                Website
              </label>
              <Input id="s-website" {...register('website')} placeholder="[PLACEHOLDER]" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Quote defaults</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="s-currency" className="mb-1 block text-sm font-medium text-neutral-700">
                Currency code
              </label>
              <Input id="s-currency" {...register('currency')} className="max-w-32" />
            </div>
            <div>
              <label htmlFor="s-terms" className="mb-1 block text-sm font-medium text-neutral-700">
                Default terms & conditions
              </label>
              <textarea
                id="s-terms"
                {...register('default_terms')}
                rows={4}
                className="w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="s-payment" className="mb-1 block text-sm font-medium text-neutral-700">
                Payment instructions
              </label>
              <textarea
                id="s-payment"
                {...register('payment_instructions')}
                rows={3}
                placeholder="[PLACEHOLDER — bank details / payment instructions]"
                className="w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="s-footer" className="mb-1 block text-sm font-medium text-neutral-700">
                Quote footer text
              </label>
              <Input id="s-footer" {...register('footer_text')} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Brand colors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="s-primary" className="mb-1 block text-sm font-medium text-neutral-700">
                Primary color
              </label>
              <div className="flex items-center gap-2">
                <input type="color" {...register('primary_color')} className="h-10 w-10 rounded border border-neutral-300" />
                <Input {...register('primary_color')} />
              </div>
            </div>
            <div>
              <label htmlFor="s-secondary" className="mb-1 block text-sm font-medium text-neutral-700">
                Secondary color
              </label>
              <div className="flex items-center gap-2">
                <input type="color" {...register('secondary_color')} className="h-10 w-10 rounded border border-neutral-300" />
                <Input {...register('secondary_color')} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateOrg.isPending}>
            {updateOrg.isPending ? 'Saving…' : 'Save settings'}
          </Button>
          {saved && !isDirty && <span className="text-sm text-status-approved">Saved</span>}
        </div>
      </form>
    </div>
  )
}
