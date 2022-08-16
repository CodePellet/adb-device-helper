/* eslint-disable import/extensions */
import ListFilterItem from "../components/ListFilterItem/ListFilterItem.js";
import Toast from "../components/Toast/Toast.js";

class ProfileController {
    constructor() {
        this.profileSelect = document.getElementById("profile-select");
        this.defaultProfileGroup = document.querySelector(".profile-select-default-group");
        this.customProfileGroup = document.querySelector(".profile-select-custom-group");
        this.removeProfileButton = document.querySelector(".btn-remove-profile");
        this.addProfileButton = document.querySelector(".btn-add-profile");
        this.saveChangesButton = document.getElementById("saveChanges");
        this.newListItemButton = document.getElementById("newListItem");

        this.fromIpcMain = this.fromIpcMain.bind(this);
        this.toIpcMain = this.toIpcMain.bind(this);
        this.profiles = this.profiles.bind(this);

        window.rogcat.profile.get(this.fromIpcMain().profiles.get);
        window.rogcat.profile.update(this.fromIpcMain().profiles.update);

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
                    this.profiles().filterItems.show(value);
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

    fromIpcMain() {
        return {
            profiles: {
                get: (tomlProfiles) => {
                    this.tomlProfiles = tomlProfiles;
                    this.profiles().show();
                    this.profiles().filterItems.show(this.profileSelect.value);
                },
                update: (tomlProfiles) => {
                    this.tomlProfiles = tomlProfiles;
                    Toast.showSaveToast();
                },
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    toIpcMain() {
        return {
            profile: {
                create: (profile = {}) => {
                    window.rogcat.profile.create(profile);
                },
                saveChanges: (profile = {}) => {
                    window.rogcat.profile.saveChanges(profile);
                },
                delete: (profile) => {
                    window.rogcat.profile.delete(profile);
                },
            },
        };
    }

    profiles() {
        return {
            add: (group, name) => {
                group.insertAdjacentHTML("beforeend", `<option value="${name}">${name}</option>`);
            },

            create: (name, comment = "", tag = [], message = []) => {
                this.toIpcMain().profile.create({
                    [name]: {
                        comment,
                        tag,
                        message,
                    },
                });
            },

            saveChanges: () => {
                const profileName = document.getElementById("profile-select").value;
                // let comment = document.querySelector(".rogcat-profile-comment input[type=text]").value;
                const comment = "";
                const tags = document.querySelectorAll(".tag-list input[type=text]");
                const messages = document.querySelectorAll(".message-list input[type=text]");

                this.toIpcMain().profile.saveChanges({
                    name: profileName,
                    data: {
                        comment,
                        tag: Array.from(tags, (tag) => tag.value).filter((t) => t !== ""),
                        message: Array.from(messages, (message) => message.value).filter((m) => m !== ""),
                    }
                });
            },

            delete: (name) => {
                this.toIpcMain().profile.delete(name);
            },

            show: () => {
                const { profile } = this.tomlProfiles;
                this.defaultProfileGroup.innerHTML = "";
                this.customProfileGroup.innerHTML = "";
                this.removeProfileButton.disabled = true;
                // eslint-disable-next-line array-callback-return
                Object.keys(profile).forEach((p) => {
                    this.profiles().add(p === "default" ? this.defaultProfileGroup : this.customProfileGroup, p);
                });
            },

            filterItems: {
                show: (profile) => {
                    this.activeProfile = profile;
                    const { tag, message } = this.tomlProfiles.profile[profile];

                    ListFilterItem.clear(".tag-list");
                    ListFilterItem.clear(".message-list");

                    tag.forEach((t) => ListFilterItem.appendListItem(".tag-list", t));
                    message.forEach((m) => ListFilterItem.appendListItem(".message-list", m));
                },
            },
        };
    }
}

export default new ProfileController();
