const path = require("path");
const resolve = require("resolve");
const fs = require("fs");
const debug = require("debug");

const namespace = "eslint-plugin-import:resolver:vite";

const log = debug(namespace);

const logError = (message) => {
    log(message);
    console.error(`[${namespace}] ${message}`);
};

exports.interfaceVersion = 2;

exports.resolve = (source, file, config) => {
    log("resolving:", source);
    log("in file:", file);

    if (resolve.isCore(source)) {
        return { found: true, path: null };
    }

    try {
        // combine default config with user defined config
        const pluginConfig = {
            configPath: "vite.config.js",
            ...(config ?? {}),
        };

        // load vite config
        const viteConfigPath = path.resolve(pluginConfig.configPath);
        if (!fs.existsSync(viteConfigPath)) {
            throw new Error(`Vite config file doesn't exist at '${viteConfigPath}'`)
        }
        const viteConfigFile = require(viteConfigPath);

        let viteConfig;
        if (pluginConfig.namedExport) {
            viteConfig = viteConfigFile[pluginConfig.namedExport]
        }
        else {
            const viteConfigObj = viteConfigFile.default ?? viteConfigFile
            viteConfig = typeof viteConfigObj === "function" ? viteConfigObj() : viteConfigObj;
        }

        const defaultExtensions = [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"];
        const { alias, extensions = defaultExtensions } = viteConfig.resolve ?? {};

        let actualSource = source;

        // parse and replace alias
        if (alias) {
            const pathParts = actualSource.split(path.sep);
            if (Array.isArray(alias)) {
                for (let i = 0; i < pathParts.length; i++) {
                    alias.forEach(({find, replacement}) => {
                        if (pathParts[i] === find) {
                            pathParts[i] = replacement;
                        }
                    });
                }
            }
            else if (typeof alias === "object") {
                for (let i = 0; i < pathParts.length; i++) {
                    if (alias.hasOwnProperty(pathParts[i])) {
                        pathParts[i] = alias[pathParts[i]];
                    }
                }
            }
            else {
                throw new Error("The alias must be either an object, or an array of objects.");
            }
            actualSource = pathParts.join(path.sep);
        }

        // resolve module
        let resolvedPath = "";
        try {
            resolvedPath = resolve.sync(actualSource, {
                basedir: path.dirname(file),
                extensions,
            });
        }
        catch (err) {
            if (viteConfig.publicDir !== false) {
                const publicDir = viteConfig.publicDir ?? "public";
                const publicActualSource = path.join(path.resolve(publicDir), actualSource);
                resolvedPath = resolve.sync(publicActualSource, {
                    basedir: path.dirname(file),
                    extensions,
                });
            }
            else {
                throw new Error("source cannot be resolved in actual path nor in 'Public' path.");
            }
        }

        log("resolved to:", resolvedPath);
        return { found: true, path: resolvedPath };
    }
    catch (err) {
        logError(err.message);
        return { found: false };
    }
};
