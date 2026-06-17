import type { ReactNode } from 'react'
import { cn } from '../utils'
import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  loadingLabel?: ReactNode
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading,
  loadingLabel,
}: ConfirmModalProps) {
  if (!open) {
    return null
  }

  function handleBackdropClick() {
    if (!loading) {
      onCancel()
    }
  }

  return (
    <dialog className={cn('modal modal-open')} aria-labelledby="confirm-modal-title">
      <div className="modal-box max-w-sm rounded-2xl border border-base-content/8 bg-base-200/80 p-0 shadow-xl backdrop-blur-xl">
        <div className="border-b border-base-content/8 px-6 py-5">
          <h2 id="confirm-modal-title" className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-sm text-base-content/50">{description}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full border border-base-content/8 bg-base-100/40 sm:w-auto sm:px-4"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="h-10 w-full sm:w-auto sm:px-6"
            loading={loading}
            loadingText={loadingLabel}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" disabled={loading} onClick={handleBackdropClick}>
          close
        </button>
      </form>
    </dialog>
  )
}
