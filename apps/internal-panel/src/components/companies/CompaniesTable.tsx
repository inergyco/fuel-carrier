import type { Company } from "@fuel-carrier/shared-types";
import { useI18nContext } from "@fuel-carrier/i18n/react";
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
    <div className="hidden overflow-x-auto rounded-2xl border border-base-content/8 bg-base-200/40 backdrop-blur-sm md:block">
      <table className="table table-sm w-full">
        <thead>
          <tr className="border-b border-base-content/8 text-xs tracking-widest text-base-content/40 uppercase">
            <th>{LL.internalPanel.companies.name()}</th>
            <th>{LL.internalPanel.companies.nationalId()}</th>
            <th>{LL.internalPanel.companies.phoneNumber()}</th>
            <th>{LL.internalPanel.companies.address()}</th>
            <th>{LL.internalPanel.companies.note()}</th>
            <th>{LL.internalPanel.companies.operations()}</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(function renderCompanyRow(company) {
            return (
              <tr
                key={company.id}
                className="border-b border-base-content/8 last:border-b-0 hover:bg-base-100/30"
              >
                <td className="font-medium">{company.name}</td>
                <td className="font-mono text-sm">{company.nationalId}</td>
                <td>{company.phoneNumber}</td>
                <td className="max-w-48 truncate">
                  {company.address ?? LL.internalPanel.companies.emptyCell()}
                </td>
                <td className="max-w-56 truncate">
                  {company.note ?? LL.internalPanel.companies.emptyCell()}
                </td>
                <td className="text-end">
                  <CompanyOperations
                    company={company}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
