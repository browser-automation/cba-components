const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const argv = require("minimist")(process.argv.slice(2));
const {existsSync} = require("fs");

// Folder where component sources reside
const srcFolder = "./src";
// Bundle output folder
const destinationFolder = "dist";
// Components, to be used from srcFolder, corresponding to
// `./[srcFolder]/[component]/[component].js` format
let components = ["cba-table", "cba-list", "cba-list-new", "cba-button", "cba-tabs", "cba-tooltip"];
// Single bundle path in destination directory if `--single-bundle` flag is used
const singleBundle = "js/cba-components.js";
const assetsPath = "img";

module.exports =
{
  context: path.resolve(__dirname),
  output: {
    path: path.resolve(destinationFolder)
  },
  optimization: {
    minimize: false
  },

  module: {
    rules: [
      // Regular css files
      {
        test: /\.css$/,
        use: 'raw-loader'
      },
      {
        test: /\.html$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: []
};

if (existsSync(`${srcFolder}/${assetsPath}`))
{
  module.exports.plugins.push(new CopyPlugin({patterns: [{from: `${srcFolder}/${assetsPath}`, to: assetsPath}]}));
}
if (process.env.COMP)
{
  components = [process.env.COMP];
}
if (process.env.SMOKE)
{
  module.exports.plugins.push(new CopyPlugin({patterns: [{from: './tests/smoke', to: "smoke", globOptions: {ignore: ["*.ejs"]}}]}));
}
if (process.env.PPTR)
{
  module.exports.plugins.push(new CopyPlugin({patterns: [{from: './tests/puppeteer/index.html', to: 'puppeteer/[name][ext]'}]}));
}
if (process.env.WATCH)
{
  module.exports.watch = true;
}
if (argv.output)
{
  module.exports.output.path = path.resolve(argv.output);
}
// Entry and output
if (argv["single-bundle"])
{
  module.exports.entry = components.map((component) => `${srcFolder}/${component}/${component}.js`);
  module.exports.output.filename = singleBundle;
}
else
{
  module.exports.entry = components.reduce((acc, component) =>
  {
    acc[component] = `${srcFolder}/${component}/${component}.js`;
    return acc;
  }, {});
  module.exports.output.filename = "js/[name]/[name].js";
}
if (argv.prod)
{
  module.exports.mode = "production";
  module.exports.optimization.minimize = true;
}
