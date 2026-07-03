import { test, expect, Page } from '@playwright/test';

const DEMO_EMAIL    = 'demo@budget-pocket.app';
const DEMO_PASSWORD = 'demo1234';

async function loginAs(page: Page, email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  await page.goto('/login');
  await page.fill('input[type="email"]',    email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 15_000 });
}

test.describe('Golden path — Transaction', () => {
  test('ajouter une dépense et la voir dans la liste', async ({ page }) => {
    await loginAs(page);

    // Naviguer vers les dépenses
    await page.goto('/expenses');
    await expect(page).toHaveURL(/expenses/);

    // Cliquer "Nouvelle transaction" ou le bouton "+"
    const newBtn = page.locator('button:has-text("Nouvelle"), a:has-text("Nouvelle"), button:has-text("+")').first();
    await newBtn.click();

    // Remplir le formulaire
    await page.fill('input[name="amount"]', '25000');

    // Sélectionner une catégorie si présente
    const foodCat = page.locator('button:has-text("Alimentation"), [data-value="FOOD"]').first();
    if (await foodCat.isVisible()) await foodCat.click();

    // Description
    const descInput = page.locator('input[name="description"], textarea[name="description"]').first();
    if (await descInput.isVisible()) await descInput.fill('Test E2E Playwright');

    // Soumettre
    const submitBtn = page.locator('button[type="submit"]:has-text("Enregistrer"), button:has-text("Enregistrer")').first();
    await submitBtn.click();

    // Vérifier la transaction est visible
    await expect(page.locator('text=25 000').or(page.locator('text=25000'))).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Dashboard', () => {
  test('le dashboard affiche les KPIs du mois', async ({ page }) => {
    await loginAs(page);
    await expect(page.locator('text=/revenus|dépenses|épargne/i').first()).toBeVisible();
  });

  test('la page analyse charge sans erreur', async ({ page }) => {
    await loginAs(page);
    await page.goto('/analysis');
    await expect(page).not.toHaveURL(/error/);
    // Vérifier qu'aucune erreur 500 n'est visible
    const body = await page.textContent('body');
    expect(body).not.toContain('Internal Server Error');
  });
});

test.describe('Budgets', () => {
  test('la page budgets charge correctement', async ({ page }) => {
    await loginAs(page);
    await page.goto('/budgets');
    await expect(page).toHaveURL(/budgets/);
    await expect(page).not.toHaveURL(/error/);
  });
});

test.describe('Settings', () => {
  test('la page paramètres affiche le profil utilisateur', async ({ page }) => {
    await loginAs(page);
    await page.goto('/settings');
    await expect(page.locator('text=/profil|email/i').first()).toBeVisible();
  });

  test('la page billing est accessible', async ({ page }) => {
    await loginAs(page);
    await page.goto('/settings/billing');
    await expect(page.locator('text=/abonnement|plan/i').first()).toBeVisible();
  });
});
