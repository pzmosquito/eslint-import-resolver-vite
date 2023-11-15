import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    build: {
        target: "esnext",
        outDir: path.resolve(__dirname, "dist"),
        lib: {
            entry: path.resolve(__dirname, "./index.js"),
            // formats: ["es", "cjs"],
            formats: ["cjs"],
            fileName: (format) => `index.${format}.js`
        },
    },
});
