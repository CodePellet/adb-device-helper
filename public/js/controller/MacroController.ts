/* eslint-disable import/extensions */
import MacroListItem from "@Components/MacroListItem";
import Toast from "@Components/Toast";

export class MacroController {

    private static _instance: MacroController;

    private adbDeviceSelect: HTMLSelectElement;
    private profileSelect: HTMLSelectElement;
    private saveChangesButton: HTMLButtonElement;
    private newMacroItemButton: HTMLButtonElement;
    private tabPaneResultsButton: HTMLButtonElement;
    private tabPaneResultsContent: HTMLDivElement;
    private tabPaneResultBadge: HTMLSpanElement;
    private tabPaneAdbBadge: HTMLSpanElement;
    private macro: any;
    private activeProfile: any;

    private constructor() {
        this.adbDeviceSelect = document.getElementById("deviceSelect") as HTMLSelectElement;
        this.profileSelect = document.getElementById("profile-select") as HTMLSelectElement;

        this.saveChangesButton = document.getElementById("saveMacroChanges") as HTMLButtonElement;
        this.newMacroItemButton = document.getElementById("newMacroItem") as HTMLButtonElement;
        this.tabPaneResultsButton = document.querySelector("[data-bs-target='#tabPaneResults']") as HTMLButtonElement;
        this.tabPaneResultsContent = document.getElementById("tabPaneResults") as HTMLDivElement;


        // BADGES
        this.tabPaneResultBadge = document.getElementById("tabPaneResultsBadge") as HTMLSpanElement;
        this.tabPaneAdbBadge = document.getElementById("tabPaneAdbBadge") as HTMLSpanElement;

        this.fromIpcMain = this.fromIpcMain.bind(this);
        this.toIpcMain = this.toIpcMain.bind(this);
        this.macros = this.macros.bind(this);

        this.fromIpcMain().macros.get();

        // window.electron.macro.get(this.fromIpcMain().macros.get);

        this.profileSelect.addEventListener("change", this.eventListeners().profileSelect.change);

        this.newMacroItemButton.addEventListener("click", this.eventListeners().newListItemButton.click);
        this.saveChangesButton.addEventListener("click", this.eventListeners().saveChangesButton.click);
        this.tabPaneResultsButton.addEventListener("show.bs.tab", this.eventListeners().tabs.resultsTab.shown)
        this.tabPaneResultsButton.addEventListener("hide.bs.tab", this.eventListeners().tabs.resultsTab.hidden)
    }

    public static getInstance(): MacroController {
        return this._instance || (this._instance = new this());
    }

    private eventListeners() {
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
                    shown: () => {
                        this.newMacroItemButton.disabled = true;
                        setTimeout(() => {
                            this.tabPaneResultBadge.classList.add("visually-hidden")
                        }, 2000);
                    },
                    hidden: () => { this.newMacroItemButton.disabled = false }
                }
            },
            profileSelect: {
                change: (e: Event) => {
                    const { value } = e.target as HTMLSelectElement;
                    this.macros().macroItems.show(value);
                },
            }
        };
    }

    private fromIpcMain() {
        return {
            macros: {
                get: async () => {
                    //@ts-ignore
                    this.macro = await window.electron.macro.get();
                    this.macros().macroItems.show(this.profileSelect.value);
                },
                update: (macros: Object[]) => {
                    this.macro = macros;
                    Toast.showSaveToast();
                },
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    private toIpcMain() {
        return {
            macros: {
                execute: async (command: string) => {
                    const deviceId = this.adbDeviceSelect.value;
                    const deviceModel = this.adbDeviceSelect?.querySelector(`option[value='${this.adbDeviceSelect.value}']`)?.getAttribute("data-adb-model");
                    //@ts-ignore
                    window.electron.shell.setAndroidDevice(deviceId, deviceModel);
                    //@ts-ignore
                    const execResult = await window.electron.macro.execute(command);
                    this.macros().showResults(execResult);
                },
                save: async (macro: { name: string, comment: string, adb: string[] } = {
                    name: "",
                    comment: "",
                    adb: []
                }) => {
                    //@ts-ignore
                    this.macro = await window.electron.macro.save(macro);
                    Toast.showSaveToast();
                    this.macros().macroItems.show(macro.name);
                },
                delete: async (macro: string) => {
                    //@ts-ignore
                    this.macro = await window.electron.macro.delete(macro);
                    this.macros().macroItems.show("default");
                },
            },
        };
    }

    public macros() {
        return {
            saveChanges: () => {
                // const profileName = document.getElementById("profile-select").value;
                const profileName: string = this.profileSelect.value;
                const comment: string = "";
                const adbMacros: NodeListOf<HTMLInputElement> = document.querySelectorAll(".adb-macro-list input[type=text]");
                // const sshMacros = document.querySelectorAll(".ssh-macro-list input[type=text]");

                this.toIpcMain().macros.save({
                    name: profileName,
                    comment,
                    adb: Array.from(adbMacros, (adb: HTMLInputElement) => adb.value).filter((command) => command !== "")
                })
            },

            execute: (command: string) => {
                this.toIpcMain().macros.execute(command);
            },

            delete: (name: string) => { this.toIpcMain().macros.delete(name); },

            showResults: ({ command, error, stdout, stderr }: { command: string, error: Error, stdout: string, stderr: string }) => {
                const elementId = Math.floor(Math.random() * 100000);
                // const tabPaneResults = document.getElementById("tabPaneResults");
                const deviceId = this.adbDeviceSelect.value;
                const deviceModel = this.adbDeviceSelect?.querySelector(`option[value='${this.adbDeviceSelect.value}']`)?.getAttribute("data-adb-model")

                /**
                 * @type String
                 */
                const commandResult = error ? stderr : stdout;
                const commandResultBG = error ? "bg-danger bg-opacity-25" : "bg-success bg-opacity-25";

                this.tabPaneResultsContent.insertAdjacentHTML(
                    "beforeend",
                    `<div id="commandResultContainer_${elementId}" class="form-floating mb-2 d-flex align-items-center justify-content-center text-break">
                        <div id="textarea_${elementId}" class="form-control ${commandResultBG}" style="user-select: text; height: fit-content; --bg">${commandResult.replaceAll("\n", "<br/>")}</div>
                        <label for="testarea_${elementId}" ><strong>Command:</strong> ${command} - <strong>Device:</strong> ${deviceId} <strong>Model:</strong> ${deviceModel}</label>
                        <div class="position-absolute end-0 top-0 d-flex p-2">
                            <a id="button_clip_${elementId}" class="btn p-1" type="button"><i class="fas fa-clipboard fa-fw "></i></a>
                            <a id="button_trash_${elementId}" class="btn p-1 text-danger" type="button"><i class="fas fa-trash fa-fw "></i></a>
                        </div>
                     </div>`
                );
                const clipButton = document.getElementById(`button_clip_${elementId}`) as HTMLButtonElement;
                clipButton.addEventListener("click", () => {
                    navigator.clipboard.writeText(commandResult);
                    Toast.showCopiedToClipboardToast();
                });

                const deleteButton = document.getElementById(`button_trash_${elementId}`) as HTMLButtonElement;
                deleteButton.addEventListener("click", () => {
                    const elementToDelete = document.getElementById(`commandResultContainer_${elementId}`) as HTMLElement;
                    elementToDelete.remove();
                });
                this.tabPaneResultBadge.classList.remove("visually-hidden");
                Toast.showExecuteMacroToast(error);
            },

            macroItems: {
                show: (profile: string) => {
                    this.activeProfile = this.profileSelect.selectedIndex === -1 ? "default" : profile;
                    const macroObj = this.macro.find((macro: any) => macro.name === this.activeProfile);

                    MacroListItem.clear(".adb-macro-list");
                    MacroListItem.clear(".ssh-macro-list");

                    macroObj?.adb.forEach((t: string) => {
                        MacroListItem.append(".adb-macro-list", t, this.macros().execute, MacroListItem.delete);
                    });
                    this.tabPaneAdbBadge.innerHTML = macroObj?.adb.length ?? 0;
                    // ssh.forEach((m) => MacroListItem.append(".ssh-macro-list", m));
                },
            },
        };
    }
}
