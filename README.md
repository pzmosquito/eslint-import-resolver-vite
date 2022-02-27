# eslint-import-resolver-vite

Vite module resolution plugin for `eslint-plugin-import`.

This plugin only resolves `resolve.alias` option. I'll add support for full `resolve` config when I get a chance.

### Installation
```sh
npm install --save-dev eslint-plugin-import eslint-import-resolver-vite

# install vite-plugin-eslint if you don't already have it
npm install --save-dev vite-plugin-eslint
```

### How to use
```js
// vite config file

import eslintPlugin from "vite-plugin-eslint";

export default = {
    resolve: {
        alias: {
            _: path.resolve(__dirname, "src")
        }
    },
    plugins: [
        eslintPlugin();
    ]
};


// eslint config file

module.exports = {
    settings: {
        "import/resolver": "vite",
    },
}

```
