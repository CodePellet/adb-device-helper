// eslint-disable-next-line import/no-extraneous-dependencies
import { AdbDeviceTracker } from "adbdevicetracker";
import { EnvController } from "./Modules/controller/adbdh-env-controller/adbdh-env-controller";
import { RogcatProfiler } from "./Modules/adbdh-rogcat-profiler/adbdh-rogcat-profiler";
import { app, BrowserWindow, Menu } from "electron";
import * as log from "electron-log";
import * as fs from "fs";
import * as path from "path";

/**
 * @type {BrowserWindow}
 */
let mainWindow: BrowserWindow;
Menu.setApplicationMenu(null);

const tracker = new AdbDeviceTracker();
const profiler = RogcatProfiler.getInstance();
const env = EnvController.getInstance();

log.debug("[Main]", "Setting up environment");
env.setup();

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
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // Load html into window
    mainWindow.loadFile(path.join(__dirname, "..", "public", "mainWindow2.html"));

    if (!app.isPackaged) mainWindow.webContents.openDevTools({ mode: "detach", activate: false });

    mainWindow.on("close", () => {
        // console.log(mainWindow.getBounds());
    });

    mainWindow.on("closed", () => app.quit());

    mainWindow.webContents.on("dom-ready", () => {
        if (!fs.existsSync(env.tmpPath)) fs.mkdirSync(env.tmpPath);
        tracker.start();
        tracker
            .on("info", message => {
                log.info(message);
            })
            .on("data", adbDevices => {
                mainWindow.webContents.send("adb:track-devices", adbDevices);
            })
            .on("error", (error: NodeJS.ErrnoException) => {
                log.error("[Tracker:Error]", { error: { ...error, name: error.code ?? error.name, message: error.message } });
                mainWindow.webContents.send("adb:track-devices", { error: { ...error, name: error.code ?? error.name, message: error.message } });
            });
        mainWindow.webContents.send("rogcat:profile", profiler.getProfiles());
    });
});