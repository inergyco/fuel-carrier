import singleTankArtUrl from './boniz-300.png'
import threeTankArtUrl from './boniz-500.png'

export function getTruckArtUrl(tankCount: number) {
  if (tankCount === 1) {
    return singleTankArtUrl
  }

  return threeTankArtUrl
}
