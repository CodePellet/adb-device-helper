// eslint-disable-next-line import/no-extraneous-dependencies
import { EnvController } from "@Controller/adbdh-env-controller";
import "@Handler/ipcMainHandler";
import { Views, ViewType } from "@Views/views";
import { AdbDeviceTracker } from "adbdevicetracker";
import { app, BrowserWindow, BrowserWindowConstructorOptions, Menu, MenuItemConstructorOptions, shell } from "electron";
import * as log from "electron-log";
import * as fs from "fs";
import * as path from "path";


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
            },
            {
                type: "separator"
            },
            {
                label: "Open log file",
                click: () => shell.openExternal(path.resolve(process.env.APPDATA!, app.getName(), "logs", "main.log"))
            }
        ]
    }
]


log.debug("[Main]", "Setting up environment");
env.setup();

const onDomReady = () => {
    let prevError: NodeJS.ErrnoException = { name: "", message: "", code: "" };
    if (!fs.existsSync(env.tmpPath)) fs.mkdirSync(env.tmpPath);

    tracker.removeAllListeners();
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
                log.error("[Tracker:Error]", [{ error: { ...error } }]);
                mainWindow.webContents.send("adb:track-devices", [{ error: { ...error } }]);
            }
        });
};

const createWindow = () => {
    mainWindow = new BrowserWindow(mainWindowOptions);
    // Load html into window
    mainWindow.loadFile(path.resolve(__dirname, "..", "public", "views", "main.html"));
    mainWindow.setMenu(Menu.buildFromTemplate(mainMenuTemplate))

    if (!app.isPackaged) mainWindow.webContents.openDevTools({ mode: "detach", activate: false });

    mainWindow.on("close", () => { console.log(mainWindow.getBounds()); });

    mainWindow.on("closed", () => app.quit());

    mainWindow.webContents.on("dom-ready", onDomReady);
}



// Listen for app to be ready
app.on("ready", createWindow);