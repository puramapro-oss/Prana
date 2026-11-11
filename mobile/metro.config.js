const path = require("path")
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const projectRoot = __dirname
const srcLib = path.resolve(projectRoot, "../src/lib")
const config = getDefaultConfig(projectRoot)
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.join(srcLib, "regulate"),
  path.join(srcLib, "supabase"),
]
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")]

module.exports = withNativeWind(config, { input: "./global.css" })
