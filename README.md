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
```js
/**
 * vite config file
 */
export const viteConfigObj = {
    resolve: {
        alias: {
            _: path.resolve(__dirname, "src")
        }
    },
};

/**
 * eslint config file
 */
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
