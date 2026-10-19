import type { Company } from "@fuel-carrier/shared-types";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import { Link } from "@tanstack/react-router";
import {
  Button,
  buttonClassName,
  dataTableDeleteActionClassName,
  dataTableEditActionClassName,
  dataTableViewActionClassName,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from "@fuel-carrier/web-ui/ui";
import { Eye, Pencil, Trash2 } from "@fuel-carrier/web-ui/icons";
import { cn } from "@fuel-carrier/web-ui/utils";

interface CompanyOperationsProps {
  company: Company;
  onDelete: (company: Company) => void;
  layout?: "inline" | "stacked";
}

export function CompanyOperations({
  company,
  onDelete,
  layout = "inline",
}: CompanyOperationsProps) {
  const { LL } = useI18nContext();
  const isStacked = layout === "stacked";

  function handleDelete() {
    onDelete(company);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 flex-nowrap",
        isStacked && "justify-center",
      )}
    >
      <Link
        to="/companies/$companyId"
        params={{ companyId: company.id }}
        className={dataTableViewActionClassName()}
        aria-label={LL.internalPanel.companies.view()}
      >
        <Eye
          className={iconSmClassName}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
      </Link>
      <Link
        to="/companies/$companyId/edit"
        params={{ companyId: company.id }}
        className={cn(buttonClassName.ghost, dataTableEditActionClassName())}
        aria-label={LL.internalPanel.companies.edit()}
      >
        <Pencil
          className={iconSmClassName}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
      </Link>
      <Button
        type="button"
        variant="ghost"
        className={dataTableDeleteActionClassName()}
        onClick={handleDelete}
        aria-label={LL.internalPanel.companies.delete()}
      >
        <Trash2
          className={iconSmClassName}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
      </Button>
    </div>
  );
}
