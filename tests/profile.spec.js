const { test, expect } = require("@playwright/test");

test("login and profile test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.click("text=Login");

  await expect(page).toHaveURL("http://localhost:3000/user/signin");
  await expect(page.locator("h2")).toContainText("Login");

  await page.fill('input[name="email"]', "jakubopyd@gmail.com");
  await page.fill('input[name="password"]', "zaq12wsx");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("http://localhost:3000/");
  await page.click("text=Profile");
  await expect(page).toHaveURL("http://localhost:3000/user/profile");
  await expect(page.locator("h1")).toContainText("Your Profile");
});
