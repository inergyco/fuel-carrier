import { useI18nContext } from "@fuel-carrier/i18n/react";
import { CarTelemetryRecordsPage } from "@fuel-carrier/web-ui/cars";
import { QueryErrorState } from "@fuel-carrier/web-ui/ui";
import { CarDetailNotFound } from "./detail/CarDetailNotFound";
import { useCarQuery } from "./useCarQuery";

interface CarTelemetryPageProps {
  carId: string;
}

export function CarTelemetryPage({ carId }: CarTelemetryPageProps) {
  const { LL } = useI18nContext();
  const { carQuery, isNotFound } = useCarQuery(carId);

  if (carQuery.isLoading) {
    return (
      <p className="text-sm text-base-content/50">
        {LL.externalPanel.cars.loading()}
      </p>
    );
  }

  if (isNotFound) {
    return <CarDetailNotFound />;
  }

  if (carQuery.isError || !carQuery.data) {
    return (
      <QueryErrorState
        onRetry={() => void carQuery.refetch()}
        labels={{
          loadFailed: LL.common.queryError.loadFailed(),
          retry: LL.common.queryError.retry(),
        }}
      />
    );
  }

  return <CarTelemetryRecordsPage carId={carId} />;
}
