
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

/** @type {import("webpack").Configuration} */
module.exports = [
    /** MAIN THREAD */
    {
        mode: "development",
        entry: "./src/main.ts",
        target: "electron-main",
        resolve: { extensions: [".ts", ".js"] },
        module: {
            rules: [{
                test: /\.ts$/,
                include: /src/,
                use: [{ loader: "ts-loader" }]
            }]
        },
        output: {
            path: `${__dirname}/dist/src`,
            filename: "main.js",

        }
    },
    {
        mode: "development",
        entry: "./src/preload.ts",
        target: "electron-preload",
        module: {
            rules: [{
                test: /\.ts$/,
                include: /src/,
                use: [{ loader: "ts-loader" }]
            }]
        },
        output: {
            path: `${__dirname}/dist/src`,
            filename: "preload.js",
        }
    },
    /** MAIN RENDER THREAD */
    {
        mode: "development",
        entry: "./public/js/script.ts",
        target: "electron-renderer",
        resolve: { extensions: [".ts", ".js"] },
        module: {
            rules: [{
                test: /\.ts(x?)$/,
                include: /public/,
                use: [{ loader: "ts-loader" }]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./public/views/main.html",
                filename: "views/main.html"
            })
        ],
        output: {
            path: `${__dirname}/dist/public`,
            filename: "js/script.js",
        }
    },
    /** SETTINGS VIEW THREAD */
    {
        mode: "development",
        entry: "./public/js/settings.ts",
        target: "electron-renderer",
        resolve: { extensions: [".ts", ".js"] },
        module: {
            rules: [{
                test: /\.ts(x?)$/,
                include: /public/,
                use: [{ loader: "ts-loader" }]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./public/views/settings.html",
                filename: "views/settings.html"
            })
        ],
        output: {
            path: `${__dirname}/dist/public`,
            filename: "js/settings.js",
        }
    }
];