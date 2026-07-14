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
  renderViewAction?: (item: T) => ReactNode
  readOnly?: boolean
  variant: 'table' | 'cards'
}

function ResourceOperations<T>({
  item,
  actionLabels,
  onEdit,
  onDelete,
  renderViewAction,
  readOnly = false,
  stacked = false,
}: {
  item: T
  actionLabels: ResourceActionLabels
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  renderViewAction?: (item: T) => ReactNode
  readOnly?: boolean
  stacked?: boolean
}) {
  function handleEdit() {
    onEdit(item)
  }

  function handleDelete() {
    onDelete(item)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        stacked && 'justify-center',
      )}
    >
      {renderViewAction?.(item)}
      {!readOnly ? (
        <>
          <Button
            type="button"
            variant="ghost"
            className={dataTableEditActionClassName()}
            onClick={handleEdit}
            aria-label={actionLabels.edit}
          >
            <Pencil className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={dataTableDeleteActionClassName()}
            onClick={handleDelete}
            aria-label={actionLabels.delete}
          >
            <Trash2 className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          </Button>
        </>
      ) : null}
    </div>
  )
}

export function ResourceList<T extends { id: string }>({
  items,
  columns,
  actionLabels,
  onEdit,
  onDelete,
  renderViewAction,
  readOnly = false,
  variant,
}: ResourceListProps<T>) {
  const showOperations = Boolean(renderViewAction) || !readOnly

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
            {showOperations ? (
              <DataTableHeaderCell>{actionLabels.operations}</DataTableHeaderCell>
            ) : null}
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
                {showOperations ? (
                  <DataTableCell className="text-end">
                    <ResourceOperations
                      item={item}
                      actionLabels={actionLabels}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      renderViewAction={renderViewAction}
                      readOnly={readOnly}
                    />
                  </DataTableCell>
                ) : null}
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
            {showOperations ? (
              <div className="mt-4 border-t border-base-content/8 pt-4">
                <ResourceOperations
                  item={item}
                  actionLabels={actionLabels}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  renderViewAction={renderViewAction}
                  readOnly={readOnly}
                  stacked
                />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
