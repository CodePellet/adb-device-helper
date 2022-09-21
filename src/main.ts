// eslint-disable-next-line import/no-extraneous-dependencies
import { AdbDeviceTracker } from "adbdevicetracker";
import { app, BrowserWindow, BrowserWindowConstructorOptions, Menu, MenuItemConstructorOptions, shell } from "electron";
import * as log from "electron-log";
import * as fs from "fs";
import * as path from "path";
import "./handler/ipcMainHandler";
import { EnvController } from "./Modules/controller/adbdh-env-controller";
import { Views, ViewType } from "./views/views";


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
        sandbox: true,
        preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: false,
};

const tracker = AdbDeviceTracker.getInstance();
const env = EnvController.getInstance();
const views = Views.getInstance();

const mainMenuTemplate: MenuItemConstructorOptions[] = [
    {
        role: "fileMenu",
        submenu: [
            {
                label: "Settings",
                click: () => { views.showView(ViewType.SETTINGS, mainWindow) }
            },
            { role: "quit" }
        ]
    },
    {
        role: "viewMenu",
        submenu: [
            {
                role: "zoomIn",
            },
            {
                role: "zoomOut",
            },
            {
                role: "resetZoom",
                label: "Reset Zoom"
            },
            {
                type: "separator"
            },
            {
                role: "togglefullscreen"
            }
        ]
    },
    {
        role: "help",
        submenu: [
            {
                label: "View on GitHub",
                click: () => { shell.openExternal("https://github.com/CodePellet/adb-device-helper") }
            }
        ]
    }
]


log.debug("[Main]", "Setting up environment");
env.setup();

const createWindow = () => {
    mainWindow = new BrowserWindow(mainWindowOptions);
    // Load html into window
    mainWindow.loadFile(path.join(__dirname, "..", "public", "views", "main.html"));
    mainWindow.setMenu(Menu.buildFromTemplate(mainMenuTemplate))

    if (!app.isPackaged) mainWindow.webContents.openDevTools({ mode: "detach", activate: false });

    mainWindow.on("close", () => { console.log(mainWindow.getBounds()); });

    mainWindow.on("closed", () => app.quit());

    mainWindow.webContents.on("dom-ready", onDomReady);
}

let prevError: NodeJS.ErrnoException = { name: "", message: "", code: "" };
const onDomReady = () => {
    if (!fs.existsSync(env.tmpPath)) fs.mkdirSync(env.tmpPath);

    tracker.start();

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
};

// Listen for app to be ready
app.on("ready", createWindow);