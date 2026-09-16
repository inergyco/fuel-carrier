import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { CheckCircle2, X } from '../icons'
import { iconMdClassName, iconSmClassName, ICON_STROKE_WIDTH } from './iconClassName'
import { cn } from '../utils'

type ToastVariant = 'success' | 'error'

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}

const TOAST_DURATION_MS = 4000

type ToastContextValue = {
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback(function dismissToast(id: string) {
    setToasts(function removeToast(prev) {
      return prev.filter(function keepOther(toast) {
        return toast.id !== id
      })
    })
  }, [])

  const showToast = useCallback(
    function showToast(message: string, variant: ToastVariant) {
      const id = crypto.randomUUID()

      setToasts(function appendToast(prev) {
        return [...prev, { id, message, variant }]
      })

      window.setTimeout(function autoDismiss() {
        dismissToast(id)
      }, TOAST_DURATION_MS)
    },
    [dismissToast],
  )

  const value: ToastContextValue = {
    success: function success(message: string) {
      showToast(message, 'success')
    },
    error: function error(message: string) {
      showToast(message, 'error')
    },
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="toast toast-top toast-end z-[100] w-full max-w-sm p-4 sm:w-auto">
      {toasts.map(function renderToast(toast) {
        return <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      })}
    </div>
  )
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  const { LL } = useI18nContext()
  const Icon = toast.variant === 'success' ? CheckCircle2 : X
  const dismissLabel = LL.common.dismiss()

  return (
    <div
      role="alert"
      className={cn(
        'alert rounded-xl border shadow-lg backdrop-blur-xl',
        toast.variant === 'success' &&
          'border-success/20 bg-success/10 text-base-content',
        toast.variant === 'error' && 'border-error/20 bg-error/10 text-base-content',
      )}
    >
      <Icon
        className={cn(
          iconMdClassName,
          toast.variant === 'success' ? 'text-success' : 'text-error',
        )}
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
      <span className="text-sm">{toast.message}</span>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-circle size-11 min-h-11 min-w-11 shrink-0 cursor-pointer"
        aria-label={dismissLabel}
        onClick={function handleDismiss() {
          onDismiss(toast.id)
        }}
      >
        <X className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
