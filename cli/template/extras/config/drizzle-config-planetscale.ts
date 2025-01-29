import { defineConfig } from "drizzle-kit"
import "dotenv/config"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/server/db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})
