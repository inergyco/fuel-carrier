import type { ReactNode } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button } from '@fuel-carrier/web-ui/ui'
import { Pencil, Plus, Trash2 } from '@fuel-carrier/web-ui/icons'

export interface ResourceColumn<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
  className?: string
}

interface ResourceSectionProps<T extends { id: string }> {
  title: string
  subtitle: string
  addLabel: string
  emptyLabel: string
  loading: boolean
  items: T[]
  columns: ResourceColumn<T>[]
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
}

export function ResourceSection<T extends { id: string }>({
  title,
  subtitle,
  addLabel,
  emptyLabel,
  loading,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
}: ResourceSectionProps<T>) {
  const { LL } = useI18nContext()

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-base-content/50">{subtitle}</p>
        </div>
        <Button
          type="button"
          className="h-10 w-full sm:w-auto sm:px-5"
          onClick={onAdd}
        >
          <span className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            {addLabel}
          </span>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-base-content/50">
          {LL.internalPanel.companies.loading()}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-base-content/50">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-content/8">
          <table className="table table-sm w-full">
            <thead>
              <tr className="border-b border-base-content/8 text-xs tracking-widest text-base-content/40 uppercase">
                {columns.map(function renderHeader(column) {
                  return <th key={column.key}>{column.header}</th>
                })}
                <th>{LL.internalPanel.companies.operations()}</th>
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
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-9 min-h-9 border border-base-content/8 bg-base-100/30 px-3"
                          onClick={function handleEdit() {
                            onEdit(item)
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            {LL.internalPanel.companies.edit()}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-9 min-h-9 border border-error/20 bg-error/5 px-3 text-error hover:bg-error/10"
                          onClick={function handleDelete() {
                            onDelete(item)
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            {LL.internalPanel.companies.delete()}
                          </span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
