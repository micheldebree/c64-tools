/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended','plugin:@typescript-eslint/recommended-type-checked','prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint','prettier'],
  root: true,
  rules: {
    'prettier/prettier': 2
  }
}
