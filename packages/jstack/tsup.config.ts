import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: ["src/server/index.ts"],
    outDir: "dist/server",
    format: ["esm", "cjs"],
    dts: true,
    clean: false,
    minify: false,
    external: ["zod"],
  },
  {
    entry: ["src/client/index.ts"],
    outDir: "dist/client",
    format: ["esm", "cjs"],
    dts: true,
    clean: false,
    minify: false,
    external: ["zod"],
  },
])
