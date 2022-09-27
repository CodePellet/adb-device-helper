/* eslint-disable import/extensions */
import FilterListItem from "@Components/FilterListItem";
import Toast from "@Components/Toast";
import { MacroController } from "@Controller/MacroController";

export class ProfileController {

    private static _instance: ProfileController;

    private profileSelect: HTMLSelectElement;
    private defaultProfileGroup: HTMLOptGroupElement;
    private customProfileGroup: HTMLOptGroupElement;
    private removeProfileButton: HTMLButtonElement;
    private addProfileButton: HTMLButtonElement;
    private saveChangesButton: HTMLButtonElement;
    private newListItemButton: HTMLButtonElement;
    private tabPaneTagBadge: HTMLSpanElement;
    private tabPaneMessageBadge: HTMLSpanElement;
    private tomlProfiles: any;
    private activeProfile: string;

    private constructor() {
        this.activeProfile = "";
        this.profileSelect = document.getElementById("profile-select") as HTMLSelectElement;
        this.defaultProfileGroup = document.querySelector(".profile-select-default-group") as HTMLOptGroupElement;
        this.customProfileGroup = document.querySelector(".profile-select-custom-group") as HTMLOptGroupElement;
        this.removeProfileButton = document.querySelector(".btn-remove-profile") as HTMLButtonElement;
        this.addProfileButton = document.querySelector(".btn-add-profile") as HTMLButtonElement;
        this.saveChangesButton = document.getElementById("saveChanges") as HTMLButtonElement;
        this.newListItemButton = document.getElementById("newListItem") as HTMLButtonElement;

        // BADGES
        this.tabPaneTagBadge = document.getElementById("tabPaneTagBadge") as HTMLSpanElement;
        this.tabPaneMessageBadge = document.getElementById("tabPaneMessageBadge") as HTMLSpanElement;

        //@ts-ignore
        window.electron.profiler.settingsProfileUpdate(() => this.fromIPCMain().getProfiles());

        this.fromIPCMain().getProfiles();

        this.eventListeners = this.eventListeners.bind(this);
        this.profiles = this.profiles.bind(this);

        this.profileSelect.addEventListener("change", this.eventListeners().profileSelect.change);
        this.addProfileButton.addEventListener("click", this.eventListeners().addProfileButton.click);
        this.removeProfileButton.addEventListener("click", this.eventListeners().removeProfileButton.click);

        this.newListItemButton.addEventListener("click", this.eventListeners().newListItemButton.click);
        this.saveChangesButton.addEventListener("click", this.eventListeners().saveChangesButton.click);
    }

    public static getInstance(): ProfileController {
        return this._instance || (this._instance = new this());
    }

    eventListeners() {
        return {
            profileSelect: {
                change: (event: Event) => {
                    const { value } = event.target as HTMLSelectElement;
                    this.removeProfileButton.disabled = value === "default";
                    this.profiles().showTagsAndMessages(value);
                },
            },
            addProfileButton: {
                click: (event: MouseEvent) => {
                    const newProfileNameInput: HTMLInputElement = document.getElementById("newProfileName") as HTMLInputElement;
                    // const profileSelect = document.getElementById("profile-select");
                    const newProfileIcon: SVGElement = this.addProfileButton.querySelector("svg") as SVGElement;

                    if (newProfileIcon.classList.contains("fa-plus")) {
                        this.profileSelect.classList.add("visually-hidden");
                        newProfileNameInput.classList.remove("visually-hidden");
                        newProfileIcon.classList.toggle("fa-check");
                        newProfileNameInput.focus();
                        return;
                    }

                    if (newProfileIcon.classList.contains("fa-check")) {
                        this.profileSelect.classList.remove("visually-hidden");
                        newProfileNameInput.classList.add("visually-hidden");
                        newProfileIcon.classList.toggle("fa-plus");
                        if (newProfileNameInput.value !== "") this.profiles().create(newProfileNameInput.value);
                        newProfileNameInput.value = "";
                    }
                },
            },
            removeProfileButton: {
                click: (event: MouseEvent) => this.profiles().delete(this.profileSelect.value),
            },
            newListItemButton: {
                click: (event: MouseEvent) => FilterListItem.appendListItem(),
            },
            saveChangesButton: {
                click: (event: MouseEvent) => this.profiles().saveChanges(),
            },
        };
    }

    fromIPCMain() {
        return {
            getProfiles: async () => {
                //@ts-ignore
                this.tomlProfiles = await window.electron.profiler.getProfiles();
                this.profiles().addProfilesToSelectMenu();
                this.profiles().showTagsAndMessages("default");
            }
        }
    }

    profiles() {
        return {
            add: (group: HTMLOptGroupElement, name: string) => {
                group.insertAdjacentHTML("beforeend", `<option value="${name}">${name}</option>`);
            },

            create: async (name: string, comment: string = "", tag: string[] = [], message: string[] = []) => {
                //@ts-ignore
                this.tomlProfiles = await window.electron.profiler.create({
                    name,
                    data: {
                        comment,
                        tag,
                        message,
                    },
                });
                this.profiles().addProfilesToSelectMenu();
            },

            saveChanges: async () => {
                // const profileName = document.getElementById("profile-select").value;
                const profileName = this.profileSelect.value;
                // let comment = document.querySelector(".rogcat-profile-comment input[type=text]").value;
                const comment = "";
                const tags: NodeListOf<HTMLInputElement> = document.querySelectorAll(".tag-list input[type=text]");
                const messages: NodeListOf<HTMLInputElement> = document.querySelectorAll(".message-list input[type=text]");

                //@ts-ignore
                const saveResult = await window.electron.profiler.save({
                    name: profileName,
                    data: {
                        comment,
                        tag: Array.from(tags, (tag: HTMLInputElement) => tag.value).filter((t) => t !== ""),
                        message: Array.from(messages, (message: HTMLInputElement) => message.value).filter((m) => m !== ""),
                    }
                });

                if (saveResult.success === true) {
                    Toast.showSaveToast();
                    this.tomlProfiles = saveResult.data;
                }
                this.profiles().showTagsAndMessages(profileName);
            },

            get: () => this.tomlProfiles,

            delete: async (name: string) => {
                //@ts-ignore
                const { success, data } = await window.electron.profiler.delete(name);

                if (!success) {
                    this.fromIPCMain().getProfiles();
                }

                MacroController.getInstance().macros().delete(name);
                this.tomlProfiles = data;
                this.profiles().addProfilesToSelectMenu();
                this.profiles().showTagsAndMessages("default");
            },

            addProfilesToSelectMenu: () => {
                const { profile } = this.tomlProfiles;
                this.defaultProfileGroup.innerHTML = "";
                this.customProfileGroup.innerHTML = "";
                this.removeProfileButton.disabled = true;
                // eslint-disable-next-line array-callback-return
                Object.keys(profile).forEach((p) => {
                    this.profiles().add(p === "default" ? this.defaultProfileGroup : this.customProfileGroup, p);
                });
            },

            showTagsAndMessages: (profile: string) => {
                this.activeProfile = profile;
                const { tag, message } = this.tomlProfiles.profile[profile];

                FilterListItem.clear(".tag-list");
                FilterListItem.clear(".message-list");

                tag.forEach((t: string) => FilterListItem.appendListItem(".tag-list", t));
                message.forEach((m: string) => FilterListItem.appendListItem(".message-list", m));

                // Show number of items in badge counter
                this.tabPaneTagBadge.innerHTML = tag.length;
                this.tabPaneMessageBadge.innerHTML = message.length;
            },
        };
    }

}
