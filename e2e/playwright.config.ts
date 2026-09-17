import { defineConfig, devices } from '@playwright/test';

/**
 * A.14 / SDD T3-7 — Playwright E2E harness (CI-ready).
 *
 * Runs against a REAL dev server with the seeded PGlite database:
 *   npm run dev          # :3000 default — or PORT=3157 for the SDD convention
 *   npm run test:e2e     # this harness
 *
 * The canonical journey under test (critical path #1 → #3):
 *   UI login (password + TOTP devHint) → create SR → convert → WO hold →
 *   reload → state persists (server truth, not client memory).
 *
 * CI: activation follows A.16 (maintainer copies ci/ci.yml → .github/workflows/).
 * The e2e job boots its own server via webServer below — no manual step needed.
 */
const PORT = Number(process.env.E2E_PORT ?? 3157);

export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // one seeded DB; serial execution keeps journeys deterministic
  workers: 1,
  retries: 0, // flake detection: a green harness must pass twice in a row
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: process.env.E2E_NO_SERVER ? undefined : {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
