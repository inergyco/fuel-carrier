import { createFileRoute, redirect } from '@tanstack/react-router'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { SettingsPage } from '../../components/settings/SettingsPage'

export const Route = createFileRoute('/_authenticated/settings')({
  beforeLoad: function requireCompanyAdmin({ context }) {
    if (!isCompanyUserAdmin(context.user)) {
      throw redirect({ to: '/' })
    }
  },
  component: SettingsRoutePage,
})

function SettingsRoutePage() {
  return <SettingsPage />
}
