// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer, shell } from "electron";
import { RogcatProfile, RogcatShellOptions } from "interfaces/common";


contextBridge.exposeInMainWorld("electron", {
  adb: {
    track: (callback: Function) =>
      ipcRenderer.on("adb:track-devices", (event, ...args) => callback(...args)),
    server: {
      start: () => ipcRenderer.invoke("shellController:startServer"),
      stop: () => ipcRenderer.invoke("shellController:stopServer")
    },
  },
  external: {
    openExternal: (target: string) => shell.openExternal(target)
  },
  shell: {
    getAndroidSerial: () => ipcRenderer.invoke("shellController:getAndroidSerial"),
    openDeviceShell: () => ipcRenderer.invoke("shellController:openDeviceShell"),
    openLocalShell: () => ipcRenderer.invoke("shellController:openLocalShell"),
    openRogcatShell: (shellOptions: RogcatShellOptions) => ipcRenderer.invoke("shellController:openRogcatShell", shellOptions),
    openTraceLocation: () => ipcRenderer.invoke("shellController:openTraceLocation"),
    setAndroidDevice: (serial: string, model: string) => ipcRenderer.invoke("shellController:setAndroidDevice", { serial, model })
  },
  macro: {
    get: async (callback: Function) => callback(await ipcRenderer.invoke("macroController:getMacros")), // callback(macroController.getMacros()), // ipcRenderer.on("macros:get", (event, ...args) => callback(...args)),
    save: async (macro: any, callback: Function) => callback(await ipcRenderer.invoke("macroController:save", macro)), // macroController.save(macro, callback),
    delete: async (macro: any, callback: Function) => callback(await ipcRenderer.invoke("macroController:delete", macro)), //macroController.delete(macro, callback),
    execute: async (command: any, callback: Function) => callback(await ipcRenderer.invoke("macroController:execute", command)), // macroController.execute(command, callback),

  },
  profiler: {
    getProfiles: async (callback: Function) => callback(await ipcRenderer.invoke("profiler:getProfiles")),
    create: (profile: RogcatProfile) => ipcRenderer.invoke("profiler:create", profile),
    save: (profile: RogcatProfile) => ipcRenderer.invoke("profiler:save", profile),
    delete: (profileName: string) => ipcRenderer.invoke("profiler:delete", profileName),
    exportProfiles: () => ipcRenderer.invoke("profiler:exportProfiles"),
    importProfiles: () => ipcRenderer.invoke("profiler:importProfiles"),
    settingsProfileUpdate: (callback: Function) => ipcRenderer.on("settings:update-profile-ui", (event, ...args) => callback(...args))
  }
})
