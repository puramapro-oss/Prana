import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./src/lib/regulate",
  testMatch: "playback.test.ts",
})
