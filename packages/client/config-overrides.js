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
  "script-src": ["chrome-extension:"]
}

function addCspHtmlWebpackPlugin(config) {
  const policy =
    process.env.NODE_ENV === "production"
      ? cspConfigPolicy
      : cspConfigPolicy_dev
  config.plugins.push(new cspHtmlWebpackPlugin(policy))
  return config
}

module.exports = {
  webpack: override(addCspHtmlWebpackPlugin)
}
