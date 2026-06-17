import type { Translation } from '../i18n-types.js'

const fa: Translation = {
  common: {
    switchToLightMode: 'تغییر به حالت روشن',
    switchToDarkMode: 'تغییر به حالت تیره',
    switchToEnglish: 'تغییر به انگلیسی',
    switchToPersian: 'تغییر به فارسی',
    languageEn: 'EN',
    languageFa: 'FA',
  },
  validation: {
    usernameRequired: 'نام کاربری الزامی است',
    usernameInvalid:
      'نام کاربری باید ۳ تا ۳۲ کاراکتر باشد و فقط شامل حروف، اعداد، زیرخط و خط تیره باشد',
    passwordRequired: 'رمز عبور الزامی است',
    passwordMinLength: 'رمز عبور باید حداقل {min} کاراکتر باشد',
    passwordUppercase: 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد',
    passwordLowercase: 'رمز عبور باید حداقل یک حرف کوچک داشته باشد',
    passwordDigit: 'رمز عبور باید حداقل یک عدد داشته باشد',
    passwordSpecial: 'رمز عبور باید حداقل یک کاراکتر ویژه داشته باشد',
  },
  internalPanel: {
    login: {
      title: 'پنل داخلی',
      subtitle: 'فقط برای دسترسی مجاز',
      username: 'نام کاربری',
      password: 'رمز عبور',
      usernamePlaceholder: 'نام_کاربری',
      invalidCredentials: 'نام کاربری یا رمز عبور نامعتبر است.',
      signingIn: 'در حال ورود',
      signIn: 'ورود',
    },
    home: {
      title: 'داشبورد',
      welcome: 'خوش آمدید، {firstName}',
      signedInAs: 'وارد شده به عنوان {firstName} {lastName} ({username})',
      signingOut: 'در حال خروج…',
      signOut: 'خروج',
    },
    nav: {
      dashboard: 'داشبورد',
      openMenu: 'باز کردن منو',
      signOut: 'خروج',
      signingOut: 'در حال خروج…',
    },
    shell: {
      brand: 'Fuel Carrier',
      brandSubtitle: 'داخلی',
    },
  },
  externalPanel: {
    home: {
      title: 'پنل خارجی',
      description: 'TanStack Router و React Query پیکربندی شده‌اند.',
    },
  },
}

export default fa
