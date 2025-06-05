import { test, chromium } from '@playwright/test';
import ENV from "../utils/env";
import { LoginPage } from '../pages/LoginPage';

let browser: any;
let page: any;
let loginPage: LoginPage
test('User can login successfully', async () => {
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
    await loginPage.validateImageElements();
    await page.waitForTimeout(5000);
});

test('Verify My Portrait card titles', async () => {
    await loginPage.verifySectionCardTitles({ request: page.request });
//   await loginPage.verifySectionCardTitles('My Library', [
//     'Grand Theft Auto V',
//     'Horizon Forbidden West'
//   ]);
//   await loginPage.verifySectionCardTitles('OnePlay', [
//     'Horizon Forbidden West',
//     'Banishers: Ghosts of New Eden',
//     `Dragon's Dogma: Dark Arisen`,
//     'Lies of P',
//     'Overwatch 2 A while back I needed to count the amount of letters that a piece of text in an email template had (to avoid passing any character limits). Unfortunately, I could not think of a quick way to do so on my macbook and I therefore turned to the Internet.There were a',
//     'Stumble Guys'
//   ]);
//   await loginPage.verifySectionCardTitles('The Battle Royale We Love', [
//     'Apex Legends',
//     `PlayerUnknown’s Battlegrounds`,
//     'Among Us game from OnePlay app Among Us game from OnePlay app Among Us game from OnePlay app Among Us game from OnePlay app',
//     'Counter-Strike 2'
//   ]);
//   await loginPage.verifySectionCardTitles('Speed We Love The Battle Royal', [
//     'Banishers: Ghosts of New Eden'
//   ]);
//   await loginPage.verifySectionCardTitles('square', [
//     'Rocket League',
//     'The Witcher 3: Wild Hunt',
//     'PlayerUnknown’s Battlegrounds',
//     'TEKKEN 7',
//     'Fall Guys: Ultimate Knockout',
//     'Dave the Diver',
//     'Hades',
//     'Overwatch 2 A while back I needed to count the amount of letters that a piece of text in an email template had (to avoid passing any character limits). Unfortunately, I could not think of a quick way to do so on my macbook and I therefore turned to the Internet.There were a',
//     `Dragon's Dogma: Dark Arisen`,
//     'Lies of P',
//     'Battlefield V is the sixteenth game in its franchise Battlefield V is 222',
//     'Cyberpunk 2077',
//     'Far Cry 6',
//     'Destiny 2',
//     'God of War',
//     'Banishers: Ghosts of New Eden',
//     'Apex Legends',
//     'Among Us game from OnePlay app Among Us game from OnePlay app Among Us game from OnePlay app Among Us game from OnePlay app',
//     'Atomic Heart',
//     'Control test1 game OnePlay Cloud Gaming is an Android app developed by OnePlayWorld. It falls under the Lifestyle category and is available for free. The app lets you stream your favorite games without the need for owning any hardware Reliance Jio to Launch Cloud Gaming Service in India For Games Like GTA 5! JioGames',
//     'Stumble Guys',
//     'Counter-Strike 2',
//     'Lethal Company',
//     'Horizon Forbidden West',
//     'Grand Theft Auto V'
//   ]);
//   await loginPage.verifySectionCardTitles('Lethal', [
//     'Lethal Company'
//   ]);

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

