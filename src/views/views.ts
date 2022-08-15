import { BrowserWindow } from "electron";
import { SettingsView } from "./view-settings";

export enum ViewType {
    SETTINGS = "settings",
    ABOUT = "about"
}


export class Views {

    private static _instance: Views;

    private constructor() { }

    public static getInstance(): Views {
        return this._instance || (this._instance = new this());
    }

    public showView(view: ViewType, parent: BrowserWindow) {
        if (view == ViewType.SETTINGS) SettingsView.getInstance().show(parent);
        if (view == ViewType.ABOUT) console.log("Show view:", view);
    }
}