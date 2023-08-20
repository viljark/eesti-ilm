const { withAndroidManifest } = require('@expo/config-plugins')
const path = require('path')
const { Paths } = require('@expo/config-plugins/build/android')
const fs = require('fs')

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true })
  let entries = await fs.promises.readdir(src, { withFileTypes: true })

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name)
    let destPath = path.join(dest, entry.name)

    entry.isDirectory() ? await copyDir(srcPath, destPath) : await fs.promises.copyFile(srcPath, destPath)
  }
}

const withNotificationIcons = (config) => {
  config = withAndroidManifest(config, async (config) => {
    const resDir = await Paths.getResourceFolderAsync(config.modRequest.projectRoot)

    try {
      await copyDir(path.join(__dirname, '../assets/res'), resDir)
    } catch (e) {
      throw e
    }

    return config
  })

  return config
}
module.exports = withNotificationIcons
