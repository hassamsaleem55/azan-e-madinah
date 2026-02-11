import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/admin-portal/",
  server: {
    host: "0.0.0.0", // ✅ allows external access
    port: 3001, // or any other
    // rewrite all requests to index.html for SPA routing
    fs: {
      allow: ["./"],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
});
