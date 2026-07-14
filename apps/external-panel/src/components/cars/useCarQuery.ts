import type { Car } from '@fuel-carrier/shared-types'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { carKeys, fetchCar } from '../../lib/api/cars'

export function useCarQuery(carId: string) {
  const carQuery = useQuery<Car>({
    queryKey: carKeys.detail(carId),
    queryFn: function loadCar() {
      return fetchCar(carId)
    },
  })

  const isNotFound =
    carQuery.isError &&
    isApiClientError(carQuery.error) &&
    carQuery.error.apiError.code === ApiErrorCode.NOT_FOUND

  return {
    carQuery,
    isNotFound,
  }
}
