import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Ignore generated and build files
  {
    ignores: [
      'src/generated/**/*',
      'dist/**/*',
      '*.config.js',
      'node_modules/**/*',
    ],
  },

  // Base ESLint Recommended Rules
  js.configs.recommended,

  // TypeScript-specific Setup
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': ts,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    rules: {
      // Apply TypeScript Recommended Rules
      ...ts.configs.recommended.rules,

      // Custom Rules
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Disable the base rule that conflicts with TS version
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Prefer const over let
      'prefer-const': 'error',
    },
  },

  // Prettier Integration (must be last to override)
  eslintConfigPrettier,
];
