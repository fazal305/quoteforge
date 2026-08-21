import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Uses the native <dialog> element: gets focus trapping, Escape-to-close,
 * and top-layer stacking from the browser instead of reimplementing them.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-0 shadow-lg backdrop:bg-neutral-900/40"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <h2 id="modal-title" className="text-sm font-semibold text-neutral-900">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          ✕
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  )
}
