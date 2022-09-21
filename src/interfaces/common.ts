export interface RogcatProfile {
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

export interface AndroidDevice {
    serial: string;
    model: string;
}

export interface RogcatShellOptions {
    activeProfile: string;
    saveTraceToFile: boolean;
}