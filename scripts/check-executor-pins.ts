import fs from "fs";
import path from "path";

const EXPECTED_VERSION = "0.0.1";
const PREFIX = "@executor-js/";
const WORKSPACES = ["apps", "services", "packages"];

function findPackageJsonFiles(dir: string): string[] {
    const files: string[] = [];
    let entries: string[];
    try {
        entries = fs.readdirSync(dir);
    } catch {
        return files;
    }
    for (const entry of entries) {
        if (entry === "node_modules") continue;
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const nested = findPackageJsonFiles(fullPath);
            files.push.apply(files, nested);
        } else if (entry === "package.json") {
            files.push(fullPath);
        }
    }
    return files;
}

const drifts: Array<{ file: string; name: string; version: string }> = [];

for (const workspace of WORKSPACES) {
    const files = findPackageJsonFiles(workspace);
    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const pkg = JSON.parse(content);
        const deps = pkg.dependencies;
        const devDeps = pkg.devDependencies;
        const allDeps: Record<string, string> = {};
        if (deps) {
            Object.assign(allDeps, deps);
        }
        if (devDeps) {
            Object.assign(allDeps, devDeps);
        }
        const depEntries = Object.entries(allDeps);
        for (const entry of depEntries) {
            const name = entry[0];
            const version = entry[1];
            if (name.startsWith(PREFIX) && version !== EXPECTED_VERSION) {
                drifts.push({ file: file, name: name, version: version });
            }
        }
    }
}

const rootContent = fs.readFileSync("package.json", "utf-8");
const rootPkg = JSON.parse(rootContent);
const catalog = rootPkg.catalog;
if (catalog) {
    const catalogEntries = Object.entries(catalog);
    for (const entry of catalogEntries) {
        const name = entry[0];
        const version = entry[1];
        if (name.startsWith(PREFIX) && version !== EXPECTED_VERSION) {
            drifts.push({ file: "package.json", name: name, version: version });
        }
    }
}

if (drifts.length === 0) {
    console.log(
        "All @executor-js/* dependencies pinned to " + EXPECTED_VERSION + " across the monorepo."
    );
    process.exit(0);
}

console.error(
    "Version drift detected for @executor-js/* packages (expected " + EXPECTED_VERSION + "):"
);
for (const drift of drifts) {
    console.error("  " + drift.file + ": " + drift.name + ": " + drift.version);
}
console.error(
    "\nThe executor SDK is vendored at 0.0.1 — upgrading requires re-validating the D1 load-bearing import rules and the patch in patches/."
);
process.exit(1);
