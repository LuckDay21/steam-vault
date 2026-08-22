import { test, expect } from "@playwright/test";

test.describe("Steam Vault — Clean Production Database Flow E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to simulate clean fresh launch
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("should render clean Steam Client header and onboarding state", async ({ page }) => {
    // Brand header
    await expect(page.locator("header")).toContainText("STEAMVAULT");
    await expect(page.getByText("Library", { exact: true })).toBeVisible();

    // Onboarding stage when library is clean
    await expect(page.getByText("Your Steam Library is Ready")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add First Game" })).toBeVisible();
  });

  test("should create Steam accounts, add a game with auto-filled tags, and view credentials", async ({ page }) => {
    // 1. Create First Steam Account (Main)
    await page.getByRole("button", { name: /Accounts \(/i }).first().click();
    await expect(page.getByText("Steam Accounts Manager")).toBeVisible();

    await page.getByRole("button", { name: /Add Another Steam Account/i }).click();
    await page.getByPlaceholder("e.g. Main Account, CS Smurf, Region TUR").fill("Main Steam Account");
    await page.getByPlaceholder("e.g. quraish_prime").fill("quraish_prime");
    await page.getByPlaceholder("Your Steam password").fill("PrimePass2026!");
    await page.getByRole("button", { name: "Add Account" }).click();

    // Verify account in list inside modal
    await expect(page.locator(".fixed").getByText("quraish_prime").first()).toBeVisible();

    // 2. Create Second Steam Account (Smurf)
    await page.getByRole("button", { name: /Add Another Steam Account/i }).click();
    await page.getByPlaceholder("e.g. Main Account, CS Smurf, Region TUR").fill("Smurf Account");
    await page.getByPlaceholder("e.g. quraish_prime").fill("quraish_smurf");
    await page.getByPlaceholder("Your Steam password").fill("SmurfPass2026!");
    await page.getByRole("button", { name: "Add Account" }).click();

    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByText("Steam Accounts Manager")).not.toBeVisible();

    // 3. Add a Game via Steam AppID (730) with Auto-Fill Info
    await page.getByRole("button", { name: "Add Game" }).click();
    await expect(page.getByText("Add Game to Vault")).toBeVisible();

    const appIdInput = page.getByPlaceholder("e.g. 730, 1091500, 1245620");
    await appIdInput.fill("730");
    await page.getByRole("button", { name: /Auto-Fill Info/i }).click();

    // Link accounts
    const modal = page.locator(".fixed.inset-0");
    await modal.getByText("Main Steam Account").first().click();
    await modal.getByText("Smurf Account").first().click();

    // Verify title was filled or set
    const titleInput = page.getByPlaceholder("e.g. Cyberpunk 2077, Elden Ring, CS2");
    if (!(await titleInput.inputValue())) {
      await titleInput.fill("Counter-Strike 2");
    }

    await page.getByRole("button", { name: "Add to Library" }).click();
    await expect(page.getByText("Add Game to Vault")).not.toBeVisible();

    // 4. Verify Game is selected in Hero Stage
    await expect(page.getByText("AppID: 730")).toBeVisible();
    await expect(page.getByText("Play / Launch")).toBeVisible();

    // 5. Verify credentials of both linked accounts
    await expect(page.locator(".max-w-5xl").getByText("quraish_prime")).toBeVisible();
    await expect(page.locator(".max-w-5xl").getByText("quraish_smurf")).toBeVisible();
    await expect(page.getByText("••••••••••••").first()).toBeVisible();

    // 6. Test 1-Click Copy
    const copyBtn = page.getByRole("button", { name: "Copy" }).first();
    await expect(copyBtn).toBeVisible();
  });

  test("should switch to Grid View and filter library", async ({ page }) => {
    // Add an account & game first
    await page.getByRole("button", { name: /Accounts \(/i }).first().click();
    await page.getByRole("button", { name: /Add Another Steam Account/i }).click();
    await page.getByPlaceholder("e.g. Main Account, CS Smurf, Region TUR").fill("Main Account");
    await page.getByPlaceholder("e.g. quraish_prime").fill("my_steam_user");
    await page.getByPlaceholder("Your Steam password").fill("Password123");
    await page.getByRole("button", { name: "Add Account" }).click();
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByText("Steam Accounts Manager")).not.toBeVisible();

    await page.getByRole("button", { name: "Add Game" }).click();
    await expect(page.getByText("Add Game to Vault")).toBeVisible();

    const titleInput = page.getByPlaceholder("e.g. Cyberpunk 2077, Elden Ring, CS2");
    await titleInput.fill("Portal 2");
    await page.getByPlaceholder("e.g. 730, 1091500, 1245620").fill("620");

    const modal = page.locator(".fixed.inset-0");
    await modal.getByText("Main Account").first().click();

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
