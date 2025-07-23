import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  build: {
    lib: {
      entry: ["src/single-spa-svelte.ts"],
      formats: ["es"],
    },
  },
  plugins: [svelte()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
