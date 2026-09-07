import { test, expect } from "@playwright/test";

test.describe("Steam Vault — Multi-User, Guest Auth, DLC Checklist & Library Valuation E2E Tests", () => {
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

  test("should manage accounts, add game with auto-calculated DLC checklist, and verify library valuation", async ({ page }) => {
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

    // 2. Add Game with Pricing & DLCs
    await page.getByRole("button", { name: "Add Game" }).click();
    await expect(page.getByText("Add Game to Vault")).toBeVisible();

    const titleInput = page.getByPlaceholder("e.g. Cyberpunk 2077, Elden Ring, CS2");
    await titleInput.fill("Cyberpunk 2077");

    const appIdInput = page.getByPlaceholder("e.g. 730, 1091500, 1245620");
    await appIdInput.fill("1091500");

    // Input Base Game Price: 700000 IDR
    const priceInput = page.getByPlaceholder("e.g. 759000");
    await priceInput.fill("700000");

    // Enable DLCs & Input DLC Price: 350000 IDR
    await page.getByText("Includes DLCs / Expansion Packs").click();
    const dlcInput = page.getByPlaceholder("e.g. 450000");
    await dlcInput.fill("350000");

    await page.getByRole("button", { name: "Add to Library" }).click();
    await expect(page.getByText("Add Game to Vault")).not.toBeVisible();

    // 3. Verify in Hero Stage: Game title, Play button, DLC tag & pricing
    await expect(page.getByRole("heading", { name: "Cyberpunk 2077" })).toBeVisible();
    await expect(page.getByText("+ DLCs")).toBeVisible();
    await expect(page.locator(".max-w-5xl").getByText("quraish_prime")).toBeVisible();

    // 4. Verify Library Valuation in Header & Sidebar
    await expect(page.locator("header").getByText(/1\.050\.000/)).toBeVisible();
    await expect(page.locator("aside").getByText(/1\.050\.000/).first()).toBeVisible();

    // 5. Test Currency Toggle (Switch to USD)
    await page.locator("header").getByText(/1\.050\.000/).click();
    // 1,050,000 IDR / 16,000 = ~$65.63
    await expect(page.locator("header").getByText(/65\.63/)).toBeVisible();
  });

  test("should switch to Grid View and view detail drawer with pricing", async ({ page }) => {
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

    // Create free game
    await page.getByRole("button", { name: "Add Game" }).click();
    await expect(page.getByText("Add Game to Vault")).toBeVisible();

    await page.getByPlaceholder("e.g. Cyberpunk 2077, Elden Ring, CS2").fill("Dota 2");
    await page.getByPlaceholder("e.g. 730, 1091500, 1245620").fill("570");
    await page.getByText("Free to Play").click();

    await page.getByRole("button", { name: "Add to Library" }).click();
    await expect(page.getByText("Add Game to Vault")).not.toBeVisible();

    // Switch to Grid View
    await page.getByRole("button", { name: /Grid View/i }).click();
    await expect(page.getByText("Dota 2").first()).toBeVisible();

    // Open Drawer in Grid View
    await page.getByText("Dota 2").first().click();
    await expect(page.getByText("Available On (1 Accounts)")).toBeVisible();
    await expect(page.locator(".fixed").getByText("Free").first()).toBeVisible();
    await expect(page.getByText("Launch in Steam")).toBeVisible();
  });
});
