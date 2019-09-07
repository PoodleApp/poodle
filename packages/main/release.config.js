module.exports = {
  dryRun: "true",
  branch: "master",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/github",
      {
        assets: [] // assets are attached to release draft in a separate step
      }
    ],
  ]
}
