import type { Car } from '@fuel-carrier/shared-types'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import {
  CarOverviewSection,
  CarTanksSection,
  CarDriverAssignmentHistorySection,
} from '@fuel-carrier/web-ui/cars'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { QueryErrorState } from '@fuel-carrier/web-ui/ui'
import { carKeys, fetchCar } from '../../../lib/api/cars'
import { CompanyCarDetailBackLink } from './CompanyCarDetailBackLink'
import { CompanyCarDetailHeader } from './CompanyCarDetailHeader'
import { CompanyCarDetailNotFound } from './CompanyCarDetailNotFound'
import { CarCustodyModals } from './custody/CarCustodyModals'
import { useCompanyCarCustody } from './custody/useCompanyCarCustody'

type CompanyCarDetailPageProps = {
  companyId: string
  carId: string
}

export function CompanyCarDetailPage({
  companyId,
  carId,
}: CompanyCarDetailPageProps) {
  const { LL } = useI18nContext()
  const custody = useCompanyCarCustody(companyId)
  const carQuery = useQuery<Car>({
    queryKey: carKeys.detail(carId),
    queryFn: function loadCar() {
      return fetchCar(carId)
    },
  })
  const isNotFound =
    (carQuery.isError &&
      isApiClientError(carQuery.error) &&
      carQuery.error.apiError.code === ApiErrorCode.NOT_FOUND) ||
    (carQuery.data != null && carQuery.data.companyId !== companyId)

  if (carQuery.isLoading) {
    return (
      <CompanyCarDetailHeader
        companyId={companyId}
        title={LL.internalPanel.companies.loading()}
      />
    )
  }

  if (isNotFound) {
    return <CompanyCarDetailNotFound companyId={companyId} />
  }

  if (carQuery.isError || !carQuery.data) {
    return (
      <div>
        <div className="mb-6">
          <CompanyCarDetailBackLink companyId={companyId} />
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
  const detailLabels = LL.internalPanel.companies.detail
  const currentDriverName = custody.currentDriverName(car)
  const overviewDriverName =
    currentDriverName === detailLabels.noDriver() ? null : currentDriverName

  return (
    <div>
      <CompanyCarDetailHeader
        companyId={companyId}
        car={car}
        custody={custody}
      />
      <div className="flex flex-col gap-6">
        <CarTanksSection
          carId={car.id}
          labels={LL.internalPanel.companies.detail}
        />
        <CarOverviewSection
          car={car}
          currentDriverName={overviewDriverName}
          labels={{
            detailTitle: detailLabels.carDetailTitle,
            detailSubtitle: detailLabels.carDetailSubtitle,
            licensePlate: detailLabels.licensePlate,
            name: LL.internalPanel.companies.name,
            note: LL.internalPanel.companies.note,
            driver: detailLabels.driver,
            noDriver: detailLabels.noDriver,
            emptyCell: LL.internalPanel.companies.emptyCell,
          }}
        />
        <CarDriverAssignmentHistorySection
          carId={car.id}
          labelScope="internal"
        />
      </div>
      <CarCustodyModals custody={custody} />
    </div>
  )
}
