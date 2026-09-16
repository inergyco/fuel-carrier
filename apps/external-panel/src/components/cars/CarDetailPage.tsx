import { useCarQuery } from "./useCarQuery";
import {
  CarDetailHeader,
  CarDetailLoadingHeader,
} from "./detail/CarDetailHeader";
import { CarDetailNotFound } from "./detail/CarDetailNotFound";
import { CarOverviewSection } from "./detail/CarOverviewSection";
import { CarTanksSection } from "./detail/CarTanksSection";
import { CarDriverAssignmentHistorySection } from "@fuel-carrier/web-ui/cars";
import { isCompanyUserAdmin } from "@fuel-carrier/shared-types";
import { getRouteApi } from "@tanstack/react-router";
import { CarCustodyModals } from "./CarCustodyModals";
import { useCarCustody } from "./useCarCustody";

const authenticatedRouteApi = getRouteApi("/_authenticated");

interface CarDetailPageProps {
  carId: string;
}

export function CarDetailPage({ carId }: CarDetailPageProps) {
  const { user } = authenticatedRouteApi.useRouteContext();
  const canManage = isCompanyUserAdmin(user);
  const { carQuery, isNotFound } = useCarQuery(carId);
  const custody = useCarCustody();

  if (carQuery.isLoading) {
    return <CarDetailLoadingHeader />;
  }

  if (isNotFound || !carQuery.data) {
    return <CarDetailNotFound />;
  }

  const car = carQuery.data;

  return (
    <div>
      <CarDetailHeader
        car={car}
        custody={custody}
        canManage={canManage}
      />
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
  );
}
