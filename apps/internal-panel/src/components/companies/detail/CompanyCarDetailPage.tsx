import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CarOverviewSection,
  CarTanksSection,
  CarDriverAssignmentHistorySection,
} from '@fuel-carrier/web-ui/cars'
import { QueryErrorState } from '@fuel-carrier/web-ui/ui'
import { CompanyCarDetailHeader } from './CompanyCarDetailHeader'
import { CompanyCarDetailNotFound } from './CompanyCarDetailNotFound'
import { CarCustodyModals } from './custody/CarCustodyModals'
import { useCompanyCarCustody } from './custody/useCompanyCarCustody'
import { useCarQuery } from './useCarQuery'

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
  const { carQuery, isNotFound: isCarNotFound } = useCarQuery(carId)
  const isNotFound =
    isCarNotFound ||
    (carQuery.data != null && carQuery.data.companyId !== companyId)

  if (carQuery.isLoading) {
    return (
      <p className="text-sm text-base-content/50">
        {LL.internalPanel.companies.loading()}
      </p>
    )
  }

  if (isNotFound) {
    return <CompanyCarDetailNotFound companyId={companyId} />
  }

  if (carQuery.isError || !carQuery.data) {
    return (
      <div className="mb-6">
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
    )
  }

  const car: Car = carQuery.data
  const detailLabels = LL.internalPanel.companies.detail
  const currentDriverName = custody.currentDriverName(car)
  const overviewDriverName =
    currentDriverName === detailLabels.noDriver() ? null : currentDriverName

  return (
    <div>
      <CompanyCarDetailHeader car={car} custody={custody} />
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
            fuelType: detailLabels.fuelType,
            fuelTypeHighGrade: detailLabels.fuelTypeHighGrade,
            fuelTypeNormal: detailLabels.fuelTypeNormal,
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
