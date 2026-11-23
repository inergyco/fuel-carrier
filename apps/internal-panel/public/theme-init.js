// Blocking classic script. Sets theme and locale before first paint.
// CSP script-src is 'self' only, so this must stay an external file.
;(function () {
  var themeKey = 'fuel-carrier:internal-panel:theme'
  var localeKey = 'fuel-carrier:internal-panel:locale'
  var storedTheme = localStorage.getItem(themeKey)
  var prefersDark = matchMedia('(prefers-color-scheme:dark)').matches
  var isDark =
    storedTheme === 'dark' ||
    ((!storedTheme || storedTheme === 'system') && prefersDark)

  document.documentElement.setAttribute(
    'data-theme',
    isDark ? 'internal-dark' : 'internal-light',
  )

  var storedLocale = localStorage.getItem(localeKey)
  var locale =
    storedLocale ||
    (navigator.language.toLowerCase().indexOf('en') === 0 ? 'en' : 'fa')

  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr'
})()
