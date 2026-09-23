import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { CarDriverAssignmentHistorySection } from '@fuel-carrier/web-ui/cars'
import { QueryErrorState } from '@fuel-carrier/web-ui/ui'
import { getRouteApi } from '@tanstack/react-router'
import { CarCustodyModals } from './CarCustodyModals'
import { useCarCustody } from './useCarCustody'
import { useCarQuery } from './useCarQuery'
import {
  CarDetailHeader,
  CarDetailLoadingHeader,
} from './detail/CarDetailHeader'
import { CarDetailBackLink } from './detail/CarDetailBackLink'
import { CarDetailNotFound } from './detail/CarDetailNotFound'
import { CarOverviewSection } from './detail/CarOverviewSection'
import { CarTanksSection } from './detail/CarTanksSection'

const authenticatedRouteApi = getRouteApi('/_authenticated')

interface CarDetailPageProps {
  carId: string
}

export function CarDetailPage({ carId }: CarDetailPageProps) {
  const { LL } = useI18nContext()
  const { user } = authenticatedRouteApi.useRouteContext()
  const canManage = isCompanyUserAdmin(user)
  const { carQuery, isNotFound } = useCarQuery(carId)
  const custody = useCarCustody()

  if (carQuery.isLoading) {
    return <CarDetailLoadingHeader />
  }

  if (isNotFound) {
    return <CarDetailNotFound />
  }

  if (carQuery.isError || !carQuery.data) {
    return (
      <div>
        <div className="mb-6">
          <CarDetailBackLink />
          <QueryErrorState
            onRetry={() => {
              void carQuery.refetch()
            }}
            labels={{
              loadFailed: LL.common.queryError.loadFailed(),
              retry: LL.common.queryError.retry(),
            }}
          />
        </div>
      </div>
    )
  }

  const car = carQuery.data

  return (
    <div>
      <CarDetailHeader car={car} custody={custody} canManage={canManage} />
      <div className="flex flex-col gap-6">
        <CarTanksSection carId={car.id} />
        <CarOverviewSection
          car={car}
          currentDriverName={custody.currentDriverName(car)}
        />
        <CarDriverAssignmentHistorySection
          carId={car.id}
          labelScope="external"
        />
      </div>
      {canManage ? <CarCustodyModals custody={custody} /> : null}
    </div>
  )
}
