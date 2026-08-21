import { forwardRef } from 'react'
import clsx from 'clsx'

export const Input = forwardRef(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={!!error}
    className={clsx(
      'h-10 w-full rounded-md border bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      error ? 'border-red-400' : 'border-neutral-300',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export function FieldError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  )
}
