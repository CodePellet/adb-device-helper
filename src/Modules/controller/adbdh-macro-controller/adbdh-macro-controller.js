const adbdhShellController = require("adbdh-shell-controller");
const childProcess = require("child_process");
const db = require("electron-db");
const path = require("path");
const log = require("electron-log");

const DATABASENAME = "macros";

class MacroController {
    constructor() {
        this.macros = null;

        if (!db.tableExists()) db.createTable(DATABASENAME, (succ, msg) => log.info("[ADBDH-MacroController]", "[DATABASE]", "create", "success", succ, "-", "message", msg));

        this.execute = this.execute.bind(this);
        this.update = this.update.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);

    }

    getMacros() {
        if (db.valid(DATABASENAME))
            db.getAll(DATABASENAME, (succ, data) => {
                if (!succ) { log.error("[MacroController]", "Error retrieving macros from database!"); return; }
                this.macros = data;
            });

        return this.macros;
    }


    execute(command, callback) {
        log.info("[MacroController]", "Execute command", command, "on device", adbdhShellController.androidSerial);
        // const cmdResult = childProcess.exec(`START "ADB Shell Window - Device ${this.androidSerial}" powershell -noexit -nologo -Command "adb shell '${command}'"`, {
        const cmdResult = childProcess.exec(`adb shell "${command}"`, {
            cwd: this.tmpPath,
            env: process.env,
        }, (error, stdout, stderr) => {
            log.info("[MacroController]", "error", error);
            log.info("[MacroController]", "stdOut", stdout.trim());
            log.info("[MacroController]", "stderr", stderr.trim());
            callback(command, error, stdout.trim(), stderr.trim());
        });
    }

    update(callback) {
        log.info("[MacroController]", "Update", this.macros);
        callback(this.macros);
    }

    save(macro, cb) {
        if (db.valid(DATABASENAME))
            db.updateRow(DATABASENAME, { name: macro.name }, macro, (succ, msg) => {
                log.info("[MacroController]", "update row", "success", succ, "message", msg);
                if (!succ)
                    db.insertTableContent(DATABASENAME, macro, (succ, msg) => {
                        log.info("[MacroController]", "[Database]", "insertTableContent", "success", succ, "message", msg);
                    });
            });

        log.info("[MacroController]", "Command", macro);
        cb(this.getMacros());
    }

    delete(profile, callback) {
        log.info("[MacroController]", "Delete profile", profile);
        db.deleteRow(DATABASENAME, {name: profile}, (succ, msg) => {
            if(succ) {log.info("[MacroController]", "Delete row", profile, "from database", "Result:", msg); return;}
            log.error("[MacroController]", "Error", msg);
        });

        callback(this.getMacros());
    }

}

module.exports = new MacroController()