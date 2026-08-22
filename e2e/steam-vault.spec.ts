import { test, expect } from "@playwright/test";

test.describe("Steam Vault — Multi-User & Guest Authentication E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("should render public welcome landing and allow entering guest mode", async ({ page }) => {
    // Check Welcome Hero
    await expect(page.getByText("Never lose track of which Steam account owns your games.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In with Google/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Try Guest Mode/i })).toBeVisible();

    // Click Guest Mode
    await page.getByRole("button", { name: /Try Guest Mode/i }).click();

    // Should enter Steam Vault UI
    await expect(page.getByText("Your Steam Library is Ready")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add First Game" })).toBeVisible();
  });

  test("should manage accounts and games inside vault session", async ({ page }) => {
    // Enter guest mode
    await page.getByRole("button", { name: /Try Guest Mode/i }).click();

    // 1. Create Steam Account
    await page.getByRole("button", { name: /Accounts \(/i }).first().click();
    await expect(page.getByText("Steam Accounts Manager")).toBeVisible();

    await page.getByRole("button", { name: /Add Another Steam Account/i }).click();
    await page.getByPlaceholder("e.g. Main Account, CS Smurf, Region TUR").fill("Main Steam Account");
    await page.getByPlaceholder("e.g. quraish_prime").fill("quraish_prime");
    await page.getByPlaceholder("Your Steam password").fill("PrimePass2026!");
    await page.getByRole("button", { name: "Add Account" }).click();

    await expect(page.locator(".fixed").getByText("quraish_prime").first()).toBeVisible();
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByText("Steam Accounts Manager")).not.toBeVisible();

    // 2. Add Game with Auto-Fill Info
    await page.getByRole("button", { name: "Add Game" }).click();
    await expect(page.getByText("Add Game to Vault")).toBeVisible();

    const appIdInput = page.getByPlaceholder("e.g. 730, 1091500, 1245620");
    await appIdInput.fill("730");
    await page.getByRole("button", { name: /Auto-Fill Info/i }).click();

    const titleInput = page.getByPlaceholder("e.g. Cyberpunk 2077, Elden Ring, CS2");
    if (!(await titleInput.inputValue())) {
      await titleInput.fill("Counter-Strike 2");
    }

    await page.getByRole("button", { name: "Add to Library" }).click();
    await expect(page.getByText("Add Game to Vault")).not.toBeVisible();

    // 3. Verify in Hero Stage
    await expect(page.getByText("AppID: 730")).toBeVisible();
    await expect(page.getByText("Play / Launch")).toBeVisible();
    await expect(page.locator(".max-w-5xl").getByText("quraish_prime")).toBeVisible();
    await expect(page.getByText("••••••••••••").first()).toBeVisible();

    // 4. Test 1-Click Copy
    const copyBtn = page.getByRole("button", { name: "Copy" }).first();
    await expect(copyBtn).toBeVisible();
  });

  test("should switch to Grid View and view detail drawer", async ({ page }) => {
    // Enter guest mode
    await page.getByRole("button", { name: /Try Guest Mode/i }).click();

    // Create account
    await page.getByRole("button", { name: /Accounts \(/i }).first().click();
    await page.getByRole("button", { name: /Add Another Steam Account/i }).click();
    await page.getByPlaceholder("e.g. Main Account, CS Smurf, Region TUR").fill("Main Account");
    await page.getByPlaceholder("e.g. quraish_prime").fill("my_steam_user");
    await page.getByPlaceholder("Your Steam password").fill("Password123");
    await page.getByRole("button", { name: "Add Account" }).click();
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByText("Steam Accounts Manager")).not.toBeVisible();

    // Create game (single account is auto-selected)
    await page.getByRole("button", { name: "Add Game" }).click();
    await expect(page.getByText("Add Game to Vault")).toBeVisible();

    await page.getByPlaceholder("e.g. Cyberpunk 2077, Elden Ring, CS2").fill("Portal 2");
    await page.getByPlaceholder("e.g. 730, 1091500, 1245620").fill("620");

    await page.getByRole("button", { name: "Add to Library" }).click();
    await expect(page.getByText("Add Game to Vault")).not.toBeVisible();

    // Switch to Grid View
    await page.getByRole("button", { name: /Grid View/i }).click();
    await expect(page.getByText("Portal 2").first()).toBeVisible();

    // Open Drawer in Grid View
    await page.getByText("Portal 2").first().click();
    await expect(page.getByText("Available On (1 Accounts)")).toBeVisible();
    await expect(page.getByText("Launch in Steam")).toBeVisible();
  });
});
