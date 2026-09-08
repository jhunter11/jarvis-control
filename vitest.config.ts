import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.ts', 'clients/acme_corp/automations/**/*.ts'],
      exclude: ['src/gateway/server.ts', 'src/db/types.ts', 'src/**/*-cli.ts'],
      thresholds: {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85
      }
    }
  }
});
