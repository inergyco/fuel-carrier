import type { ReactNode } from 'react'
import type { ResourceActionLabels } from './ResourceSection'

export interface ResourceColumn<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
  className?: string
}

export type ResourceListItemProps<T extends { id: string }> = {
  items: T[]
  columns: ResourceColumn<T>[]
  actionLabels: ResourceActionLabels
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onMqttCredentials?: (item: T) => void
  renderViewAction?: (item: T) => ReactNode
  renderExtraActions?: (item: T) => ReactNode
  readOnly?: boolean
  showOperations: boolean
}
