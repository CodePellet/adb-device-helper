class AdbDevice {
    /** @type {string} */
    androidId;
    /** @type {string} */
    deviceState;
    /** @type {string} */
    product;
    /** @type {string} */
    model;
    /** @type {string} */
    device;
    /** @type {string} */
    transportId;
    error = {
        /** @type {string} */
        name,
        /**@type {string} */
        code,
        /** @type {string} */
        message
    };
}

class AdbDeviceController {
    constructor() {
        this.activeDevice = "";
        this.adbDeviceCountBadge = document.getElementById("adbDeviceCountBadge");
        this.adbDeviceSelect = document.getElementById("deviceSelect");
        this.startAdbServer = document.getElementById("startAdbServerButton");
        this.stopAdbServer = document.getElementById("stopAdbServerButton");
        this.btnRogcat = document.querySelector(".btn-start-rogcat");
        this.btnLocalShell = document.querySelector(".btn-local-shell");
        this.btnDeviceShell = document.querySelector(".btn-device-shell");
        this.btnOpenTraceFolder = document.querySelector("#openTraceFolder");

        this.fromIPCMain = this.fromIPCMain.bind(this);
        this.toIPCMain = this.toIPCMain.bind(this);
        this.devices = this.devices.bind(this);
        this.setProfileControllerInstance = this.setProfileControllerInstance.bind(this);

        window.adb.track(this.fromIPCMain().devices.track);

        this.adbDeviceSelect.addEventListener("change", this.eventListeners().adbDeviceSelect.change);

        this.startAdbServer.addEventListener("click", this.eventListeners().btnStartAdbServer.click);
        this.stopAdbServer.addEventListener("click", this.eventListeners().btnStopAdbServer.click);

        this.btnRogcat.addEventListener("click", this.eventListeners().btnRogcat.click);
        this.btnLocalShell.addEventListener("click", this.eventListeners().btnLocalShell.click);
        this.btnDeviceShell.addEventListener("click", this.eventListeners().btnDeviceShell.click);
        this.btnOpenTraceFolder.addEventListener("click", this.eventListeners().btnOpenTraceFolder.click);
    }

    setProfileControllerInstance(profileController) {
        this.profileController = profileController;
    }

    eventListeners() {
        return {
            adbDeviceSelect: {
                change: (e) => {
                    this.activeDevice = e.target.value;
                }
            },
            btnStartAdbServer: {
                click: () => {
                    this.toIPCMain().server.start();
                },
            },
            btnStopAdbServer: {
                click: () => {
                    this.toIPCMain().server.stop();
                },
            },
            btnRogcat: {
                click: () => {
                    const save = document.querySelector("#saveTraceToFile").checked;
                    this.toIPCMain().shell.rogcat(this.profileController.activeProfile, save);
                },
            },
            btnLocalShell: {
                click: () => this.toIPCMain().shell.local(),
            },
            btnDeviceShell: {
                click: () => this.toIPCMain().shell.remote(),
            },
            btnOpenTraceFolder: {
                click: () => this.toIPCMain().trace.openTraceDirectory(),
            },
        };
    }

    fromIPCMain() {
        return {
            devices: {
                /**
                 * @param {AdbDevice} adbDevices
                 */
                track: async (adbDevices) => {

                    this.startAdbServer.querySelector('.fa-play').classList.remove("visually-hidden");
                    this.startAdbServer.querySelector('span.spinner-border').classList.add("visually-hidden");

                    if (adbDevices.error) {
                        switch (adbDevices.error.code) {
                            case "ENODEVICES":
                                this.devices().clear();
                                this.adbDeviceSelect.insertAdjacentHTML("beforeend", `<option>${adbDevices.error.message}</option>`);
                                this.startAdbServer.disabled = true;
                                break;
                            case "ECONNREFUSED":
                                this.devices().clear();
                                this.adbDeviceSelect.insertAdjacentHTML("beforeend", "<option>Server not running...</option>");
                                this.startAdbServer.disabled = false;
                                break;

                            default:
                                break;
                        }
                        this.stopAdbServer.disabled = !this.startAdbServer.disabled;
                        return;
                    }

                    this.startAdbServer.disabled = true;
                    this.stopAdbServer.disabled = !this.startAdbServer.disabled;
                    this.adbDeviceCountBadge.innerHTML = adbDevices.length;
                    this.devices().clear();
                    await adbDevices.forEach((d) => this.devices().add(d));
                    if (this.activeDevice === "") return;
                    if (this.adbDeviceSelect.innerHTML.includes(this.activeDevice)) this.adbDeviceSelect.value = this.activeDevice;
                },
            },
        };
    }

    toIPCMain() {
        return {
            devices: {
                setDeviceInfo: () => {
                    const deviceId = this.adbDeviceSelect.value;
                    const deviceModel = this.adbDeviceSelect?.querySelector(`option[value='${this.adbDeviceSelect.value}']`)?.getAttribute("data-adb-model")
                    window.shell.setAndroidDevice(deviceId, deviceModel);
                },
            },
            server: {
                start: () => {
                    this.startAdbServer.querySelector('span.spinner-border').classList.remove("visually-hidden");
                    this.startAdbServer.querySelector('.fa-play').classList.add("visually-hidden");
                    window.adb.server.start();
                },
                stop: () => {
                    window.adb.server.stop();
                    this.adbDeviceCountBadge.classList.add("visually-hidden");
                },
            },
            shell: {
                local: () => {
                    this.toIPCMain().devices.setDeviceInfo();
                    window.shell.openLocalShell();
                },
                remote: () => {
                    this.toIPCMain().devices.setDeviceInfo();
                    window.shell.openDeviceShell();
                },
                rogcat: (profile, saveToFile) => {
                    this.toIPCMain().devices.setDeviceInfo();
                    const options = { activeProfile: profile, saveTraceToFile: saveToFile };
                    window.shell.openRogcatShell(options);
                },
            },
            trace: {
                openTraceDirectory: () => {
                    window.shell.openTraceLocation();
                },
            },
        };
    }

    devices() {
        return {
            add: (d) => {
                const { androidId, model, error } = d;
                let option = `<option data-adb-model="${model}" value="${androidId}">${androidId} - ${model}</option>`;
                if (error) {
                    option = `<option value="-1">No devices connected...</option>`;
                    this.adbDeviceCountBadge.innerHTML = 0;
                }
                this.adbDeviceSelect.insertAdjacentHTML("beforeend", option);
                this.adbDeviceCountBadge.classList.remove("visually-hidden");
            },
            clear: () => {
                this.adbDeviceSelect.innerHTML = "";
            },
        };
    }
}

export default new AdbDeviceController();
