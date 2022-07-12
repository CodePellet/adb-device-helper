const { shell } = require("electron");
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const envController = require("adbdh-env-controller");
const log = require("electron-log");

class ShellController {
    constructor() {
        this.androidDevice = {};
        this.tmpPath = envController.tmpPath;

        this.startServer = this.startServer.bind(this);
        this.stopServer = this.stopServer.bind(this);

        this.setAndroidDevice = this.setAndroidDevice.bind(this);
        this.openLocalShell = this.openLocalShell.bind(this);
        this.openDeviceShell = this.openDeviceShell.bind(this);
        this.openTraceLocation = this.openTraceLocation.bind(this);
    }

    setAndroidDevice(serial, model) {
        this.androidDevice.serial = serial;
        this.androidDevice.model = model;
        process.env.ANDROID_SERIAL = serial;
    }

    startServer() {
        log.info("[ShellController]", "Start adb-server");
        childProcess.exec(`powershell -nologo -Command adb start-server`, {
            cwd: this.tmpPath,
            env: process.env,
        });
    }

    stopServer() {
        log.info("[ShellController]", "Stop adb-server");
        childProcess.exec(`powershell -nologo -Command adb kill-server`, {
            cwd: this.tmpPath,
            env: process.env,
        });
    }

    openLocalShell() {
        log.info("[ShellController]", "Open local shell for device", this.androidDevice.serial, this.androidDevice.model);
        childProcess.exec(`START "Device ${this.androidDevice.model}" powershell -noexit -nologo`, {
            cwd: this.tmpPath,
            env: process.env,
        });
    }

    openDeviceShell() {
        log.info("[ShellController]", "Open device shell for device", this.androidDevice.serial, this.androidDevice.model);
        childProcess.exec(`START "Device ${this.androidDevice.model}" powershell -noexit -nologo -Command adb shell`, {
            cwd: this.tmpPath,
            env: process.env,
        });
    }

    openRogcatShell(options) {
        log.info("[ShellController]", "Open rogcat shell for device", this.androidDevice.serial, this.androidDevice.model);
        if (!fs.existsSync(this.tmpPath)) fs.mkdirSync(this.tmpPath);
        const date = new Date();
        const dateString = `${date.getFullYear()}${date.getMonth() > 9 ? date.getMonth() : `0${date.getMonth() + 1}`}${date.getDay() > 9 ? date.getDay() : `0${date.getDay()}`
            }T${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
        const tmpRogcatTraceFile = `rogcat_${process.env.ANDROID_SERIAL.replace(":", "")}_${dateString}.log`;

        if (options.saveTraceToFile) {
            log.info("[ShellController]", "Saving trace to file", path.join(this.tmpPath, tmpRogcatTraceFile));
            childProcess.exec(
                `START "Rogcat Logger - Device ${this.androidDevice.model} - Profile ${options.activeProfile
                }" powershell -noexit -nologo -Command rogcat -p ${options.activeProfile} -o "${path.join(
                    this.tmpPath,
                    tmpRogcatTraceFile
                )}"`,
                {
                    cwd: this.tmpPath,
                    env: process.env,
                }
            );
        }

        // let rogcatViewShell = childProcess.exec(`START cmd /K rogcat -p ${options.activeProfile}`, {
        childProcess.exec(
            `START "Rogcat Viewer - Device ${this.androidDevice.model} - Profile ${options.activeProfile}" powershell -noexit -nologo -WindowStyle Maximized -Command rogcat -p ${options.activeProfile}`,
            {
                cwd: this.tmpPath,
                env: process.env,
            }
        );
    }

    openTraceLocation() {
        if (!fs.existsSync(this.tmpPath)) fs.mkdirSync(this.tmpPath);
        shell.openPath(this.tmpPath);
    }
}

module.exports = new ShellController();
