const path = require("path");
const importPlugin = require("eslint-plugin-import");
const { viteConfigObj } = require("./vite.config.cjs");

// Built package (package.json "main"), same module consumers require.
const resolverPath = path.resolve(__dirname, "../dist/index.cjs.js");

module.exports = [
    {
        files: ["**/*.js"],
        plugins: { import: importPlugin },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
        settings: {
            "import/resolver": {
                [resolverPath]: {
                    viteConfig: viteConfigObj,
                },
            },
            "import/extensions": [".js", ".mjs"],
            "import/ignore": ["\\.txt$"],
        },
        rules: {
            "import/no-unresolved": "error",
            "import/named": "error",
        },
    },
];
