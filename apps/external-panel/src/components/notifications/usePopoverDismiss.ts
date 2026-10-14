import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'

type PopoverDismissOptions<T extends HTMLElement> = {
  open: boolean
  containerRef: RefObject<T | null>
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function usePopoverDismiss<T extends HTMLElement>({
  open,
  containerRef,
  setOpen,
}: PopoverDismissOptions<T>) {
  useEffect(
    function closeWhenDismissed() {
      if (!open) {
        return
      }

      function handlePointerDown(event: PointerEvent) {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          setOpen(false)
        }
      }

      document.addEventListener('pointerdown', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
      return function removeDismissListeners() {
        document.removeEventListener('pointerdown', handlePointerDown)
        document.removeEventListener('keydown', handleKeyDown)
      }
    },
    [open, containerRef, setOpen],
  )
}
