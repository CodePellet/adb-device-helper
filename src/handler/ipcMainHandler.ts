import { dialog, ipcMain } from "electron";

ipcMain.handle("showSaveDialogSync", (event, params: Electron.SaveDialogOptions) => {
    return dialog["showSaveDialogSync"](params);
});

ipcMain.handle("showOpenDialogSync", (event, params: Electron.OpenDialogOptions) => {
    return dialog["showOpenDialogSync"](params);
});