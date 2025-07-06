import { defineConfig } from "vite";

export default defineConfig({
  root: "src/products",
  build: {
    outDir: "../../dist/products",
    emptyOutDir: true
  }
})

