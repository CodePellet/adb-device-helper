/* eslint-disable import/extensions */
import ListFilterItem from "../components/ListFilterItem/ListFilterItem.js";
import Toast from "../components/Toast/Toast.js";
import MacroController from "./MacroController.js";

class ProfileController {
    constructor() {
        this.profileSelect = document.getElementById("profile-select");
        this.defaultProfileGroup = document.querySelector(".profile-select-default-group");
        this.customProfileGroup = document.querySelector(".profile-select-custom-group");
        this.removeProfileButton = document.querySelector(".btn-remove-profile");
        this.addProfileButton = document.querySelector(".btn-add-profile");
        this.saveChangesButton = document.getElementById("saveChanges");
        this.newListItemButton = document.getElementById("newListItem");

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

    eventListeners() {
        return {
            profileSelect: {
                change: (e) => {
                    const { value } = e.target;
                    this.removeProfileButton.disabled = value === "default";
                    this.profiles().showTagsAndMessages(value);
                },
            },
            addProfileButton: {
                click: () => {
                    const newProfileNameInput = document.getElementById("newProfileName");
                    const profileSelect = document.getElementById("profile-select");
                    const newProfileIcon = this.addProfileButton.querySelector("svg");

                    if (newProfileIcon.classList.contains("fa-plus")) {
                        profileSelect.classList.add("visually-hidden");
                        newProfileNameInput.classList.remove("visually-hidden");
                        newProfileIcon.classList.toggle("fa-check");
                        newProfileNameInput.focus();
                        return;
                    }

                    if (newProfileIcon.classList.contains("fa-check")) {
                        profileSelect.classList.remove("visually-hidden");
                        newProfileNameInput.classList.add("visually-hidden");
                        newProfileIcon.classList.toggle("fa-plus");
                        if (newProfileNameInput.value !== "") this.profiles().create(newProfileNameInput.value);
                        newProfileNameInput.value = "";
                    }
                },
            },
            removeProfileButton: {
                click: () => this.profiles().delete(this.profileSelect.value),
            },
            newListItemButton: {
                click: () => ListFilterItem.appendListItem(),
            },
            saveChangesButton: {
                click: () => this.profiles().saveChanges(),
            },
        };
    }

    fromIPCMain() {
        return {
            getProfiles: async () => {
                this.tomlProfiles = await window.electron.profiler.getProfiles();
                this.profiles().addProfilesToSelectMenu();
                this.profiles().showTagsAndMessages("default");
            }
        }
    }

    profiles() {
        return {
            add: (group, name) => {
                group.insertAdjacentHTML("beforeend", `<option value="${name}">${name}</option>`);
            },

            create: async (name, comment = "", tag = [], message = []) => {
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
                const profileName = document.getElementById("profile-select").value;
                // let comment = document.querySelector(".rogcat-profile-comment input[type=text]").value;
                const comment = "";
                const tags = document.querySelectorAll(".tag-list input[type=text]");
                const messages = document.querySelectorAll(".message-list input[type=text]");

                const saveResult = await window.electron.profiler.save({
                    name: profileName,
                    data: {
                        comment,
                        tag: Array.from(tags, (tag) => tag.value).filter((t) => t !== ""),
                        message: Array.from(messages, (message) => message.value).filter((m) => m !== ""),
                    }
                });

                if (saveResult.success === true) {
                    Toast.showSaveToast();
                    this.tomlProfiles = saveResult.data;
                }
            },

            get: () => this.tomlProfiles,

            delete: async (name) => {
                const { success, data } = await window.electron.profiler.delete(name);

                if (!success) {
                    this.fromIPCMain().getProfiles();
                }

                MacroController.macros().delete(name);
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

            showTagsAndMessages: (profile) => {
                this.activeProfile = profile;
                const { tag, message } = this.tomlProfiles.profile[profile];

                ListFilterItem.clear(".tag-list");
                ListFilterItem.clear(".message-list");

                tag.forEach((t) => ListFilterItem.appendListItem(".tag-list", t));
                message.forEach((m) => ListFilterItem.appendListItem(".message-list", m));
            },
        };
    }

}

export default new ProfileController();
