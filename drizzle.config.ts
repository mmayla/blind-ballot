import './envConfig.ts'
import { defineConfig, type Config } from 'drizzle-kit';

let drizzleConfig: Config;
if (process.env.DATABASE_AUTH_TOKEN) {
  drizzleConfig = {
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'turso',
    dbCredentials: {
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN
    },
  }
} else {
  drizzleConfig = {
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
      url: process.env.DATABASE_URL!
    },
  }
}

export default defineConfig(drizzleConfig);
