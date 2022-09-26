interface IAdbDevice {
    androidId: string;
    deviceState?: string;
    product?: string;
    model?: string;
    device?: string;
    transportId?: string;
    error?: NodeJS.ErrnoException;
}

export class AdbDeviceController {

    private static _instance: AdbDeviceController;

    private activeDevice: string;
    private adbDeviceCountBadge: HTMLSpanElement;
    private adbDeviceSelect: HTMLSelectElement;
    private startAdbServer: HTMLButtonElement;
    private stopAdbServer: HTMLButtonElement;
    private btnRogcat: HTMLButtonElement;
    private btnLocalShell: HTMLButtonElement;
    private btnDeviceShell: HTMLButtonElement;
    private btnOpenTraceFolder: HTMLButtonElement;
    private profileController: any;

    private constructor() {
        this.activeDevice = "";
        this.adbDeviceCountBadge = document.getElementById("adbDeviceCountBadge") as HTMLSpanElement;
        this.adbDeviceSelect = document.getElementById("deviceSelect") as HTMLSelectElement;
        this.startAdbServer = document.getElementById("startAdbServerButton") as HTMLButtonElement;
        this.stopAdbServer = document.getElementById("stopAdbServerButton") as HTMLButtonElement;
        this.btnRogcat = document.querySelector(".btn-start-rogcat") as HTMLButtonElement;
        this.btnLocalShell = document.querySelector(".btn-local-shell") as HTMLButtonElement;
        this.btnDeviceShell = document.querySelector(".btn-device-shell") as HTMLButtonElement;
        this.btnOpenTraceFolder = document.querySelector("#openTraceFolder") as HTMLButtonElement;

        this.setProfileControllerInstance = this.setProfileControllerInstance.bind(this);
        this.eventListeners = this.eventListeners.bind(this);
        this.fromIPCMain = this.fromIPCMain.bind(this);
        this.toIPCMain = this.toIPCMain.bind(this);
        this.devices = this.devices.bind(this);

        //@ts-ignore
        window.electron.adb.track(this.fromIPCMain().devices.track);

        this.adbDeviceSelect?.addEventListener("change", this.eventListeners().adbDeviceSelect.change);

        this.startAdbServer?.addEventListener("click", this.eventListeners().btnStartAdbServer.click);
        this.stopAdbServer?.addEventListener("click", this.eventListeners().btnStopAdbServer.click);

        this.btnRogcat.addEventListener("click", this.eventListeners().btnRogcat.click);
        this.btnLocalShell.addEventListener("click", this.eventListeners().btnLocalShell.click);
        this.btnDeviceShell.addEventListener("click", this.eventListeners().btnDeviceShell.click);
        this.btnOpenTraceFolder.addEventListener("click", this.eventListeners().btnOpenTraceFolder.click);
    }

    public static getInstance(): AdbDeviceController {
        return this._instance || (this._instance = new this());
    }

    setProfileControllerInstance(profileController: any): void {
        this.profileController = profileController;
    }

    eventListeners() {
        return {
            adbDeviceSelect: {
                change: (event: Event): void => { this.activeDevice = (event.target as HTMLSelectElement).value; }
            },
            btnStartAdbServer: {
                click: (event: MouseEvent): void => { this.toIPCMain().server.start(); },
            },
            btnStopAdbServer: {
                click: (event: MouseEvent): void => { this.toIPCMain().server.stop(); },
            },
            btnRogcat: {
                click: (event: MouseEvent): void => {
                    this.toIPCMain().shell.rogcat(
                        this.profileController.activeProfile,
                        (document.querySelector("#saveTraceToFile") as HTMLInputElement).checked
                    );
                },
            },
            btnLocalShell: {
                click: (event: MouseEvent): void => this.toIPCMain().shell.local(),
            },
            btnDeviceShell: {
                click: (event: MouseEvent): void => this.toIPCMain().shell.remote(),
            },
            btnOpenTraceFolder: {
                click: (event: MouseEvent): void => this.toIPCMain().trace.openTraceDirectory(),
            },
        };
    }

    fromIPCMain() {
        return {
            devices: {
                track: (adbDevices: IAdbDevice[]): void => {

                    const [{ error }] = adbDevices;

                    (this.startAdbServer.querySelector('.fa-play') as HTMLElement).classList.remove("visually-hidden");
                    (this.startAdbServer.querySelector('span.spinner-border') as HTMLElement).classList.add("visually-hidden");

                    if (error) {
                        switch (error.code) {
                            case "ENODEVICES":
                                this.devices().clear();
                                this.adbDeviceSelect.insertAdjacentHTML("beforeend", `<option>${error.message}</option>`);
                                this.startAdbServer.disabled = true;
                                this.adbDeviceCountBadge.innerHTML = "0";

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
                    this.adbDeviceCountBadge.innerHTML = adbDevices.length.toString();
                    this.devices().clear();
                    adbDevices.forEach((d) => this.devices().add(d));
                    if (this.activeDevice === "") return;
                    if (this.adbDeviceSelect.innerHTML.includes(this.activeDevice)) this.adbDeviceSelect.value = this.activeDevice;
                },
            },
        };
    }

    toIPCMain() {
        return {
            devices: {
                setDeviceInfo: (): void => {
                    const deviceId = this.adbDeviceSelect.value;
                    const deviceModel = this.adbDeviceSelect?.querySelector(`option[value='${this.adbDeviceSelect.value}']`)?.getAttribute("data-adb-model")
                    //@ts-ignore
                    window.electron.shell.setAndroidDevice(deviceId, deviceModel);
                },
            },
            server: {
                start: (): void => {
                    (this.startAdbServer.querySelector('span.spinner-border') as HTMLElement).classList.remove("visually-hidden");
                    (this.startAdbServer.querySelector('.fa-play') as HTMLElement).classList.add("visually-hidden");
                    //@ts-ignore
                    window.electron.adb.server.start();
                },
                stop: (): void => {
                    //@ts-ignore
                    window.electron.adb.server.stop();
                    this.adbDeviceCountBadge.classList.add("visually-hidden");
                },
            },
            shell: {
                local: (): void => {
                    this.toIPCMain().devices.setDeviceInfo();
                    //@ts-ignore
                    window.electron.shell.openLocalShell();
                },
                remote: (): void => {
                    this.toIPCMain().devices.setDeviceInfo();
                    //@ts-ignore
                    window.electron.shell.openDeviceShell();
                },
                rogcat: (profile: string, saveToFile: boolean): void => {
                    this.toIPCMain().devices.setDeviceInfo();
                    const options = { activeProfile: profile, saveTraceToFile: saveToFile };
                    //@ts-ignore
                    window.electron.shell.openRogcatShell(options);
                },
            },
            trace: {
                openTraceDirectory: (): void => {
                    //@ts-ignore
                    window.electron.shell.openTraceLocation();
                },
            },
        };
    }

    devices() {
        return {
            add: (d: IAdbDevice): void => {
                const { androidId, model } = d;
                const option = `<option data-adb-model="${model}" value="${androidId}">${androidId} - ${model}</option>`;
                this.adbDeviceSelect.insertAdjacentHTML("beforeend", option);
                this.adbDeviceCountBadge.classList.remove("visually-hidden");
            },
            clear: (): void => {
                this.adbDeviceSelect.innerHTML = "";
            },
        };
    }
}
