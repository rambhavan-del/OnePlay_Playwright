import dotenv from 'dotenv';

async function globalSetup() {
  const envFile = `./env/.env.${process.env.ENV || 'qa'}`;
  console.log(`🛠  Loading environment: ${envFile}`);
  dotenv.config({ path: envFile });
}

export default globalSetup;
