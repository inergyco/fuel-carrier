import type { Company } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Link } from '@tanstack/react-router'
import { Button, ICON_STROKE_WIDTH, iconSmClassName } from '@fuel-carrier/web-ui/ui'
import { Eye, Pencil, Trash2 } from '@fuel-carrier/web-ui/icons'

interface CompanyOperationsProps {
  company: Company
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
  layout?: 'inline' | 'stacked'
}

export function CompanyOperations({
  company,
  onEdit,
  onDelete,
  layout = 'inline',
}: CompanyOperationsProps) {
  const { LL } = useI18nContext()

  function handleEdit() {
    onEdit(company)
  }

  function handleDelete() {
    onDelete(company)
  }

  return (
    <div
      className={
        layout === 'stacked'
          ? 'flex flex-col gap-2'
          : 'flex flex-wrap items-center gap-2'
      }
    >
      <Link
        to="/companies/$companyId"
        params={{ companyId: company.id }}
        className={
          layout === 'stacked'
            ? 'btn btn-ghost btn-sm flex h-9 min-h-9 w-full items-center justify-center border border-base-content/8 bg-base-100/30 px-3 text-xs normal-case tracking-normal transition-all'
            : 'btn btn-ghost btn-sm inline-flex h-9 min-h-9 items-center border border-base-content/8 bg-base-100/30 px-3 text-xs normal-case tracking-normal transition-all'
        }
      >
        <span className="flex items-center gap-2">
          <Eye className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          {LL.internalPanel.companies.view()}
        </span>
      </Link>
      <Button
        type="button"
        variant="ghost"
        className="h-9 min-h-9 border border-base-content/8 bg-base-100/30 px-3"
        onClick={handleEdit}
      >
        <span className="flex items-center gap-2">
          <Pencil className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          {LL.internalPanel.companies.edit()}
        </span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-9 min-h-9 border border-error/20 bg-error/5 px-3 text-error hover:bg-error/10"
        onClick={handleDelete}
      >
        <span className="flex items-center gap-2">
          <Trash2 className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          {LL.internalPanel.companies.delete()}
        </span>
      </Button>
    </div>
  )
}
