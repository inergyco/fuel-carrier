import threeTankArtUrl from "./boniz-500.png";

/**
 * One-tank schematic. Swap this import for `./boniz-500-1.png`
 * when that drawing is added.
 */
const singleTankArtUrl = threeTankArtUrl;

export function getTruckArtUrl(tankCount: number) {
  if (tankCount === 1) {
    return singleTankArtUrl;
  }

  return threeTankArtUrl;
}
