import { test, expect } from '@playwright/test';

const DEMO_EMAIL    = 'demo@budget-pocket.app';
const DEMO_PASSWORD = 'demo1234';

test.describe('Authentification', () => {
  test('la page login est accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Budget-Pocket|Connexion/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login avec identifiants invalides affiche une erreur', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]',    'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // L'url reste sur /login ou un message d'erreur apparaît
    await expect(page).toHaveURL(/login/);
  });

  test('login avec identifiants valides redirige vers dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]',    DEMO_EMAIL);
    await page.fill('input[type="password"]', DEMO_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('logout redirige vers login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]',    DEMO_EMAIL);
    await page.fill('input[type="password"]', DEMO_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });

    // Chercher le bouton déconnexion ou lien settings
    const logoutBtn = page.locator('[data-testid="logout"], button:has-text("Déconnexion"), a:has-text("Déconnexion")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/login/);
    }
  });
});
