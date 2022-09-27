import Toast from "@Components/Toast";

export class SettingsController {

    private static _instance: SettingsController;

    private exportBtn: HTMLButtonElement;
    private importBtn: HTMLButtonElement;
    private profileTable: HTMLTableElement;
    private appVersionSpan: HTMLSpanElement;

    private constructor() {
        this.exportBtn = document.getElementById("btn-settings-export-profiles") as HTMLButtonElement;
        this.importBtn = document.getElementById("btn-settings-import-profiles") as HTMLButtonElement;
        this.profileTable = document.getElementById("settings-table-profiles") as HTMLTableElement;
        this.appVersionSpan = document.getElementById("settings-app-version") as HTMLSpanElement;


        this.eventListeners = this.eventListeners.bind(this);
        this.getAppVersion = this.getAppVersion.bind(this);
        this.getProfiles = this.getProfiles.bind(this);
        this.addProfileRows = this.addProfileRows.bind(this);

        this.getProfiles();
        this.getAppVersion();

        this.exportBtn.addEventListener("click", this.eventListeners().buttons.exportProfile.click);
        this.importBtn.addEventListener("click", this.eventListeners().buttons.importProfile.click);

    }

    public static getInstance(): SettingsController {
        return this._instance || (this._instance = new this());
    }

    private eventListeners() {
        return {
            buttons: {
                importProfile: {
                    click: async () => {
                        //@ts-ignore
                        const { success, data } = await window.electron.profiler.importProfiles();
                        if (success) {
                            this.addProfileRows(data);
                            Toast.showImportToast();
                        };
                    }
                },
                exportProfile: {
                    click: async () => {
                        //@ts-ignore
                        const dialogReturnValue = await window.electron.profiler.exportProfiles();

                        if (dialogReturnValue)
                            Toast.showExportToast();
                    }
                }
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private async getAppVersion() {
        //@ts-ignore
        this.appVersionSpan.innerText = await window.electron.app.getVersion();
    };

    private async getProfiles() {
        //@ts-ignore
        const { profile } = await window.electron.profiler.getProfiles();
        this.addProfileRows(profile);

    }

    private addProfileRows(profiles: any) {

        if (profiles.profile)
            profiles = profiles.profile;

        const tbody: HTMLTableSectionElement = this.profileTable.querySelector("tbody") as HTMLTableSectionElement;
        tbody.innerHTML = "";
        Object.keys(profiles).forEach(p => {
            const { message, tag } = profiles[p];
            tbody.insertAdjacentHTML("beforeend",
                `<tr>
                    <td>${p}</td>
                    <td class="text-break">${message}</td>
                    <td class="text-break">${tag}</td>
                    <!-- <td class="text-break">soon</td> -->
                </tr>`
            );
        })
    }
}
