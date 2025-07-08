import { defineConfig } from "vite";

export default defineConfig({
  root: "src", // raiz do projeto
  build: {
    outDir: "../dist", //distribuição
    emptyOutDir: true
  },
  server: {
    open: '/auth/login.html', // abre a tela de login por padrão
  }
});

