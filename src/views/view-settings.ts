import { app, BrowserWindow } from "electron";
import path from "path";

export class SettingsView {
    public static _instance: SettingsView;
    private settingsWindow!: BrowserWindow;

    private constructor() { }

    public static getInstance(): SettingsView {
        return this._instance || (this._instance = new this());
    }
    public show(parent: BrowserWindow) {
        this.settingsWindow = new BrowserWindow({
            parent: parent,
            title: "Settings",
            height: 600,
            width: 1000,
            icon: path.join(app.getAppPath(), "assets", "icons", "win", "icon.ico"),
            autoHideMenuBar: true,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, "..", "preload.js")
            }
        });
        this.settingsWindow.loadFile(path.join(__dirname, "..", "..", "public", "views", "settings.html"));
        this.settingsWindow.on("ready-to-show", () => {
            this.settingsWindow.show();
        });

        this.settingsWindow.on("closed", () => {
            parent.webContents.send("settings:update-profile-ui", {});
        });

    }
}