import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "./certs/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "./certs/localhost.pem")),
    },
    port: 5173,
    open: '/auth/login.html'
  }
});