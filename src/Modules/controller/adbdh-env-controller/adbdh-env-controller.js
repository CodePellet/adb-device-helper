const fs = require("fs");
const path = require("path");
const adbDeviceTracker = require("adbdh-device-tracker");

class EnvController {
    constructor() {
        this.tmpPath = path.join(process.env.TMP, "ADBDH");

        this.setup = this.setup.bind(this);
        this.appendToEnvVariable = this.createOrExpandEnvVariable.bind(this);
    }

    setup() {
        this.createOrExpandEnvVariable("PATH", adbDeviceTracker.getRunningAdbPath());
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
    createOrExpandEnvVariable(variable, value) {
        if (process.env[variable] === undefined) {
            process.env[variable] = value;
            return;
        }

        const envVariableDescructured = process.env[variable].split(";");
        envVariableDescructured.push(value);
        process.env[variable] = envVariableDescructured.join(";");
    }
}

module.exports = new EnvController();
