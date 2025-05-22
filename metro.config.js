const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('png')
config.resolver.assetExts.push('svg')

module.exports = config