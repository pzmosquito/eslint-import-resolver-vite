const path = require("path");
const resolve = require("resolve");
const debug = require("debug");
const namespace = "eslint-plugin-import:resolver:vite";
const log = debug(namespace);

const processAlias = (alias, source) => {
    if (!alias) {
        return source;
    }

    if (typeof alias !== "object" || alias === null) {
        throw new Error("The alias must be either an object, or an array of objects.");
    }

    const aliases = Array.isArray(alias)
        ? alias
        : Object.keys(alias).map((key) => ({ find: key, replacement: alias[key] }));

    // Sort string-based aliases by length descending to match most specific first
    const sortedAliases = aliases.slice().sort((a, b) => {
        const lenA = typeof a.find === "string" ? a.find.length : 0;
        const lenB = typeof b.find === "string" ? b.find.length : 0;
        return lenB - lenA;
    });

    let result = source;
    let parts = result.split("/");
    let i = 0;

    while (i < parts.length) {
        let matched = false;
        for (const { find, replacement } of sortedAliases) {
            if (typeof find === "string") {
                const findParts = find.split("/");
                if (matchSegments(parts, i, findParts)) {
                    const replacementParts = replacement.split("/");
                    parts.splice(i, findParts.length, ...replacementParts);
                    i += replacementParts.length;
                    matched = true;
                    break;
                }
            }
        }
        if (!matched) {
            i++;
        }
    }

    result = parts.join("/");

    // Apply regex aliases
    for (const { find, replacement } of aliases) {
        if (find instanceof RegExp) {
            result = result.replace(find, replacement);
        }
    }

    return result;
};

const matchSegments = (parts, start, findParts) => {
    if (findParts.length === 0 || start + findParts.length > parts.length) {
        return false;
    }

    for (let j = 0; j < findParts.length; j++) {
        const find = findParts[j];
        const part = parts[start + j];

        if (j === findParts.length - 1 && find.endsWith("$")) {
            const exactFind = find.slice(0, -1);
            if (part !== exactFind || start + findParts.length < parts.length) {
                return false;
            }
        } else if (part !== find) {
            return false;
        }
    }

    return true;
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
    catch { }

    // try to resolve the source with alias
    const parsedSource = processAlias(alias, source);
    if (parsedSource !== source) {
        try {
            return resolveSync(parsedSource, resolveOptions, "with alias");
        }
        catch { }
    }

    // try to resolve the source if it is an absolute path
    if (path.isAbsolute(parsedSource)) {
        const root = viteConfig.root ?? process.cwd();
        const absoluteSource = path.join(path.resolve(root), parsedSource);
        try {
            return resolveSync(absoluteSource, resolveOptions, "absolute path");
        }
        catch { }
    }

    // try to resolve the source in public directory if all above failed
    if (viteConfig.publicDir !== false) {
        const publicDir = viteConfig.publicDir ?? "public";
        const publicSource = path.join(path.resolve(publicDir), parsedSource);
        try {
            return resolveSync(publicSource, resolveOptions, "in public directory");
        }
        catch { }
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

exports.interfaceVersion = 2;
