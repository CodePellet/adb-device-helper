import { dialog, ipcMain } from "electron";

ipcMain.handle("showSaveDialogSync", (event, params: Electron.SaveDialogOptions) => {
    const savePath = dialog["showSaveDialogSync"](params);
    console.log(savePath);
    return savePath;
});

ipcMain.handle("showOpenDialogSync", (event, params: Electron.OpenDialogOptions) => {
    dialog["showOpenDialogSync"](params);
});