import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "unplugin-dts/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  build: {
    lib: {
      entry: ["src/single-spa-svelte.ts"],
      formats: ["es"],
    },
  },
  plugins: [
    svelte(),
    dts({
      exclude: [
        "src/single-spa-svelte.ts",
        "src/single-spa-svelte.test.ts",
        "src/setupTests.ts",
      ],
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
