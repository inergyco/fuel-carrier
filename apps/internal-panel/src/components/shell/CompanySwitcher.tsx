import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Company } from '@fuel-carrier/shared-types'
import { Building2, Check } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ICON_STROKE_WIDTH,
  iconMdClassName,
  MEDIA_QUERIES,
  Modal,
  Select,
  useMediaQuery,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useActiveCompany } from './activeCompanyContext'

export function CompanySwitcher() {
  const isSmUp = useMediaQuery(MEDIA_QUERIES.smUp)
  const { LL } = useI18nContext()
  const { companyId, setCompanyId, companies, isLoading, hasCompanies } =
    useActiveCompany()

  const selectedName =
    companies.find((company) => company.id === companyId)?.name ??
    LL.internalPanel.shell.companySwitcherLoading()
  const label = LL.internalPanel.shell.companySwitcherLabel()

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextCompanyId = event.target.value
    if (nextCompanyId) {
      setCompanyId(nextCompanyId)
    }
  }

  if (!isLoading && !hasCompanies) {
    return null
  }

  if (!isSmUp) {
    return (
      <CompanySwitcherModalTrigger
        label={label}
        selectedName={selectedName}
        companyId={companyId}
        companies={companies}
        isLoading={isLoading}
        loadingLabel={LL.internalPanel.shell.companySwitcherLoading()}
        onSelect={setCompanyId}
      />
    )
  }

  return (
    <div className="grid w-full min-w-0 max-w-full sm:w-max sm:max-w-[min(36rem,calc(100vw-14rem))]">
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 whitespace-pre px-8 text-sm"
      >
        {selectedName}
      </span>
      <div className="col-start-1 row-start-1 min-w-0">
        <Select
          aria-label={label}
          title={selectedName}
          value={companyId ?? ''}
          onChange={handleChange}
          disabled={isLoading || !hasCompanies}
          className="h-11 min-h-11 w-full min-w-0 max-w-full tracking-normal"
        >
          {isLoading ? (
            <option value="">
              {LL.internalPanel.shell.companySwitcherLoading()}
            </option>
          ) : (
            companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))
          )}
        </Select>
      </div>
    </div>
  )
}

interface CompanySwitcherModalTriggerProps {
  label: string
  selectedName: string
  companyId: string | null
  companies: Company[]
  isLoading: boolean
  loadingLabel: string
  onSelect: (companyId: string) => void
}

function CompanySwitcherModalTrigger({
  label,
  selectedName,
  companyId,
  companies,
  isLoading,
  loadingLabel,
  onSelect,
}: CompanySwitcherModalTriggerProps) {
  const [open, setOpen] = useState(false)

  function handleOpen() {
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  function handleSelect(nextCompanyId: string) {
    onSelect(nextCompanyId)
    setOpen(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="icon"
        aria-label={label}
        title={selectedName}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={isLoading}
        onClick={handleOpen}
      >
        <Building2
          strokeWidth={ICON_STROKE_WIDTH}
          className={iconMdClassName}
          aria-hidden
        />
      </Button>

      <Modal open={open} title={label} onClose={handleClose} size="sm">
        {isLoading ? (
          <p className="text-sm text-base-content/50">{loadingLabel}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {companies.map(function renderCompanyOption(company) {
              const selected = company.id === companyId

              return (
                <li key={company.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-start text-sm transition-all',
                      selected
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-transparent text-base-content hover:bg-base-content/5',
                    )}
                    aria-pressed={selected}
                    onClick={() => handleSelect(company.id)}
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {company.name}
                    </span>
                    {selected ? (
                      <Check
                        strokeWidth={ICON_STROKE_WIDTH}
                        className="size-4 shrink-0"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Modal>
    </>
  )
}
