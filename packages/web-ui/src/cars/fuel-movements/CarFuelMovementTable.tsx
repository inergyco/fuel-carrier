import type { CarFuelMovement } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableRow,
} from '../../ui/DataTable'
import { formatVolume } from '../fuel-truck'
import {
  formatMeasure,
  formatRecordTimestamp,
} from '../telemetry-records/formatTelemetryRecord'
import { TelemetryModeBadge } from '../telemetry-records/TelemetryModeBadge'

type CarFuelMovementTableProps = {
  movements: CarFuelMovement[]
}

export function CarFuelMovementTable({ movements }: CarFuelMovementTableProps) {
  const { LL, locale } = useI18nContext()
  const labels = LL.common.carFuelMovements

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderRow>
          <DataTableHeaderCell>{labels.recordedAt()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.mode()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.liters()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.pricePerLiter()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.wage()}</DataTableHeaderCell>
        </DataTableHeaderRow>
      </DataTableHead>
      <DataTableBody>
        {movements.map(function renderMovement(movement) {
          return (
            <DataTableRow key={movement.id}>
              <DataTableCell className="whitespace-nowrap">
                {formatRecordTimestamp(movement.recordedAt, locale)}
              </DataTableCell>
              <DataTableCell>
                <TelemetryModeBadge mode={movement.mode} />
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatMeasure({
                  value: movement.liters,
                  format: formatVolume,
                  unit: labels.volumeUnit(),
                  empty: labels.emptyCell(),
                })}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatAmount(movement.pricePerLiter, labels.emptyCell())}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatAmount(movement.wage, labels.emptyCell())}
              </DataTableCell>
            </DataTableRow>
          )
        })}
      </DataTableBody>
    </DataTable>
  )
}

const formatAmount = (value: number | undefined, empty: string) =>
  value == null || !Number.isFinite(value) ? empty : formatVolume(value)
