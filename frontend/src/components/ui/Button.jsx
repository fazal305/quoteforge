import { forwardRef } from 'react'
import clsx from 'clsx'

const variantStyles = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-neutral-300',
  secondary:
    'bg-neutral-0 text-neutral-800 border border-neutral-300 hover:bg-neutral-50 disabled:text-neutral-400',
  ghost: 'text-neutral-700 hover:bg-neutral-100 disabled:text-neutral-400',
  danger: 'bg-neutral-0 text-red-600 border border-red-200 hover:bg-red-50 disabled:text-neutral-400',
}

const sizeStyles = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export const Button = forwardRef(({ variant = 'primary', size = 'md', className, ...props }, ref) => (
  <button
    ref={ref}
    className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
    {...props}
  />
))
Button.displayName = 'Button'
