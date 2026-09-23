import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  Button,
  ICON_STROKE_WIDTH,
  MEDIA_QUERIES,
  QueryErrorState,
  ResourceListSkeleton,
  iconMdClassName,
  useMediaQuery,
  type QueryErrorStateLabels,
} from '@fuel-carrier/web-ui/ui'
import { Plus } from '@fuel-carrier/web-ui/icons'
import type { ReactNode } from 'react'
import { ResourceList, type ResourceColumn } from './resourceListViews'

export type { ResourceColumn } from './resourceListViews'

interface ResourceSectionProps<T extends { id: string }> {
  title: string
  subtitle: string
  addLabel: string
  emptyLabel: string
  loading: boolean
  isError?: boolean
  onRetry?: () => void
  errorLabels?: QueryErrorStateLabels
  items: T[]
  columns: ResourceColumn<T>[]
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onMqttCredentials?: (item: T) => void
  renderView?: (item: T) => ReactNode
  footer?: ReactNode
}

export function ResourceSection<T extends { id: string }>({
  title,
  subtitle,
  addLabel,
  emptyLabel,
  loading,
  isError = false,
  onRetry,
  errorLabels,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onMqttCredentials,
  renderView,
  footer,
}: ResourceSectionProps<T>) {
  const { LL } = useI18nContext()
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)
  const listVariant = isMdUp ? 'table' : 'cards'
  const loadingLabel = LL.internalPanel.companies.loading()

  function renderBody() {
    if (loading) {
      return (
        <ResourceListSkeleton
          variant={listVariant}
          columns={columns.length + 1}
          label={loadingLabel}
        />
      )
    }

    if (isError && onRetry && errorLabels) {
      return <QueryErrorState onRetry={onRetry} labels={errorLabels} />
    }

    if (items.length === 0) {
      return <p className="text-sm text-base-content/50">{emptyLabel}</p>
    }

    return (
      <>
        <ResourceList
          items={items}
          columns={columns}
          onEdit={onEdit}
          onDelete={onDelete}
          onMqttCredentials={onMqttCredentials}
          renderView={renderView}
          variant={listVariant}
        />
        {footer}
      </>
    )
  }

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-base-content/50">{subtitle}</p>
        </div>
        <Button
          type="button"
          className="h-11 w-full sm:w-auto sm:px-5"
          onClick={onAdd}
        >
          <span className="flex items-center justify-center gap-2">
            <Plus
              className={iconMdClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
            {addLabel}
          </span>
        </Button>
      </div>

      {renderBody()}
    </section>
  )
}
