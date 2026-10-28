import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { CarTelemetryRecordsPage } from '@fuel-carrier/web-ui/cars'
import { QueryErrorState } from '@fuel-carrier/web-ui/ui'
import { CompanyCarDetailNotFound } from './CompanyCarDetailNotFound'
import { useCarQuery } from './useCarQuery'

type CompanyCarTelemetryPageProps = {
  companyId: string
  carId: string
}

export function CompanyCarTelemetryPage({
  companyId,
  carId,
}: CompanyCarTelemetryPageProps) {
  const { LL } = useI18nContext()
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
      <QueryErrorState
        onRetry={() => {
          void carQuery.refetch()
        }}
        labels={{
          loadFailed: LL.common.queryError.loadFailed(),
          retry: LL.common.queryError.retry(),
        }}
      />
    )
  }

  const car: Car = carQuery.data

  return <CarTelemetryRecordsPage carId={car.id} />
}
