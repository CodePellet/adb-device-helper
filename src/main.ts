// eslint-disable-next-line import/no-extraneous-dependencies
import { AdbDeviceTracker } from "adbdevicetracker";
import { app, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import * as log from "electron-log";
import * as fs from "fs";
import * as path from "path";
import { RogcatProfiler } from "./Modules/adbdh-rogcat-profiler";
import { EnvController } from "./Modules/controller/adbdh-env-controller";


let mainWindow: BrowserWindow;
const mainWindowOptions: BrowserWindowConstructorOptions = {
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
    autoHideMenuBar: true
};

const tracker = new AdbDeviceTracker();
const profiler = RogcatProfiler.getInstance();
const env = EnvController.getInstance();

log.debug("[Main]", "Setting up environment");
env.setup();

const createWindow = () => {
    mainWindow = new BrowserWindow(mainWindowOptions);
    // Load html into window
    mainWindow.loadFile(path.join(__dirname, "..", "public", "mainWindow2.html"));

    if (!app.isPackaged) mainWindow.webContents.openDevTools({ mode: "detach", activate: false });

    mainWindow.on("close", () => { console.log(mainWindow.getBounds()); });

    mainWindow.on("closed", () => app.quit());

    mainWindow.webContents.on("dom-ready", onDomReady);

}

const onDomReady = () => {
    if (!fs.existsSync(env.tmpPath)) fs.mkdirSync(env.tmpPath);
    tracker.start();

    let prevError: NodeJS.ErrnoException = { name: "", message: "", code: "" };

    tracker
        .on("info", message => {
            log.info(message);
        })
        .on("data", adbDevices => {
            prevError = { name: "", message: "", code: "" };
            mainWindow.webContents.send("adb:track-devices", adbDevices);
        })
        .on("error", (error: NodeJS.ErrnoException) => {
            if (prevError.code !== error.code) {
                prevError = error;
                log.error("[Tracker:Error]", { error: { ...error } });
                mainWindow.webContents.send("adb:track-devices", { error: { ...error } });
            }
        });
    mainWindow.webContents.send("rogcat:profile", profiler.getProfiles());
};

// Listen for app to be ready
app.on("ready", createWindow);
