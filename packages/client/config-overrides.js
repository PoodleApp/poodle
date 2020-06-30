const { override } = require("customize-cra")
const cspHtmlWebpackPlugin = require("csp-html-webpack-plugin")

const cspConfigPolicy = {
  "default-src": ["'none'"],
  "script-src": [],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "cid:", "mid:"],
  "child-src": ["data:"],
  "font-src": ["'self'"],
  "media-src": ["'self'", "data:", "cid:", "mid:"],
  "object-src": ["'none'"],
  "form-action": ["'none'"]
}

const cspConfigPolicy_dev = {
  ...cspConfigPolicy,
  "connect-src": ["'self'", "ws://localhost:3000"],
  "script-src": [
    "chrome-extension:",
    // Hash of source for react overlay iframe which displays error information
    // in development mode. It might be necessary to update this hash when
    // changing React versions.
    "'sha256-QAj9SgqS0tkqFXsMg6gbHzN3KfNnrPW0N0FCdMzN3MI='"
  ]
}

function addCspHtmlWebpackPlugin(config) {
  const policy =
    process.env.NODE_ENV === "production"
      ? cspConfigPolicy
      : cspConfigPolicy_dev
  config.plugins.push(
    new cspHtmlWebpackPlugin(policy, {
      nonceEnabled: {
        // We need to disable nonces for styles because we want to use the
        // `unsafe-inline` option, and if any nonces or hashes are included in
        // a CSP policy then `unsafe-inline` is ignored.
        "style-src": false
      }
    })
  )
  return config
}

module.exports = {
  webpack: override(addCspHtmlWebpackPlugin)
}
