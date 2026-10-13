// Single source of truth for the app version: package.json's "version" field,
// which is bumped automatically on every commit (see scripts/bump-version.js
// and .husky/pre-commit). Everything else in app.json is used as-is.
const { version } = require("./package.json");

module.exports = ({ config }) => ({ ...config, version });
