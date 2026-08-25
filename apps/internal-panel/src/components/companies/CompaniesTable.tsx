import type { Company } from "@fuel-carrier/shared-types";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import {
  CompanyBrandLogo,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableRow,
} from "@fuel-carrier/web-ui/ui";
import { CompanyOperations } from "./CompanyOperations";

interface CompaniesTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompaniesTable({
  companies,
  onEdit,
  onDelete,
}: CompaniesTableProps) {
  const { LL } = useI18nContext();

  return (
    <DataTable className="rounded-2xl">
      <DataTableHead>
        <DataTableHeaderRow>
          <DataTableHeaderCell>{LL.internalPanel.companies.name()}</DataTableHeaderCell>
          <DataTableHeaderCell>{LL.internalPanel.companies.nationalId()}</DataTableHeaderCell>
          <DataTableHeaderCell>{LL.internalPanel.companies.phoneNumber()}</DataTableHeaderCell>
          <DataTableHeaderCell>{LL.internalPanel.companies.address()}</DataTableHeaderCell>
          <DataTableHeaderCell>{LL.internalPanel.companies.note()}</DataTableHeaderCell>
          <DataTableHeaderCell>{LL.internalPanel.companies.operations()}</DataTableHeaderCell>
        </DataTableHeaderRow>
      </DataTableHead>
      <DataTableBody>
        {companies.map(function renderCompanyRow(company) {
          return (
            <DataTableRow key={company.id}>
              <DataTableCell>
                <div className="flex items-center gap-3">
                  <CompanyBrandLogo logoUrl={company.logoUrl} />
                  <span className="font-medium text-nowrap">{company.name}</span>
                </div>
              </DataTableCell>
              <DataTableCell className="font-mono text-sm">
                {company.nationalId}
              </DataTableCell>
              <DataTableCell>{company.phoneNumber}</DataTableCell>
              <DataTableCell className="max-w-48 truncate">
                {company.address ?? LL.internalPanel.companies.emptyCell()}
              </DataTableCell>
              <DataTableCell className="max-w-56 truncate">
                {company.note ?? LL.internalPanel.companies.emptyCell()}
              </DataTableCell>
              <DataTableCell className="text-end">
                <CompanyOperations
                  company={company}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTableBody>
    </DataTable>
  );
}
