import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car } from '@fuel-carrier/shared-types'
import { useCarQuery } from '../cars/useCarQuery'

export type AppBarHeading = {
  title: string
  subtitle?: string
  /** When set, the app bar shows this plate instead of `title`. */
  licensePlate?: string
  /** Keep `title` visible and show `licensePlate` with the plate component. */
  showTitleWithPlate?: boolean
  backTo?: '/panel/cars' | '/panel/cars/$carId'
  backCarId?: string
  backLabel?: string
}

type LL = ReturnType<typeof useI18nContext>['LL']

const staticHeadings: Record<
  string,
  (LL: LL, firstName: string) => AppBarHeading
> = {
  '/panel': (LL, firstName) => ({
    title: LL.externalPanel.home.title(),
    subtitle: LL.externalPanel.home.welcome({ firstName }),
  }),
  '/panel/users': (LL) => ({
    title: LL.externalPanel.users.title(),
    subtitle: LL.externalPanel.users.subtitle(),
  }),
  '/panel/drivers': (LL) => ({
    title: LL.externalPanel.drivers.title(),
    subtitle: LL.externalPanel.drivers.subtitle(),
  }),
  '/panel/cars': (LL) => ({
    title: LL.externalPanel.cars.title(),
    subtitle: LL.externalPanel.cars.subtitle(),
  }),
  '/panel/map': (LL) => ({
    title: LL.externalPanel.map.title(),
    subtitle: LL.externalPanel.map.subtitle(),
  }),
  '/panel/audit-logs': (LL) => ({
    title: LL.externalPanel.auditLogs.title(),
    subtitle: LL.externalPanel.auditLogs.subtitle(),
  }),
  '/panel/settings': (LL) => ({
    title: LL.externalPanel.settings.title(),
    subtitle: LL.externalPanel.settings.subtitle(),
  }),
}

export function useAppBarHeading(
  pathname: string,
  firstName: string,
): AppBarHeading | undefined {
  const { LL } = useI18nContext()
  const carRoute = getCarRoute(pathname)
  const { carQuery, isNotFound } = useCarQuery(carRoute?.carId ?? '', {
    enabled: Boolean(carRoute),
  })

  if (carRoute) {
    return getCarDetailAppBarHeading({
      car: carQuery.data,
      carId: carRoute.carId,
      isTelemetry: carRoute.telemetry,
      isNotFound,
      LL,
    })
  }

  return staticHeadings[pathname]?.(LL, firstName)
}

function getCarRoute(
  pathname: string,
): { carId: string; telemetry: boolean } | undefined {
  const match = pathname.match(/^\/panel\/cars\/([^/]+)(\/telemetry)?$/)
  if (!match?.[1]) return undefined

  return { carId: match[1], telemetry: Boolean(match[2]) }
}

function getCarDetailAppBarHeading({
  car,
  carId,
  isTelemetry,
  isNotFound,
  LL,
}: {
  car: Car | undefined
  carId: string
  isTelemetry: boolean
  isNotFound: boolean
  LL: LL
}): AppBarHeading {
  const backToList = {
    backTo: '/panel/cars' as const,
    backLabel: LL.externalPanel.cars.backToList(),
  }

  if (isNotFound) {
    return {
      title: LL.externalPanel.cars.notFound(),
      subtitle: LL.externalPanel.cars.notFoundDescription(),
      ...backToList,
    }
  }

  const licensePlate = car?.licensePlate.trim()

  if (isTelemetry) {
    return {
      title: LL.common.carTelemetry.title(),
      subtitle: LL.common.carTelemetry.subtitle(),
      licensePlate: licensePlate || undefined,
      showTitleWithPlate: Boolean(licensePlate),
      backTo: '/panel/cars/$carId',
      backCarId: carId,
      backLabel: LL.common.carTelemetry.backToVehicle(),
    }
  }

  return {
    title: licensePlate || LL.externalPanel.cars.detailTitle(),
    licensePlate: licensePlate || undefined,
    subtitle: LL.externalPanel.cars.detailSubtitle(),
    ...backToList,
  }
}
