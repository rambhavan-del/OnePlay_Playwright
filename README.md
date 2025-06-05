# Playwright E2E Test Framework

This project uses [Playwright](https://playwright.dev/) with **TypeScript** for end-to-end (E2E) testing. It includes:
- Environment-based configurations
- Page Object Model (POM)
- Allure reporting

## 📦 Tech Stack

- [Playwright](https://playwright.dev/)
- TypeScript
- dotenv (for environment config)
- Allure Reporter

# Set environment and run test
# For PowerShell (Windows):
- $env:ENV="qa"; npx playwright test

# For Command Prompt (CMD):
- set ENV=qa && npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Allure Reporting
1. Generate Allure results
- npx playwright test
2. Serve Allure Report
- npx allure serve ./allure-results
# If not installed:
- npm install -g allure-commandline --save-dev

# You can debug tests by using --debug:
- npx playwright test --debug