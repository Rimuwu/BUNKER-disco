import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    include: ['tests/e2e/**/*.test.ts'],
    alias: {
      '@helpers': path.resolve(__dirname, 'helpers'),
    },
    reporters: ['default'],
  },
});
