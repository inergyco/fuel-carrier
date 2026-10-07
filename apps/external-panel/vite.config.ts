import { createPanelViteConfig } from '@fuel-carrier/web-config/vite'

export default createPanelViteConfig({
  port: 5174,
  pwa: {
    name: 'Company Portal',
    shortName: 'Company Portal',
    description: 'Company portal for fuel carrier operations',
    themeColor: '#0b1838',
    backgroundColor: '#0b1838',
  },
})
