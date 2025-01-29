import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: ["src/index.ts"],
    outDir: "dist/",
    format: ["esm", "cjs"],
    dts: true,
    clean: false,
    minify: false,
  },
])
