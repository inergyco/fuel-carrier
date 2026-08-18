import { useState } from 'react';
import type { CarTelemetryMarker } from '@fuel-carrier/shared-types';
import { applyCompanyFilter, toCompanyLegendItems } from './company-legend';
import { useCompanyColors } from './company-colors';

type UseCompanyMapFilterOptions = {
  markers: CarTelemetryMarker[];
  unnamedCompanyLabel: string;
  enabled: boolean;
};

export function useCompanyMapFilter({
  markers,
  unnamedCompanyLabel,
  enabled,
}: UseCompanyMapFilterOptions) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const companyColors = useCompanyColors(
    enabled
      ? markers.map(function toCompanyId(marker) {
          return marker.companyId;
        })
      : [],
  );
  const legendItems = enabled
    ? toCompanyLegendItems(markers, companyColors, unnamedCompanyLabel)
    : [];
  const { activeCompanyId, selectedCompanyName, visibleMarkers } =
    applyCompanyFilter(markers, legendItems, selectedCompanyId);

  function handleSelectCompany(companyId: string) {
    setSelectedCompanyId(function toggleCompany(current) {
      return current === companyId ? null : companyId;
    });
  }

  function handleShowAllCompanies() {
    setSelectedCompanyId(null);
  }

  return {
    companyColors,
    legendItems,
    activeCompanyId,
    selectedCompanyName,
    visibleMarkers,
    handleSelectCompany,
    handleShowAllCompanies,
  };
}
