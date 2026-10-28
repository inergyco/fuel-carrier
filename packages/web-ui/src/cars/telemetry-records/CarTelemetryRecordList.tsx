import type { CarTelemetry } from '@fuel-carrier/shared-types'
import { MEDIA_QUERIES, useMediaQuery } from '../../ui'
import { CarTelemetryRecordCards } from './CarTelemetryRecordCards'
import { CarTelemetryRecordTable } from './CarTelemetryRecordTable'

type CarTelemetryRecordListProps = {
  records: CarTelemetry[]
}

export function CarTelemetryRecordList({
  records,
}: CarTelemetryRecordListProps) {
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)

  if (!isMdUp) {
    return <CarTelemetryRecordCards records={records} />
  }

  return <CarTelemetryRecordTable records={records} />
}
