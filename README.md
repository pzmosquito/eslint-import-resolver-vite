# eslint-import-resolver-vite

Vite module resolution plugin for `eslint-plugin-import`.

This plugin will resolve the `resolve.alias` option.

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
        // use default config:
        "import/resolver": "vite",
        
        // OR use custom config:
        "import/resolver": {
            vite: {
                configPath: "./app1/vite.confg.dev.js"
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
  - **If you use a function as vite config, you must export a named vite config object.**
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
