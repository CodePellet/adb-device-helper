import * as log from "electron-log";
import find from "find-process";
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

    public async setup(): Promise<void> {
        this.createOrExpandEnvVariable("PATH", await this.getRunningAdbProcessPath());
        this.createOrExpandEnvVariable("PATH", path.join(process.resourcesPath, "adb-micro", "bin"));
        this.createOrExpandEnvVariable("PATH", path.join(process.resourcesPath, "adb-micro", "rogcat"));

        if (!fs.existsSync(this.tmpPath)) fs.mkdirSync(this.tmpPath);
    }

    private async getRunningAdbProcessPath(): Promise<string> {
        try {
            //@ts-ignore
            const { pid, ppid, bin, name, cmd } = (await find("name", "adb", true))[0]
            log.info("[EnvController]", "Found running adb process", "-", "Using binary from:", bin);
            return bin;
        } catch (error) {
            log.error("[EnvController]", "Error retrieving running adb process information", error);
            return "";
        }
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
