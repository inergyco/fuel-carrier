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
import { carKeys, fetchCar } from '../../../lib/api/cars'
import { driverKeys, fetchAllDrivers } from '../../../lib/api/drivers'
import { CompanyCarDetailHeader } from './CompanyCarDetailHeader'
import { CompanyCarDetailNotFound } from './CompanyCarDetailNotFound'

type CompanyCarDetailPageProps = {
  companyId: string
  carId: string
}

export function CompanyCarDetailPage({
  companyId,
  carId,
}: CompanyCarDetailPageProps) {
  const { LL } = useI18nContext()
  const carQuery = useQuery<Car>({
    queryKey: carKeys.detail(carId),
    queryFn: function loadCar() {
      return fetchCar(carId)
    },
  })
  const driversQuery = useQuery({
    queryKey: [...driverKeys.byCompany(companyId), 'all'] as const,
    queryFn: function loadDrivers() {
      return fetchAllDrivers(companyId)
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

  if (isNotFound || !carQuery.data) {
    return <CompanyCarDetailNotFound companyId={companyId} />
  }

  const car = carQuery.data
  const detailLabels = LL.internalPanel.companies.detail
  const currentDriver = (driversQuery.data ?? []).find(
    (driver) => driver.id === car.driverId,
  )
  const currentDriverName = currentDriver
    ? `${currentDriver.firstName} ${currentDriver.lastName}`
    : null

  return (
    <div>
      <CompanyCarDetailHeader companyId={companyId} car={car} />
      <div className="flex flex-col gap-6">
        <CarTanksSection
          carId={car.id}
          labels={LL.internalPanel.companies.detail}
        />
        <CarOverviewSection
          car={car}
          currentDriverName={currentDriverName}
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
    </div>
  )
}
