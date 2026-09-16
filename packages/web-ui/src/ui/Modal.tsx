import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { cn } from '../utils'
import { Button, type ButtonVariant } from './Button'

type ModalSize = 'sm' | 'lg'

const modalSizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  lg: 'max-w-lg',
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

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
  const { LL } = useI18nContext()
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(
    function manageModalFocus() {
      if (!open) {
        return
      }

      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      const panel = panelRef.current
      if (panel) {
        const focusables = getFocusableElements(panel)
        const initial = focusables[0] ?? panel
        initial.focus()
      }

      function handleDocumentKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          if (!closeDisabled) {
            event.preventDefault()
            onClose()
          }
          return
        }

        if (event.key !== 'Tab' || !panelRef.current) {
          return
        }

        const focusables = getFocusableElements(panelRef.current)
        if (focusables.length === 0) {
          event.preventDefault()
          panelRef.current.focus()
          return
        }

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement

        if (event.shiftKey && active === first) {
          event.preventDefault()
          last.focus()
          return
        }

        if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }

      document.addEventListener('keydown', handleDocumentKeyDown)

      return function cleanupModalFocus() {
        document.removeEventListener('keydown', handleDocumentKeyDown)
        previousFocusRef.current?.focus()
      }
    },
    [open, closeDisabled, onClose],
  )

  if (!open) {
    return null
  }

  function handleBackdropClick() {
    if (!closeDisabled) {
      onClose()
    }
  }

  function handlePanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && !closeDisabled) {
      event.stopPropagation()
      onClose()
    }
  }

  const hasBody = children != null
  const closeLabel = LL.common.close()

  return createPortal(
    <dialog
      className={cn('modal modal-open z-50')}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        ref={panelRef}
        role="document"
        tabIndex={-1}
        onKeyDown={handlePanelKeyDown}
        className={cn(
          'modal-box rounded-2xl border border-base-content/8 bg-base-200/80 p-0 shadow-xl backdrop-blur-xl outline-none',
          modalSizeClasses[size],
        )}
      >
        <div className="border-b border-base-content/8 px-6 py-5">
          <h2 id={titleId} className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-1 text-sm text-base-content/50"
            >
              {description}
            </p>
          ) : null}
        </div>

        {hasBody ? <div className="px-6 py-5">{children}</div> : null}

        {footer ? (
          <div
            className={cn(
              'flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end',
              hasBody && 'border-t border-base-content/8',
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button
          type="button"
          disabled={closeDisabled}
          onClick={handleBackdropClick}
          aria-label={closeLabel}
        >
          {closeLabel}
        </button>
      </form>
    </dialog>,
    document.body,
  )
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(function isVisible(element) {
    return element.offsetParent != null || element === document.activeElement
  })
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
  confirmDisabled?: boolean
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
  confirmDisabled,
}: ModalActionsProps) {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="h-11 min-h-11 w-full border border-base-content/8 bg-base-100/40 sm:w-auto sm:px-4"
        disabled={cancelDisabled ?? loading}
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        type={confirmType}
        variant={confirmVariant}
        className="h-11 min-h-11 w-full sm:w-auto sm:px-6"
        form={confirmForm}
        loading={loading}
        loadingText={loadingLabel}
        disabled={confirmDisabled}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </>
  )
}
