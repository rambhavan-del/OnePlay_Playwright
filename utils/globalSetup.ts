import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

async function globalSetup() {
  // Load environment file
  const envFile = `./env/.env.${process.env.ENV || 'qa'}`;
  console.log(`🛠  Loading environment: ${envFile}`);
  dotenv.config({ path: envFile });

  // Clean up old Allure results
  const resultsDir = path.join(__dirname, '..', 'allure-results');
  const reportDir = path.join(__dirname, '..', 'allure-report');

  [resultsDir, reportDir].forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`🧹 Deleted folder: ${dir}`);
    }
  });
}

export default globalSetup;
