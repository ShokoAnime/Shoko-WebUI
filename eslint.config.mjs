import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import pluginQuery from '@tanstack/eslint-plugin-query';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import reactRefresh from 'eslint-plugin-react-refresh';
import tailwind from 'eslint-plugin-better-tailwindcss';
import tseslint from 'typescript-eslint';

export const projectRoot = path.resolve('.');
export const gitignorePath = path.resolve(projectRoot, '.gitignore');

const jsConfig = [
  // ESLint Recommended Rules
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  // Stylistic Plugin
  plugins.stylistic,
  // Import X Plugin
  plugins.importX,
  // Airbnb Base Recommended Config
  ...configs.base.recommended,
];

const reactConfig = [
  // React Plugin
  plugins.react,
  // React Hooks Plugin
  plugins.reactHooks,
  // React JSX A11y Plugin
  plugins.reactA11y,
  // Airbnb React Recommended Config
  ...configs.react.recommended,
];

const typescriptConfig = [
  // Airbnb Base TypeScript Config
  ...configs.base.typescript,
  // Airbnb React TypeScript Config
  ...configs.react.typescript,
];

const tseslintConfig = [
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
]

export default [
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  // Javascript Config
  ...jsConfig,
  // React Config
  ...reactConfig,
  // TypeScript Config
  ...typescriptConfig,
  ...tseslintConfig,
  ...pluginQuery.configs['flat/recommended'],
  reactRefresh.configs.recommended,
  tailwind.configs.recommended,
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/css/tailwind.css',
      }
    },
    rules: {
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      'better-tailwindcss/no-unknown-classes': ['error', {
        ignore: [
          'login-image-default',
          'metadata-link-icon',
           'react-resizable-handle',
           'scroll-gutter',
           'scroll-no-gutter',
           'AniDB'
        ]
      }]
    }
  },
  {
    plugins: {
      'sort-destructure-keys': sortDestructureKeys,
    },
    rules: {
      'sort-destructure-keys/sort-destructure-keys': 'error',
    },
  },
  {
    rules: {
      '@stylistic/arrow-parens': [
        'error',
        'as-needed',
        { requireForBlockBody: true },
      ],
      '@stylistic/implicit-arrow-linebreak': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/max-len': 'off',
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false,
          },
        },
      ],
      '@stylistic/object-curly-newline': [
        'error',
        { ImportDeclaration: { consistent: true} },
      ],
      '@stylistic/operator-linebreak': [ 'off' ],
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/consistent-type-definitions': [
        'error',
        'type',
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false }
      ],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignorePrimitives: { boolean: true }
        }
      ],
      'func-style': [
        'error',
        'expression',
      ],
      'id-length': [
        'error',
        { min: 3, exceptions: ['cx', 'ID', 'id', '_', '__'], properties: 'never' },
      ],
      'import-x/no-cycle': 'off',
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          pathGroups: [{ 'pattern': 'react*', 'group': 'external', 'position': 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          distinctGroup: false,
          alphabetize: { 'order': 'asc' }
        }
      ],
      'import-x/prefer-default-export': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'no-console': [
        'error',
        { allow: ['warn', 'error'] },
      ],
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['sliceState'],
          ignorePropertyModificationsForRegex: ['^draft']
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          'patterns': [
            { group: ['../*'], message: 'Use @/ instead.' },
            { group: ['usehooks-ts'], importNames: ['useCopyToClipboard'], message: 'Use copyToClipboard from @/core/util instead.' }
          ],
          'paths': [
            { name: 'react-redux', importNames: ['useDispatch'], message: 'Use @/core/store/useDispatch instead.' },
            { name: 'react-redux', importNames: ['useSelector'], message: 'Use @/core/store/useSelector instead.' },
            { name: 'react-router', importNames: ['useNavigate'], message: 'Use @/hooks/useNavigateVoid instead.' },
            { name: 'react-toastify', importNames: ['toast'], message: 'Use @/components/Toast instead.' },
            { name: 'usehooks-ts', importNames: ['useEventCallback'], message: 'Use @/hooks/useEventCallback instead.' }
          ]
        }
      ],
      'no-restricted-syntax': 'off',
      'no-undef': 'error',
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'react/jsx-key': [
        'error',
        { checkFragmentShorthand: true, checkKeyMustBeforeSpread: true }
      ],
      'react/jsx-one-expression-per-line': [
        'error',
        { allow: 'single-child' }
      ],
      'react/jsx-wrap-multilines': [
        'error',
        { prop: 'ignore' }
      ],
      'react/no-unstable-nested-components': [
        'error',
        { allowAsProps: true }
      ],
      'react/require-default-props': 'off',
    },
  },
];
