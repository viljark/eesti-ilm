const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Opt out of package.json exports resolution if Firebase packages cause issues
// Uncomment the following line if you encounter ESM-related errors with Firebase:
// config.resolver.unstable_enablePackageExports = false;

module.exports = config;
