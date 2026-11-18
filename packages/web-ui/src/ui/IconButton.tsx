import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react'
import { cn } from '../utils'

export const ICON_STROKE_WIDTH = 2.25

/** Inline action icons (edit, delete, view). */
export const iconSmClassName = 'size-4 shrink-0'

/** Default UI icons — nav, buttons, controls. */
export const iconMdClassName = 'size-5 shrink-0'

/** Section headers and back links. */
export const iconLgClassName = 'size-6 shrink-0'

/** Auth hero and prominent branding. */
export const iconXlClassName = 'size-8 shrink-0'

export const iconButtonClassName =
  'btn btn-ghost btn-sm btn-square inline-flex size-11 min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center'

type IconButtonOwnProps<T extends ElementType> = {
  as?: T
  className?: string
  children: ReactNode
}

export type IconButtonProps<T extends ElementType = 'button'> =
  IconButtonOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof IconButtonOwnProps<T>>

export function IconButton<T extends ElementType = 'button'>({
  as,
  className,
  children,
  ...props
}: IconButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType
  const defaultType =
    Component === 'button' && !('type' in props)
      ? { type: 'button' as const }
      : undefined

  return (
    <Component
      className={cn(iconButtonClassName, className)}
      {...defaultType}
      {...props}
    >
      {children}
    </Component>
  )
}
