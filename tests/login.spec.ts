import { test, chromium } from '@playwright/test';
import ENV from "../utils/env";
import { LoginPage } from '../pages/LoginPage';

let browser: any;
let page: any;
let loginPage: LoginPage

test.beforeAll(async () => {
    console.log("Resolved UI_URL:", ENV.UI_URL);
    browser = await chromium.launch();
    const context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);
    await page.goto(`${ENV.UI_URL}`);
    await loginPage.verifyBannerPopup();
    await loginPage.login();
    await page.waitForTimeout(3000);
    await loginPage.verifyBannerPopup();
});

test.afterAll(async () => {
  await page.close();
  await browser.close();
});

test('User can login successfully', async () => {
    await loginPage.validateImageElements();
    await page.waitForTimeout(5000);
});

test('Verify My Portrait card titles', async () => {
    await loginPage.verifySectionCardTitles({ request: page.request });
});

test('Verify Special Banner Collection card titles', async () => {
    await loginPage.verifySpecialBannerCollectionCardTitles({ request: page.request });
});

test('Verify Square Category large card titles', async () => {
    await loginPage.verifySquareCategoryLargeCardTitles({ request: page.request });
});

test('Verify Square Category small card titles', async () => {
    await loginPage.verifySquareCategorySmallCardTitles({ request: page.request });
});

test('Verify Portrait Category card titles', async () => {
    await loginPage.verifyPortraitCategoryCardTitles({ request: page.request });
});

test('Verify Landscape video card titles', async () => {
    await loginPage.verifyLandscapeVideoCardTitles({ request: page.request });
});

