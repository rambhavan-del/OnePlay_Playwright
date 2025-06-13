import { Page, expect } from '@playwright/test';
import { ActionHelper } from '../utils/actions';
import { step } from 'allure-js-commons';
import testData from '../tests-data/testData.json'
import ENV from '../utils/env';
import ENDPOINT from '../utils/endpoints';

export class HomePage {
  initialGame: string | null;
  constructor(private page: Page) {}

  get viewMoreCTA(){
    return this.page.locator("(//button[normalize-space(text())='View More'])[1]");
  }

  get homeBtn(){
    return this.page.locator("//span[text()='Home']");
  }

  get gamesBtn(){
    return this.page.locator("//span[text()='Games']");
  }

  get storeBtn(){
    return this.page.locator("(//div[normalize-space(text())='Store'])[1]");
  }

  get lavelBtn(){
    return this.page.locator("//span[text()='Level 1']");
  }

  get rightArrow(){
    return this.page.locator('.rightArrow.cursorPointer');
  }

  get leftArrow(){
    return this.page.locator('.leftArrow.cursorPointer');
  }

  get selectedCardCarousel(){
    return this.page.locator('.card-carousel-img.selectedGame');
  }

  get searchButton(){
    return this.page.locator(`span.search-btn`);
  }

  get searchTextField(){
    return this.page.locator(`input.search-txt`);
  }

  get counterStrikeGame(){
    return this.page.locator(`//span[contains(text(), 'Counter-Strike 2')]`);
  }

  get actionButton(){
    return this.page.locator("button.action-btn");
  }

  get terminateButton(){
    return this.page.locator(`button.transparent-btn`);
  }

  get saveAndLaunchGameBtn(){
    return this.page.locator(`//button[normalize-space(text())='Save & Launch Game']`);
  }

  get resumeButton(){
    return this.page.locator(`//button[normalize-space(text())='Resume']`);
  }

  get inlineCheckbox(){
    return this.page.locator(".form-check-input");
  }

  get agreeAndContinueButton(){
    return this.page.locator(`button.customBtnBg`);
  }

  async verifyAllCTA(){
    await step('Verify View More CTA', async () => {
      const viewMoreCTA = await this.viewMoreCTA.textContent();
      expect(viewMoreCTA?.trim()).toBe(testData.homePage.viewMoreCTA);
    });
    await step('Verify Home CTA', async () => {
      const homeBtn = await this.homeBtn.textContent();
      expect(homeBtn?.trim()).toBe(testData.homePage.homeCTA);
    });
    await step('Verify Games CTA', async () => {
      const gamesBtn = await this.gamesBtn.textContent();
      expect(gamesBtn?.trim()).toBe(testData.homePage.gamesCTA);
    });
    await step('Verify Store CTA', async () => {
      const storeBtn = await this.storeBtn.textContent();
      expect(storeBtn?.trim()).toBe(testData.homePage.storeCTA);
    });
    await step('Verify Lavel 1 CTA', async () => {
      const lavelBtn = await this.lavelBtn.textContent();
      expect(lavelBtn?.trim()).toBe(testData.homePage.lavelCTA);
    });
  }

  async validateImageElements({ request }) {
    await step('Validate all carousel images', async () => {
      const apiUrl = `${ENV.API_URL}${ENDPOINT.GETHOMEPAGEFEED}`;
      const response = await request.get(apiUrl);
      expect(response.ok()).toBeTruthy();
        
      const json = await response.json();
      const feeds = json.feeds;
      const corousalCount_api = feeds[0].results.length;
      console.log(`Total carousel images found in API: ${corousalCount_api}`);
      const carouselImages = this.page.locator('img.card-carousel-img');
      const corousalCount_ui = await carouselImages.count();
      console.log(`Total carousel images found: ${corousalCount_ui}`);
      expect(corousalCount_api).toBe(corousalCount_ui);
      for (let i = 0; i < corousalCount_ui; i++) {
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
  

async clickAndVerifyLeftAndRightArrow() {
  await step('Capture initial carousel game image', async () => {
    let initialGame = await this.selectedCardCarousel.getAttribute('src');
    this.initialGame = initialGame;
  });

  await step('Click on right arrow and verify carousel updates', async () => {
    await expect(this.rightArrow).toBeVisible();
    await this.rightArrow.click();
    await this.page.waitForTimeout(1000);

    const afterRightClickGame = await this.selectedCardCarousel.getAttribute('src');
    expect(afterRightClickGame).not.toBe(this.initialGame);
  });

  await step('Click on left arrow and verify carousel reverts back', async () => {
    await expect(this.leftArrow).toBeVisible();
    await this.leftArrow.click();
    await this.page.waitForTimeout(1000);

    const afterLeftClickGame = await this.selectedCardCarousel.getAttribute('src');
    expect(afterLeftClickGame).toBe(this.initialGame);
  });
}

async searchGame(){
    await this.searchButton.hover();
    await ActionHelper.fill(this.searchTextField,testData.gameDetailsPage.gameName,"Enter game name in search field");
    await this.counterStrikeGame.waitFor({ state: 'visible' });
    await ActionHelper.click(this.counterStrikeGame,"select Counter-Strike 2 from suggestions");
}

async verifyActionButtonOnGameDetailsPage(){
    const action = await this.actionButton.textContent();
    if(action?.trim()==="Play Now"){
      expect(action?.trim()).toBe("Play Now");
      await ActionHelper.click(this.actionButton,"Click on Play Now Button");
      await ActionHelper.click(this.inlineCheckbox,"Check for before you start form checkbox");
      await ActionHelper.click(this.agreeAndContinueButton,"Click on Agree & Continue button");
      const saveAndLaunchGame = await this.saveAndLaunchGameBtn.textContent();
      expect(saveAndLaunchGame?.trim()).toBe("Save & Launch Game");
      await ActionHelper.click(this.saveAndLaunchGameBtn,"Click on Save & Launch Game button");
      await this.resumeButton.waitFor({'state':'visible','timeout':200000});
      const resume = await this.resumeButton.textContent();
      expect(resume?.trim()).toBe("Resume");
      const terminate = await this.terminateButton.getAttribute("data");
      expect(terminate?.trim()).toBe("Terminate");
    }else if(action?.trim()==="Resume"){
      expect(action?.trim()).toBe("Resume");
      const terminate = await this.terminateButton.getAttribute("data");
      expect(terminate?.trim()).toBe("Terminate");
    }
}
}