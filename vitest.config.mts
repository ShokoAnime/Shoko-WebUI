import path from 'path';

import { defineConfig } from 'vitest/config';

// Standalone config - intentionally does NOT reuse vite.config.mjs, which runs
// git and writes public/version.json as a side effect on load.
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(import.meta.dirname, 'src') },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
