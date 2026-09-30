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


### Vite compatibility

This package is built and tested against the **last 3 Vite major versions** (currently **6**, **7**, and **8**). Vite is a build-time/dev dependency only — the resolver does not import Vite at runtime.

**Node for consumers:** `engines.node` stays `>=16` because the published resolver does not require Vite at runtime.

**Node for contributors / `npm run build` / `prepublishOnly`:** use **Node `^20.19.0 || >=22.12.0`** so Vite 7 and 8 install and build cleanly (Vite 6 still supports Node 18, but the default `make dev` image is Node 20). The Makefile uses `node:20-alpine`.

```sh
npm run test:ci      # unit tests (mock-based; Vite version-agnostic)
npm run build        # library build with the installed Vite
npm run test:matrix  # install+test+build against Vite 6.4.3, 7.3.6, and 8.3.1
```

Prefer `npm run test:matrix` locally (or wire the same Vite versions into CI when the token has `workflow` scope).

#### Subpath resolution

In addition to standard segment-based alias resolution, you can define aliases for complete module paths including subpaths. The resolver checks for exact full path matches first before falling back to segment-based replacements.

```js
export const viteConfigObj = {
    resolve: {
        alias: {
            "@utils": path.resolve(__dirname, "src/utils"),
            "@utils/api/client": path.resolve(__dirname, "src/api/client"), // Full path alias
        },
    },
};

// In your code:
import { apiClient } from "@utils/api/client"; // ✓ resolves to src/api/client
import { helper } from "@utils/helpers"; // ✓ resolves to src/utils/helpers
```

This works with both object-based and array-based alias configurations.
