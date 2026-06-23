import { Button } from '@fuel-carrier/web-ui/ui'
import { Pencil, Trash2 } from '@fuel-carrier/web-ui/icons'
import type { ReactNode } from 'react'
import type { ResourceActionLabels } from './ResourceSection'

export interface ResourceColumn<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
  className?: string
}

interface ResourceListProps<T extends { id: string }> {
  items: T[]
  columns: ResourceColumn<T>[]
  actionLabels: ResourceActionLabels
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  variant: 'table' | 'cards'
}

function ResourceOperations<T>({
  item,
  actionLabels,
  onEdit,
  onDelete,
  stacked = false,
}: {
  item: T
  actionLabels: ResourceActionLabels
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  stacked?: boolean
}) {
  const width = stacked ? ' w-full' : ''

  function handleEdit() {
    onEdit(item)
  }

  function handleDelete() {
    onDelete(item)
  }

  return (
    <div className={stacked ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-2'}>
      <Button
        type="button"
        variant="ghost"
        className={`h-9 min-h-9${width} border border-base-content/8 bg-base-100/30 px-3`}
        onClick={handleEdit}
      >
        <span className={`flex items-center gap-2${stacked ? ' justify-center' : ''}`}>
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          {actionLabels.edit}
        </span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={`h-9 min-h-9${width} border border-error/20 bg-error/5 px-3 text-error hover:bg-error/10`}
        onClick={handleDelete}
      >
        <span className={`flex items-center gap-2${stacked ? ' justify-center' : ''}`}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {actionLabels.delete}
        </span>
      </Button>
    </div>
  )
}

export function ResourceList<T extends { id: string }>({
  items,
  columns,
  actionLabels,
  onEdit,
  onDelete,
  variant,
}: ResourceListProps<T>) {
  if (variant === 'table') {
    return (
      <div className="overflow-x-auto rounded-xl border border-base-content/8">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-content/8 text-xs tracking-widest text-base-content/40 uppercase">
              {columns.map(function renderHeader(column) {
                return <th key={column.key}>{column.header}</th>
              })}
              <th>{actionLabels.operations}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(function renderRow(item) {
              return (
                <tr
                  key={item.id}
                  className="border-b border-base-content/8 last:border-b-0 hover:bg-base-100/30"
                >
                  {columns.map(function renderCell(column) {
                    return (
                      <td key={column.key} className={column.className}>
                        {column.cell(item)}
                      </td>
                    )
                  })}
                  <td className="text-end">
                    <ResourceOperations
                      item={item}
                      actionLabels={actionLabels}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const [titleColumn, ...detailColumns] = columns

  return (
    <ul className="flex flex-col gap-3">
      {items.map(function renderCard(item) {
        return (
          <li
            key={item.id}
            className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm"
          >
            {titleColumn ? (
              <p className="mb-3 text-base font-medium tracking-tight">
                {titleColumn.cell(item)}
              </p>
            ) : null}
            {detailColumns.length > 0 ? (
              <dl className="grid gap-2 text-sm text-base-content/70">
                {detailColumns.map(function renderField(column) {
                  return (
                    <div key={column.key}>
                      <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                        {column.header}
                      </dt>
                      <dd
                        className={`mt-1 break-words whitespace-pre-wrap ${column.className ?? ''}`}
                      >
                        {column.cell(item)}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            ) : null}
            <div className="mt-4 border-t border-base-content/8 pt-4">
              <ResourceOperations
                item={item}
                actionLabels={actionLabels}
                onEdit={onEdit}
                onDelete={onDelete}
                stacked
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
