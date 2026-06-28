import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  Button,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableRow,
  dataTableDeleteActionClassName,
  dataTableEditActionClassName,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { Pencil, Trash2 } from '@fuel-carrier/web-ui/icons'
import { cn } from '@fuel-carrier/web-ui/utils'
import type { ReactNode } from 'react'

export interface ResourceColumn<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
  className?: string
}

interface ResourceListProps<T extends { id: string }> {
  items: T[]
  columns: ResourceColumn<T>[]
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  variant: 'table' | 'cards'
}

function ResourceOperations<T>({
  item,
  onEdit,
  onDelete,
  stacked = false,
}: {
  item: T
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  stacked?: boolean
}) {
  const { LL } = useI18nContext()

  function handleEdit() {
    onEdit(item)
  }

  function handleDelete() {
    onDelete(item)
  }

  return (
    <div className={cn(stacked ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-2')}>
      <Button
        type="button"
        variant="ghost"
        className={dataTableEditActionClassName(stacked && 'w-full')}
        onClick={handleEdit}
      >
        <span className={cn('flex items-center gap-2', stacked && 'justify-center')}>
          <Pencil className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          {LL.internalPanel.companies.edit()}
        </span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={dataTableDeleteActionClassName(stacked && 'w-full')}
        onClick={handleDelete}
      >
        <span className={cn('flex items-center gap-2', stacked && 'justify-center')}>
          <Trash2 className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          {LL.internalPanel.companies.delete()}
        </span>
      </Button>
    </div>
  )
}

export function ResourceList<T extends { id: string }>({
  items,
  columns,
  onEdit,
  onDelete,
  variant,
}: ResourceListProps<T>) {
  const { LL } = useI18nContext()

  if (variant === 'table') {
    return (
      <DataTable>
        <DataTableHead>
          <DataTableHeaderRow>
            {columns.map(function renderHeader(column) {
              return (
                <DataTableHeaderCell key={column.key}>{column.header}</DataTableHeaderCell>
              )
            })}
            <DataTableHeaderCell>{LL.internalPanel.companies.operations()}</DataTableHeaderCell>
          </DataTableHeaderRow>
        </DataTableHead>
        <DataTableBody>
          {items.map(function renderRow(item) {
            return (
              <DataTableRow key={item.id}>
                {columns.map(function renderCell(column) {
                  return (
                    <DataTableCell key={column.key} className={column.className}>
                      {column.cell(item)}
                    </DataTableCell>
                  )
                })}
                <DataTableCell className="text-end">
                  <ResourceOperations item={item} onEdit={onEdit} onDelete={onDelete} />
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
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
                        className={cn(
                          'mt-1 break-words whitespace-pre-wrap',
                          column.className,
                        )}
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
