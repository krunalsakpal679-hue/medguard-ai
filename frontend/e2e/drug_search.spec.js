import { test, expect } from '@playwright/test';

test.describe('Molecular Search Surveillance', () => {

    test.beforeEach(async ({ page }) => {
        // Authenticate the session
        await page.addInitScript(() => {
            window.localStorage.setItem('auth_token', 'fake_token');
        });
        
        // Mock molecular search data
        await page.route('**/api/v1/drugs/search*', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify([
                    { id: 'm1', name: 'Sertraline', generic_name: 'Zoloft', drug_class: 'SSRI' },
                    { id: 'm2', name: 'Serotonin', generic_name: '5-HT', drug_class: 'Neurotransmitter' }
                ])
            });
        });
    });

    test('should search and display molecular results after debounce', async ({ page }) => {
        await page.goto('/search');
        const searchInput = page.locator('input[placeholder*="Search"]');
        
        await searchInput.fill('Sert');
        await page.waitForTimeout(600); // Wait for debounce

        await expect(page.locator('text=Sertraline')).toBeVisible();
        await expect(page.locator('text=SSRI')).toBeVisible();
    });

    test('should navigate to deep molecular details', async ({ page }) => {
        await page.goto('/search');
        await page.locator('input[placeholder*="Search"]').fill('Sert');
        await page.waitForTimeout(600);
        
        // Intercept detail route
        await page.route('**/api/v1/drugs/m1', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ name: 'Sertraline', generic_name: 'Zoloft', description: 'Major antidepressant' })
            });
        });

        await page.click('text=View Molecule');
        await expect(page).toHaveURL(/.*detail/);
        await expect(page.locator('text=Pharmacological Profile')).toBeVisible();
    });

})
