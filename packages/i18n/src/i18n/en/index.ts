import type { BaseTranslation } from '../i18n-types.js'

const en: BaseTranslation = {
  common: {
    switchToLightMode: 'Switch to light mode',
    switchToDarkMode: 'Switch to dark mode',
    switchToEnglish: 'Switch to English',
    switchToPersian: 'Switch to Persian',
    languageEn: 'EN',
    languageFa: 'FA',
  },
  validation: {
    usernameRequired: 'Username is required',
    usernameInvalid:
      'Username must be 3–32 characters and contain only letters, numbers, underscores, and hyphens',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least {min:number} characters',
    passwordUppercase: 'Password must contain at least one uppercase letter',
    passwordLowercase: 'Password must contain at least one lowercase letter',
    passwordDigit: 'Password must contain at least one number',
    passwordSpecial: 'Password must contain at least one special character',
  },
  internalPanel: {
    login: {
      title: 'Internal Panel',
      subtitle: 'Authorized access only',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'your_username',
      invalidCredentials: 'Invalid username or password.',
      signingIn: 'Signing in',
      signIn: 'Sign in',
    },
    home: {
      title: 'Dashboard',
      welcome: 'Welcome back, {firstName:string}',
      signedInAs: 'Signed in as {firstName:string} {lastName:string} ({username:string})',
      signingOut: 'Signing out…',
      signOut: 'Sign out',
    },
    nav: {
      dashboard: 'Dashboard',
      openMenu: 'Open menu',
      signOut: 'Sign out',
      signingOut: 'Signing out…',
    },
    shell: {
      brand: 'Fuel Carrier',
      brandSubtitle: 'Internal',
    },
  },
  externalPanel: {
    home: {
      title: 'External Panel',
      description: 'TanStack Router and React Query are configured.',
    },
  },
}

export default en
