import type { CarTelemetry } from '@fuel-carrier/shared-types'
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
import { formatResistanceMeasure } from '../resistance-status'
import {
  formatCoordinate,
  formatMeasure,
  formatRecordTimestamp,
  formatSpeed,
} from './formatTelemetryRecord'
import { TelemetryModeBadge } from './TelemetryModeBadge'

type CarTelemetryRecordTableProps = {
  records: CarTelemetry[]
}

export function CarTelemetryRecordTable({
  records,
}: CarTelemetryRecordTableProps) {
  const { LL, locale } = useI18nContext()
  const labels = LL.common.carTelemetry

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderRow>
          <DataTableHeaderCell>{labels.recordedAt()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.mode()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.speed()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.remainFuel()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.latitude()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.longitude()}</DataTableHeaderCell>
          <DataTableHeaderCell>
            {labels.resistanceTankToGround()}
          </DataTableHeaderCell>
          <DataTableHeaderCell>
            {labels.resistanceTankToNozzle()}
          </DataTableHeaderCell>
          <DataTableHeaderCell>
            {labels.resistanceGroundToVehicle()}
          </DataTableHeaderCell>
        </DataTableHeaderRow>
      </DataTableHead>
      <DataTableBody>
        {records.map(function renderRecord(record) {
          return (
            <DataTableRow key={record.updatedAt}>
              <DataTableCell className="whitespace-nowrap">
                {formatRecordTimestamp(record.updatedAt, locale)}
              </DataTableCell>
              <DataTableCell>
                <TelemetryModeBadge mode={record.mode} />
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatMeasure({
                  value: record.speed,
                  format: (value) => formatSpeed(value, locale),
                  unit: labels.speedUnit(),
                  empty: labels.emptyCell(),
                })}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatMeasure({
                  value: record.remainFuel,
                  format: formatVolume,
                  unit: labels.volumeUnit(),
                  empty: labels.emptyCell(),
                })}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatCoordinate(record.latitude)}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatCoordinate(record.longitude)}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatResistanceMeasure({
                  value: record.resistance?.tankToGround,
                  unit: labels.resistanceUnit(),
                  openLine: labels.resistanceOpenLine(),
                  empty: labels.emptyCell(),
                })}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatResistanceMeasure({
                  value: record.resistance?.tankToNozzle,
                  unit: labels.resistanceUnit(),
                  openLine: labels.resistanceOpenLine(),
                  empty: labels.emptyCell(),
                })}
              </DataTableCell>
              <DataTableCell className="whitespace-nowrap font-mono tabular-nums">
                {formatResistanceMeasure({
                  value: record.resistance?.groundToVehicle,
                  unit: labels.resistanceUnit(),
                  openLine: labels.resistanceOpenLine(),
                  empty: labels.emptyCell(),
                })}
              </DataTableCell>
            </DataTableRow>
          )
        })}
      </DataTableBody>
    </DataTable>
  )
}
