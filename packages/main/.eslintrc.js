const path = require("path")

module.exports = {
  extends: ["eslint-config-react-app"],
  overrides: {
    files: ["**/*.ts", "**/*.tsx"],
    parserOptions: {
      project: path.join(__dirname, "tsconfig.json"),
      tsconfigRootDir: __dirname,
      warnOnUnsupportedTypeScriptVersion: false
    },
    rules: {
      "default-case": "off"
    }
  }
}
