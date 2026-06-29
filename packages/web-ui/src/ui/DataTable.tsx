import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import type { ClassValue } from 'clsx'
import { cn } from '../utils'

interface DataTableProps {
  children: ReactNode
  className?: string
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-base-content/12 bg-base-100/55 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

interface DataTableSectionProps {
  children: ReactNode
  className?: string
}

export function DataTableHead({ children, className }: DataTableSectionProps) {
  return (
    <thead className={cn('bg-base-200/75', className)}>
      {children}
    </thead>
  )
}

export function DataTableBody({ children, className }: DataTableSectionProps) {
  return <tbody className={className}>{children}</tbody>
}

interface DataTableRowProps {
  children: ReactNode
  className?: string
}

export function DataTableHeaderRow({ children, className }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        'border-b-2 border-base-content/12 text-xs font-semibold tracking-wider text-base-content/70 uppercase',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function DataTableRow({ children, className }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-base-content/10 transition-colors last:border-b-0 odd:bg-base-100/25 even:bg-base-200/40 hover:bg-primary/8',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function DataTableHeaderCell({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'border-e border-base-content/10 px-4 py-3.5 text-start align-middle last:border-e-0 first:ps-5 last:pe-5',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function DataTableCell({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'border-e border-base-content/8 px-4 py-3.5 align-middle text-base-content/90 last:border-e-0 first:ps-5 last:pe-5',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  )
}

export function dataTableEditActionClassName(...inputs: ClassValue[]) {
  return cn(
    'inline-flex size-9 min-h-9 min-w-9 shrink-0 items-center justify-center border border-primary/25 bg-primary/10 p-0 text-primary hover:border-primary/35 hover:bg-primary/15',
    ...inputs,
  )
}

export function dataTableDeleteActionClassName(...inputs: ClassValue[]) {
  return cn(
    'inline-flex size-9 min-h-9 min-w-9 shrink-0 items-center justify-center border border-error/30 bg-error/10 p-0 text-error hover:border-error/40 hover:bg-error/15',
    ...inputs,
  )
}

export function dataTableViewActionClassName(...inputs: ClassValue[]) {
  return cn(
    'btn btn-ghost btn-sm inline-flex size-9 min-h-9 min-w-9 shrink-0 items-center justify-center border border-base-content/12 bg-base-100/45 p-0 normal-case tracking-normal transition-all hover:border-base-content/20 hover:bg-base-100/65',
    ...inputs,
  )
}
