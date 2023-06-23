const resolve = require("resolve");
const resolver = require("./index");

jest.mock("resolve");
jest.mock("fs");

describe("Resolver Plugin Tests", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test("should resolve core module", () => {
        resolve.isCore.mockReturnValue(true);

        const result = resolver.resolve("fs", "/path/to/file.js", {});

        expect(result.found).toBe(true);
        expect(result.path).toBe(null);
    });

    test("should resolve non-core module", () => {
        resolve.sync = jest.fn((source) => "/path/to/resolved.js");

        jest.mock("/path/to/vite.config.js", () => ({
            default: {
                resolve: {
                    extensions: [".js"],
                    alias: {
                        "_": "/path/to/src",
                    },
                },
            }
        }), { virtual: true });

        const result = resolver.resolve("_/module", "/path/to/file.js", { configPath: "/path/to/vite.config.js" });

        expect(result.found).toBe(true);
        expect(result.path).toBe("/path/to/resolved.js");
        expect(resolve.sync).toHaveBeenCalledWith("/path/to/src/module", {
            basedir: "/path/to",
            extensions: [".js"],
        });
    });

    test("should handle resolve error", () => {
        resolve.sync = jest.fn(() => {
            throw new Error("Resolve error");
        });

        const result = resolver.resolve("module", "/path/to/file.js", {});

        expect(result.found).toBe(false);
    });
});
