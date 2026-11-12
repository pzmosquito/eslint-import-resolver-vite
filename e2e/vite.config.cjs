const path = require("path");

const root = __dirname;

/**
 * Plain Vite config object (not a Vite `defineConfig` callback).
 * The resolver reads this synchronously: aliases, extensions, root, publicDir.
 */
const viteConfigObj = {
    root,
    publicDir: path.join(root, "public"),
    resolve: {
        extensions: [".mjs", ".js", ".json"],
        alias: {
            "@": path.join(root, "src"),
            // Exact module path, checked before segment replacement.
            "@utils/api/client": path.join(root, "src/lib/api/client"),
        },
    },
};

module.exports = { viteConfigObj };
