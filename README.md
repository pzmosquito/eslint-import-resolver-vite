# eslint-import-resolver-vite

Vite module resolution plugin for `eslint-plugin-import` and `eslint-plugin-import-x`. This plugin will resolve the `resolve.alias` option.


### Installation
```sh
npm install --save-dev eslint-import-resolver-vite
```


### How to use

#### Vite config file
```js
export const viteConfigObj = {
    resolve: {
        alias: {
            _: path.resolve(__dirname, "src")
        }
    },
};
```

#### ESLint config file
NOTE:  
- Since ESLint requires rules to be synchronous, Vite's [ResolvedConfig API](https://vitejs.dev/guide/api-javascript.html#resolvedconfig) cannot be utilized.
- This plugin accepts a Vite config object to accommodate various setups, e.g. CJS, ESM, or mixed.

```js
// for using `eslint-plugin-import`
module.exports = {
    settings: {
        "import/resolver": {
            vite: {
                viteConfig: require("./vite.config").viteConfigObj, // named export of the Vite config object.
            }
        }
    }
}


// for using `eslint-plugin-import-x` resolver interface v3
const { createViteImportResolver } = require("eslint-import-resolver-vite");

module.exports = {
    settings: {
        "import-x/resolver-next": [
            createViteImportResolver({
                viteConfig: require("./vite.config").viteConfigObj, // named export of the Vite config object.
            })
        ]
    }
}
```
