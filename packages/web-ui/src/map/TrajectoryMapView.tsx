import type { Car, CarTelemetryMarker } from '@fuel-carrier/shared-types';
import type { ReactNode } from 'react';
import type { KyInstance } from '../api';
import { cn } from '../utils';
import { CarsMap } from './CarsMap';
import { CompanyColorLegend } from './CompanyColorLegend';
import { TrajectoryControls } from './TrajectoryControls';
import type { TrajectoryMapViewLabels } from './trajectory-map.types';
import { getVehicleLabel, resolveTrajectoryStatusText } from './trajectory-utils';
import { useCompanyMapFilter } from './useCompanyMapFilter';
import { useTrajectoryHistory } from './useTrajectoryHistory';
import { useTrajectorySelection } from './useTrajectorySelection';

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
  const selection = useTrajectorySelection();
  const companyFilter = useCompanyMapFilter({
    markers,
    unnamedCompanyLabel: labels.unnamedCompany?.() ?? '',
    enabled: colorByCompany,
  });
  const selectedCar = cars.find(function matchCar(car) {
    return car.id === selection.selectedCarId;
  });
  const selectedLiveMarker =
    markers.find(function matchMarker(marker) {
      return marker.carId === selection.selectedCarId;
    }) ?? null;
  const history = useTrajectoryHistory({
    api,
    historyRequest: selection.historyRequest,
    selectedCar,
    selectedLiveMarker,
  });
  const vehicleLabel = getVehicleLabel({
    car: selectedCar,
    marker: selectedLiveMarker,
    fallback: labels.unnamedVehicle(),
  });
  const companyLegendLabel = labels.companyLegend;
  const showAllCompaniesLabel = labels.showAllCompanies;
  const showLegend =
    colorByCompany &&
    !selection.isHistoryMode &&
    companyLegendLabel != null &&
    showAllCompaniesLabel != null;

  return (
    <section
      className={cn('relative min-h-0 overflow-hidden', className ?? 'flex-1')}
    >
      <TrajectoryControls
        labels={labels}
        titleAs={titleAs}
        statusText={resolveTrajectoryStatusText({
          labels,
          isHistoryMode: selection.isHistoryMode,
          isHistoryLoading: history.isLoading,
          hasHistoryData: history.hasHistoryData,
          vehicleLabel,
          liveMarkerCount: companyFilter.visibleMarkers.length,
          isLiveLoading: isLoading,
          selectedCompanyName: companyFilter.selectedCompanyName,
          hasSelectedCar: selection.hasSelectedCar,
        })}
        isHistoryMode={selection.isHistoryMode}
        hasSelectedCar={selection.hasSelectedCar}
        vehicleLabel={vehicleLabel}
        startAt={selection.startAt}
        endAt={selection.endAt}
        canSubmit={selection.canSubmit}
        isSubmitting={history.isLoading}
        onStartChange={selection.setStartAt}
        onEndChange={selection.setEndAt}
        onShowTrajectory={selection.handleShowTrajectory}
        onBackToLiveMap={selection.handleBackToLiveMap}
        onClearSelection={selection.handleClearSelection}
      />

      {showLegend ? (
        <CompanyColorLegend
          title={companyLegendLabel()}
          showAllLabel={showAllCompaniesLabel()}
          items={companyFilter.legendItems}
          selectedCompanyId={companyFilter.activeCompanyId}
          onSelectCompany={companyFilter.handleSelectCompany}
          onShowAll={companyFilter.handleShowAllCompanies}
        />
      ) : null}

      {isLoading ? (
        <div className="flex h-full items-center justify-center bg-base-300/40 text-sm text-base-content/50">
          {labels.loading()}
        </div>
      ) : (
        <div className="absolute inset-0">
          <CarsMap
            markers={resolveMapMarkers({
              isHistoryMode: selection.isHistoryMode,
              historyMarker: history.historyMarker,
              selectedLiveMarker,
              liveMarkers: companyFilter.visibleMarkers,
            })}
            labels={labels}
            renderVehicleLink={renderVehicleLink}
            companyColors={
              !selection.isHistoryMode && colorByCompany
                ? companyFilter.companyColors
                : undefined
            }
            pathPoints={
              selection.isHistoryMode ? history.historyPathPoints : undefined
            }
            instantMarkerUpdates={selection.isHistoryMode}
            selectedCarId={selection.selectedCarId || null}
            onMarkerSelect={
              selection.isHistoryMode ? undefined : selection.handleSelectMarker
            }
          />
        </div>
      )}
    </section>
  );
}

function resolveMapMarkers({
  isHistoryMode,
  historyMarker,
  selectedLiveMarker,
  liveMarkers,
}: {
  isHistoryMode: boolean;
  historyMarker: CarTelemetryMarker | null;
  selectedLiveMarker: CarTelemetryMarker | null;
  liveMarkers: CarTelemetryMarker[];
}): CarTelemetryMarker[] {
  if (!isHistoryMode) {
    return liveMarkers;
  }

  if (historyMarker) {
    return [historyMarker];
  }

  if (selectedLiveMarker) {
    return [selectedLiveMarker];
  }

  return [];
}
