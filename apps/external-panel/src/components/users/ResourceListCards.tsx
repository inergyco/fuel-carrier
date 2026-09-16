import { cn } from '@fuel-carrier/web-ui/utils'
import { ResourceOperations } from './ResourceOperations'
import type { ResourceListItemProps } from './resourceListTypes'

export function ResourceListCards<T extends { id: string }>({
  items,
  columns,
  actionLabels,
  onEdit,
  onDelete,
  onMqttCredentials,
  renderViewAction,
  renderExtraActions,
  readOnly = false,
  showOperations,
}: ResourceListItemProps<T>) {
  const [titleColumn, ...detailColumns] = columns

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
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
              {detailColumns.map((column) => (
                <div key={column.key}>
                  <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                    {column.header}
                  </dt>
                  <dd
                    className={cn(
                      'mt-1 wrap-break-word whitespace-pre-wrap',
                      column.className,
                    )}
                  >
                    {column.cell(item)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {showOperations ? (
            <div className="mt-4 border-t border-base-content/8 pt-4">
              <ResourceOperations
                item={item}
                actionLabels={actionLabels}
                onEdit={onEdit}
                onDelete={onDelete}
                onMqttCredentials={onMqttCredentials}
                renderViewAction={renderViewAction}
                renderExtraActions={renderExtraActions}
                readOnly={readOnly}
                stacked
              />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
