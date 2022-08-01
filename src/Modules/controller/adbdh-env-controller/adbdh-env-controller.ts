import { execSync } from "child_process";
import * as log from "electron-log";
import * as fs from "fs";
import * as path from "path";

export class EnvController {

    private static _instance: EnvController;

    public tmpPath: string;


    private constructor() {
        this.tmpPath = path.join(process.env.TMP!, "ADBDH");

        this.setup = this.setup.bind(this);
        this.createOrExpandEnvVariable = this.createOrExpandEnvVariable.bind(this);
    }

    public static getInstance(): EnvController {
        return this._instance || (this._instance = new this());
    }

    public setup(): void {
        this.createOrExpandEnvVariable("PATH", this.getRunningAdbProcessPath());
        this.createOrExpandEnvVariable("PATH", path.join(process.resourcesPath, "adb-micro", "bin"));
        this.createOrExpandEnvVariable("PATH", path.join(process.resourcesPath, "adb-micro", "rogcat"));

        if (!fs.existsSync(this.tmpPath)) fs.mkdirSync(this.tmpPath);
    }

    private getRunningAdbProcessPath(): string {
        let adbPath: string = "";
        if (process.platform === "win32")
            adbPath = execSync("powershell Split-Path (Get-Process adb).Path").toString().trim();

        if (adbPath !== "") {
            log.info("[EnvController]", "Located adb at", adbPath);
        }
        return adbPath;
    }

    /**
     *
     * @param {String} variable The variable name to append
     * @param {String} value The value to append
     */
    // eslint-disable-next-line class-methods-use-this
    private createOrExpandEnvVariable(variable: string, value: any): void {
        if (process.env[variable] === undefined) {
            process.env[variable] = value;
            return;
        }

        const envVariableDescructured: string[] = process.env[variable]!.split(";");
        envVariableDescructured.push(value);
        process.env[variable] = envVariableDescructured.join(";");
    }
}
