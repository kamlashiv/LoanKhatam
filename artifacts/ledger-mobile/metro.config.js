const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Web-only packages (hoisted to the workspace root node_modules that Metro
// watches) that the mobile app never imports. Excluding them keeps Metro from
// crawling/watching their large trees and avoids transient temp-dir watch
// crashes during installs.
const ignoredWebPackages = [
  /\/node_modules\/\.pnpm\/pdfjs-dist@[^/]+\//,
  /\/node_modules\/\.pnpm\/tesseract\.js[^/]*@[^/]+\//,
];
config.resolver.blockList = config.resolver.blockList
  ? [].concat(config.resolver.blockList, ignoredWebPackages)
  : ignoredWebPackages;

module.exports = config;
