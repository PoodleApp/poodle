const path = require("path")
const reactAppConfig = require("eslint-config-react-app")

module.exports = {
  ...reactAppConfig,
  plugins: ["import"],
  overrides: {
    ...reactAppConfig.overrides,
    parserOptions: {
      ...reactAppConfig.overrides.parserOptions,
      project: path.join(__dirname, "tsconfig.json"),
      tsconfigRootDir: __dirname,
      warnOnUnsupportedTypeScriptVersion: false
    }
  },
  rules: Object.fromEntries(
    Object.entries(reactAppConfig.rules).filter(
      ([rule]) =>
        !rule.startsWith("flowtype/") &&
        !rule.startsWith("jsx") &&
        !rule.startsWith("react")
    )
  )
}
