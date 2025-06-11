import { test, chromium } from '@playwright/test';
import ENV from "../utils/env";
import { LoginPage } from '../pages/LoginPage';
import {HomePage} from '../pages/HomePage';

let browser: any;
let page: any;
let loginPage: LoginPage
let homePage: HomePage

test.beforeAll(async () => {
    console.log("Resolved UI_URL:", ENV.UI_URL);
    browser = await chromium.launch();
    const context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
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

test('Verify the UI of the Upper half of the Game Details Page', async () => {
    await homePage.verifyAllCTA();
    await homePage.validateImageElements({ request: page.request });
    await homePage.clickAndVerifyLeftAndRightArrow();
});

