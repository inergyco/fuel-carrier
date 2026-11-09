import type { Car, CarMqttCredentials } from "@fuel-carrier/shared-types";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import type { UseMutationResult } from "@fuel-carrier/web-ui/query";
import {
  Button,
  ConfirmModal,
  CopyableCredentialField,
  Modal,
} from "@fuel-carrier/web-ui/ui";

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
        title={LL.internalPanel.companies.detail.mqttCredentialsConfirmTitle()}
        description={
          target
            ? LL.internalPanel.companies.detail.mqttCredentialsConfirmDescription({
                licensePlate: target.licensePlate,
              })
            : ''
        }
        confirmLabel={LL.internalPanel.companies.detail.mqttCredentialsConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        loading={mutation.isPending}
        loadingLabel={LL.internalPanel.companies.detail.mqttCredentialsProvisioning()}
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
            ? LL.internalPanel.companies.detail.mqttCredentialsRotatedTitle()
            : LL.internalPanel.companies.detail.mqttCredentialsProvisionedTitle()
        }
        description={LL.internalPanel.companies.detail.mqttCredentialsOnceWarning()}
        onClose={onCloseCredentials}
        footer={
          <Button
            type="button"
            className="h-10 w-full sm:w-auto sm:px-6"
            onClick={onCloseCredentials}
          >
            {LL.internalPanel.companies.detail.mqttCredentialsDismiss()}
          </Button>
        }
      >
        {credentials ? (
          <div className="flex flex-col gap-4">
            <CopyableCredentialField
              label={LL.internalPanel.companies.detail.mqttCredentialsUsername()}
              value={credentials.username}
            />
            <CopyableCredentialField
              label={LL.internalPanel.companies.detail.mqttCredentialsPassword()}
              value={credentials.password}
              type="password"
            />
            <CopyableCredentialField
              label={LL.internalPanel.companies.detail.mqttCredentialsTopic()}
              value={credentials.publishTopic}
            />
            <CopyableCredentialField
              label={LL.internalPanel.companies.detail.mqttCredentialsSubscribeTopic()}
              value={credentials.subscribeTopic}
            />
          </div>
        ) : null}
      </Modal>
    </>
  )
}
