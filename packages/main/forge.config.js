const child_process = require("child_process")
const fs = require("fs-extra")
const path = require("path")

module.exports = {
  packagerConfig: {
    afterCopy: [installFrontendAssets, installPoodleCommon],
    asar: true
  },
  plugins: [["@electron-forge/plugin-auto-unpack-natives"]],
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "Poodle"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"]
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        maintainer: "Jesse Hallett",
        homepage: "https://poodleapp.com/"
      }
    }
  ]
}

async function installFrontendAssets(
  buildPath,
  _electronVersion,
  _platform,
  _arch,
  callback
) {
  await exec("yarn build", { cwd: path.join("..", "client") })
  await fs.copy(
    path.join("..", "client", "build"),
    path.join(buildPath, "public")
  )
  callback()
}

async function installPoodleCommon(
  buildPath,
  _electronVersion,
  _platform,
  _arch,
  callback
) {
  await fs.copy(
    path.join("..", "common"),
    path.join(buildPath, "node_modules", "poodle-common")
  )
  callback()
}

function exec(cmd, options) {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      }
      resolve({ stdout, stderr })
    })
  })
}
