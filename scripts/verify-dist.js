#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const dist = path.resolve(__dirname, "..", "dist", "index.cjs.js");
if (!fs.existsSync(dist)) {
    console.error("Missing build output:", dist);
    process.exit(1);
}

const code = fs.readFileSync(dist, "utf8");
for (const builtin of ["path", "resolve", "debug"]) {
    const re = new RegExp(`require\\(["']${builtin}["']\\)`);
    if (!re.test(code)) {
        console.error(`dist/index.cjs.js does not require("${builtin}") — builtins may have been stubbed`);
        process.exit(1);
    }
}

delete require.cache[require.resolve(dist)];
const mod = require(dist);
if (mod.interfaceVersion !== 2) {
    console.error("Expected interfaceVersion 2, got", mod.interfaceVersion);
    process.exit(1);
}
if (typeof mod.createViteImportResolver !== "function") {
    console.error("Missing createViteImportResolver export");
    process.exit(1);
}

let viteVersion = "unknown";
try {
    viteVersion = require("vite/package.json").version;
} catch {}
console.log(`dist ok (vite ${viteVersion})`);
