export {
  CompanyDashboard,
  type CompanyDashboardProps,
} from './CompanyDashboard'
export {
  DashboardModeSwitcher,
  DASHBOARD_MODES,
  type DashboardMode,
  type DashboardModeSwitcherProps,
} from './DashboardModeSwitcher'
export type {
  CompanyDashboardDataSource,
  CompanyDashboardLabels,
  CompanyDashboardLinkRenderers,
  CompanyDashboardListParams,
} from './CompanyDashboard.types'
export { DashboardCarCard, type DashboardCarCardProps } from './car-card'
export { FleetStatsBar } from './FleetStatsBar'
export { FleetStatsSection } from './FleetStatsSection'
export { FuelLevelRingChart } from './FuelLevelRingChart'
export { FuelLevelRingSection } from './FuelLevelRingSection'
export { DashboardCarsSection } from './DashboardCarsSection'

/** Shared class for the car-card details CTA (apps wrap their router Link with this). */
export const dashboardCarDetailsLinkClassName =
  'inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-content transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
