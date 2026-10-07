import { createPanelViteConfig } from '@fuel-carrier/web-config/vite'

export default createPanelViteConfig({
  port: 5173,
  pwa: {
    name: 'Fuel Carrier Admin',
    shortName: 'FC Admin',
    description: 'Internal admin panel for fuel carrier operations',
    themeColor: '#0d2f33',
    backgroundColor: '#0d2f33',
  },
})
