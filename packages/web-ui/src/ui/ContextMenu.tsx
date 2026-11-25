import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { EllipsisVertical } from '../icons'
import { cn } from '../utils'
import { ICON_STROKE_WIDTH, IconButton, iconSmClassName } from './IconButton'

export type ContextMenuTone = 'default' | 'primary' | 'danger' | 'success'

const contextMenuToneClassName: Record<ContextMenuTone, string> = {
  default:
    'border border-base-content/12 bg-base-100/45 text-base-content/80 hover:bg-base-content/5',
  primary: 'bg-primary text-primary-content hover:bg-primary/90',
  danger: 'border border-error/25 bg-error/10 text-error hover:bg-error/15',
  success:
    'border border-success/25 bg-success/10 text-success hover:bg-success/15',
}

type ContextMenuContextValue = {
  close: () => void
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

type ContextMenuProps = {
  label: string
  children: ReactNode
  className?: string
  panelClassName?: string
  icon?: ReactNode
}

export function ContextMenu({
  label,
  children,
  className,
  panelClassName,
  icon,
}: ContextMenuProps) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const preferredFocusRef = useRef<'first' | 'last'>('first')

  function focusTrigger() {
    containerRef.current
      ?.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')
      ?.focus()
  }

  function close() {
    setOpen(false)
    focusTrigger()
  }

  function openMenu(focus: 'first' | 'last') {
    preferredFocusRef.current = focus
    setOpen(true)
  }

  function handleTriggerClick() {
    if (open) {
      close()
      return
    }

    openMenu('first')
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openMenu('first')
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu('last')
    }
  }

  function handleMenuClick(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target
    if (target instanceof Element && target.closest('[role="menuitem"]')) {
      close()
    }
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }

    const items = queryMenuItems(menuRef.current)
    if (items.length === 0) {
      return
    }

    const current = items.indexOf(document.activeElement as HTMLElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[(current + 1) % items.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      items[(current - 1 + items.length) % items.length]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
    }
  }

  useEffect(
    function focusPreferredItem() {
      if (!open) {
        return
      }

      focusMenuItem(menuRef.current, preferredFocusRef.current)
    },
    [open],
  )

  useEffect(
    function closeWhenDismissed() {
      if (!open) {
        return
      }

      function handlePointerDown(event: PointerEvent) {
        if (!containerRef.current?.contains(event.target as Node)) {
          close()
        }
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          event.preventDefault()
          close()
        }
      }

      document.addEventListener('pointerdown', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
      return function removeDismissListeners() {
        document.removeEventListener('pointerdown', handlePointerDown)
        document.removeEventListener('keydown', handleKeyDown)
      }
    },
    [open],
  )

  return (
    <ContextMenuContext.Provider value={{ close }}>
      <div ref={containerRef} className={cn('relative shrink-0', className)}>
        <IconButton
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
        >
          {icon ?? (
            <EllipsisVertical
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          )}
        </IconButton>
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          aria-orientation="vertical"
          hidden={!open}
          inert={!open}
          onClick={handleMenuClick}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute end-0 z-30 mt-2 w-[min(12rem,calc(100vw-2rem))] flex-col gap-1.5 overflow-y-auto rounded-2xl border border-base-content/8 bg-base-100/95 p-1.5 shadow-lg backdrop-blur-xl',
            'max-h-[min(24rem,calc(100svh-6rem))]',
            open ? 'flex' : 'hidden',
            panelClassName,
          )}
        >
          {children}
        </div>
      </div>
    </ContextMenuContext.Provider>
  )
}

export const contextMenuItemClassName = (tone: ContextMenuTone = 'default') =>
  cn(
    'flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-start text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60',
    contextMenuToneClassName[tone],
  )

type ContextMenuItemOwnProps = {
  icon?: ReactNode
  tone?: ContextMenuTone
  className?: string
  children: ReactNode
}

type ContextMenuItemProps<T extends ElementType> = ContextMenuItemOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ContextMenuItemOwnProps>

export function ContextMenuItem<T extends ElementType = 'button'>({
  as,
  icon,
  tone = 'default',
  className,
  children,
  ...props
}: ContextMenuItemProps<T> & { as?: T }) {
  const menu = useContext(ContextMenuContext)
  const Component = (as ?? 'button') as ElementType

  function handleClick(event: ReactMouseEvent<HTMLElement>) {
    const onClick = (
      props as { onClick?: (event: ReactMouseEvent<HTMLElement>) => void }
    ).onClick
    onClick?.(event)
    if (!event.defaultPrevented) {
      menu?.close()
    }
  }

  return (
    <Component
      role="menuitem"
      tabIndex={-1}
      {...(Component === 'button' && !('type' in props)
        ? { type: 'button' as const }
        : undefined)}
      {...props}
      onClick={handleClick}
      className={cn(contextMenuItemClassName(tone), className)}
    >
      {icon}
      <span className="min-w-0 truncate">{children}</span>
    </Component>
  )
}

const queryMenuItems = (menu: HTMLElement | null) =>
  menu
    ? [
        ...menu.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([disabled])',
        ),
      ]
    : []

function focusMenuItem(
  menu: HTMLElement | null,
  placement: 'first' | 'last',
) {
  const items = queryMenuItems(menu)
  const item = placement === 'last' ? items.at(-1) : items[0]
  item?.focus()
}
