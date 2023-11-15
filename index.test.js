const resolve = require("resolve");
const resolver = require("./index");

jest.mock("resolve");

describe("Resolver Plugin Tests", () => {
    test("should resolve core module", () => {
        resolve.isCore.mockReturnValue(true);

        const result = resolver.resolve("fs", "/path/to/file.js", {});

        expect(result.found).toBe(true);
        expect(result.path).toBe(null);
    });

    test("should resolve non-core module", () => {
        resolve.sync = jest.fn(() => "/path/to/resolved.js");

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: {
                    "_": "/path/to/src",
                    "@": "assets/images",
                },
            },
        };

        // JS module
        let result = resolver.resolve("_/@/_module@", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/path/to/src/assets/images/_module@",
            { basedir: "/path/to", extensions: [".js"] }
        );
    });

    test("should resolve non-core module (array alias pairs)", () => {
        resolve.sync = jest.fn(() => "/path/to/resolved.js");

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: [
                    { find: "_", replacement: "/path/to/src" },
                    { find: "@", replacement: "assets/images" },
                ],
            },
        };

        // JS module
        let result = resolver.resolve("_/@/_module@", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/path/to/src/assets/images/_module@",
            { basedir: "/path/to", extensions: [".js"] }
        );
    });

    test("should throw error when alias type is invalid", () => {
        resolve.sync = jest.fn(() => "/path/to/resolved.js");

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: "test",
            },
        };

        // JS module
        let result = resolver.resolve("_/module", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(false);
    });

    test("should resolve non-core module with publicDir", () => {
        resolve.sync = jest.fn((source) => {
            console.log(source);
            if (source === "/path/to/src/module") {
                throw new Error("Resolve error");
            }
            else if (source === "/path/to/public/path/to/src/module") {
                return "/path/to/resolved.js";
            }
            return "incorrect";
        });

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: {
                    "_": "path/to/src",
                },
            },
            publicDir: "/path/to/public",
        };

        // JS module
        const result = resolver.resolve("/_/module", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
    });

    test("should resolve non-core module with absolute path", () => {
        resolve.sync = jest.fn(() => "/path/to/resolved.js");

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: {
                    "_": "/path/to/src",
                },
            },
            publicDir: "/path/to/public",
        };

        // JS module
        const result = resolver.resolve("/path/to/module", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/path/to/module",
            { basedir: "/path/to", extensions: [".js"] }
        );
    });

    test("should handle resolve error", () => {
        resolve.sync = jest.fn(() => {
            throw new Error("Resolve error");
        });

        const result = resolver.resolve("module", "/path/to/file.js", {});

        expect(result.found).toBe(false);
    });
});
