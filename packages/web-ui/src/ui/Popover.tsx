import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../utils'

interface PopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  children: ReactNode
  label: string
  className?: string
}

export function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  label,
  className,
}: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(
    function closeWhenDismissed() {
      if (!open) {
        return
      }

      function handlePointerDown(event: PointerEvent) {
        if (!containerRef.current?.contains(event.target as Node)) {
          onOpenChange(false)
        }
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          onOpenChange(false)
        }
      }

      document.addEventListener('pointerdown', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
      return function removeDismissListeners() {
        document.removeEventListener('pointerdown', handlePointerDown)
        document.removeEventListener('keydown', handleKeyDown)
      }
    },
    [open, onOpenChange],
  )

  return (
    <div ref={containerRef} className="relative">
      {trigger}
      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute end-0 z-30 mt-2 flex max-h-[min(28rem,calc(100svh-5rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-base-content/8 bg-base-100/95 shadow-lg backdrop-blur-xl',
            className,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
