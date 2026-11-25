import type { CarFuelMovement } from '@fuel-carrier/shared-types'
import { MEDIA_QUERIES, useMediaQuery } from '../../ui'
import { CarFuelMovementCards } from './CarFuelMovementCards'
import { CarFuelMovementTable } from './CarFuelMovementTable'

type CarFuelMovementListProps = {
  movements: CarFuelMovement[]
}

export function CarFuelMovementList({ movements }: CarFuelMovementListProps) {
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)

  if (!isMdUp) {
    return <CarFuelMovementCards movements={movements} />
  }

  return <CarFuelMovementTable movements={movements} />
}
