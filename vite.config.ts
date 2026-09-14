import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
    },
    plugins: [
      vinext(),
    ],
  };
});
