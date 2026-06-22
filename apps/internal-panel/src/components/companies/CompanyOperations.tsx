import type { Company } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button } from '@fuel-carrier/web-ui/ui'
import { Pencil, Trash2 } from '@fuel-carrier/web-ui/icons'

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
      <Button
        type="button"
        variant="ghost"
        className="h-9 min-h-9 border border-base-content/8 bg-base-100/30 px-3"
        onClick={handleEdit}
      >
        <span className="flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5" aria-hidden />
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
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {LL.internalPanel.companies.delete()}
        </span>
      </Button>
    </div>
  )
}
