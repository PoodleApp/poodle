module.exports = {
  preset: "ts-jest",
  runner: "@jest-runner/electron/main",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/lib/"]
}
