// eslint-disable-next-line import/no-extraneous-dependencies
const { ipcMain } = require("electron");

const fs = require("fs");
const toml = require("@iarna/toml");
const path = require("path");
const log = require("electron-log");

class RogcatProfiler {
    constructor() {
        this.rogcatProfileFile = path.join(process.env.appdata, "rogcat", "profiles.toml");
        this.tomlProfiles = {};

        this.setup = this.setup.bind(this);
        this.getProfiles = this.getProfiles.bind(this);
        this.setProfiles = this.setProfiles.bind(this);
        this.createProfile = this.createProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.deleteProfile = this.deleteProfile.bind(this);

        ipcMain.on("rogcat:profile-create", this.createProfile);
        ipcMain.on("rogcat:profile-update", this.updateProfile);
        ipcMain.on("rogcat:profile-delete", this.deleteProfile);

        this.setup();
    }

    setup() {
        // Path to rogcat default profile %appdata%\rogcat\
        // check if folder rogcat exists in %appdata% => create it if not
        // create default rogcat profile file if it does not exist
        try {
            fs.accessSync(path.dirname(this.rogcatProfileFile), fs.constants.F_OK);
            fs.accessSync(this.rogcatProfileFile, fs.constants.R_OK || fs.constants.W_OK);
            log.info("[RogcatProfiler]", "Profiles ");
        } catch (error) {
            log.error("[RogcatProfiler]", "No rogcat profiles found");
            log.error("[RogcatProfiler]", "Creating new profile file in", this.rogcatProfileFile);
            fs.mkdirSync(path.dirname(this.rogcatProfileFile));
            fs.writeFileSync(this.rogcatProfileFile, '[profile.default]\ncomment = "The default rogcat profile"');
            this.setup();
        } finally {
            this.tomlProfiles = toml.parse(fs.readFileSync(this.rogcatProfileFile, "utf-8"));
            log.info("[RogcatProfiler]", "Profiles loaded");
        }
    }

    getProfiles() {
        this.tomlProfiles = toml.parse(fs.readFileSync(this.rogcatProfileFile, "utf-8"));
        return this.tomlProfiles;
    }

    setProfiles(profiles) {
        fs.writeFileSync(this.rogcatProfileFile, toml.stringify(profiles));
    }

    createProfile(event, profile) {
        this.tomlProfiles.profile = { ...this.tomlProfiles.profile, ...profile };
        // return this.tomlProfiles;
        this.setProfiles(this.tomlProfiles);
        event.reply("rogcat:profile", this.getProfiles());
    }

    updateProfile(event, profile) {
        const rogcatProfiles = this.getProfiles();
        rogcatProfiles.profile[profile.name].comment = profile.comment;
        rogcatProfiles.profile[profile.name].tag = profile.tag;
        rogcatProfiles.profile[profile.name].message = profile.message;
        this.setProfiles(rogcatProfiles);
        event.reply("rogcat:profile-update", this.getProfiles());
    }

    deleteProfile(event, profile) {
        delete this.tomlProfiles.profile[profile];
        this.setProfiles(this.tomlProfiles);
        event.reply("rogcat:profile", this.getProfiles());
    }
}

module.exports = new RogcatProfiler();
