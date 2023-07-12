const resolve = require("resolve");
const fs = require("fs");
const resolver = require("./index");

jest.mock("resolve");
jest.mock("fs");

describe("Resolver Plugin Tests", () => {
    test("should resolve core module", () => {
        resolve.isCore.mockReturnValue(true);

        const result = resolver.resolve("fs", "/path/to/file.js", {});

        expect(result.found).toBe(true);
        expect(result.path).toBe(null);
    });

    test("should resolve non-core module", () => {
        resolve.sync = jest.fn(() => "/path/to/resolved.js");
        fs.existsSync = jest.fn(() => true);

        jest.mock("/path/to/vite.config.js", () => ({
            default: {
                resolve: {
                    extensions: [".js"],
                    alias: {
                        "_": "/path/to/src",
                    },
                },
            },
        }), { virtual: true });

        // JS module
        let result = resolver.resolve("_/module", "/path/to/file.js", { configPath: "/path/to/vite.config.js" });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/path/to/src/module",
            { basedir: "/path/to", extensions: [".js"] }
        );
    });

    test("should resolve non-core module with publicDir", () => {
        resolve.sync = jest.fn(() => "/path/to/resolved.js");
        fs.existsSync = jest.fn((param) => {
            if (param === "/path/to/vite.config.js") {
                return true;
            }
            return false;
        });

        jest.mock("/path/to/vite.config.js", () => ({
            default: {
                resolve: {
                    extensions: [".js"],
                    alias: {
                        "_": "/path/to/src",
                    },
                },
                publicDir: "/path/to/public",
            },
        }), { virtual: true });

        // JS module
        const result = resolver.resolve("/_/module", "/path/to/file.js", { configPath: "/path/to/vite.config.js" });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/path/to/public/path/to/src/module",
            { basedir: "/path/to", extensions: [".js"] }
        );
    });

    test("should resolve non-core module with absolute path", () => {
        resolve.sync = jest.fn(() => "/path/to/resolved.js");
        fs.existsSync = jest.fn(() => true);

        jest.mock("/path/to/vite.config.js", () => ({
            default: {
                resolve: {
                    extensions: [".js"],
                    alias: {
                        "_": "/path/to/src",
                    },
                },
                publicDir: "/path/to/public",
            },
        }), { virtual: true });

        // JS module
        const result = resolver.resolve("/path/to/module", "/path/to/file.js", { configPath: "/path/to/vite.config.js" });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/path/to/module",
            { basedir: "/path/to", extensions: [".js"] }
        );
    });

    test("should handle vite config DNE error", () => {
        fs.existsSync = jest.fn((param) => {
            if (param === "/path/to/vite.config.js") {
                return false;
            }
            return true;
        });

        const result = resolver.resolve("module", "/path/to/file.js", { configPath: "/path/to/vite.config.js" });

        expect(result.found).toBe(false);
    });

    test("should handle resolve error", () => {
        resolve.sync = jest.fn(() => {
            throw new Error("Resolve error");
        });
        fs.existsSync = jest.fn((param) => true);

        const result = resolver.resolve("module", "/path/to/file.js", {});

        expect(result.found).toBe(false);
    });
});
