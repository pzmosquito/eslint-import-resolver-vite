const path = require("path");
const resolve = require("resolve");
const debug = require("debug");
const namespace = "eslint-plugin-import:resolver:vite";
const log = debug(namespace);

const processAlias = (alias, source) => {
    if (alias) {
        const pathParts = path.normalize(source).split(path.sep);
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
        return pathParts.join(path.sep);
    }
    return source;
};

const resolveSync = (source, resolveOptions, label) => {
    log("resolving:\t", `(${label})`, source);
    const resolvedPath = resolve.sync(source, resolveOptions);
    log("resolved:\t", resolvedPath);
    return { found: true, path: resolvedPath };
};

exports.interfaceVersion = 2;

exports.resolve = (source, file, config) => {
    log("\nin file:\t", file);

    if (resolve.isCore(source)) {
        log("resolved:\t", source);
        return { found: true, path: null };
    }

    const { viteConfig } = config;
    if (!viteConfig) {
        throw new Error("'viteConfig' option must be a vite config object.");
    }

    const defaultExtensions = [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"];
    const { alias, extensions = defaultExtensions } = viteConfig.resolve ?? {};
    const resolveOptions = { basedir: path.dirname(file), extensions };

    // try to resolve the source as is
    try {
        return resolveSync(source, resolveOptions, "as is");
    }
    catch {}

    // try to resolve the source with alias
    const parsedSource = processAlias(alias, source);
    if (parsedSource !== source) {
        try {
            return resolveSync(parsedSource, resolveOptions, "with alias");
        }
        catch {}
    }

    // try to resolve the source if it is an absolute path
    if (path.isAbsolute(parsedSource)) {
        const root = viteConfig.root ?? process.cwd();
        const absoluteSource = path.join(path.resolve(root), parsedSource);
        try {
            return resolveSync(absoluteSource, resolveOptions, "absolute path");
        }
        catch {}
    }

    // try to resolve the source in public directory if all above failed
    if (viteConfig.publicDir !== false) {
        const publicDir = viteConfig.publicDir ?? "public";
        const publicSource = path.join(path.resolve(publicDir), parsedSource);
        try {
            return resolveSync(publicSource, resolveOptions, "in public directory");
        }
        catch {}
    }

    log("ERROR:\t", "Unable to resolve");
    return { found: false };
};

// for `eslint-plugin-import-x` resolver interface v3
exports.createViteImportResolver = (config) => {
    return {
        interfaceVersion: 3,
        name: "eslint-import-resolver-vite",
        resolve: (source, file) => exports.resolve(source, file, config)
    };
}
