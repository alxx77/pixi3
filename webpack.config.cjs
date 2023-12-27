const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  mode: "development",
  entry: {
    bundle: path.resolve(__dirname, "src/index.ts"), // Update the entry file to TypeScript
    //bundle: path.resolve(__dirname, "src/index.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name][contenthash].js",
    clean: true,
    assetModuleFilename: "[name][ext]",
  },
  devtool: "source-map",
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, "dist"),
      },
    ],
    port: 3000,
    open: false,
    hot: true,
    liveReload: true,
    compress: true,
    historyApiFallback: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"], // Add TypeScript file extensions
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.tsx?$/, // Add TypeScript file extension
        use: "ts-loader",
        exclude: /node_modules/,
      },
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: "babel-loader",
      //     options: {
      //       presets: ["@babel/preset-env"],
      //     },
      //   },
      // },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Pixi Slot Machine",
      filename: "index.html",
      template: "src/template.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./assets", to: "assets" },
      ],
    }),

  ],
}
