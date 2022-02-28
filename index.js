const path = require("path");
const resolve = require("resolve");

exports.interfaceVersion = 2;

exports.resolve = (source, file, config) => {
    if (resolve.isCore(source)) {
        return { found: true, path: null };
    }

    // combine default config with user defined config
    const pluginConfig = {
        configPath: "vite.config.js",
        ...(config ?? {}),
    };

    // load vite config
    const viteConfigPath = path.resolve(pluginConfig.configPath);
    const viteConfigFile = require(viteConfigPath);
    let viteConfig;
    if (pluginConfig.namedExport) {
        viteConfig = viteConfigFile[pluginConfig.namedExport]
    }
    else {
        viteConfig = typeof viteConfigFile.default === "function" ? viteConfigFile.default() : viteConfigFile.default;
    }


    const { alias, extensions } = viteConfig.resolve;
    const defaultExtensions = [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"];

    let actualSource = source;

    // parse import path with alias
    Object.entries(alias).forEach(([find, replacement]) => {
        actualSource = actualSource.replace(find, replacement);
    });

    // resolve module
    try {
        const resolvedPath = resolve.sync(
            actualSource,
            {
                basedir: path.dirname(path.resolve(file)),
                extensions: extensions || defaultExtensions,
            },
        );
        return { found: true, path: resolvedPath };
    }
    catch (err) {
        return { found: false };
    }
};
