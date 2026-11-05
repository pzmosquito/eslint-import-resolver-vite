const path = require("path");
const resolve = require("resolve");
const resolver = require("./index");

jest.mock("resolve");

const defaultExtensions = [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"];

describe("eslint-import-resolver-vite", () => {
    beforeEach(() => {
        resolve.isCore.mockReset();
        resolve.isCore.mockReturnValue(false);
    });

    describe("interface", () => {
        test("exports resolver interface v2", () => {
            expect(resolver.interfaceVersion).toBe(2);
            expect(typeof resolver.resolve).toBe("function");
        });

        test("createViteImportResolver returns import-x v3 resolver", () => {
            resolve.isCore.mockReturnValue(true);

            const viteResolver = resolver.createViteImportResolver({
                viteConfig: {},
            });

            expect(viteResolver.interfaceVersion).toBe(3);
            expect(viteResolver.name).toBe("eslint-import-resolver-vite");
            expect(viteResolver.resolve("fs", "/path/to/file.js")).toEqual({
                found: true,
                path: null,
            });
        });

        test("createViteImportResolver forwards config to resolve", () => {
            resolve.sync = jest.fn((source) => {
                if (source === "/alias/target.js") {
                    return "/alias/target.js";
                }
                throw new Error("Resolve error");
            });

            const viteResolver = resolver.createViteImportResolver({
                viteConfig: {
                    resolve: {
                        extensions: [".js"],
                        alias: { "@": "/alias" },
                    },
                },
            });

            const result = viteResolver.resolve("@/target.js", "/path/to/file.js");
            expect(result).toEqual({ found: true, path: "/alias/target.js" });
        });
    });

    describe("core modules", () => {
        test("resolves Node core modules without viteConfig", () => {
            resolve.isCore.mockReturnValue(true);

            const result = resolver.resolve("fs", "/path/to/file.js", {});

            expect(result).toEqual({ found: true, path: null });
            expect(resolve.sync).not.toHaveBeenCalled();
        });
    });

    describe("config validation", () => {
        test("throws when viteConfig is missing", () => {
            expect(() =>
                resolver.resolve("./mod", "/path/to/file.js", {}),
            ).toThrow("'viteConfig' option must be a vite config object.");
        });

        test("throws when viteConfig is null", () => {
            expect(() =>
                resolver.resolve("./mod", "/path/to/file.js", {
                    viteConfig: null,
                }),
            ).toThrow("'viteConfig' option must be a vite config object.");
        });

        test("throws when alias type is invalid", () => {
            resolve.sync = jest.fn(() => {
                throw new Error("Resolve error");
            });

            expect(() =>
                resolver.resolve("_/module", "/path/to/file.js", {
                    viteConfig: {
                        resolve: { alias: "not-valid" },
                    },
                }),
            ).toThrow(
                "The alias must be either an object, or an array of objects.",
            );
        });
    });

    describe("as-is resolution", () => {
        test("resolves relative imports without alias", () => {
            resolve.sync = jest.fn((source) => {
                if (source === "./local") {
                    return "/path/to/local.js";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("./local", "/path/to/file.js", {
                viteConfig: {},
            });

            expect(result).toEqual({ found: true, path: "/path/to/local.js" });
            expect(resolve.sync).toHaveBeenCalledWith("./local", {
                basedir: "/path/to",
                extensions: defaultExtensions,
            });
        });

        test("resolves package imports without alias", () => {
            resolve.sync = jest.fn((source) => {
                if (source === "lodash") {
                    return "/path/to/node_modules/lodash/index.js";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("lodash", "/path/to/file.js", {
                viteConfig: { resolve: {} },
            });

            expect(result).toEqual({
                found: true,
                path: "/path/to/node_modules/lodash/index.js",
            });
        });
    });

    describe("extensions", () => {
        test("uses default Vite-like extensions when omitted", () => {
            resolve.sync = jest.fn((source) => {
                if (source === "./mod") {
                    return "/path/to/mod.js";
                }
                throw new Error("Resolve error");
            });

            resolver.resolve("./mod", "/path/to/file.js", { viteConfig: {} });

            expect(resolve.sync).toHaveBeenCalledWith("./mod", {
                basedir: "/path/to",
                extensions: defaultExtensions,
            });
        });

        test("passes custom resolve.extensions through", () => {
            const extensions = [".vue", ".ts", ".js"];
            resolve.sync = jest.fn((source) => {
                if (source === "./Comp") {
                    return "/path/to/Comp.vue";
                }
                throw new Error("Resolve error");
            });

            resolver.resolve("./Comp", "/path/to/file.js", {
                viteConfig: { resolve: { extensions } },
            });

            expect(resolve.sync).toHaveBeenCalledWith("./Comp", {
                basedir: "/path/to",
                extensions,
            });
        });
    });

    describe("object aliases", () => {
        test("resolves segment-based object aliases", () => {
            resolve.sync = jest.fn((source) => {
                if (source === "/path/to/src/assets/images/_module@") {
                    return "/path/to/resolved.js";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("_/@/_module@", "/path/to/file.js", {
                viteConfig: {
                    resolve: {
                        extensions: [".js"],
                        alias: {
                            _: "/path/to/src",
                            "@": "assets/images",
                        },
                    },
                },
            });

            expect(result).toEqual({ found: true, path: "/path/to/resolved.js" });
            expect(resolve.sync).toHaveBeenCalledWith(
                "/path/to/src/assets/images/_module@",
                { basedir: "/path/to", extensions: [".js"] },
            );
        });

        test("resolves exact full-path object aliases before segments", () => {
            resolve.sync = jest.fn((source) => {
                if (source === "/path/to/module/subpath.js") {
                    return "/path/to/module/subpath.js";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("module/subpath", "/path/to/file.js", {
                viteConfig: {
                    resolve: {
                        extensions: [".js"],
                        alias: {
                            "module/subpath": "/path/to/module/subpath.js",
                        },
                    },
                },
            });

            expect(result).toEqual({
                found: true,
                path: "/path/to/module/subpath.js",
            });
            expect(resolve.sync).toHaveBeenNthCalledWith(1, "module/subpath", {
                basedir: "/path/to",
                extensions: [".js"],
            });
            expect(resolve.sync).toHaveBeenNthCalledWith(
                2,
                "/path/to/module/subpath.js",
                { basedir: "/path/to", extensions: [".js"] },
            );
        });
    });

    describe("array aliases", () => {
        test("resolves segment-based array aliases", () => {
            resolve.sync = jest.fn((source) => {
                if (source === "/path/to/src/assets/images/_module@") {
                    return "/path/to/resolved.js";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("_/@/_module@", "/path/to/file.js", {
                viteConfig: {
                    resolve: {
                        extensions: [".js"],
                        alias: [
                            { find: "_", replacement: "/path/to/src" },
                            { find: "@", replacement: "assets/images" },
                        ],
                    },
                },
            });

            expect(result).toEqual({ found: true, path: "/path/to/resolved.js" });
        });

        test("resolves exact full-path array aliases before segments", () => {
            resolve.sync = jest.fn((source) => {
                if (source === "/path/to/module/subpath.js") {
                    return "/path/to/module/subpath.js";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("module/subpath", "/path/to/file.js", {
                viteConfig: {
                    resolve: {
                        extensions: [".js"],
                        alias: [
                            {
                                find: "module/subpath",
                                replacement: "/path/to/module/subpath.js",
                            },
                        ],
                    },
                },
            });

            expect(result).toEqual({
                found: true,
                path: "/path/to/module/subpath.js",
            });
        });
    });

    describe("root / absolute-from-root paths", () => {
        test("joins viteConfig.root for absolute-looking imports", () => {
            const root = "/project/root";
            resolve.sync = jest.fn((source) => {
                // First "as is" attempt for "/src/mod" fails; root join succeeds.
                if (source === path.join(path.resolve(root), "/src/mod")) {
                    return "/project/root/src/mod.js";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("/src/mod", "/project/root/app/file.js", {
                viteConfig: {
                    root,
                    resolve: { extensions: [".js"] },
                    publicDir: false,
                },
            });

            expect(result).toEqual({
                found: true,
                path: "/project/root/src/mod.js",
            });
            expect(resolve.sync).toHaveBeenCalledWith(
                path.join(path.resolve(root), "/src/mod"),
                { basedir: "/project/root/app", extensions: [".js"] },
            );
        });

        test("defaults root to process.cwd() when omitted", () => {
            const cwd = process.cwd();
            resolve.sync = jest.fn((source) => {
                if (source === path.join(path.resolve(cwd), "/abs/mod")) {
                    return path.join(cwd, "abs/mod.js");
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("/abs/mod", "/path/to/file.js", {
                viteConfig: {
                    resolve: { extensions: [".js"] },
                    publicDir: false,
                },
            });

            expect(result.found).toBe(true);
            expect(result.path).toBe(path.join(cwd, "abs/mod.js"));
        });
    });

    describe("publicDir", () => {
        test("resolves from custom publicDir after other strategies fail", () => {
            resolve.sync = jest.fn((source) => {
                if (source === path.join(path.resolve("/path/to/public"), "favicon.svg")) {
                    return "/path/to/public/favicon.svg";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("favicon.svg", "/path/to/file.js", {
                viteConfig: {
                    resolve: { extensions: [".svg", ".js"] },
                    publicDir: "/path/to/public",
                },
            });

            expect(result).toEqual({
                found: true,
                path: "/path/to/public/favicon.svg",
            });
        });

        test("resolves aliased path under publicDir", () => {
            resolve.sync = jest.fn((source) => {
                if (
                    source ===
                    path.join(path.resolve("/path/to/public"), "path/to/src/module")
                ) {
                    return "/path/to/resolved.js";
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("_/module", "/path/to/file.js", {
                viteConfig: {
                    resolve: {
                        extensions: [".js"],
                        alias: { _: "path/to/src" },
                    },
                    publicDir: "/path/to/public",
                },
            });

            expect(result).toEqual({ found: true, path: "/path/to/resolved.js" });
        });

        test("defaults publicDir to 'public' when omitted", () => {
            resolve.sync = jest.fn((source) => {
                if (source === path.join(path.resolve("public"), "asset.png")) {
                    return path.resolve("public/asset.png");
                }
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("asset.png", "/path/to/file.js", {
                viteConfig: { resolve: { extensions: [".png"] } },
            });

            expect(result.found).toBe(true);
            expect(result.path).toBe(path.resolve("public/asset.png"));
        });

        test("skips publicDir when set to false", () => {
            resolve.sync = jest.fn(() => {
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("missing.png", "/path/to/file.js", {
                viteConfig: {
                    resolve: { extensions: [".png"] },
                    publicDir: false,
                },
            });

            expect(result).toEqual({ found: false });
            for (const call of resolve.sync.mock.calls) {
                expect(call[0]).not.toMatch(/public/);
            }
        });
    });

    describe("not found", () => {
        test("returns found:false when all strategies fail", () => {
            resolve.sync = jest.fn(() => {
                throw new Error("Resolve error");
            });

            const result = resolver.resolve("missing-module", "/path/to/file.js", {
                viteConfig: {
                    resolve: {
                        extensions: [".js"],
                        alias: { "@": "/src" },
                    },
                    publicDir: false,
                },
            });

            expect(result).toEqual({ found: false });
        });
    });
});
