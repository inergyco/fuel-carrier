import { useState } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Company, CompanyDeletionImpact } from '@fuel-carrier/shared-types'
import { useQuery } from '@fuel-carrier/web-ui/query'
import {
  Input,
  Modal,
  ModalActions,
  QueryErrorState,
} from '@fuel-carrier/web-ui/ui'
import {
  companyKeys,
  fetchCompanyDeletionImpact,
} from '../../lib/api/companies'

type DeleteCompanyModalProps = {
  company: Company
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteCompanyModal({
  company,
  loading,
  onConfirm,
  onCancel,
}: DeleteCompanyModalProps) {
  const { LL } = useI18nContext()
  const [typedName, setTypedName] = useState('')

  const impactQuery = useQuery({
    queryKey: companyKeys.deletionImpact(company.id),
    queryFn: () => fetchCompanyDeletionImpact(company.id),
  })

  const nameMatches = typedName.trim() === company.name.trim()
  const impact = impactQuery.data

  function renderBody() {
    if (impactQuery.isLoading && !impact) {
      return (
        <p className="text-sm text-base-content/50">
          {LL.internalPanel.companies.deleteCascadeLoading()}
        </p>
      )
    }

    if (impactQuery.isError) {
      return (
        <QueryErrorState
          onRetry={() => {
            void impactQuery.refetch()
          }}
          labels={{
            loadFailed: LL.common.queryError.loadFailed(),
            retry: LL.common.queryError.retry(),
          }}
        />
      )
    }

    if (!impact) {
      return null
    }

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-base-content/70">
          {LL.internalPanel.companies.deleteConfirmDescription({
            name: company.name,
          })}
        </p>
        <CascadeSummary impact={impact} />
        <Input
          label={LL.internalPanel.companies.deleteTypeToConfirm({
            name: company.name,
          })}
          value={typedName}
          autoComplete="off"
          disabled={loading}
          onChange={(event) => {
            setTypedName(event.target.value)
          }}
        />
      </div>
    )
  }

  return (
    <Modal
      open
      size="lg"
      title={LL.internalPanel.companies.deleteConfirmTitle()}
      onClose={onCancel}
      closeDisabled={loading}
      footer={
        <ModalActions
          cancelLabel={LL.internalPanel.nav.cancel()}
          confirmLabel={LL.internalPanel.companies.deleteConfirm()}
          confirmVariant="danger"
          loading={loading}
          loadingLabel={LL.internalPanel.companies.deleting()}
          confirmDisabled={!nameMatches || !impact || impactQuery.isError}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      }
    >
      {renderBody()}
    </Modal>
  )
}

function CascadeSummary({ impact }: { impact: CompanyDeletionImpact }) {
  const { LL } = useI18nContext()

  return (
    <ul className="list-disc space-y-1 rounded-xl border border-error/25 bg-error/10 px-4 py-3 ps-8 text-sm text-base-content/80">
      <li>
        {LL.internalPanel.companies.deleteCascadeCars({
          count: impact.cars,
        })}
      </li>
      <li>
        {LL.internalPanel.companies.deleteCascadeDrivers({
          count: impact.drivers,
        })}
      </li>
      <li>
        {LL.internalPanel.companies.deleteCascadeUsers({
          count: impact.users,
        })}
      </li>
    </ul>
  )
}
