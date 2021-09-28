# eslint-import-resolver-vite

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

module.exports = {
    settings: {
        "import/resolver": "vite",
    },
}

```
