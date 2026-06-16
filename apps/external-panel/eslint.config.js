import { createReactViteEslintConfig } from '@fuel-carrier/web-config/eslint'

export default createReactViteEslintConfig({
  tsconfigRootDir: import.meta.dirname,
})
