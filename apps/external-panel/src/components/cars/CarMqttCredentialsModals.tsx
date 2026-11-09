import type { Car, CarMqttCredentials } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { UseMutationResult } from '@fuel-carrier/web-ui/query'
import {
  Button,
  ConfirmModal,
  CopyableCredentialField,
  Modal,
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
            <CopyableCredentialField
              label={LL.externalPanel.cars.mqttCredentialsSubscribeTopic()}
              value={credentials.subscribeTopic}
            />
          </div>
        ) : null}
      </Modal>
    </>
  )
}
