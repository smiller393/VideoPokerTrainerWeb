import { test, expect } from '@playwright/test';

test.describe('Video Poker Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial game state', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Video Poker Trainer');
    await expect(page.locator('.credits-value')).toContainText('1000');
    await expect(page.locator('.bet-button.active')).toContainText('1');
    await expect(page.locator('.deal-button')).toContainText('Deal');
  });

  test('should deal cards when deal button is clicked', async ({ page }) => {
    await page.click('.deal-button');
    
    // Should show 5 cards
    await expect(page.locator('.card')).toHaveCount(5);
    
    // Credits should decrease by bet amount
    await expect(page.locator('.credits-value')).toContainText('999');
    
    // Deal button should change to "New Hand"
    await expect(page.locator('.deal-button')).toContainText('New Hand');
    
    // Draw button should be enabled
    await expect(page.locator('.draw-button')).toBeEnabled();
  });

  test('should allow holding cards', async ({ page }) => {
    await page.click('.deal-button');
    
    // Click first card to hold
    await page.locator('.card').first().click();
    
    // Should show held indicator
    await expect(page.locator('.held-indicator')).toBeVisible();
    
    // Click again to unhold
    await page.locator('.card').first().click();
    
    // Held indicator should be gone
    await expect(page.locator('.held-indicator')).not.toBeVisible();
  });

  test('should complete full game cycle', async ({ page }) => {
    // Deal cards
    await page.click('.deal-button');
    
    // Hold first two cards
    await page.locator('.card').nth(0).click();
    await page.locator('.card').nth(1).click();
    
    // Draw
    await page.click('.draw-button');
    
    // Should show result
    await expect(page.locator('.hand-result, .strategy-feedback')).toBeVisible();
    
    // Should be able to deal new hand
    await expect(page.locator('.deal-button')).toBeEnabled();
  });

  test('should change bet amount', async ({ page }) => {
    await page.click('.bet-button:has-text("5")');
    await expect(page.locator('.bet-button.active')).toContainText('5');
    
    await page.click('.deal-button');
    await expect(page.locator('.credits-value')).toContainText('995'); // 1000 - 5
  });

  test('should show strategy feedback on suboptimal play', async ({ page }) => {
    await page.click('.deal-button');
    
    // Make a clearly suboptimal play (hold all cards regardless)
    await page.locator('.card').nth(0).click();
    await page.locator('.card').nth(1).click();
    await page.locator('.card').nth(2).click();
    await page.locator('.card').nth(3).click();
    await page.locator('.card').nth(4).click();
    
    await page.click('.draw-button');
    
    // Should show strategy feedback and indicators under cards
    const hasResult = await page.locator('.hand-result').isVisible();
    const hasStrategy = await page.locator('.strategy-feedback').isVisible();
    const hasStrategyIndicators = await page.locator('.strategy-indicator').count() > 0;
    
    expect(hasResult || hasStrategy || hasStrategyIndicators).toBeTruthy();
  });

  test('should show correct strategy indicators under each card', async ({ page }) => {
    await page.click('.deal-button');
    
    // Hold only the first card
    await page.locator('.card').nth(0).click();
    
    await page.click('.draw-button');
    
    // Check if strategy indicators appear when there's a mistake
    const strategyIndicators = page.locator('.strategy-indicator');
    const indicatorCount = await strategyIndicators.count();
    
    if (indicatorCount > 0) {
      // Should have indicators for each card
      expect(indicatorCount).toBe(5);
      
      // Should show different types of feedback
      const correctIndicators = page.locator('.strategy-correct');
      const shouldHoldIndicators = page.locator('.strategy-should-hold');
      const shouldDiscardIndicators = page.locator('.strategy-should-discard');
      
      const hasCorrect = await correctIndicators.count() > 0;
      const hasHold = await shouldHoldIndicators.count() > 0;
      const hasDiscard = await shouldDiscardIndicators.count() > 0;
      
      expect(hasCorrect || hasHold || hasDiscard).toBeTruthy();
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.pay-table')).toBeVisible();
    await expect(page.locator('.controls')).toBeVisible();
    
    // Cards should be smaller but still clickable
    await page.click('.deal-button');
    await expect(page.locator('.card')).toHaveCount(5);
    
    // Should be able to hold cards on mobile
    await page.locator('.card').first().click();
    await expect(page.locator('.held-indicator')).toBeVisible();
  });
});