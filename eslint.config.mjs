import prettierRecommended from 'eslint-plugin-prettier/recommended';
import perfectionist from 'eslint-plugin-perfectionist';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**']
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierRecommended,
  perfectionist.configs['recommended-line-length'],
  unicorn.configs['recommended'],
  {
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-module': 'off'
    }
  }
);
