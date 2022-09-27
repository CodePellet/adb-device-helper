// eslint-disable-next-line import/no-extraneous-dependencies
import toml, { JsonMap } from "@iarna/toml";
import { dialog } from "electron";
import * as log from "electron-log";
import * as fs from "fs";
import * as path from "path";

import { RogcatProfile } from "@Interfaces/common";
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
        this.importProfiles = this.importProfiles.bind(this);
        this.exportProfiles = this.exportProfiles.bind(this);
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

    public getProfiles(): JsonMap {
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

    public async importProfiles(): Promise<{ success: boolean, data: JsonMap }> {
        const dialogResult = await dialog.showOpenDialog({ title: "Import Rogcat Profile", filters: [{ name: "TOML", extensions: ["toml"] }], properties: ["openFile", "openFile"] });

        if (dialogResult.canceled || !dialogResult.filePaths) {
            log.error("[RogcatProfiler]", "Error importing profiles", "Import file path not defined", dialogResult.filePaths[0]);
            return { success: false, data: {} ?? undefined };
        }

        log.info("[RogcatProfiler]", "Importing profiles from", dialogResult.filePaths[0]);
        const tomlProfileObj = this.tomlProfiles.profile;
        const importedProfiles = toml.parse(fs.readFileSync(dialogResult.filePaths[0].toString(), "utf-8"));

        Object.entries(importedProfiles.profile).forEach(([key, value]): void => {

            const existingTagArray: string[] = tomlProfileObj[key] ? [...tomlProfileObj[key].tag] : [];
            const existingMessageArray: string[] = tomlProfileObj[key] ? [...tomlProfileObj[key].message] : [];

            tomlProfileObj[key] = {
                tag: Array.from(new Set([...value.tag, ...existingTagArray])),
                message: Array.from(new Set([...value.message, ...existingMessageArray])),
            }
        });

        this.tomlProfiles.profile = tomlProfileObj;
        return {
            success: this.writeToFile(this.tomlProfiles),
            data: this.getProfiles()
        };
    }

    public async exportProfiles(): Promise<boolean> {
        const dialogResult = await dialog.showSaveDialog({ title: "Export Rogcat Profiles", filters: [{ name: "TOML", extensions: ["toml"] }], properties: ["showOverwriteConfirmation"] })

        if (!dialogResult.filePath) {
            log.error("[RogcatProfiler]", "Error exporting profiles", dialogResult.filePath);
            return false
        }

        log.info("[RogcatProfiler]", "Exporting profiles to", dialogResult.filePath);
        fs.writeFileSync(dialogResult.filePath, toml.stringify(this.getProfiles()));
        return true;
    }

    public create(profile: RogcatProfile): JsonMap {
        this.tomlProfiles.profile = { ...this.tomlProfiles.profile, [profile.name]: { ...profile.data } };
        this.writeToFile(this.tomlProfiles);
        return this.getProfiles();
    }

    public save(profile: RogcatProfile): { success: boolean, data: JsonMap } {
        const rogcatProfiles: any = this.getProfiles();
        rogcatProfiles.profile[profile.name].comment = profile.data.comment;
        rogcatProfiles.profile[profile.name].tag = profile.data.tag;
        rogcatProfiles.profile[profile.name].message = profile.data.message;
        const writeSuccess = this.writeToFile(rogcatProfiles);
        return { success: writeSuccess, data: this.getProfiles() };
    }

    public delete(profileName: string): any {
        delete this.tomlProfiles.profile[profileName];
        const writeSuccess = this.writeToFile(this.tomlProfiles);
        return { success: writeSuccess, data: this.getProfiles() };
    }
}
