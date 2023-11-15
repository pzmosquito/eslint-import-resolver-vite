const path = require("path");
const resolve = require("resolve");
const debug = require("debug");
const log = debug("eslint-plugin-import:resolver:vite");

exports.interfaceVersion = 2;

exports.resolve = (source, file, config) => {
    log("resolving:\t", source);
    log("in file:\t", file);

    if (resolve.isCore(source)) {
        return { found: true, path: null };
    }

    try {
        const { viteConfig } = config;
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
        const resolveOptions = {
            basedir: path.dirname(file),
            extensions,
        };

        try {
            resolvedPath = resolve.sync(actualSource, resolveOptions);
        }
        catch (err) {
            if (viteConfig.publicDir !== false) {
                const publicDir = viteConfig.publicDir ?? "public";
                const publicActualSource = path.join(path.resolve(publicDir), actualSource);
                resolvedPath = resolve.sync(publicActualSource, resolveOptions);
            }
            else {
                throw new Error("source cannot be resolved in actual path nor in 'Public' path.");
            }
        }

        log("resolved:\t", resolvedPath);
        return { found: true, path: resolvedPath };
    }
    catch (err) {
        log("ERROR:\t", err.message);
        return { found: false };
    }
};
