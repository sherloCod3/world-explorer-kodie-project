/**
 * Configuração do ESLint (flat config).
 *
 * Padrões validados:
 * - Regras recomendadas do JavaScript e do TypeScript
 * - Regras de React Hooks (dependências de efeitos e ordem das chamadas)
 * - Regra de React Refresh para o hot reload do Vite funcionar
 *
 * Pastas geradas são ignoradas: build (dist), dependências (node_modules)
 * e relatórios de teste (.vitest).
 */

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.vitest', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    // Os presets dos plugins são no formato antigo; os plugins são registrados
    // aqui e as regras são habilitadas explicitamente (formato flat config).
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
    },
  },
);
