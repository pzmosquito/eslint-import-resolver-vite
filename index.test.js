const resolve = require("resolve");
const resolver = require("./index");

jest.mock("resolve");

describe("Resolver Plugin Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should resolve core module", () => {
        resolve.isCore.mockReturnValue(true);

        const result = resolver.resolve("fs", "/path/to/file.js", {});

        expect(result.found).toBe(true);
        expect(result.path).toBe(null);
    });

    test("should resolve non-core module", () => {
        resolve.sync = jest.fn((source) => {
            if (source === "/path/to/src/assets/images/_module@") {
                return "/path/to/resolved.js";
            }
            throw new Error("Resolve error");
        });

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: {
                    "_": "/path/to/src",
                    "@": "assets/images",
                },
            },
        };

        const result = resolver.resolve("_/@/_module@", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/path/to/src/assets/images/_module@",
            { basedir: "/path/to", extensions: [".js"] }
        );
    });

    test("should resolve non-core module (array alias pairs)", () => {
        resolve.sync = jest.fn((source) => {
            if (source === "/path/to/src/assets/images/_module@") {
                return "/path/to/resolved.js";
            }
            throw new Error("Resolve error");
        });

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: [
                    { find: "_", replacement: "/path/to/src" },
                    { find: "@", replacement: "assets/images" },
                ],
            },
        };

        const result = resolver.resolve("_/@/_module@", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/path/to/src/assets/images/_module@",
            { basedir: "/path/to", extensions: [".js"] }
        );
    });

    test("should throw error when viteConfig is not an object", () => {
        const viteConfig = null;

        const result = () => resolver.resolve("_/module", "/path/to/file.js", { viteConfig });

        expect(result).toThrow("'viteConfig' option must be a vite config object.");
    });

    test("should throw error when alias type is invalid", () => {
        resolve.sync = jest.fn((source) => {
            throw new Error("Resolve error");
        });

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: "test",
            },
        };

        const result = () => resolver.resolve("_/module", "/path/to/file.js", { viteConfig });

        expect(result).toThrow("The alias must be either an object, or an array of objects.");
    });

    test("should resolve non-core module with publicDir", () => {
        resolve.sync = jest.fn((source) => {
            if (source === "/path/to/public/path/to/src/module") {
                return "/path/to/resolved.js";
            }
            throw new Error("Resolve error");
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

        const result = resolver.resolve("/_/module", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
    });

    test("should resolve non-core module with absolute path", () => {
        resolve.sync = jest.fn((source) => {
            if (source === "/path/to/module") {
                return "/path/to/resolved.js";
            }
            throw new Error("Resolve error");
        });

        const viteConfig = {
            resolve: {
                extensions: [".js"],
                alias: {
                    "_": "/path/to/src",
                },
            },
            publicDir: "/path/to/public",
        };

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

        const viteConfig = {};

        const result = resolver.resolve("module", "/path/to/file.js", { viteConfig });

        expect(result.found).toBe(false);
    });

    test("should resolve alias with slashes (e.g. '@/components')", () => {
        resolve.sync = jest.fn((source) => {
            if (source === "/abs/path/to/src/components/Button") {
                return "/abs/path/to/resolved.js";
            }
            throw new Error("Resolve error");
        });

        const viteConfig = {
            resolve: {
                alias: {
                    "@/components": "/abs/path/to/src/components"
                }
            }
        };

        const result = resolver.resolve("@/components/Button", "/abs/path/to/project/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/abs/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith(
            "/abs/path/to/src/components/Button",
            expect.anything()
        );
    });

    test("should resolve alias that is not a full path segment", () => {
        resolve.sync = jest.fn((source) => {
            if (source === "/abs/path/to/other/file.js") {
                return "/abs/path/to/resolved.js";
            }
            throw new Error("Resolve error");
        });

        const viteConfig = {
            resolve: {
                alias: {
                    "deep/path": "/abs/path/to/other"
                }
            }
        };

        const result = resolver.resolve("deep/path/file.js", "/abs/path/to/project/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(resolve.sync).toHaveBeenCalledWith(
            "/abs/path/to/other/file.js",
            expect.anything()
        );
    });

    test("should support regex aliases", () => {
        resolve.sync = jest.fn((source) => {
            if (source === "/abs/path/to/regex-match/file.js") {
                return "/abs/path/to/resolved.js";
            }
            throw new Error("Resolve error");
        });

        const viteConfig = {
            resolve: {
                alias: [
                    { find: /^(.*)\.suffix$/, replacement: "$1" }
                ]
            }
        };

        const result = resolver.resolve("/abs/path/to/regex-match/file.js.suffix", "/abs/path/to/project/file.js", { viteConfig });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/abs/path/to/resolved.js");
    });
});
