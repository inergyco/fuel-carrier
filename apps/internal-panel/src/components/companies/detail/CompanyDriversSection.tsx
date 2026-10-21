import { useI18nContext } from "@fuel-carrier/i18n/react";
import { Pagination, ResourceListToolbar } from "@fuel-carrier/web-ui/ui";
import { getDriverColumns } from "./companyResourceColumns.tsx";
import { DeleteCompanyDriverModal } from "./DeleteCompanyDriverModal";
import { DriverFormModal } from "./DriverFormModal";
import { ResourceSection } from "./ResourceSection";
import { useCompanyDrivers } from "./useCompanyDrivers";

const DRIVER_CARD_GRID_CLASS_NAME =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

interface CompanyDriversSectionProps {
  companyId: string;
}

export function CompanyDriversSection({
  companyId,
}: CompanyDriversSectionProps) {
  const { LL } = useI18nContext();
  const drivers = useCompanyDrivers(companyId);
  const result = drivers.driversQuery.data;

  return (
    <>
      <ResourceSection
        layout="cards"
        listClassName={DRIVER_CARD_GRID_CLASS_NAME}
        addLabel={LL.internalPanel.companies.detail.addDriver()}
        emptyLabel={
          drivers.hasActiveFilters
            ? LL.internalPanel.companies.detail.driversEmptyFiltered()
            : LL.internalPanel.companies.detail.driversEmpty()
        }
        loading={drivers.driversQuery.isLoading && !result}
        isError={drivers.driversQuery.isError}
        onRetry={() => {
          void drivers.driversQuery.refetch();
        }}
        errorLabels={{
          loadFailed: LL.common.queryError.loadFailed(),
          retry: LL.common.queryError.retry(),
        }}
        items={drivers.companyDrivers}
        columns={getDriverColumns({ LL })}
        onAdd={() => drivers.setDriverModal({ mode: "create" })}
        onEdit={(driver) =>
          drivers.setDriverModal({ mode: "edit", item: driver })
        }
        onDelete={drivers.setDeleteTarget}
        toolbar={
          <ResourceListToolbar
            searchPlaceholder={LL.internalPanel.companies.detail.driversSearchPlaceholder()}
            searchText={drivers.draftSearchText}
            onSearchTextChange={drivers.setDraftSearchText}
          />
        }
        footer={
          result ? (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              totalItems={result.totalItems}
              limit={result.limit}
              onPageChange={drivers.handlePageChange}
              onLimitChange={drivers.handleLimitChange}
              labels={LL.common.pagination}
            />
          ) : null
        }
      />

      {drivers.driverModal && (
        <DriverFormModal
          key={
            drivers.driverModal.mode === "edit"
              ? `driver-edit-${drivers.driverModal.item.id}`
              : "driver-create"
          }
          mode={drivers.driverModal.mode}
          companyId={companyId}
          driver={
            drivers.driverModal.mode === "edit"
              ? drivers.driverModal.item
              : undefined
          }
          onClose={() => drivers.setDriverModal(null)}
          onSuccess={drivers.handleChanged}
        />
      )}

      <DeleteCompanyDriverModal
        target={drivers.deleteTarget}
        mutation={drivers.deleteMutation}
        onClose={() => drivers.setDeleteTarget(null)}
      />
    </>
  );
}
