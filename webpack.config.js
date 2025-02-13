const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

// Create two separate configurations
module.exports = [
  // First config - unminified version
  {
    entry: {
      ["global"]: "./src/index.js",
    },
    mode: "production",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      library: "[name]",
      libraryTarget: "umd",
      globalObject: "this",
      umdNamedDefine: true,
      clean: false, // Changed to false so it doesn't remove the minified version
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
        {
          test: /\.css$/i,
          include: path.resolve(__dirname, "src"),
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
      ],
    },
    resolve: {
      extensions: ["*", ".js", ".jsx"],
    },
    optimization: {
      minimize: false, // Ensure this version is not minified
    },
  },

  // Second config - minified version
  {
    entry: {
      ["global.min"]: "./src/index.js",
    },
    mode: "production",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      library: "global", // Keep the library name consistent
      libraryTarget: "umd",
      globalObject: "this",
      umdNamedDefine: true,
      clean: false,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
        {
          test: /\.css$/i,
          include: path.resolve(__dirname, "src"),
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
      ],
    },
    resolve: {
      extensions: ["*", ".js", ".jsx"],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    },
  },
];
