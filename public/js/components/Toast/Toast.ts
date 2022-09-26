import { Toast as BToast } from "bootstrap";

class Toast {

    private static _instance: Toast;
    private toastContainer: HTMLElement = document.getElementById("toast_container") as HTMLElement;

    private constructor() {
        this.ToastTemplates = this.ToastTemplates.bind(this);
    }

    public static getInstance(): Toast {
        return this._instance || (this._instance = new this());
    }

    // eslint-disable-next-line class-methods-use-this
    private ToastTemplates() {
        return {
            clipToast: (randomId: number) => `<div id="clipToast_${randomId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <div class="rounded p-2 me-2 bg-success" alt="..."></div>
                                <strong class="me-auto">Success</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">Copied to clipboard!</div>
                        </div>`,

            saveToast: () => `<div id="saveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <div class="rounded p-2 me-2 bg-success" alt="..."></div>
                                <strong class="me-auto">Success</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">Saved!</div>
                        </div>`,

            importToast: () => `<div id="importToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <div class="rounded p-2 me-2 bg-success" alt="..."></div>
                                <strong class="me-auto">Success</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">Profiles imported successfully!</div>
                        </div>`,

            exportToast: () => `<div id="exportToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <div class="rounded p-2 me-2 bg-success" alt="..."></div>
                                <strong class="me-auto">Success</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">Profiles exported successfully!</div>
                        </div>`,
            executeMacroToast: (error: Object) => `<div id="executeMacroToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <div class="rounded p-2 me-2 ${error ? "bg-danger" : "bg-success"}" alt="..."></div>
                                <strong class="me-auto">${error ? "Error" : "Success"}</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">Macro executed ${error ? "with errors" : "successfully"}!</div>
                        </div>`,

        }
    }

    public showCopiedToClipboardToast() {
        const randomToastId = Math.floor(Math.random() * 1000000);
        this.toastContainer?.insertAdjacentHTML(
            "beforeend",
            this.ToastTemplates().clipToast(randomToastId)
        );
        this.showToast(`clipToast_${randomToastId}`);
    }

    public showSaveToast() {
        if (document.getElementById("saveToast") == null)
            this.toastContainer?.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().saveToast()
            );
        this.showToast(`saveToast`);
    }

    public showImportToast() {
        if (document.getElementById("importToast") == null)
            this.toastContainer?.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().importToast()
            );
        this.showToast(`importToast`);
    }

    public showExportToast() {
        if (document.getElementById("exportToast") == null)
            this.toastContainer?.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().exportToast()
            );
        this.showToast(`exportToast`);
    }

    public showExecuteMacroToast(error: Object) {
        if (document.getElementById("executeMacroToast") == null)
            this.toastContainer?.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().executeMacroToast(error)
            );
        this.showToast(`executeMacroToast`);
    }

    // eslint-disable-next-line class-methods-use-this
    private disposeToast(toastEl: HTMLElement) {
        toastEl.addEventListener("hidden.bs.toast", () => {
            toastEl.remove();
        })
    }

    private showToast(toastElId: string) {
        const toastEl: HTMLElement = document.getElementById(toastElId)!;
        // TODO: Fix bootstrap import error
        //@ts-ignore
        const bsToast = new BToast(toastEl);
        bsToast.show();
        this.disposeToast(toastEl);
    }
}

export default Toast.getInstance();