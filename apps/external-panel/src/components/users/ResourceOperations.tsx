import type { ReactNode } from 'react'
import {
  Button,
  dataTableDeleteActionClassName,
  dataTableEditActionClassName,
  dataTableViewActionClassName,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { KeyRound, Pencil, Trash2 } from '@fuel-carrier/web-ui/icons'
import { cn } from '@fuel-carrier/web-ui/utils'
import type { ResourceActionLabels } from './ResourceSection'

type ResourceOperationsProps<T> = {
  item: T
  actionLabels: ResourceActionLabels
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onMqttCredentials?: (item: T) => void
  renderViewAction?: (item: T) => ReactNode
  renderExtraActions?: (item: T) => ReactNode
  readOnly?: boolean
  stacked?: boolean
}

export function ResourceOperations<T>({
  item,
  actionLabels,
  onEdit,
  onDelete,
  onMqttCredentials,
  renderViewAction,
  renderExtraActions,
  readOnly = false,
  stacked = false,
}: ResourceOperationsProps<T>) {
  function handleEdit() {
    onEdit(item)
  }

  function handleDelete() {
    onDelete(item)
  }

  function handleMqttCredentials() {
    onMqttCredentials?.(item)
  }

  return (
    <div
      className={cn(
        'flex flex-nowrap items-center gap-2',
        stacked && 'flex-wrap justify-center',
      )}
    >
      {renderViewAction?.(item)}
      {!readOnly ? (
        <>
          {onMqttCredentials ? (
            <Button
              type="button"
              variant="ghost"
              className={dataTableViewActionClassName()}
              onClick={handleMqttCredentials}
              aria-label={
                actionLabels.mqttCredentials ?? actionLabels.operations
              }
            >
              <KeyRound
                className={iconSmClassName}
                strokeWidth={ICON_STROKE_WIDTH}
                aria-hidden
              />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className={dataTableEditActionClassName()}
            onClick={handleEdit}
            aria-label={actionLabels.edit}
          >
            <Pencil
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={dataTableDeleteActionClassName()}
            onClick={handleDelete}
            aria-label={actionLabels.delete}
          >
            <Trash2
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          </Button>
          {renderExtraActions ? (
            <>
              <span
                aria-hidden
                className="mx-0.5 h-5 w-px shrink-0 bg-base-content/15"
              />
              {renderExtraActions(item)}
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
