import * as childProcess from "child_process";
//@ts-ignore
import * as db from "electron-db";
import * as log from "electron-log";

import { ShellController } from "../adbdh-shell-controller/adbdh-shell-controller"

const DATABASENAME = "macros";

export class MacroController {

    private static _instance: MacroController;
    private macros: Object[] = [];
    private shellController: ShellController = ShellController.getInstance();

    private constructor() {
        if (!db.tableExists()) db.createTable(DATABASENAME, (succ: any, msg: any) => log.info("[ADBDH-MacroController]", "[DATABASE]", "create", "success", succ, "-", "message", msg));

        this.execute = this.execute.bind(this);
        this.update = this.update.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);

    }

    public static getInstance(): MacroController {
        return this._instance || (this._instance = new this());
    }

    public getMacros() {
        if (db.valid(DATABASENAME))
            db.getAll(DATABASENAME, (succ: any, data: Object[]) => {
                if (!succ) { log.error("[MacroController]", "Error retrieving macros from database!"); return; }
                this.macros = data;
            });

        return this.macros;
    }


    public execute(command: any, callback: (arg0: any, arg1: childProcess.ExecException | null, arg2: string, arg3: string) => void): void {
        log.info("[MacroController]", "Execute command", command, "on device", this.shellController.getAndroidSerial().serial);
        // const cmdResult = childProcess.exec(`START "ADB Shell Window - Device ${this.androidSerial}" powershell -noexit -nologo -Command "adb shell '${command}'"`, {
        const cmdResult = childProcess.exec(`adb shell "${command}"`, {
            cwd: process.env.TMP,
            env: process.env,
        }, (error, stdout, stderr) => {
            log.info("[MacroController]", "error", error);
            log.info("[MacroController]", "stdOut", stdout.trim());
            log.info("[MacroController]", "stderr", stderr.trim());
            callback(command, error, stdout.trim(), stderr.trim());
        });
    }

    public update(callback: (arg0: Object[]) => void): void {
        log.info("[MacroController]", "Update", this.macros);
        callback(this.macros);
    }

    public save(macro: { name: any; }, cb: (arg0: Object[]) => void): void {
        if (db.valid(DATABASENAME))
            db.updateRow(DATABASENAME, { name: macro.name }, macro, (succ: any, msg: any) => {
                log.info("[MacroController]", "update row", "success", succ, "message", msg);
                if (!succ)
                    db.insertTableContent(DATABASENAME, macro, (succ: any, msg: any) => {
                        log.info("[MacroController]", "[Database]", "insertTableContent", "success", succ, "message", msg);
                    });
            });

        log.info("[MacroController]", "Command", macro);
        cb(this.getMacros());
    }

    public delete(profile: any, callback: (arg0: Object[]) => void): void {
        log.info("[MacroController]", "Delete profile", profile);
        db.deleteRow(DATABASENAME, { name: profile }, (succ: any, msg: any) => {
            if (succ) { log.info("[MacroController]", "Delete row", profile, "from database", "Result:", msg); return; }
            log.error("[MacroController]", "Error", msg);
        });

        callback(this.getMacros());
    }

}
