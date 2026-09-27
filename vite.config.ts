import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 8080, host: "::" },
  plugins: [
    tsConfigPaths(),
    viteReact(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
  },
});
