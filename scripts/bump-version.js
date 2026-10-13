#!/usr/bin/env node
/**
 * Bumps package.json's version number by one (e.g. 1.0.4 -> 1.0.5).
 * Run automatically by .husky/pre-commit on every commit - see that file
 * for why. package-lock.json is updated to match by the same npm command,
 * and both files are then staged into the commit that's in progress.
 *
 * Safe to run by hand too: `node scripts/bump-version.js`.
 */
const { execSync } = require("node:child_process");

try {
  const output = execSync("npm version patch --no-git-tag-version --allow-same-version", {
    encoding: "utf-8",
  });
  console.log(`Version bumped automatically -> ${output.trim()}`);
} catch (error) {
  console.error("Could not bump the version number:", error.message);
  process.exit(1);
}
