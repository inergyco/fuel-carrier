import { createFileRoute } from "@tanstack/react-router";
import { parseCarTelemetryRecordsSearch } from "@fuel-carrier/web-ui/cars";
import { CompanyCarFuelMovementsPage } from "../../components/companies/detail/CompanyCarFuelMovementsPage";

export const Route = createFileRoute(
  "/_authenticated/companies/$companyId/cars/$carId/fuel-movements",
)({
  validateSearch: parseCarTelemetryRecordsSearch,
  component: CompanyCarFuelMovementsRoute,
});

function CompanyCarFuelMovementsRoute() {
  const { companyId, carId } = Route.useParams();

  return <CompanyCarFuelMovementsPage companyId={companyId} carId={carId} />;
}
