module.exports = {
  preset: "ts-jest",
  runner: "@jest-runner/electron/main",
  setupFilesAfterEnv: ["./jest.setup.js"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/lib/", "/out/"],
}
