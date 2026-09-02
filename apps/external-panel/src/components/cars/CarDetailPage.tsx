import { useCarQuery } from "./useCarQuery";
import {
  CarDetailHeader,
  CarDetailLoadingHeader,
} from "./detail/CarDetailHeader";
import { CarDetailNotFound } from "./detail/CarDetailNotFound";
import { CarOverviewSection } from "./detail/CarOverviewSection";
import { CarTanksSection } from "./detail/CarTanksSection";
import { CarDriverAssignmentHistorySection } from "@fuel-carrier/web-ui/cars";

interface CarDetailPageProps {
  carId: string;
}

export function CarDetailPage({ carId }: CarDetailPageProps) {
  const { carQuery, isNotFound } = useCarQuery(carId);

  if (carQuery.isLoading) {
    return <CarDetailLoadingHeader />;
  }

  if (isNotFound || !carQuery.data) {
    return <CarDetailNotFound />;
  }

  const car = carQuery.data;

  return (
    <div>
      <CarDetailHeader car={car} />
      <div className="flex flex-col gap-6">
        <CarTanksSection carId={car.id} />
        <CarOverviewSection car={car} />
        <CarDriverAssignmentHistorySection
          carId={car.id}
          labelScope="external"
        />
      </div>
    </div>
  );
}
