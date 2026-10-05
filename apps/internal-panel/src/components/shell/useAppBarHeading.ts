import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car, Company } from '@fuel-carrier/shared-types'
import { useCompanyQuery } from '../companies/useCompanyQuery'
import { useCarQuery } from '../companies/detail/useCarQuery'

export type AppBarBack =
  | { to: '/companies'; label: string }
  | {
      to: '/companies/$companyId/cars'
      companyId: string
      label: string
    }

export type AppBarHeading = {
  title: string
  subtitle?: string
  back?: AppBarBack
}

type LL = ReturnType<typeof useI18nContext>['LL']

const staticHeadings: Record<
  string,
  (LL: LL, firstName: string) => AppBarHeading
> = {
  '/': (LL, firstName) => ({
    title: LL.internalPanel.home.title(),
    subtitle: LL.internalPanel.home.welcome({ firstName }),
  }),
  '/companies': (LL) => ({
    title: LL.internalPanel.companies.title(),
    subtitle: LL.internalPanel.companies.subtitle(),
  }),
  '/map': (LL) => ({
    title: LL.internalPanel.map.title(),
    subtitle: LL.internalPanel.map.subtitle(),
  }),
  '/audit-logs': (LL) => ({
    title: LL.internalPanel.auditLogs.title(),
    subtitle: LL.internalPanel.auditLogs.subtitle(),
  }),
}

export function useAppBarHeading(
  pathname: string,
  firstName: string,
): AppBarHeading | undefined {
  const { LL } = useI18nContext()
  const carRoute = getCompanyCarDetailRoute(pathname)
  const companyId = carRoute?.companyId ?? getCompanyDetailId(pathname)
  const { companyQuery, isNotFound: isCompanyNotFound } = useCompanyQuery(
    companyId ?? '',
    { enabled: Boolean(companyId) },
  )
  const { carQuery, isNotFound: isCarNotFound } = useCarQuery(
    carRoute?.carId ?? '',
    { enabled: Boolean(carRoute) },
  )

  if (carRoute) {
    return getCarDetailAppBarHeading({
      car: carQuery.data,
      companyId: carRoute.companyId,
      isNotFound:
        isCarNotFound ||
        (carQuery.data != null &&
          carQuery.data.companyId !== carRoute.companyId),
      LL,
    })
  }

  if (companyId) {
    return getCompanyDetailAppBarHeading({
      company: companyQuery.data,
      isNotFound: isCompanyNotFound,
      LL,
    })
  }

  return staticHeadings[pathname]?.(LL, firstName)
}

function getCompanyDetailId(pathname: string): string | undefined {
  if (!pathname.startsWith('/companies/')) return undefined

  const rest = pathname.slice('/companies/'.length)
  const companyId = rest.split('/')[0]
  if (!companyId) return undefined

  return companyId
}

function getCompanyCarDetailRoute(
  pathname: string,
): { companyId: string; carId: string } | undefined {
  const match = pathname.match(/^\/companies\/([^/]+)\/cars\/([^/]+)$/)
  if (!match) return undefined

  return { companyId: match[1], carId: match[2] }
}

function getCompanyDetailAppBarHeading({
  company,
  isNotFound,
  LL,
}: {
  company: Company | undefined
  isNotFound: boolean
  LL: LL
}): AppBarHeading {
  const back: AppBarBack = {
    to: '/companies',
    label: LL.internalPanel.companies.backToList(),
  }

  if (isNotFound) {
    return {
      title: LL.internalPanel.companies.notFound(),
      subtitle: LL.internalPanel.companies.notFoundDescription(),
      back,
    }
  }

  return {
    title: company?.name ?? LL.internalPanel.companies.loading(),
    subtitle: LL.internalPanel.companies.subtitle(),
    back,
  }
}

function getCarDetailAppBarHeading({
  car,
  companyId,
  isNotFound,
  LL,
}: {
  car: Car | undefined
  companyId: string
  isNotFound: boolean
  LL: LL
}): AppBarHeading {
  const detail = LL.internalPanel.companies.detail
  const back: AppBarBack = {
    to: '/companies/$companyId/cars',
    companyId,
    label: detail.backToCars(),
  }

  if (isNotFound) {
    return {
      title: detail.carNotFound(),
      subtitle: detail.carNotFoundDescription(),
      back,
    }
  }

  return {
    title: car?.name?.trim() || car?.licensePlate || detail.carDetailTitle(),
    subtitle: car?.licensePlate ?? detail.carDetailSubtitle(),
    back,
  }
}
