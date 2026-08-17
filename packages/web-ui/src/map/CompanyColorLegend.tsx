import { cn } from "../utils";

export type CompanyColorLegendItem = {
  companyId: string;
  name: string;
  color: string;
};

type CompanyColorLegendProps = {
  title: string;
  showAllLabel: string;
  items: CompanyColorLegendItem[];
  selectedCompanyId: string | null;
  onSelectCompany: (companyId: string) => void;
  onShowAll: () => void;
};

export function CompanyColorLegend({
  title,
  showAllLabel,
  items,
  selectedCompanyId,
  onSelectCompany,
  onShowAll,
}: CompanyColorLegendProps) {
  if (items.length === 0) {
    return null;
  }

  const hasFilter = selectedCompanyId != null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 z-1000 flex justify-center p-3 md:bottom-4 md:justify-start md:p-4">
      <aside
        aria-label={title}
        className="pointer-events-auto max-h-56 w-full max-w-xs overflow-y-auto rounded-2xl border border-base-content/8 bg-base-200/70 px-4 py-3 shadow-lg backdrop-blur-xl sm:max-h-72"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-tight text-base-content/80">
            {title}
          </p>
          {hasFilter ? (
            <button
              type="button"
              onClick={onShowAll}
              className="cursor-pointer shrink-0 rounded-lg px-2 text-xs font-medium text-primary transition-all hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
            >
              {showAllLabel}
            </button>
          ) : null}
        </div>
        <ul className="mt-2">
          {items.map(function renderLegendItem(item) {
            const isSelected = item.companyId === selectedCompanyId;

            return (
              <li key={item.companyId}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={function handleSelectCompany() {
                    onSelectCompany(item.companyId);
                  }}
                  className={cn(
                    "cursor-pointer flex min-h-8 w-full items-center gap-2 rounded-lg px-1.5 text-start text-xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40",
                    isSelected
                      ? "bg-base-content/8 text-base-content"
                      : hasFilter
                        ? "text-base-content/40 hover:bg-base-content/5 hover:text-base-content/70"
                        : "text-base-content/70 hover:bg-base-content/5 hover:text-base-content",
                  )}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full ring-2 ring-base-100"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 truncate">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
