/* eslint-disable import/extensions */
import MacroListItem from "../components/MacroListItem/MacroListItem.js";
import Toast from "../components/Toast/Toast.js";

class MacroController {
    constructor() {
        this.adbDeviceSelect = document.getElementById("deviceSelect");
        this.profileSelect = document.getElementById("profile-select");
        this.removeProfileButton = document.querySelector(".btn-remove-profile");

        this.saveChangesButton = document.getElementById("saveMacroChanges");
        this.newMacroItemButton = document.getElementById("newMacroItem");
        this.tabPaneResults = document.querySelector("[data-bs-target='#tabPaneResults']");

        this.fromIpcMain = this.fromIpcMain.bind(this);
        this.toIpcMain = this.toIpcMain.bind(this);
        this.macros = this.macros.bind(this);

        window.macros.get(this.fromIpcMain().macros.get);
        // window.macros.update(this.fromIpcMain().macros.update);

        this.profileSelect.addEventListener("change", this.eventListeners().profileSelect.change);
        this.removeProfileButton.addEventListener("click", this.eventListeners().removeProfileButton.click);

        this.newMacroItemButton.addEventListener("click", this.eventListeners().newListItemButton.click);
        this.saveChangesButton.addEventListener("click", this.eventListeners().saveChangesButton.click);
        this.tabPaneResults.addEventListener("show.bs.tab", this.eventListeners().tabs.resultsTab.shown)
        this.tabPaneResults.addEventListener("hide.bs.tab", this.eventListeners().tabs.resultsTab.hidden)
    }

    eventListeners() {
        return {
            newListItemButton: {
                click: () => {
                    MacroListItem.append(".adb-macro-list", "", this.macros().execute, MacroListItem.delete);
                },
            },
            saveChangesButton: {
                click: () => this.macros().saveChanges(),
            },
            tabs: {
                resultsTab: {
                    shown: () => { this.newMacroItemButton.disabled = true },
                    hidden: () => { this.newMacroItemButton.disabled = false }
                }
            },
            profileSelect: {
                change: (e) => {
                    const { value } = e.target;
                    this.macros().macroItems.show(value);
                },
            },
            removeProfileButton: {
                click: () => {
                    this.macros().delete(this.profileSelect.value)
                }
            }
        };
    }

    fromIpcMain() {
        return {
            macros: {
                get: (macros) => {
                    this.macro = macros;
                    this.macros().macroItems.show(this.profileSelect.value);
                },
                update: (macros) => {
                    this.macro = macros;
                    Toast.showSaveToast();
                },
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    toIpcMain() {
        return {
            macros: {
                execute: (command) => {
                    const deviceId = this.adbDeviceSelect.value;
                    const deviceModel = this.adbDeviceSelect?.querySelector(`option[value='${this.adbDeviceSelect.value}']`)?.getAttribute("data-adb-model");
                    window.shell.setAndroidDevice(deviceId, deviceModel);
                    window.macros.execute(command, this.macros().showResults);
                },
                save: (macro = {}) => {
                    window.macros.save(macro, this.fromIpcMain().macros.update);
                },
                delete: (macro) => {
                    window.macros.delete(macro, (macros) => {
                        this.macro = macros;
                        this.macros().macroItems.show("default");
                    });
                },
            },
        };
    }

    macros() {
        return {

            saveChanges: () => {
                const profileName = document.getElementById("profile-select").value;
                // let comment = document.querySelector(".rogcat-profile-comment input[type=text]").value;
                const comment = "";
                const adbMacros = document.querySelectorAll(".adb-macro-list input[type=text]");
                // const sshMacros = document.querySelectorAll(".ssh-macro-list input[type=text]");

                this.toIpcMain().macros.save({
                    name: profileName,
                    comment,
                    adb: Array.from(adbMacros, (adb) => adb.value).filter((command) => command !== "")
                })
            },

            execute: (command) => {
                this.toIpcMain().macros.execute(command);
            },

            delete: (name) => {
                this.toIpcMain().macros.delete(name);
            },

            showResults: (command, error, stdout, stderr) => {
                const elementId = Math.floor(Math.random() * 100000);
                const tabPaneResults = document.getElementById("tabPaneResults");
                const deviceId = this.adbDeviceSelect.value;
                const deviceModel = this.adbDeviceSelect?.querySelector(`option[value='${this.adbDeviceSelect.value}']`)?.getAttribute("data-adb-model")

                /**
                 * @type String
                 */
                const commandResult = error ? stderr : stdout;
                const commandResultBG = error ? "bg-danger bg-opacity-25" : "bg-success bg-opacity-25";

                tabPaneResults.insertAdjacentHTML(
                    "beforeend",
                    `<div id="commandResultContainer_${elementId}" class="form-floating mb-2 d-flex align-items-center justify-content-center">
                        <div id="textarea_${elementId}" class="form-control ${commandResultBG}" style="user-select: text; height: fit-content; --bg">${commandResult.replaceAll("\n", "<br/>")}</div>
                        <label for="testarea_${elementId}" ><strong>Command:</strong> ${command} - <strong>Device:</strong> ${deviceId} <strong>Model:</strong> ${deviceModel}</label>
                        <div class="position-absolute end-0 top-0 d-flex p-2">
                            <a id="button_clip_${elementId}" class="btn p-1" type="button"><i class="fas fa-clipboard fa-fw "></i></a>
                            <a id="button_trash_${elementId}" class="btn p-1 text-danger" type="button"><i class="fas fa-trash fa-fw "></i></a>
                        </div>
                     </div>`
                );

                document.getElementById(`button_clip_${elementId}`).addEventListener("click", () => {
                    navigator.clipboard.writeText(commandResult);
                    Toast.showCopiedToClipboardToast();
                });

                document.getElementById(`button_trash_${elementId}`).addEventListener("click", () => {
                    document.getElementById(`commandResultContainer_${elementId}`).remove();
                });
            },

            macroItems: {
                show: (profile) => {
                    this.activeProfile = this.profileSelect.selectedIndex === -1 ? "default" : profile;
                    const macroObj = this.macro.find(macro => macro.name === this.activeProfile);

                    MacroListItem.clear(".adb-macro-list");
                    MacroListItem.clear(".ssh-macro-list");

                    macroObj?.adb.forEach((t) => {
                        MacroListItem.append(".adb-macro-list", t, this.macros().execute, MacroListItem.delete);
                    });
                    // ssh.forEach((m) => MacroListItem.append(".ssh-macro-list", m));
                },
            },
        };
    }
}

export default new MacroController();
