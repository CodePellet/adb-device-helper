const HtmlWebpackPlugin = require("html-webpack-plugin");

/** @type {import("webpack").Configuration} */
module.exports = [
    /** MAIN THREAD */
    {
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
    /** ELECTRON PRELOAD */
    {
        entry: "./src/preload.ts",
        target: "electron-preload",
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
            filename: "preload.js",
        }
    },
    /** MAIN RENDER THREAD */
    {
        entry: "./public/js/script.ts",
        target: "electron-renderer",
        resolve: { extensions: [".ts", ".js"] },
        module: {
            rules: [{
                test: /\.ts$/,
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
        entry: "./public/js/settings.ts",
        target: "electron-renderer",
        resolve: { extensions: [".ts", ".js"] },
        module: {
            rules: [{
                test: /\.ts$/,
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