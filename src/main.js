// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const log = require("electron-log");
const adbDeviceTracker = require("adbdh-device-tracker");
const rogcatProfiler = require("adbdh-rogcat-profiler");
const envController = require("adbdh-env-controller");

/**
 * @type {BrowserWindow}
 */
let mainWindow;
Menu.setApplicationMenu(null);

log.debug("[Main]", "Setting up environment");
envController.setup();
log.debug("[Main]", "ADB_VENDOR_KEYS", process.env.ADB_VENDOR_KEYS);
log.debug("[Main]", "ADB_VENDOR_KEYS", process.env.ADB_VENDOR_KEYS);
log.debug("[Main]", "PATH", process.env.PATH);

// Listen for app to be ready
app.on("ready", () => {
    // Create new window
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        resizable: true,
        icon: path.join(app.getAppPath(), "assets", "icons", "win", "icon.ico"),
        title: `ADB-Device-Helper - v${app.getVersion()}`,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(app.getAppPath(), "src", "preload.js"),
            worldSafeExecuteJavaScript: true,
        },
    });

    // Load html into window
    mainWindow.loadFile(path.join(app.getAppPath(), "public", "mainWindow2.html"));

    if (!app.isPackaged) mainWindow.webContents.openDevTools({ mode: "detach", activate: false });

    mainWindow.on("close", () => {
        // console.log(mainWindow.getBounds());
    });

    mainWindow.on("closed", () => {
        app.quit();
    });

    mainWindow.webContents.on("dom-ready", () => {
        if (!fs.existsSync(envController.tmpPath)) fs.mkdirSync(envController.tmpPath);
        adbDeviceTracker.setMainWindowRef(mainWindow);
        adbDeviceTracker.connect();
        mainWindow.webContents.send("rogcat:profile", rogcatProfiler.getProfiles());
        mainWindow.webContents.send("app:version", app.getVersion());
    });
});
