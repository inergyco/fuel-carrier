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

export interface ResourceActionLabels {
  loading: string
  edit: string
  delete: string
  operations: string
  mqttCredentials?: string
}

interface ResourceSectionProps<T extends { id: string }> {
  addLabel: string
  emptyLabel: string
  loading: boolean
  isError?: boolean
  onRetry?: () => void
  errorLabels?: QueryErrorStateLabels
  items: T[]
  columns: ResourceColumn<T>[]
  actionLabels: ResourceActionLabels
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onMqttCredentials?: (item: T) => void
  renderViewAction?: (item: T) => ReactNode
  renderExtraActions?: (item: T) => ReactNode
  readOnly?: boolean
  toolbar?: ReactNode
  footer?: ReactNode
}

export function ResourceSection<T extends { id: string }>({
  addLabel,
  emptyLabel,
  loading,
  isError = false,
  onRetry,
  errorLabels,
  items,
  columns,
  actionLabels,
  onAdd,
  onEdit,
  onDelete,
  onMqttCredentials,
  renderViewAction,
  renderExtraActions,
  readOnly = false,
  toolbar,
  footer,
}: ResourceSectionProps<T>) {
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)
  const listVariant = isMdUp ? 'table' : 'cards'

  function renderBody() {
    if (loading) {
      return (
        <ResourceListSkeleton
          variant={listVariant}
          columns={columns.length + 1}
          label={actionLabels.loading}
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
          actionLabels={actionLabels}
          onEdit={onEdit}
          onDelete={onDelete}
          onMqttCredentials={onMqttCredentials}
          renderViewAction={renderViewAction}
          renderExtraActions={renderExtraActions}
          readOnly={readOnly}
          variant={listVariant}
        />
        {footer}
      </>
    )
  }

  const showHeader = Boolean(toolbar) || !readOnly

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
      {showHeader ? (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          {toolbar ? <div className="min-w-0 flex-1">{toolbar}</div> : null}

          {!readOnly ? (
            <Button
              type="button"
              className="h-11 w-full shrink-0 sm:w-auto sm:self-start lg:self-auto sm:px-5"
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
          ) : null}
        </div>
      ) : null}

      {renderBody()}
    </section>
  )
}
