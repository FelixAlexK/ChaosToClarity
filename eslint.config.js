import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'app',

    ignores: [
      'vite.config.*',
      'eslint.config.js',
      './src/components/ui/**',
      './convex/**'
    ],

    gitignore: true,

    stylistic: true,
    formatters: true,

    typescript: true,

    react: true,

    jsonc: true,
    yaml: true,
  }
)