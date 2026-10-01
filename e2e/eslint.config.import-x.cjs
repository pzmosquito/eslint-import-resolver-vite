const path = require("path");
const importX = require("eslint-plugin-import-x");
const { createViteImportResolver } = require(path.resolve(
    __dirname,
    "../dist/index.cjs.js",
));
const { viteConfigObj } = require("./vite.config.cjs");

module.exports = [
    {
        files: ["**/*.js"],
        plugins: { "import-x": importX.default },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
        settings: {
            "import-x/resolver-next": [
                createViteImportResolver({
                    viteConfig: viteConfigObj,
                }),
            ],
            "import-x/extensions": [".js", ".mjs"],
            "import-x/ignore": ["\\.txt$"],
        },
        rules: {
            "import-x/no-unresolved": "error",
            "import-x/named": "error",
        },
    },
];
