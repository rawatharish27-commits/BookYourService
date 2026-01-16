module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // ============================================
    // HARD FAIL RULE: JSX FILE EXTENSION (PRODUCTION-KILLER)
    // ============================================
    // Purpose: Prevent future "esbuild JSX parse error" (ProtectedRoute.ts issue).
    // Stack: ESLint + React Plugin.
    // Type: Production-Grade (Strict Enforcement).
    // 
    // IMPORTANT:
    // 1. Rule: react/jsx-filename-extension.
    // 2. Level: 'error' (HARD FAIL).
    // 3. Extensions: ['.tsx', '.jsx'] ONLY.
    // 4. Effect: If ANY JSX is found in a `.ts` file, Linter FAILS the build.
    // 5. This stops "esbuild" from crashing (Stream Error) because it detects JSX in `.ts` early.
    // ============================================

    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.tsx', '.jsx'],
        allow: 'as-needed',
      },
    ],
  },
};
