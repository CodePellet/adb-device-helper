class Toast {

    constructor() {
        this.toastContainer = document.getElementById("toast_container");

        this.ToastTemplates = this.ToastTemplates.bind(this);
    }

    // eslint-disable-next-line class-methods-use-this
    ToastTemplates() {
        return {
            clipToast: (randomId) => `<div id="clipToast_${randomId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
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
            executeMacroToast: (error) => `<div id="executeMacroToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <div class="rounded p-2 me-2 ${error ? "bg-danger" : "bg-success"}" alt="..."></div>
                                <strong class="me-auto">${error ? "Error" : "Success"}</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">Macro executed ${error ? "with errors" : "successfully"}!</div>
                        </div>`,

        }
    }

    showCopiedToClipboardToast() {
        const randomToastId = Math.floor(Math.random() * 1000000);
        this.toastContainer.insertAdjacentHTML(
            "beforeend",
            this.ToastTemplates().clipToast(randomToastId)
        );
        this.showToast(`clipToast_${randomToastId}`);
    }

    showSaveToast() {
        if (document.getElementById("saveToast") == null)
            this.toastContainer.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().saveToast()
            );
        this.showToast(`saveToast`);
    }

    showImportToast() {
        if (document.getElementById("importToast") == null)
            this.toastContainer.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().importToast()
            );
        this.showToast(`importToast`);
    }

    showExportToast() {
        if (document.getElementById("exportToast") == null)
            this.toastContainer.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().exportToast()
            );
        this.showToast(`exportToast`);
    }

    showExecuteMacroToast(error) {
        if (document.getElementById("executeMacroToast") == null)
            this.toastContainer.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().executeMacroToast(error)
            );
        this.showToast(`executeMacroToast`);
    }

    // eslint-disable-next-line class-methods-use-this
    disposeToast(toastEl) {
        toastEl.addEventListener("hidden.bs.toast", () => {
            toastEl.remove();
        })
    }

    showToast(toastElId) {
        const toastEl = document.getElementById(toastElId);
        // eslint-disable-next-line no-undef
        const bsToast = new bootstrap.Toast(toastEl);
        bsToast.show();
        this.disposeToast(toastEl);
    }
}

export default new Toast();