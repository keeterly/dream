import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/dream/",       // <--- MUST BE HERE, MUST MATCH REPO NAME EXACTLY
  build: {
    target: ["es2019", "safari13"],
  },
});