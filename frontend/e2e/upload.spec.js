import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Prescription Digitization Pipeline', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => { window.localStorage.setItem('auth_token', 'fake_token'); });
    });

    test('should process clinical document and extract molecular identities', async ({ page }) => {
        await page.goto('/upload');

        // Mock Capture and AI OCR
        await page.route('**/api/v1/upload/prescription', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ upload_id: 'up321', ocr_status: 'processing' }) });
        });

        await page.route('**/api/v1/upload/up321/status', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ 
                    ocr_status: 'completed', 
                    extracted_drugs: ['Metformin', 'Lisinopril'],
                    confidence_scores: { 'Metformin': 0.98, 'Lisinopril': 0.92 }
                })
            });
        });

        // 1. Asset Upload
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('text=Drop files here');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(path.join(__dirname, 'mocks/sample_rx.jpg'));

        // 2. Monitor AI Progress Sequence
        await expect(page.locator('text=Analyzing Molecular Pattern')).toBeVisible();
        
        // 3. Verify Entity Extraction
        await expect(page.locator('text=Metformin')).toBeVisible();
        await expect(page.locator('text=98% Confidence')).toBeVisible();
        await expect(page.locator('text=Lisinopril')).toBeVisible();
    });

})
