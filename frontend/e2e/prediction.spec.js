import { test, expect } from '@playwright/test';

test.describe('Clinical Interaction Analysis Protocol', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => { window.localStorage.setItem('auth_token', 'fake_token'); });
    });

    test('should execute full-chain interaction check for major risks', async ({ page }) => {
        await page.goto('/check');

        // Mock Search Results for Sequencing
        await page.route('**/api/v1/drugs/search*', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify([{ id: 'd1', name: 'Warfarin' }, { id: 'd2', name: 'Aspirin' }]) });
        });

        // Mock Prediction Outcome
        await page.route('**/api/v1/predictions/check', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    id: 'p99',
                    overall_risk_level: 'MAJOR',
                    pair_results: [{ drug_a_name: 'Warfarin', drug_b_name: 'Aspirin', severity: 'MAJOR', synergy_score: 0.92 }]
                })
            });
        });

        // 1. Stage Molecules
        const searchInput = page.locator('input[placeholder*="Add drug"]');
        await searchInput.fill('War');
        await page.click('text=Warfarin');
        await searchInput.fill('Asp');
        await page.click('text=Aspirin');

        // 2. Validate Submit Button Enablement
        const submitBtn = page.locator('button:has-text("Execute AI Audit")');
        await expect(submitBtn).toBeEnabled();

        // 3. Trigger AI Inference
        await submitBtn.click();

        // 4. Verify Clinical Alerts
        await expect(page.locator('text=MAJOR RISK DETECTED')).toBeVisible();
        await expect(page.locator('text=92% Potency')).toBeVisible();
        await expect(page.locator('.risk-badge-red')).toBeVisible();
    });

})
