import { ResourceListCards } from './ResourceListCards'
import { ResourceListTable } from './ResourceListTable'
import type { ResourceListItemProps } from './resourceListTypes'

export type { ResourceColumn } from './resourceListTypes'

type ResourceListProps<T extends { id: string }> = Omit<
  ResourceListItemProps<T>,
  'showOperations'
> & {
  variant: 'table' | 'cards'
  listClassName?: string
}

export function ResourceList<T extends { id: string }>({
  variant,
  renderViewAction,
  readOnly = false,
  listClassName,
  ...props
}: ResourceListProps<T>) {
  const showOperations = Boolean(renderViewAction) || !readOnly
  const shared = {
    ...props,
    renderViewAction,
    readOnly,
    showOperations,
    listClassName,
  }

  if (variant === 'table') {
    return <ResourceListTable {...shared} />
  }

  return <ResourceListCards {...shared} />
}
