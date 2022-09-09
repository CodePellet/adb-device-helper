// eslint-disable-next-line import/no-extraneous-dependencies
import toml, { JsonMap } from "@iarna/toml";
import { ipcMain, IpcMainEvent } from "electron";
import * as log from "electron-log";
import * as fs from "fs";
import * as path from "path";


interface RogcatProfile {
    name: string;
    data: {
        comment?: string;
        extends?: string[];
        highlight?: string[];
        message?: string[];
        message_ignore_case?: string[];
        regex?: string[];
        tag?: string[];
        tag_ignore_case?: string[];
    };

}

export class RogcatProfiler {

    private static _instance: RogcatProfiler;

    private rogcatProfileFile: string;
    private tomlProfiles: any;


    private constructor() {
        // since process.env.appdata is a default windows environment variable, we can tell typscript in this case, that the value of it will never be null.
        this.rogcatProfileFile = path.join(process.env.appdata!, "rogcat", "profiles.toml");
        this.tomlProfiles = {};

        this.setup = this.setup.bind(this);
        this.getProfiles = this.getProfiles.bind(this);
        this.writeToFile = this.writeToFile.bind(this);
        this.create = this.create.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);

        this.setup();
    }

    public static getInstance(): RogcatProfiler {
        return this._instance || (this._instance = new this());
    }

    private setup(): void {
        // Path to rogcat default profile %appdata%\rogcat\
        // check if folder rogcat exists in %appdata% => create it if not
        // create default rogcat profile file if it does not exist
        try {
            fs.accessSync(path.dirname(this.rogcatProfileFile), fs.constants.F_OK);
            fs.accessSync(this.rogcatProfileFile, fs.constants.R_OK || fs.constants.W_OK);
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

    public getProfiles(): any {
        this.tomlProfiles = toml.parse(fs.readFileSync(this.rogcatProfileFile, "utf-8"));
        return this.tomlProfiles;
    }

    private writeToFile(profiles: JsonMap): boolean {
        try {
            fs.writeFileSync(this.rogcatProfileFile, toml.stringify(profiles));
            return true;
        } catch (error) {
            return false;
        }
    }

    public create(profile: RogcatProfile): any {
        this.tomlProfiles.profile = { ...this.tomlProfiles.profile, [profile.name]: { ...profile.data } };
        this.writeToFile(this.tomlProfiles);
        return this.getProfiles();
    }

    public save(profile: RogcatProfile): { success: boolean, data: Object } {
        const rogcatProfiles = this.getProfiles();
        rogcatProfiles.profile[profile.name].comment = profile.data.comment;
        rogcatProfiles.profile[profile.name].tag = profile.data.tag;
        rogcatProfiles.profile[profile.name].message = profile.data.message;
        const writeSuccess = this.writeToFile(rogcatProfiles);
        return { success: writeSuccess, data: this.getProfiles() };
    }

    public delete(profileName: string): any {
        delete this.tomlProfiles.profile[profileName];
        this.writeToFile(this.tomlProfiles);
        return this.getProfiles();
    }
}
