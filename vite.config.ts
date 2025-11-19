import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/dream/",
  build: {
    target: ["safari13", "es2019"], // <-- ADD THIS
  },
});