import { test, expect } from '@playwright/test';

test.describe('Clinical Authentication Cluster', () => {

    test('should redirect unauthenticated users to identity entry point', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*login/);
        await expect(page.locator('text=Secure Clinical Access')).toBeVisible();
    });

    test('should simulate successful clinical handshake', async ({ page }) => {
        // Intercept OIDC callback
        await page.route('**/api/v1/auth/google', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: 'mock_jwt_auth_token',
                    user: { id: 'user1', name: 'Dr. Test Analyst', email: 'test@clinical.io', role: 'USER' }
                })
            });
        });

        await page.goto('/login');
        
        // Mocking the Google trigger (simplified for E2E logic)
        await page.evaluate(() => {
            localStorage.setItem('auth_token', 'mock_jwt_auth_token');
            localStorage.setItem('user', JSON.stringify({ name: 'Dr. Test Analyst' }));
            window.location.href = '/dashboard';
        });

        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.locator('text=Welcome back, Dr. Test Analyst')).toBeVisible();
    });

})
