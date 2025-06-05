// utils/ActionHelper.ts
import { step } from 'allure-js-commons';
import { Locator } from '@playwright/test';

export class ActionHelper {
  static async click(locator: Locator, stepDescription: string) {
    await step(stepDescription, async () => {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      await locator.click();
    });
  }

  static async type(locator: Locator, text: string, stepDescription: string) {
    await step(stepDescription, async () => {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      await locator.fill(text);
    });
  }

  static async isVisible(locator: Locator, message?: string, suppressStepLog = false) {
  const visible = await locator.isVisible();
  if (!suppressStepLog && message) {
    await step(message, async () => {}); // Just log step
  }
  return visible;
}


  static async fillOtpFields(locator: Locator, otp: string, stepDescription: string) {
    await step(stepDescription, async () => {
      for (let i = 0; i < otp.length; i++) {
        await locator.nth(i).fill(otp[i]);
      }
    });
  }
}
