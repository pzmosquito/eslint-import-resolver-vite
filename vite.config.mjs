import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { builtinModules } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeBuiltins = builtinModules.flatMap((m) => [m, `node:${m}`]);

export default defineConfig({
    build: {
        target: "esnext",
        outDir: path.resolve(__dirname, "dist"),
        lib: {
            entry: path.resolve(__dirname, "./index.js"),
            formats: ["cjs"],
            fileName: (format) => `index.${format}.js`,
        },
        // Vite 8 (Rolldown) treats lib builds as browser by default and stubs
        // Node builtins unless they are explicitly externalized. Keep rollupOptions
        // for Vite 5–7 compatibility during the transition.
        rolldownOptions: {
            external: [...nodeBuiltins, "resolve", "debug"],
        },
        rollupOptions: {
            external: [...nodeBuiltins, "resolve", "debug"],
        },
    },
});
