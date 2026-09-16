import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableRow,
} from '@fuel-carrier/web-ui/ui'
import { ResourceOperations } from './ResourceOperations'
import type { ResourceListItemProps } from './resourceListTypes'

export function ResourceListTable<T extends { id: string }>({
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
  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderRow>
          {columns.map((column) => (
            <DataTableHeaderCell key={column.key}>
              {column.header}
            </DataTableHeaderCell>
          ))}
          {showOperations ? (
            <DataTableHeaderCell>{actionLabels.operations}</DataTableHeaderCell>
          ) : null}
        </DataTableHeaderRow>
      </DataTableHead>
      <DataTableBody>
        {items.map((item) => (
          <DataTableRow key={item.id}>
            {columns.map((column) => (
              <DataTableCell key={column.key} className={column.className}>
                {column.cell(item)}
              </DataTableCell>
            ))}
            {showOperations ? (
              <DataTableCell className="text-end">
                <ResourceOperations
                  item={item}
                  actionLabels={actionLabels}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMqttCredentials={onMqttCredentials}
                  renderViewAction={renderViewAction}
                  renderExtraActions={renderExtraActions}
                  readOnly={readOnly}
                />
              </DataTableCell>
            ) : null}
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
}
