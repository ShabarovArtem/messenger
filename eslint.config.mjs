import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.js',
      'logs/**',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unsafe-*': 'off',
    },
  },
  prettier,
];
