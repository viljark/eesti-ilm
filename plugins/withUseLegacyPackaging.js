const { createRunOncePlugin, withAppBuildGradle } = require('@expo/config-plugins')

const withAppBuildGradleModified = (config) => {
  return withAppBuildGradle(config, async (file) => {
    const modResults = file.modResults
    modResults.contents = modResults.contents + '\nandroid.packagingOptions.jniLibs.useLegacyPackaging = true\n'
    return file
  })
}

module.exports = createRunOncePlugin(withAppBuildGradleModified, 'withAppBuildGradleMOdified', '1.0.0')
