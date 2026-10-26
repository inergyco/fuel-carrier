import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car } from '@fuel-carrier/shared-types'
import { useCarQuery } from '../cars/useCarQuery'

export type AppBarHeading = {
  title: string
  subtitle?: string
  backTo?: '/panel/cars'
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
  const carId = getCarDetailId(pathname)
  const { carQuery, isNotFound } = useCarQuery(carId ?? '', {
    enabled: Boolean(carId),
  })

  if (carId) {
    return getCarDetailAppBarHeading(carQuery.data, isNotFound, LL)
  }

  return staticHeadings[pathname]?.(LL, firstName)
}

function getCarDetailId(pathname: string): string | undefined {
  if (!pathname.startsWith('/panel/cars/')) return undefined

  const carId = pathname.slice('/panel/cars/'.length)
  if (!carId || carId.includes('/')) return undefined

  return carId
}

function getCarDetailAppBarHeading(
  car: Car | undefined,
  isNotFound: boolean,
  LL: LL,
): AppBarHeading {
  const back = {
    backTo: '/panel/cars' as const,
    backLabel: LL.externalPanel.cars.backToList(),
  }

  if (isNotFound) {
    return {
      title: LL.externalPanel.cars.notFound(),
      subtitle: LL.externalPanel.cars.notFoundDescription(),
      ...back,
    }
  }

  return {
    title: car?.licensePlate || LL.externalPanel.cars.detailTitle(),
    subtitle: LL.externalPanel.cars.detailSubtitle(),
    ...back,
  }
}
