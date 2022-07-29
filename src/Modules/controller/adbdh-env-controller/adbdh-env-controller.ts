import * as fs from "fs";
import * as path from "path";
import { AdbDeviceTracker } from "../../adbdh-device-tracker/adbdh-device-tracker";

export class EnvController {

    private static _instance: EnvController;

    private tracker: AdbDeviceTracker = AdbDeviceTracker.getInstance();
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
        this.createOrExpandEnvVariable("PATH", this.tracker.getRunningAdbPath());
        this.createOrExpandEnvVariable("PATH", path.join(process.resourcesPath, "adb-micro", "bin"));
        this.createOrExpandEnvVariable("PATH", path.join(process.resourcesPath, "adb-micro", "rogcat"));

        if (!fs.existsSync(this.tmpPath)) fs.mkdirSync(this.tmpPath);
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
