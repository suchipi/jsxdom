// vite.config.js
const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "JSXDOM",
      fileName: (format) => `jsxdom.${format}.js`,
      formats: ["es", "cjs", "umd"],
    },
  },
});
