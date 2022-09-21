// eslint-disable-next-line import/extensions
import Toast from "../components/Toast/Toast.js";

class SettingsController {

    constructor() {
        this.exportBtn = document.getElementById("btn-settings-export-profiles");
        this.importBtn = document.getElementById("btn-settings-import-profiles");
        this.profileTable = document.getElementById("settings-table-profiles");
        this.appVersionSpan = document.getElementById("settings-app-version");


        this.eventListeners = this.eventListeners.bind(this);
        this.getAppVersion = this.getAppVersion.bind(this);
        this.getProfiles = this.getProfiles.bind(this);

        this.getProfiles();
        this.getAppVersion();

        this.exportBtn.addEventListener("click", this.eventListeners().buttons.exportProfile.click);
        this.importBtn.addEventListener("click", this.eventListeners().buttons.importProfile.click);

    }

    eventListeners() {
        return {
            buttons: {
                importProfile: {
                    click: async () => {
                        const { success, data } = await window.electron.profiler.importProfiles();
                        if (success) {
                            this.getProfiles(data)
                            Toast.showImportToast();
                        };
                    }
                },
                exportProfile: {
                    click: async () => {
                        const dialogReturnValue = await window.electron.profiler.exportProfiles();

                        if (dialogReturnValue)
                            Toast.showExportToast();
                    }
                }
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async getAppVersion() {
        this.appVersionSpan.innerText = await window.electron.app.getVersion();
    };

    async getProfiles() {
        const { profile } = await window.electron.profiler.getProfiles();
        const tbody = this.profileTable.querySelector("tbody");
        tbody.innerHTML = "";
        Object.keys(profile).forEach(p => {
            const { message, tag } = profile[p];
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
export default new SettingsController();
