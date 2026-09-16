import type { CarsMapLabels } from './CarsMap';

export type TrajectoryMapViewLabels = CarsMapLabels & {
  title: () => string;
  loading: () => string;
  empty: () => string;
  vehiclesOnMap: (params: { count: number }) => string;
  companyLegend?: () => string;
  unnamedCompany?: () => string;
  showAllCompanies?: () => string;
  vehiclesOnMapForCompany?: (params: { count: number; company: string }) => string;
  selectVehicle: () => string;
  selectedVehicle: () => string;
  clickVehicleHint: () => string;
  chooseTimeRange: () => string;
  selectedVehiclePrompt: (params: { vehicle: string }) => string;
  changeVehicle: () => string;
  startDateTime: () => string;
  endDateTime: () => string;
  dateTimePlaceholder: () => string;
  showTrajectory: () => string;
  showingTrajectory: () => string;
  showTrajectoryLoading: () => string;
  trajectoryHint: () => string;
  noTrajectoryData: () => string;
  backToLiveMap: () => string;
  selectedTimeRange: (params: { vehicle: string }) => string;
};
