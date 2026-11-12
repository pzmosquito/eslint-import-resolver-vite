#!/usr/bin/env node
/**
 * Integration test: lint the e2e fixture with ESLint (Node API).
 * No browser. Builds must already exist at dist/index.cjs.js.
 */
const path = require("path");
const { ESLint } = require("eslint");

const ROOT = path.resolve(__dirname, "..");
const E2E = path.join(ROOT, "e2e");
const GOOD = ["src/index.js"];
const BAD = ["src/broken.js"];

function summarize(results) {
    return results.flatMap((result) =>
        result.messages.map((message) => {
            const where = path.relative(ROOT, result.filePath);
            const rule = message.ruleId || (message.fatal ? "fatal" : "error");
            return `${where}:${message.line || 0} [${rule}] ${message.message}`;
        }),
    );
}

async function lint(label, configFile, files) {
    const eslint = new ESLint({
        cwd: E2E,
        overrideConfigFile: path.join(E2E, configFile),
        errorOnUnmatchedPattern: true,
    });
    const results = await eslint.lintFiles(files);
    const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
    const fatal = results.reduce((sum, result) => sum + result.fatalErrorCount, 0);
    return { label, results, errorCount, fatal, lines: summarize(results) };
}

function fail(message, details) {
    console.error(`\nFAIL ${message}`);
    for (const line of details || []) console.error(`  ${line}`);
    process.exitCode = 1;
}

(async () => {
    for (const [label, configFile] of [
        ["eslint-plugin-import", "eslint.config.import.cjs"],
        ["eslint-plugin-import-x", "eslint.config.import-x.cjs"],
    ]) {
        const good = await lint(`${label} good`, configFile, GOOD);
        const bad = await lint(`${label} bad`, configFile, BAD);
        if (good.errorCount !== 0 || good.fatal !== 0) {
            fail(`${label}: expected src/index.js to resolve cleanly`, good.lines);
        } else {
            console.log(`ok  ${label}: resolved aliases, extensions, public file, core + package imports`);
        }

        const unresolved = bad.lines.filter((line) => /no-unresolved/.test(line) && /missing\/module/.test(line));
        if (bad.errorCount < 1 || unresolved.length < 1) {
            fail(`${label}: expected import/no-unresolved on @/missing/module`, bad.lines);
        } else {
            console.log(`ok  ${label}: unresolved @/missing/module (${bad.errorCount} error${bad.errorCount === 1 ? "" : "s"})`);
        }
    }

    if (process.exitCode) {
        console.error("\ne2e failed");
        process.exit(process.exitCode);
    }
    console.log("\ne2e passed");
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
