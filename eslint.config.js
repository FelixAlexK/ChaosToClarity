// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  jsx: true,
  basePath: '.',
  formatters: true,
  stylistic: true,
  jsonc: true,
  ignores:
    ['dist/*', 'node_modules/*', 'public/*', './src/components/ui/*', './eslint.config.js'],

  rules: {
    'react/no-comment-textnodes': 'off',
    'react-hooks-extra/no-unnecessary-use-prefix': 'off',
    'react-hooks-extra/prefer-use-state-lazy-initialization': 'off',
    'unused-imports/no-unused-vars': 'warn',
    'node/prefer-global/process': 'off',
    'ts/no-use-before-define': 'warn',
    'react/no-use-context': 'warn'
  },


})