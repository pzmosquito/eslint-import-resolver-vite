#!/usr/bin/env node
/**
 * Install each supported Vite major's latest patch, run unit tests + library
 * build, and verify the published CJS bundle still requires Node builtins.
 *
 * Supported majors: last 3 (currently 6, 7, 8).
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
/** Latest patches confirmed on npm for the last 3 majors. */
const VITE_VERSIONS = ["6.4.3", "7.3.6", "8.3.2"];

function run(cmd, args, opts = {}) {
    console.log(`\n> ${cmd} ${args.join(" ")}`);
    const result = spawnSync(cmd, args, {
        cwd: ROOT,
        stdio: "inherit",
        shell: process.platform === "win32",
        ...opts,
    });
    if (result.status !== 0) {
        throw new Error(`Command failed (${result.status}): ${cmd} ${args.join(" ")}`);
    }
}

function installedViteVersion() {
    const pkgPath = path.join(ROOT, "node_modules", "vite", "package.json");
    return JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
}

const results = [];

try {
    for (const version of VITE_VERSIONS) {
        console.log(`\n========== Vite ${version} ==========`);
        run("npm", ["install", `vite@${version}`, "--no-save", "--no-package-lock"]);
        const actual = installedViteVersion();
        if (actual !== version) {
            throw new Error(`Expected vite@${version} but node_modules has ${actual}`);
        }
        run("npx", ["jest", "--watchAll=false"]);
        run("npx", ["vite", "build"]);
        run("node", ["scripts/verify-dist.js"]);
        results.push({ version: actual, tests: "pass", build: "pass" });
        console.log(`OK Vite ${actual}: tests + build`);
    }
} catch (err) {
    console.error("\nMatrix failed:", err.message);
    process.exitCode = 1;
} finally {
    // Restore the default (highest) Vite allowed by package.json for local/dev use.
    console.log("\n========== Restoring default vite from package.json ==========");
    try {
        run("npm", ["install", "--no-audit", "--no-fund"]);
        console.log(`Restored vite@${installedViteVersion()}`);
    } catch (restoreErr) {
        console.error("Failed to restore default vite:", restoreErr.message);
        process.exitCode = 1;
    }
}

console.log("\n========== Matrix summary ==========");
for (const row of results) {
    console.log(`Vite ${row.version}: tests=${row.tests} build=${row.build}`);
}
if (results.length !== VITE_VERSIONS.length) {
    console.log(`Incomplete: ${results.length}/${VITE_VERSIONS.length} versions passed`);
}
