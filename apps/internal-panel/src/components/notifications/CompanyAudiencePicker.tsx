import { useI18nContext } from "@fuel-carrier/i18n/react";
import type { Company } from "@fuel-carrier/shared-types";
import { fetchAllPaginated } from "@fuel-carrier/web-ui/api";
import { useQuery } from "@fuel-carrier/web-ui/query";
import {
  Checkbox,
  FieldsetLegend,
  Input,
  Pagination,
  QueryErrorState,
  Skeleton,
  useDebouncedValue,
} from "@fuel-carrier/web-ui/ui";
import { useState } from "react";
import { companyKeys, fetchCompanies } from "../../lib/api/companies";

export type SelectedCompany = {
  id: string;
  name: string;
};

const COMPANY_PAGE_SIZE = 10;

interface CompanyAudiencePickerProps {
  selected: SelectedCompany[];
  onChange: (companies: SelectedCompany[]) => void;
  error?: string;
}

export function CompanyAudiencePicker({
  selected,
  onChange,
  error,
}: CompanyAudiencePickerProps) {
  const { LL } = useI18nContext();
  const copy = LL.internalPanel.notifications;
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const [pageSearch, setPageSearch] = useState(debouncedSearch);
  if (pageSearch !== debouncedSearch) {
    setPageSearch(debouncedSearch);
    setPage(1);
  }
  const listParams = {
    page,
    limit: COMPANY_PAGE_SIZE,
    search: debouncedSearch || undefined,
  };
  const companiesQuery = useQuery({
    queryKey: companyKeys.list(listParams),
    queryFn: function loadCompanies() {
      return fetchCompanies(listParams);
    },
    placeholderData: function keepPrevious(previousData) {
      return previousData;
    },
  });
  const result = companiesQuery.data;
  const companies = result?.items ?? [];
  const selectedIds = new Set(selected.map((company) => company.id));

  function handleSearchChange(value: string) {
    setSearchText(value);
  }

  function handleToggleCompany(company: Company) {
    const isSelected = selectedIds.has(company.id);
    const next = isSelected
      ? selected.filter((item) => item.id !== company.id)
      : [...selected, { id: company.id, name: company.name }];
    onChange(next);
  }

  async function handleSelectAll() {
    setIsSelectingAll(true);
    try {
      const matches = await fetchAllPaginated((pagination) =>
        fetchCompanies({
          ...pagination,
          search: debouncedSearch || undefined,
        }),
      );
      const byId = new Map(selected.map((company) => [company.id, company]));
      for (const company of matches) {
        byId.set(company.id, { id: company.id, name: company.name });
      }
      onChange([...byId.values()]);
    } finally {
      setIsSelectingAll(false);
    }
  }

  function handleClear() {
    onChange([]);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <FieldsetLegend description={copy.companiesHint()}>
        {copy.companiesLabel()}
      </FieldsetLegend>
      <div className="overflow-hidden rounded-xl border border-base-content/8 bg-base-200/30">
        <div className="flex flex-col gap-3 border-b border-base-content/8 p-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Input
              label={LL.common.search.label()}
              type="search"
              value={searchText}
              placeholder={copy.companySearchPlaceholder()}
              onChange={function updateSearch(event) {
                handleSearchChange(event.target.value);
              }}
              onKeyDown={function preventFormSubmit(event) {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm h-11 min-h-11 rounded-lg px-3 text-xs normal-case tracking-normal"
              onClick={function selectAll() {
                void handleSelectAll();
              }}
              disabled={isSelectingAll || (result?.totalItems ?? 0) === 0}
            >
              {copy.selectAll()}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm h-11 min-h-11 rounded-lg px-3 text-xs normal-case tracking-normal"
              onClick={handleClear}
              disabled={selected.length === 0}
            >
              {copy.clearSelection()}
            </button>
          </div>
        </div>

        {companiesQuery.isLoading && !result ? (
          <ul className="flex flex-col gap-2 p-3" aria-hidden>
            {Array.from({ length: 4 }, function renderSkeleton(_, index) {
              return <Skeleton key={index} className="h-11 w-full" />;
            })}
          </ul>
        ) : companiesQuery.isError ? (
          <div className="p-3">
            <QueryErrorState
              onRetry={function retryCompanies() {
                void companiesQuery.refetch();
              }}
              labels={{
                loadFailed: LL.common.queryError.loadFailed(),
                retry: LL.common.queryError.retry(),
              }}
            />
          </div>
        ) : companies.length === 0 ? (
          <p className="px-3 py-6 text-sm text-base-content/50">
            {copy.noCompanies()}
          </p>
        ) : (
          <ul className="max-h-72 overflow-y-auto">
            {companies.map(function renderCompany(company) {
              const inputId = `notification-company-${company.id}`;
              return (
                <li key={company.id}>
                  <label
                    htmlFor={inputId}
                    className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 hover:bg-base-content/5"
                  >
                    <Checkbox
                      id={inputId}
                      checked={selectedIds.has(company.id)}
                      onChange={function toggleCompany() {
                        handleToggleCompany(company);
                      }}
                    />
                    <span className="min-w-0 truncate text-sm">
                      {company.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {result ? (
          <Pagination
            className="border-t border-base-content/8 px-3 py-2"
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.totalItems}
            limit={result.limit}
            showLimitSelect={false}
            onPageChange={setPage}
            labels={{
              previous: LL.common.pagination.previous,
              next: LL.common.pagination.next,
              showing: LL.common.pagination.showing,
              pageOf: LL.common.pagination.pageOf,
              perPage: LL.common.pagination.perPage,
            }}
          />
        ) : null}
      </div>

      <p className="text-xs text-base-content/45">
        {copy.selectedCount({ count: selected.length })}
      </p>
      {error ? (
        <p className="text-xs text-error/80" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
