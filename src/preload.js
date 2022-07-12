// eslint-disable-next-line import/no-extraneous-dependencies
const { contextBridge, ipcRenderer } = require("electron");
const shellController = require("adbdh-shell-controller");
const macroController = require("adbdh-macro-controller");

contextBridge.exposeInMainWorld("adb", {
    track: (callback) => ipcRenderer.on("adb:track-devices", (event, ...args) => callback(...args)),
    server: {
        start: () => shellController.startServer(),
        stop: () => shellController.stopServer(),
    },
});

// contextBridge.exposeInMainWorld("shell", {
//     openLocalShell: () => shellController.openLocalShell(),
//     openDeviceShell: () => shellController.openDeviceShell(),
//     openRogcatShell: (options) => shellController.openRogcatShell(options),
//     setAndroidSerial: (serial) => shellController.setAndroidSerial(serial),
//     openTraceLocation: () => shellController.openTraceLocation(),
// });
contextBridge.exposeInMainWorld("shell", shellController);

contextBridge.exposeInMainWorld("rogcat", {
    profile: {
        get: (callback) => ipcRenderer.on("rogcat:profile", (event, ...args) => callback(...args)),
        update: (callback) => ipcRenderer.on("rogcat:profile-update", (event, ...args) => callback(...args)),
        create: (profile) => ipcRenderer.send("rogcat:profile-create", profile),
        saveChanges: (profile) => ipcRenderer.send("rogcat:profile-update", profile),
        delete: (profile) => ipcRenderer.send("rogcat:profile-delete", profile),
    },
});

contextBridge.exposeInMainWorld("macros", {
    get: (callback) => callback(macroController.getMacros()), // ipcRenderer.on("macros:get", (event, ...args) => callback(...args)),
    update: (callback) => macroController.update(callback), // ipcRenderer.on("macros:update", (event, ...args) => callback(...args)),
    execute: (command, callback) => macroController.execute(command, callback),
    save: (macro, callback) => macroController.save(macro, callback),
    delete: (macro, callback) => macroController.delete(macro, callback),
},
);
