import type { Car, CarTelemetryMarker } from '@fuel-carrier/shared-types';
import type { ReactNode } from 'react';
import type { KyInstance } from '../api';
import { cn } from '../utils';
import { CarsMap } from './CarsMap';
import { CompanyColorLegend } from './CompanyColorLegend';
import { TrajectoryControls } from './TrajectoryControls';
import type { TrajectoryMapViewLabels } from './trajectory-map.types';
import { useTrajectoryMap } from './useTrajectoryMap';

export type { TrajectoryMapViewLabels } from './trajectory-map.types';

export type TrajectoryMapViewProps = {
  api: KyInstance;
  cars: Car[];
  markers: CarTelemetryMarker[];
  isLoading: boolean;
  labels: TrajectoryMapViewLabels;
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode;
  className?: string;
  titleAs?: 'h1' | 'h2';
  colorByCompany?: boolean;
};

export function TrajectoryMapView({
  api,
  cars,
  markers,
  isLoading,
  labels,
  renderVehicleLink,
  className,
  titleAs = 'h1',
  colorByCompany = false,
}: TrajectoryMapViewProps) {
  const trajectory = useTrajectoryMap({
    api,
    cars,
    markers,
    isLoading,
    labels,
    colorByCompany,
  });

  return (
    <section
      className={cn('relative min-h-0 overflow-hidden', className ?? 'flex-1')}
    >
      <TrajectoryControls
        labels={labels}
        titleAs={titleAs}
        statusText={trajectory.statusText}
        isHistoryMode={trajectory.isHistoryMode}
        hasSelectedCar={trajectory.hasSelectedCar}
        vehicleLabel={trajectory.vehicleLabel}
        controls={trajectory.controls}
      />

      {trajectory.legend && labels.companyLegend && labels.showAllCompanies ? (
        <CompanyColorLegend
          title={labels.companyLegend()}
          showAllLabel={labels.showAllCompanies()}
          items={trajectory.legend.items}
          selectedCompanyId={trajectory.legend.activeCompanyId}
          onSelectCompany={trajectory.legend.onSelectCompany}
          onShowAll={trajectory.legend.onShowAll}
        />
      ) : null}

      {trajectory.isMapLoading ? (
        <div className="flex h-full items-center justify-center bg-base-300/40 text-sm text-base-content/50">
          {labels.loading()}
        </div>
      ) : (
        <div className="absolute inset-0">
          <CarsMap
            markers={trajectory.map.markers}
            labels={labels}
            renderVehicleLink={renderVehicleLink}
            companyColors={trajectory.map.companyColors}
            pathPoints={trajectory.map.pathPoints}
            instantMarkerUpdates={trajectory.map.instantMarkerUpdates}
            selectedCarId={trajectory.map.selectedCarId}
            onMarkerSelect={trajectory.map.onMarkerSelect}
          />
        </div>
      )}
    </section>
  );
}
