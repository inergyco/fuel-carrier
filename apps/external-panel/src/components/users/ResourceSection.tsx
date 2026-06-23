import { Button, MEDIA_QUERIES, useMediaQuery } from '@fuel-carrier/web-ui/ui'
import { Plus } from '@fuel-carrier/web-ui/icons'
import { ResourceList, type ResourceColumn } from './resourceListViews'

export type { ResourceColumn } from './resourceListViews'

export interface ResourceActionLabels {
  loading: string
  edit: string
  delete: string
  operations: string
}

interface ResourceSectionProps<T extends { id: string }> {
  title: string
  subtitle: string
  addLabel: string
  emptyLabel: string
  loading: boolean
  items: T[]
  columns: ResourceColumn<T>[]
  actionLabels: ResourceActionLabels
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
  actionLabels,
  onAdd,
  onEdit,
  onDelete,
}: ResourceSectionProps<T>) {
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-base-content/50">{subtitle}</p>
        </div>
        <Button type="button" className="h-10 w-full sm:w-auto sm:px-5" onClick={onAdd}>
          <span className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            {addLabel}
          </span>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-base-content/50">{actionLabels.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-base-content/50">{emptyLabel}</p>
      ) : (
        <ResourceList
          items={items}
          columns={columns}
          actionLabels={actionLabels}
          onEdit={onEdit}
          onDelete={onDelete}
          variant={isMdUp ? 'table' : 'cards'}
        />
      )}
    </section>
  )
}
