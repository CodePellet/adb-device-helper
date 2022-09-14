// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer, shell } from "electron";
import { RogcatProfiler } from "./Modules/adbdh-rogcat-profiler";
import { MacroController } from "./Modules/controller/adbdh-macro-controller";
import { ShellController } from "./Modules/controller/adbdh-shell-controller";

const shellController: ShellController = ShellController.getInstance();
const macroController: MacroController = MacroController.getInstance();
const profiler: RogcatProfiler = RogcatProfiler.getInstance();

contextBridge.exposeInMainWorld("adb", {
  track: (callback: Function) =>
    ipcRenderer.on("adb:track-devices", (event, ...args) => callback(...args)),
  server: {
    start: () => shellController.startServer(),
    stop: () => shellController.stopServer(),
  },
});

contextBridge.exposeInMainWorld("openWithNativeApp", {
  openExternal: (target: string) => shell.openExternal(target)
})

contextBridge.exposeInMainWorld("shell", shellController);

contextBridge.exposeInMainWorld("profiler", {
  ...profiler,
  settingsProfileUpdate: (callback: Function) => ipcRenderer.on("settings:update-profile-ui", (event, ...args) => callback(...args))
});

contextBridge.exposeInMainWorld("macros", {
  get: (callback: (arg0: any) => any) => callback(macroController.getMacros()), // ipcRenderer.on("macros:get", (event, ...args) => callback(...args)),
  update: (callback: any) => macroController.update(callback), // ipcRenderer.on("macros:update", (event, ...args) => callback(...args)),
  execute: (command: any, callback: any) =>
    macroController.execute(command, callback),
  save: (macro: any, callback: any) => macroController.save(macro, callback),
  delete: (macro: any, callback: any) =>
    macroController.delete(macro, callback),
});
