import { useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../utils'
import { Button, type ButtonVariant } from './Button'

type ModalSize = 'sm' | 'lg'

const modalSizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  lg: 'max-w-lg',
}

interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children?: ReactNode
  footer?: ReactNode
  closeDisabled?: boolean
  size?: ModalSize
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  closeDisabled,
  size = 'lg',
}: ModalProps) {
  const titleId = useId()

  if (!open) {
    return null
  }

  function handleBackdropClick() {
    if (!closeDisabled) {
      onClose()
    }
  }

  const hasBody = children != null

  return createPortal(
    <dialog className={cn('modal modal-open z-50')} aria-labelledby={titleId}>
      <div
        className={cn(
          'modal-box rounded-2xl border border-base-content/8 bg-base-200/80 p-0 shadow-xl backdrop-blur-xl',
          modalSizeClasses[size],
        )}
      >
        <div className="border-b border-base-content/8 px-6 py-5">
          <h2 id={titleId} className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-base-content/50">{description}</p>
          )}
        </div>

        {hasBody && <div className="px-6 py-5">{children}</div>}

        {footer && (
          <div
            className={cn(
              'flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end',
              hasBody && 'border-t border-base-content/8',
            )}
          >
            {footer}
          </div>
        )}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" disabled={closeDisabled} onClick={handleBackdropClick}>
          close
        </button>
      </form>
    </dialog>,
    document.body,
  )
}

interface ModalActionsProps {
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm?: () => void
  confirmType?: 'button' | 'submit'
  confirmForm?: string
  loading?: boolean
  loadingLabel?: ReactNode
  confirmVariant?: ButtonVariant
  cancelDisabled?: boolean
}

export function ModalActions({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  confirmType = 'button',
  confirmForm,
  loading,
  loadingLabel,
  confirmVariant = 'primary',
  cancelDisabled,
}: ModalActionsProps) {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="h-10 w-full border border-base-content/8 bg-base-100/40 sm:w-auto sm:px-4"
        disabled={cancelDisabled ?? loading}
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        type={confirmType}
        variant={confirmVariant}
        className="h-10 w-full sm:w-auto sm:px-6"
        form={confirmForm}
        loading={loading}
        loadingText={loadingLabel}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </>
  )
}
