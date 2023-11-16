# eslint-import-resolver-vite

Vite module resolution plugin for `eslint-plugin-import`. This plugin will resolve the `resolve.alias` option.

> #### Version `2.0.0-beta.1` is available. See [what's changed](https://github.com/pzmosquito/eslint-import-resolver-vite/releases/tag/untagged-5ecea36ccacfd45396b3).
> ```sh
> npm install --save-dev eslint-import-resolver-vite@2.0.0-beta.1
> ```

### Installation
```sh
npm install --save-dev eslint-import-resolver-vite

# install vite-plugin-eslint if you don't already have it
npm install --save-dev vite-plugin-eslint
```

### How to use
```js
/**
 * vite config file
 */
import eslintPlugin from "vite-plugin-eslint";

export default {
    resolve: {
        alias: {
            _: path.resolve(__dirname, "src")
        }
    },
    plugins: [
        eslintPlugin()
    ]
};

/**
 * eslint config file
 */
module.exports = {
    settings: {
        // This uses the default `vite.config.js` file and the Vite configuration is an object. 
        "import/resolver": "vite",
        
        // OR use custom config (see Config Options below):
        "import/resolver": {
            vite: {
                configPath: "./app1/vite.confg.ts"
            }
        }
    }
}

```

### Config Options
- **configPath**: vite config file path.
  - Required: No
  - Type: string
  - Default: "vite.config.js"
  - By default, the plugin assumes the vite config file and eslintrc file are in the same directory.
- **namedExport**: named export of vite config object.
  - Required: No
  - Type: string
  - Default: [No Default]
  - **If you use a function as vite config, you must export a named vite config object. This is a result of the limitation of `eslint-plugin-import`.**
  ```js
  /**
   * vite config file
   */
  export const viteConfig = {};
  
  export default ({ command, mode }) => {
      // conditional config
      return viteConfig;
  }

  /**
   * eslintrc file
   */
  module.exports = {
      settings: {
          "import/resolver": {
              vite: {
                  namedExport: "viteConfig"
              }
          }
      }
  }
  ```
