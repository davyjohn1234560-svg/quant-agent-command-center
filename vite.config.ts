import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  // Keep local development private until authentication and network policy exist.
  server: { host: "127.0.0.1", port: 3000, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  resolve: { alias: { "@": srcDir } },
  plugins: [
    // TanStack Start must precede the React plugin.
    tanstackStart({ server: { entry: "server" } }),
    nitro(),
    tailwindcss(),
    viteReact(),
  ],
});
