import { JsonMap } from "@iarna/toml/index";
import { app, ipcMain } from "electron";
import { AndroidDevice } from "interfaces/common";
import { RogcatProfiler } from "../Modules/adbdh-rogcat-profiler";
import { MacroController } from "../Modules/controller/adbdh-macro-controller";
import { ShellController } from "../Modules/controller/adbdh-shell-controller";

const shellController = ShellController.getInstance();
const rogcatProfiler = RogcatProfiler.getInstance();
const macroController = MacroController.getInstance();

// APP HANDLER
ipcMain.handle("app:getVersion", (event, args) => { return app.getVersion(); });

// SHELL HANDLER
ipcMain.handle("shellController:startServer", (event, args): void => { shellController.startServer(); });

ipcMain.handle("shellController:stopServer", (event, args): void => { shellController.stopServer(); });

ipcMain.handle("shellController:getAndroidSerial", (event, args): AndroidDevice => { return shellController.getAndroidSerial(); });

ipcMain.handle("shellController:openDeviceShell", (event, args): void => { shellController.openDeviceShell(); });

ipcMain.handle("shellController:openLocalShell", (event, args): void => { shellController.openLocalShell(); });

ipcMain.handle("shellController:openRogcatShell", (event, args): void => { shellController.openRogcatShell(args); });

ipcMain.handle("shellController:openTraceLocation", (event, args): void => { shellController.openTraceLocation(); });

ipcMain.handle("shellController:setAndroidDevice", (event, args): void => { shellController.setAndroidDevice(args.serial, args.model); });

// PROFILE HANDLER
ipcMain.handle("profiler:getProfiles", (event, args): any => { return rogcatProfiler.getProfiles(); });

ipcMain.handle("profiler:create", (event, args): JsonMap => { return rogcatProfiler.create(args); });

ipcMain.handle("profiler:save", (event, args): { success: boolean, data: JsonMap } => { return rogcatProfiler.save(args); });

ipcMain.handle("profiler:delete", (event, args): JsonMap => { return rogcatProfiler.delete(args); });

ipcMain.handle("profiler:exportProfiles", (event, args): Promise<boolean> => { return rogcatProfiler.exportProfiles(); });

ipcMain.handle("profiler:importProfiles", (event, args): Promise<{ success: boolean, data: JsonMap }> => { return rogcatProfiler.importProfiles(); });

// MACRO HANDLER

ipcMain.handle("macroController:getMacros", (event, args) => { return macroController.getMacros(); });

ipcMain.handle("macroController:save", (event, args) => { return macroController.save(args); });

ipcMain.handle("macroController:delete", (event, args) => { return macroController.delete(args); });

ipcMain.handle("macroController:execute", (event, args) => { return macroController.execute(args); });
