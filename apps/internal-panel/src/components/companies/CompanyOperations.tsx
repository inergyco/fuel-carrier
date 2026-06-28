import type { Company } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Link } from '@tanstack/react-router'
import {
  Button,
  dataTableDeleteActionClassName,
  dataTableEditActionClassName,
  dataTableViewActionClassName,
  ICON_STROKE_WIDTH,
  iconSmClassName,
} from '@fuel-carrier/web-ui/ui'
import { Eye, Pencil, Trash2 } from '@fuel-carrier/web-ui/icons'
import { cn } from '@fuel-carrier/web-ui/utils'

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
  const isStacked = layout === 'stacked'

  function handleEdit() {
    onEdit(company)
  }

  function handleDelete() {
    onDelete(company)
  }

  return (
    <div
      className={cn(
        isStacked ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-2',
      )}
    >
      <Link
        to="/companies/$companyId"
        params={{ companyId: company.id }}
        className={dataTableViewActionClassName(
          isStacked && 'flex w-full justify-center',
        )}
      >
        <span className={cn('flex items-center gap-2', isStacked && 'justify-center')}>
          <Eye className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          {LL.internalPanel.companies.view()}
        </span>
      </Link>
      <Button
        type="button"
        variant="ghost"
        className={dataTableEditActionClassName(isStacked && 'w-full')}
        onClick={handleEdit}
      >
        <span className={cn('flex items-center gap-2', isStacked && 'justify-center')}>
          <Pencil className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          {LL.internalPanel.companies.edit()}
        </span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={dataTableDeleteActionClassName(isStacked && 'w-full')}
        onClick={handleDelete}
      >
        <span className={cn('flex items-center gap-2', isStacked && 'justify-center')}>
          <Trash2 className={iconSmClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          {LL.internalPanel.companies.delete()}
        </span>
      </Button>
    </div>
  )
}
