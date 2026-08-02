import { useState } from 'react'
import type { Car, CarMqttCredentials } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { UseMutationResult } from '@fuel-carrier/web-ui/query'
import { Check, Copy } from '@fuel-carrier/web-ui/icons'
import {
  Button,
  ConfirmModal,
  ICON_STROKE_WIDTH,
  iconSmClassName,
  Input,
  Modal,
  useToast,
} from '@fuel-carrier/web-ui/ui'

interface CarMqttCredentialsModalsProps {
  target: Car | null
  credentials: CarMqttCredentials | null
  mutation: UseMutationResult<CarMqttCredentials, Error, string, unknown>
  onCloseConfirm: () => void
  onCloseCredentials: () => void
}

export function CarMqttCredentialsModals({
  target,
  credentials,
  mutation,
  onCloseConfirm,
  onCloseCredentials,
}: CarMqttCredentialsModalsProps) {
  const { LL } = useI18nContext()

  return (
    <>
      <ConfirmModal
        open={target !== null && credentials === null}
        title={LL.externalPanel.cars.mqttCredentialsConfirmTitle()}
        description={
          target
            ? LL.externalPanel.cars.mqttCredentialsConfirmDescription({
                licensePlate: target.licensePlate,
              })
            : ''
        }
        confirmLabel={LL.externalPanel.cars.mqttCredentialsConfirm()}
        cancelLabel={LL.externalPanel.nav.cancel()}
        loading={mutation.isPending}
        loadingLabel={LL.externalPanel.cars.mqttCredentialsProvisioning()}
        onConfirm={async function confirmProvision() {
          if (target) {
            await mutation.mutateAsync(target.id)
          }
        }}
        onCancel={function cancelProvision() {
          if (!mutation.isPending) {
            onCloseConfirm()
          }
        }}
      />

      <Modal
        open={credentials !== null}
        title={
          credentials?.rotated
            ? LL.externalPanel.cars.mqttCredentialsRotatedTitle()
            : LL.externalPanel.cars.mqttCredentialsProvisionedTitle()
        }
        description={LL.externalPanel.cars.mqttCredentialsOnceWarning()}
        onClose={onCloseCredentials}
        footer={
          <Button
            type="button"
            className="h-10 w-full sm:w-auto sm:px-6"
            onClick={onCloseCredentials}
          >
            {LL.externalPanel.cars.mqttCredentialsDismiss()}
          </Button>
        }
      >
        {credentials ? (
          <div className="flex flex-col gap-4">
            <CopyableCredentialField
              label={LL.externalPanel.cars.mqttCredentialsUsername()}
              value={credentials.username}
            />
            <CopyableCredentialField
              label={LL.externalPanel.cars.mqttCredentialsPassword()}
              value={credentials.password}
              type="password"
            />
            <CopyableCredentialField
              label={LL.externalPanel.cars.mqttCredentialsTopic()}
              value={credentials.publishTopic}
            />
          </div>
        ) : null}
      </Modal>
    </>
  )
}

type CopyableCredentialFieldProps = {
  label: string
  value: string
  type?: 'text' | 'password'
}

function CopyableCredentialField({
  label,
  value,
  type = 'text',
}: CopyableCredentialFieldProps) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(LL.externalPanel.cars.mqttCredentialsCopied())
      window.setTimeout(function resetCopied() {
        setCopied(false)
      }, 1500)
    } catch {
      toast.error(LL.externalPanel.cars.mqttCredentialsCopyFailed())
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <Input
          label={label}
          name={type === 'password' ? 'password' : 'username'}
          type={type}
          value={value}
          readOnly
          autoComplete="off"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        className="mb-0 inline-flex size-10 shrink-0 items-center justify-center border border-base-content/12 bg-base-100/45 p-0"
        onClick={handleCopy}
        aria-label={LL.externalPanel.cars.mqttCredentialsCopy()}
      >
        {copied ? (
          <Check
            className={iconSmClassName}
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
        ) : (
          <Copy
            className={iconSmClassName}
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
        )}
      </Button>
    </div>
  )
}
