const { test, expect } = require('@playwright/test');
test('has link do login page', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.click("text=Login");
  expect(page).toHaveURL('http://localhost:3000/user/signin');
  await expect(page.locator('h2')).toContainText('Login');
});