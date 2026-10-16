import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// That single plugin is what teaches Vite to understand JSX and get fast
// refresh (components update in place while you edit) working.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
    },
  },
});
