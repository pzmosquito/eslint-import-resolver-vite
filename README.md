# eslint-plugin-vite-import-resolver

Vite module resolution plugin for `eslint-plugin-import`.

```js
// vite config file

export default = {
    resolve: {
        alias: {
            _: path.resolve(__dirname, "src")
        }
    }
};

// eslint config file

const viteImportResolver = require("eslint-plugin-vite-import-resolver")

module.exports = {
    settings: {
        "import/resolver": viteImportResolver,
    },
}

```
