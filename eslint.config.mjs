import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

// Flat config (ESLint 9). Baseline for a previously-unlinted React 19 + TS
// codebase: structural rules (rules-of-hooks, jsx-key) are errors; type/style
// noise is downgraded to warn so `yarn lint` gives signal without a wall of
// errors. Tighten incrementally.
export default tseslint.config(
  { ignores: ['build/**', 'dist/**', 'node_modules/**', 'eslint.config.mjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      // TS compiler handles undefined identifiers + browser globals.
      'no-undef': 'off',
      // Deliberate error-swallowing catches (e.g. optional destructuring).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // react-jsx runtime: no React import needed; TS covers prop types.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Structural correctness — keep as error.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // High-frequency noise in a legacy, non-strict codebase — warn for now.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      // Intentional class+interface merging in mobx-state-tree models — not a bug.
      '@typescript-eslint/no-unsafe-declaration-merging': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',
    },
  },
  prettier,
)
