const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const fs = require("fs");
const path = require("path");

function findBuildFiles(pattern) {
  const buildDir = path.join(__dirname, "build");
  const files = [];

  function searchDir(dir, pattern) {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        searchDir(fullPath, pattern);
      } else if (pattern.test(item)) {
        files.push(path.relative(__dirname, fullPath));
      }
    });
  }

  searchDir(path.join(buildDir, "static"), pattern);
  return files;
}

module.exports = {
  packagerConfig: {
    asar: true,
    ignore: [
      /node_modules\/(?!(@mui|react|react-dom))/,
      /\.map$/,
      /\.test\./,
      /\.md$/,
      /\.txt$/,
      /\.log$/,
      /\.git/,
      /\.github/,
      /\.vscode/,
      /^\/src\/(?!main\.js|preload\.js)/,
      /^\/(?!build|src|package\.json)/,
      /^\/build\/static\/js\/.*\.txt$/,
      /^\/build\/static\/media/,
      /^\/build\/static\/.*\.map$/,
    ],
    prune: true,
    overwrite: true,
    extraResource: [
      "build/index.html",
      ...findBuildFiles(/main\.[a-f0-9]+\.(js|css)$/),
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
