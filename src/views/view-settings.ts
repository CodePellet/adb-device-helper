import { BrowserWindow, Settings } from "electron";
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
            autoHideMenuBar: true
        });
        this.settingsWindow.loadFile(path.join(__dirname, "..", "..", "public", "views", "settings.html"));
        this.settingsWindow.show();
    }
}