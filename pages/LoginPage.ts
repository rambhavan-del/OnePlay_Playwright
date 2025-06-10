// pages/LoginPage.ts
import { Page, expect } from '@playwright/test';
import { ActionHelper } from '../utils/actions';
import { step } from 'allure-js-commons';
import testData from '../tests-data/testData.json'
import ENV from '../utils/env';
import ENDPOINT from '../utils/endpoints';

export class LoginPage {
  constructor(private page: Page) {}

  get offerPopUp() {
    return this.page.locator(`//*[@class='offer-popup']`);
  }

  get rewardsPopUp(){
    return this.page.locator(`#onePlayRewards`);
  }

  get rewardsBannerCloseIcon() {
    return this.page.locator(`//*[@class='close-icon']`);
  }

  get bannerCloseIcon() {
    return this.page.locator(`//*[@class='icon-close']`);
  }

  get loginBtn() {
    return this.page.locator(`//button[normalize-space(text()) = 'Sign In']`);
  }

  get mobileNumberField() {
    return this.page.locator(`//input[@placeholder='Enter your Mobile Number']`);
  }

  get getOtpCTA() {
    return this.page.locator(`//*[normalize-space(text()) = 'Get OTP']`);
  }

  get otpInputField() {
    return this.page.locator(`.otpInputField`);
  }

  get passwordField(){
    return this.page.locator(`//input[@name='password']`);
  }

  get continueCTA(){
    return this.page.locator(`//button[text()='Continue']`);
  }

  async verifyBannerPopup() {
  await step('Verify and close banner popup if visible', async () => {
    if (await ActionHelper.isVisible(this.offerPopUp)) {
      await ActionHelper.click(this.bannerCloseIcon, 'Close banner popup');
    } else if (await ActionHelper.isVisible(this.rewardsPopUp)) {
      await ActionHelper.click(this.rewardsBannerCloseIcon, 'Close rewards banner popup');
    } else {
      console.log('No banner popup is visible');
    }
  });
}


  async login() {
  await ActionHelper.click(this.loginBtn, 'Click Sign In button');
  await ActionHelper.type(this.mobileNumberField, testData.mobileNumber, 'Enter mobile number');

  if (process.env.ENV === 'qa') {
    await ActionHelper.click(this.getOtpCTA, 'Click Get OTP');
    await ActionHelper.fillOtpFields(this.otpInputField, testData.OTP, 'Enter OTP digits');
  } else if (process.env.ENV === 'prod') {
    await ActionHelper.type(this.passwordField, testData.password, 'Enter password');
    await ActionHelper.click(this.continueCTA, 'Click Continue with Password');
  } else {
    throw new Error(`Unsupported ENV: ${process.env.ENV}. Expected 'qa' or 'prod'.`);
  }
}


  async validateImageElements() {
    await step('Validate all carousel images', async () => {
      const carouselImages = this.page.locator('img.card-carousel-img');
      const count = await carouselImages.count();
      console.log(`Total carousel images found: ${count}`);

      for (let i = 0; i < count; i++) {
        await step(`Validate image #${i + 1}`, async () => {
          const img = carouselImages.nth(i);
          await expect(img).toBeVisible();
          const src = await img.getAttribute('src');
          expect(src).not.toBeNull();
          expect(src).toMatch(/^https?:\/\//);
          console.log(`Image ${i + 1} validated with src: ${src}`);
        });
      }
    });
  }


  async verifySectionCardTitles({ request }) {
  const apiUrl = `${ENV.API_URL}${ENDPOINT.GETHOMEPAGEFEED}`;
  const response = await request.get(apiUrl);
  expect(response.ok()).toBeTruthy();

  const json = await response.json();
  const feeds = json.feeds;

  for (let i = 0; i < feeds.length; i++) {
    const feed = feeds[i];

    // Execute only if type is portrait_card
    if (feed.type === 'portrait_card') {
      const sectionTitle = feed.title?.trim();
      if(sectionTitle === 'OnePlay  😀😃😄😁😁Connect For'){
        const expectedCardTitles = feed.results
        .map((r: any) => r.title?.trim())
        .filter((title: string) => !!title);

      const expectedCardGenre = feed.results
        .map((r: any) => r.genre_mappings?.[0])
        .filter((genre: any) => !!genre);

      console.log(`📘 Section #${i}: ${sectionTitle}`);
      console.log(`🎯 Expected Card Titles:`, expectedCardTitles);
      console.log(`🎯 Expected Genre:`, expectedCardGenre);

      // Step 1: Verify the section heading is visible
      await step(`Verify section heading '${sectionTitle}' is visible`, async () => {
        const section = this.page.locator(`//span[normalize-space(text())='OnePlay' and contains(@class,'heading-text')]`).first();
        await expect(section).toBeVisible();
      });

      // Step 2: Verify card titles under that section
      await step(`Verify card titles in section '${sectionTitle}'`, async () => {
        const cardTitlesLocator = this.page.locator(
          `//span[normalize-space(text())='OnePlay']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//h4[contains(@class, 'game-title')]`
        );
        await expect(cardTitlesLocator.first()).toBeVisible();

        const actualTitles = await cardTitlesLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedTitle of expectedCardTitles) {
          await step(`Verify card title "${expectedTitle}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedTitle);
            console.log(`✅ Verified card title: "${expectedTitle}"`);
          });
        }
      });
      // Step 3: Verify genre under card titles
      await step(`Verify genre in section '${sectionTitle}'`, async () => {
        const genreLocator = this.page.locator(
          `//span[normalize-space(text())='OnePlay']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//span[contains(@class, 'gameGenre')]`
        );
        await expect(genreLocator.first()).toBeVisible();

        const actualTitles = await genreLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedGenre of expectedCardGenre) {
          await step(`Verify genre "${expectedGenre}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedGenre);
            console.log(`✅ Verified genre: "${expectedGenre}"`);
          });
        }
      });
      // Step 4: Validate card size (200 x 250)
    await step(`Validate size of each card is 200x250 pixels`, async () => {
      const cardContainers = this.page.locator(
        `//span[normalize-space(text())='OnePlay']/ancestor::div[contains(@class,'container-fluid')]/following-sibling::div[contains(@class, 'scrollListing')]//div[contains(@style,'position')]`
      );

      const count = await cardContainers.count();
      for (let i = 0; i < count; i++) {
        const box = await cardContainers.nth(i).boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(190);
        expect(box?.width).toBeLessThanOrEqual(210);

        expect(box?.height).toBeGreaterThanOrEqual(240);
        expect(box?.height).toBeLessThanOrEqual(260);
        console.log(`✅ Verified size for card #${i + 1}: ${box?.width} x ${box?.height}`);
      }
    });
      }else{
        const expectedCardTitles = feed.results
        .map((r: any) => r.title?.trim())
        .filter((title: string) => !!title);

        const expectedCardGenre = feed.results
        .map((r: any) => r.genre_mappings?.[0])
        .filter((genre: any) => !!genre);

      console.log(`📘 Section #${i}: ${sectionTitle}`);
      console.log(`🎯 Expected Card Titles:`, expectedCardTitles);
      console.log(`🎯 Expected Genre:`, expectedCardGenre);

      // Step 1: Verify the section heading is visible
      await step(`Verify section heading '${sectionTitle}' is visible`, async () => {
        const section = this.page.locator(`//span[normalize-space(text())="${sectionTitle}" and contains(@class,'heading-text')]`).first();
        await expect(section).toBeVisible();
      });

      // Step 2: Verify card titles under that section
      await step(`Verify card titles in section '${sectionTitle}'`, async () => {
        const cardTitlesLocator = this.page.locator(
          `//span[normalize-space(text())="${sectionTitle}"]/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//h4[contains(@class, 'game-title')]`
        );
        await expect(cardTitlesLocator.first()).toBeVisible();

        const actualTitles = await cardTitlesLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedTitle of expectedCardTitles) {
          await step(`Verify card title "${expectedTitle}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedTitle);
            console.log(`✅ Verified card title: "${expectedTitle}"`);
          });
        }
      });
      // Step 3: Verify genre under card titles
      await step(`Verify genre in section '${sectionTitle}'`, async () => {
        const genreLocator = this.page.locator(
          `//span[normalize-space(text())="${sectionTitle}"]/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//span[contains(@class, 'gameGenre')]`
        );
        await expect(genreLocator.first()).toBeVisible();

        const actualTitles = await genreLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedGenre of expectedCardGenre) {
          await step(`Verify genre "${expectedGenre}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedGenre);
            console.log(`✅ Verified genre: "${expectedGenre}"`);
          });
        }
      });
      // Step 4: Validate card size (200 x 250)
    await step(`Validate size of each card is 200x250 pixels`, async () => {
      const cardContainers = this.page.locator(
        `//span[normalize-space(text())="${sectionTitle}"]/ancestor::div[contains(@class,'container-fluid')]/following-sibling::div[contains(@class, 'scrollListing')]//div[contains(@style,'position')]`
      );

      const count = await cardContainers.count();
      for (let i = 0; i < count; i++) {
        const box = await cardContainers.nth(i).boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(190);
        expect(box?.width).toBeLessThanOrEqual(210);

        expect(box?.height).toBeGreaterThanOrEqual(240);
        expect(box?.height).toBeLessThanOrEqual(260);
        console.log(`✅ Verified size for card #${i + 1}: ${box?.width} x ${box?.height}`);
      }
    });
    }
    } else {
      console.log(`⏭️ Skipped feed[${i}] — not a portrait_card (type = '${feed.type}')`);
    }
  }
}

async verifySpecialBannerCollectionCardTitles({ request }) {
  const apiUrl = `${ENV.API_URL}${ENDPOINT.GETHOMEPAGEFEED}`;
  const response = await request.get(apiUrl);
  expect(response.ok()).toBeTruthy();

  const json = await response.json();
  const feeds = json.feeds;

  for (let i = 0; i < feeds.length; i++) {
    const feed = feeds[i];

    // Execute only if type is portrait_card
    if (feed.type === 'special_banner') {
      const sectionTitle = feed.title?.trim();

        const expectedCardTitles = feed.results
        .map((r: any) => r.title?.trim())
        .filter((title: string) => !!title);

        const expectedCardGenre = feed.results
        .map((r: any) => r.genre_mappings?.[0])
        .filter((genre: any) => !!genre);

      console.log(`📘 Section #${i}: ${sectionTitle}`);
      console.log(`🎯 Expected Card Titles:`, expectedCardTitles);
      console.log(`🎯 Expected Genre:`, expectedCardGenre);

      // Step 2: Verify card titles under that section
      await step(`Verify card titles in section '${sectionTitle}'`, async () => {
  const cardTitlesLocator = this.page.locator(
    `//section[@class='parallexContainer']//h4[@class='game-title']`
  );

  const count = await cardTitlesLocator.count();
  expect(count).toBe(expectedCardTitles.length); // ensures sizes match

  for (let i = 0; i < count; i++) {
    const expectedTitle = expectedCardTitles[i];
    await step(`Verify card title "${expectedTitle}" at index ${i}`, async () => {
      const actualTitle = (await cardTitlesLocator.nth(i).textContent())?.trim() || '';
      const cleanedActual = actualTitle.replace(/\.\.\.$/, '');
      expect(expectedTitle).toContain(cleanedActual);
      console.log(`✅ Verified card title at index ${i}: "${actualTitle}"`);
    });
  }

      });
      // Step 3: Verify genre under card titles
      await step(`Verify genre in section '${sectionTitle}'`, async () => {
        const genreLocator = this.page.locator(
          `//section[@class='parallexContainer']//span[contains(@class,'gameGenre')]`
        );
        await expect(genreLocator.first()).toBeVisible();

        const actualTitles = await genreLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedGenre of expectedCardGenre) {
          await step(`Verify genre "${expectedGenre}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedGenre);
            console.log(`✅ Verified genre: "${expectedGenre}"`);
          });
        }
      });
      // Step 4: Validate card size (320 x 180)
    await step(`Validate size of each card is 320x180 pixels`, async () => {
      const cardContainers = this.page.locator(
        `//section[@class='parallexContainer']//img[contains(@style,'object-fit')]`
      );

      const count = await cardContainers.count();
      for (let i = 0; i < count; i++) {
        const box = await cardContainers.nth(i).boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(310);
        expect(box?.width).toBeLessThanOrEqual(330);

        expect(box?.height).toBeGreaterThanOrEqual(170);
        expect(box?.height).toBeLessThanOrEqual(190);
        console.log(`✅ Verified size for card #${i + 1}: ${box?.width} x ${box?.height}`);
      }
    });
    }else {
      console.log(`⏭️ Skipped feed[${i}] — not a special banner collection card (type = '${feed.type}')`);
    }
  }
}

async verifySquareCategoryLargeCardTitles({ request }) {
  const apiUrl = `${ENV.API_URL}${ENDPOINT.GETHOMEPAGEFEED}`;
  const response = await request.get(apiUrl);
  expect(response.ok()).toBeTruthy();

  const json = await response.json();
  const feeds = json.feeds;

  for (let i = 0; i < feeds.length; i++) {
    const feed = feeds[i];

    // Execute only if type is portrait_card
    if (feed.type === 'square_category_large') {
      const sectionTitle = feed.title?.trim();

        const expectedCardTitles = feed.results
        .map((r: any) => r.title?.trim())
        .filter((title: string) => !!title);

        const expectedCardGenre = feed.results
        .map((r: any) => r.genre_mappings?.[0])
        .filter((genre: any) => !!genre);

      console.log(`📘 Section #${i}: ${sectionTitle}`);
      console.log(`🎯 Expected Card Titles:`, expectedCardTitles);
      console.log(`🎯 Expected Genre:`, expectedCardGenre);

      // Step 1: Verify the section heading is visible
      await step(`Verify section heading '${sectionTitle}' is visible`, async () => {
        const section = this.page.locator(`//span[normalize-space(text())='${sectionTitle}' and contains(@class,'heading-text')]`).first();
        await expect(section).toBeVisible();
      });

      // Step 2: Verify card titles under that section
      await step(`Verify card titles in section '${sectionTitle}'`, async () => {
        const cardTitlesLocator = this.page.locator(
          `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//h4[contains(@class, 'game-title')]`
        );
        await expect(cardTitlesLocator.first()).toBeVisible();

        const actualTitles = await cardTitlesLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedTitle of expectedCardTitles) {
          await step(`Verify card title "${expectedTitle}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedTitle);
            console.log(`✅ Verified card title: "${expectedTitle}"`);
          });
        }
      });
      // Step 3: Verify genre under card titles
      await step(`Verify genre in section '${sectionTitle}'`, async () => {
        const genreLocator = this.page.locator(
          `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//span[contains(@class, 'gameGenre')]`
        );
        await expect(genreLocator.first()).toBeVisible();

        const actualTitles = await genreLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedGenre of expectedCardGenre) {
          await step(`Verify genre "${expectedGenre}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedGenre);
            console.log(`✅ Verified genre: "${expectedGenre}"`);
          });
        }
      });
      // Step 4: Validate card size (247 x 240)
    await step(`Validate size of each card is 247 x 240 pixels`, async () => {
      const cardContainers = this.page.locator(
        `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[contains(@class,'container-fluid')]/following-sibling::div[contains(@class, 'scrollListing')]//div[contains(@style,'position')]`
      );

      const count = await cardContainers.count();
      for (let i = 0; i < count; i++) {
        const box = await cardContainers.nth(i).boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(240);
        expect(box?.width).toBeLessThanOrEqual(260);

        expect(box?.height).toBeGreaterThanOrEqual(230);
        expect(box?.height).toBeLessThanOrEqual(250);
        console.log(`✅ Verified size for card #${i + 1}: ${box?.width} x ${box?.height}`);
      }
    });
    }else {
      console.log(`⏭️ Skipped feed[${i}] — not a square category large card (type = '${feed.type}')`);
    }
  }
}

async verifySquareCategorySmallCardTitles({ request }) {
  const apiUrl = `${ENV.API_URL}${ENDPOINT.GETHOMEPAGEFEED}`;
  const response = await request.get(apiUrl);
  expect(response.ok()).toBeTruthy();

  const json = await response.json();
  const feeds = json.feeds;

  for (let i = 0; i < feeds.length; i++) {
    const feed = feeds[i];

    // Execute only if type is portrait_card
    if (feed.type === 'square_category_small') {
      const sectionTitle = feed.title?.trim();

        const expectedCardTitles = feed.results
        .map((r: any) => r.name?.trim())
        .filter((name: string) => !!name);

        const expectedCardGenre = feed.results
        .map((r: any) => r.categories?.[0])
        .filter((categories: any) => !!categories);

      console.log(`📘 Section #${i}: ${sectionTitle}`);
      console.log(`🎯 Expected Card Names:`, expectedCardTitles);
      console.log(`🎯 Expected categories:`, expectedCardGenre);

      // Step 1: Verify the section heading is visible
      await step(`Verify section heading '${sectionTitle}' is visible`, async () => {
        const section = this.page.locator(`//span[normalize-space(text())='${sectionTitle}' and contains(@class,'heading-text')]`).first();
        await expect(section).toBeVisible();
      });

      // Step 2: Verify card titles under that section
      await step(`Verify card titles in section '${sectionTitle}'`, async () => {
        const cardTitlesLocator = this.page.locator(
          `//div[contains(@class,'smallCategoryContainer')]//span[@class='game-title']`
        );
        await expect(cardTitlesLocator.first()).toBeVisible();

        const actualTitles = await cardTitlesLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedTitle of expectedCardTitles) {
          await step(`Verify card title "${expectedTitle}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedTitle);
            console.log(`✅ Verified card title: "${expectedTitle}"`);
          });
        }
      });
      // Step 3: Verify genre under card titles
      await step(`Verify genre in section '${sectionTitle}'`, async () => {
        const genreLocator = this.page.locator(
          `//div[contains(@class,'smallCategoryContainer')]//span[contains(@class,'gameGenre')]`
        );
        await expect(genreLocator.first()).toBeVisible();

        const actualTitles = await genreLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedGenre of expectedCardGenre) {
          await step(`Verify genre "${expectedGenre}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedGenre);
            console.log(`✅ Verified genre: "${expectedGenre}"`);
          });
        }
      });
      // Step 4: Validate card size (247 x 240)
    // await step(`Validate size of each card is 247 x 240 pixels`, async () => {
    //   const cardContainers = this.page.locator(
    //     `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[contains(@class,'container-fluid')]/following-sibling::div[contains(@class, 'scrollListing')]//div[contains(@style,'position')]`
    //   );

    //   const count = await cardContainers.count();
    //   for (let i = 0; i < count; i++) {
    //     const box = await cardContainers.nth(i).boundingBox();
    //     expect(box?.width).toBeGreaterThanOrEqual(240);
    //     expect(box?.width).toBeLessThanOrEqual(260);

    //     expect(box?.height).toBeGreaterThanOrEqual(230);
    //     expect(box?.height).toBeLessThanOrEqual(250);
    //     console.log(`✅ Verified size for card #${i + 1}: ${box?.width} x ${box?.height}`);
    //   }
    // });
    }else {
      console.log(`⏭️ Skipped feed[${i}] — not a square category small card (type = '${feed.type}')`);
    }
  }
}

async verifyPortraitCategoryCardTitles({ request }) {
  const apiUrl = `${ENV.API_URL}${ENDPOINT.GETHOMEPAGEFEED}`;
  const response = await request.get(apiUrl);
  expect(response.ok()).toBeTruthy();

  const json = await response.json();
  const feeds = json.feeds;

  for (let i = 0; i < feeds.length; i++) {
    const feed = feeds[i];

    // Execute only if type is portrait_card
    if (feed.type === 'portrait_category') {
      const sectionTitle = feed.title?.trim();

        const expectedCardTitles = feed.results
        .map((r: any) => r.title?.trim())
        .filter((title: string) => !!title);

        const expectedCardGenre = feed.results
        .map((r: any) => r.genre_mappings?.[0])
        .filter((genre: any) => !!genre);

      console.log(`📘 Section #${i}: ${sectionTitle}`);
      console.log(`🎯 Expected Card Titles:`, expectedCardTitles);
      console.log(`🎯 Expected Genre:`, expectedCardGenre);

      // Step 1: Verify the section heading is visible
      await step(`Verify section heading '${sectionTitle}' is visible`, async () => {
        const section = this.page.locator(`//span[normalize-space(text())='${sectionTitle}' and contains(@class,'heading-text')]`).first();
        await expect(section).toBeVisible();
      });

      // Step 2: Verify card titles under that section
      await step(`Verify card titles in section '${sectionTitle}'`, async () => {
        const cardTitlesLocator = this.page.locator(
          `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//h4[contains(@class, 'game-title')]`
        );
        await expect(cardTitlesLocator.first()).toBeVisible();

        const actualTitles = await cardTitlesLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedTitle of expectedCardTitles) {
          await step(`Verify card title "${expectedTitle}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedTitle);
            console.log(`✅ Verified card title: "${expectedTitle}"`);
          });
        }
      });
      // Step 3: Verify genre under card titles
      await step(`Verify genre in section '${sectionTitle}'`, async () => {
        const genreLocator = this.page.locator(
          `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//span[contains(@class, 'gameGenre')]`
        );
        await expect(genreLocator.first()).toBeVisible();

        const actualTitles = await genreLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedGenre of expectedCardGenre) {
          await step(`Verify genre "${expectedGenre}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedGenre);
            console.log(`✅ Verified genre: "${expectedGenre}"`);
          });
        }
      });
      // Step 4: Validate card size (247 x 240)
    await step(`Validate size of each card is 247 x 240 pixels`, async () => {
      const cardContainers = this.page.locator(
        `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[contains(@class,'container-fluid')]/following-sibling::div[contains(@class, 'scrollListing')]//div[contains(@style,'position')]`
      );

      const count = await cardContainers.count();
      for (let i = 0; i < count; i++) {
        const box = await cardContainers.nth(i).boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(190);
        expect(box?.width).toBeLessThanOrEqual(210);

        expect(box?.height).toBeGreaterThanOrEqual(240);
        expect(box?.height).toBeLessThanOrEqual(260);
        console.log(`✅ Verified size for card #${i + 1}: ${box?.width} x ${box?.height}`);
      }
    });
    }else {
      console.log(`⏭️ Skipped feed[${i}] — not a portrait category card (type = '${feed.type}')`);
    }
  }
}

async verifyLandscapeVideoCardTitles({ request }) {
  const apiUrl = `${ENV.API_URL}${ENDPOINT.GETHOMEPAGEFEED}`;
  const response = await request.get(apiUrl);
  expect(response.ok()).toBeTruthy();

  const json = await response.json();
  const feeds = json.feeds;

  for (let i = 0; i < feeds.length; i++) {
    const feed = feeds[i];

    // Execute only if type is portrait_card
    if (feed.type === 'landscape_video') {
      const sectionTitle = feed.title?.trim();

        const expectedCardTitles = feed.results
        .map((r: any) => r.title?.trim())
        .filter((title: string) => !!title);

        const expectedGameName = feed.results
        .map((r: any) => r.game_name?.trim())
        .filter((game_name: any) => !!game_name);

        const expectedCreatorName = feed.results
        .map((r: any) => r.creator_name?.trim())
        .filter((creator_name: any) => !!creator_name);

      console.log(`📘 Section #${i}: ${sectionTitle}`);
      console.log(`🎯 Expected Card Titles:`, expectedCardTitles);
      console.log(`🎯 Expected Game Name:`, expectedGameName);

      // Step 1: Verify the section heading is visible
      await step(`Verify section heading '${sectionTitle}' is visible`, async () => {
        const section = this.page.locator(`//span[normalize-space(text())='${sectionTitle}' and contains(@class,'heading-text')]`).first();
        await expect(section).toBeVisible();
      });

      // Step 2: Verify card titles under that section
      await step(`Verify card titles in section '${sectionTitle}'`, async () => {
        const cardTitlesLocator = this.page.locator(
          `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//h4[contains(@class, 'game-title')]`
        );
        await expect(cardTitlesLocator.first()).toBeVisible();

        const actualTitles = await cardTitlesLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedTitle of expectedCardTitles) {
          await step(`Verify card title "${expectedTitle}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedTitle);
            console.log(`✅ Verified card title: "${expectedTitle}"`);
          });
        }
      });
      // Step 3: Verify genre under card titles
      await step(`Verify Game in section '${sectionTitle}'`, async () => {
        const genreLocator = this.page.locator(
          `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//div[contains(@class, 'game-secondary-title')]`
        );
        await expect(genreLocator.first()).toBeVisible();

        const actualTitles = await genreLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedGame of expectedGameName) {
          await step(`Verify Game "${expectedGame}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedGame);
            console.log(`✅ Verified Game: "${expectedGame}"`);
          });
        }
      });
      // Step 4: Validate Creator name
    await step(`Verify Creator in section '${sectionTitle}'`, async () => {
        const creatorLocator = this.page.locator(
          `//span[normalize-space(text())='${sectionTitle}']/ancestor::div[@class='container-fluid']/following-sibling::div[contains(@class, 'scrollListing')]//span[contains(@class, 'game-title')]`
        );
        await expect(creatorLocator.first()).toBeVisible();

        const actualTitles = await creatorLocator.allTextContents();
        const trimmedTitles = actualTitles.map(t => t.trim());

        for (const expectedCreator of expectedCreatorName) {
          await step(`Verify Creator "${expectedCreator}" is present`, async () => {
            expect(trimmedTitles).toContain(expectedCreator);
            console.log(`✅ Verified Creator: "${expectedCreator}"`);
          });
        }
      });
    }else {
      console.log(`⏭️ Skipped feed[${i}] — not a landscape video card (type = '${feed.type}')`);
    }
  }
}
}
