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
    },
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
  - Default: "viteConfig"
  - If you use **async** vite config, you need to export a named vite config object since `eslint-plugin-import` doesn't support async resolver. e.g.
  ```js
  /**
   * vite config file
   */
  export const viteConfig = {};
  
  export default async () => {
      // process await data
      return viteConfig;
  }
  ```
