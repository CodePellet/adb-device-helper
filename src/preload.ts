// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer } from "electron";
import { ShellController } from "./Modules/controller/adbdh-shell-controller/adbdh-shell-controller";
import { MacroController } from "./Modules/controller/adbdh-macro-controller/adbdh-macro-controller";

const shellController: ShellController = ShellController.getInstance();
const macroController: MacroController = MacroController.getInstance();

contextBridge.exposeInMainWorld("adb", {
    track: (callback: Function) => ipcRenderer.on("adb:track-devices", (event, ...args) => callback(...args)),
    server: {
        start: () => shellController.startServer(),
        stop: () => shellController.stopServer(),
    },
});

contextBridge.exposeInMainWorld("shell", shellController);

contextBridge.exposeInMainWorld("rogcat", {
    profile: {
        get: (callback: Function) => ipcRenderer.on("rogcat:profile", (event, ...args) => callback(...args)),
        update: (callback: Function) => ipcRenderer.on("rogcat:profile-update", (event, ...args) => callback(...args)),
        create: (profile: any) => ipcRenderer.send("rogcat:profile-create", profile),
        saveChanges: (profile: any) => ipcRenderer.send("rogcat:profile-update", profile),
        delete: (profile: any) => ipcRenderer.send("rogcat:profile-delete", profile),
    },
});

contextBridge.exposeInMainWorld("macros", {
    get: (callback: (arg0: any) => any) => callback(macroController.getMacros()), // ipcRenderer.on("macros:get", (event, ...args) => callback(...args)),
    update: (callback: any) => macroController.update(callback), // ipcRenderer.on("macros:update", (event, ...args) => callback(...args)),
    execute: (command: any, callback: any) => macroController.execute(command, callback),
    save: (macro: any, callback: any) => macroController.save(macro, callback),
    delete: (macro: any, callback: any) => macroController.delete(macro, callback),
});
