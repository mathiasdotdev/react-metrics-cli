import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // 1. Fichiers JS (Le socle de base)
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        // Ajout des variables globales de Bun (comme `Bun`, `fetch`, etc.)
        fetch: 'readonly',
        Bun: 'readonly',
      },
      sourceType: 'module',
    },
    // Inclut les règles recommandées de base (JavaScript)
    extends: [js.configs.recommended],
  },

  // 2. Fichiers TypeScript/TSX (Le cœur de votre projet)
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    // Configure le parseur TypeScript pour les fichiers TS/TSX
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.prod.json'],
        ecmaFeatures: {
          jsx: true,
        },
      },
      // S'assure que l'environnement Node est toujours défini pour ces fichiers
      globals: {
        ...globals.node,
        fetch: 'readonly',
        Bun: 'readonly',
      },
    },
    // Règles spécifiques TS (Optionnel : pour surcharger ou ajouter des règles)
    rules: {
      // Désactive des règles qui seraient gérées par le linter de TypeScript
      // car le compilateur est plus efficace pour cela.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // D'autres règles TS...
    },
  },
]);
