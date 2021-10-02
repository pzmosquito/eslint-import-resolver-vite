# eslint-import-resolver-vite

Vite module resolution plugin for `eslint-plugin-import`.

This plugin only resolves `resolve.alias` option. I'll add support for full `resolve` config when I get a chance.

### Installation
```sh
npm install --save-dev eslint-import-resolver-vite
```

### How to use
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
