import { expect, test, type Page } from '@playwright/test';

/**
 * SDD T3-7 (A.14): canonical critical journey, end-to-end against the real
 * server + seeded DB. Login is driven through the REAL UI (devHint TOTP);
 * mutations go through the app's real API routes with the browser session
 * cookie (same server, same auth, same persistence rules) — then the result
 * is asserted through the REAL UI after a hard reload.
 *
 * Journey: login → create SR → convert → WO hold → reload asserts ON_HOLD.
 */

const SEED_EMAIL = 'm.vance@apexops.io';
const SEED_PASSWORD = 'demo-pass-4821';

async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('#lf-email', SEED_EMAIL);
  await page.fill('#lf-pass', SEED_PASSWORD);
  await page.getByRole('button', { name: 'Continue' }).click();

  // MFA step — the dev hint renders the current TOTP (dev-only, disabled in prod).
  const hint = page.getByTestId('dev-hint');
  await expect(hint).toBeVisible();
  const code = (await hint.textContent())?.match(/\b(\d{6})\b/)?.[1];
  expect(code, 'devHint must expose a 6-digit TOTP in dev').toBeTruthy();
  await page.fill('#lf-mfa', code!);
  await page.getByRole('button', { name: /Verify|Sign in|Continue/ }).click();

  // Session established → redirected into the ops shell.
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20_000 });
}

test('critical journey: login → create SR → convert → WO hold → persists across reload', async ({ page }) => {
  await login(page);

  // 1. Create a service request through the real API (browser session cookie).
  const srTitle = `E2E journey ${Date.now()}`;
  const srRes = await page.request.post('/api/service-requests', {
    data: { title: srTitle, requesterName: 'E2E Harness', priority: 'P2' },
  });
  expect(srRes.status(), 'SR create must succeed').toBe(201);
  const sr = (await srRes.json()) as { data?: { number?: string } };
  const srNumber = sr.data?.number;
  expect(srNumber, 'SR number returned').toBeTruthy();

  // 2. Convert → real WO in the same transaction.
  const convRes = await page.request.post(`/api/service-requests/${srNumber}/transitions`, {
    data: { action: 'convert' },
  });
  expect(convRes.status(), 'SR convert must succeed').toBe(200);
  const conv = (await convRes.json()) as { data?: { convertedWoNumber?: string | null } };
  const woNumber = conv.data?.convertedWoNumber;
  expect(woNumber, 'convert returns the new WO number').toBeTruthy();

  // 3. Hold the WO (state machine: OPEN → ON_HOLD, reason required).
  const holdRes = await page.request.post(`/api/work-orders/${woNumber}/transitions`, {
    data: { action: 'hold', reason: 'E2E harness hold probe' },
  });
  expect(holdRes.status(), 'WO hold must succeed').toBe(200);

  // 4. Hard reload the real dossier UI → server truth shows ON_HOLD.
  await page.goto(`/work-orders/${woNumber}`);
  await expect(page.getByText('ON_HOLD').first()).toBeVisible();

  await page.reload();
  await expect(page.getByText('ON_HOLD').first()).toBeVisible();

  // 5. The SR row is CONVERTED — one-time conversion (double-convert → 409).
  const dblRes = await page.request.post(`/api/service-requests/${srNumber}/transitions`, {
    data: { action: 'convert' },
  });
  expect(dblRes.status(), 'double-convert must be rejected 409').toBe(409);
});
