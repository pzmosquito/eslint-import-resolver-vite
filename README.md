# eslint-import-resolver-vite

Vite module resolution plugin for `eslint-plugin-import`. This plugin will resolve the `resolve.alias` option.


### Installation
```sh
npm install --save-dev eslint-import-resolver-vite
```


### Config Options
- **viteConfig**: The Vite config object.
  - Required: Yes
  - Type: object


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
- Since `eslint-plugin-import` doesn't support an async resolver, Vite's [ResolvedConfig API](https://vitejs.dev/guide/api-javascript.html#resolvedconfig) cannot be utilized.
- This plugin accepts a Vite config object to accommodate various setups, e.g. CJS, ESM, or mixed.
```js
module.exports = {
    settings: {
        "import/resolver": {
            vite: {
                viteConfig: require("./vite.config").viteConfigObj,
            }
        }
    }
}

```
