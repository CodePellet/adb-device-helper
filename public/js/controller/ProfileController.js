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

        window.profiler.settingsProfileUpdate((data) => {
            this.tomlProfiles = window.profiler.getProfiles();
            this.profiles.addProfilesToSelectMenu();
        });

        this.tomlProfiles = window.profiler.getProfiles();
        this.profiles.addProfilesToSelectMenu();
        this.profiles.showTagsAndMessages("default");

        this.profileSelect.addEventListener("change", this.eventListeners.profileSelect.change);
        this.addProfileButton.addEventListener("click", this.eventListeners.addProfileButton.click);
        this.removeProfileButton.addEventListener("click", this.eventListeners.removeProfileButton.click);

        this.newListItemButton.addEventListener("click", this.eventListeners.newListItemButton.click);
        this.saveChangesButton.addEventListener("click", this.eventListeners.saveChangesButton.click);
    }

    eventListeners = {
        profileSelect: {
            change: (e) => {
                const { value } = e.target;
                this.removeProfileButton.disabled = value === "default";
                this.profiles.showTagsAndMessages(value);
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
                    if (newProfileNameInput.value !== "") this.profiles.create(newProfileNameInput.value);
                    newProfileNameInput.value = "";
                }
            },
        },
        removeProfileButton: {
            click: () => this.profiles.delete(this.profileSelect.value),
        },
        newListItemButton: {
            click: () => ListFilterItem.appendListItem(),
        },
        saveChangesButton: {
            click: () => this.profiles.saveChanges(),
        },
    };

    profiles = {
        add: (group, name) => {
            group.insertAdjacentHTML("beforeend", `<option value="${name}">${name}</option>`);
        },

        create: (name, comment = "", tag = [], message = []) => {
            this.tomlProfiles = window.profiler.create({
                name,
                data: {
                    comment,
                    tag,
                    message,
                },
            });
            this.profiles.addProfilesToSelectMenu();
        },

        saveChanges: () => {
            const profileName = document.getElementById("profile-select").value;
            // let comment = document.querySelector(".rogcat-profile-comment input[type=text]").value;
            const comment = "";
            const tags = document.querySelectorAll(".tag-list input[type=text]");
            const messages = document.querySelectorAll(".message-list input[type=text]");

            const saveResult = window.profiler.save({
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

        get: () => {
            return this.tomlProfiles;
        },

        delete: (name) => {
            this.tomlProfiles = window.profiler.delete(name);
            try {
                MacroController.macros().delete(name);
            } catch (error) {
                console.error(error);
            }
            this.profiles.addProfilesToSelectMenu();
            this.profiles.showTagsAndMessages("default");
        },

        addProfilesToSelectMenu: () => {
            const { profile } = this.tomlProfiles;
            this.defaultProfileGroup.innerHTML = "";
            this.customProfileGroup.innerHTML = "";
            this.removeProfileButton.disabled = true;
            // eslint-disable-next-line array-callback-return
            Object.keys(profile).forEach((p) => {
                this.profiles.add(p === "default" ? this.defaultProfileGroup : this.customProfileGroup, p);
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

export default new ProfileController();
