class Toast {

    constructor() {
        this.toastContainer = document.getElementById("toast_container");

        this.ToastTemplates = this.ToastTemplates.bind(this);
    }

    ToastTemplates() {
        return {
            clipToast: (randomId) => {
                return `<div id="clipToast_${randomId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <div class="rounded p-2 me-2 bg-success" alt="..."></div>
                                <strong class="me-auto">Success</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">Copied to clipboard!</div>
                        </div>`;
            },

            saveToast: () => {
                return `<div id="saveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <div class="rounded p-2 me-2 bg-success" alt="..."></div>
                                <strong class="me-auto">Success</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">Saved!</div>
                        </div>`;
            }
        }
    }

    showCopiedToClipboardToast() {
        const randomToastId = Math.floor(Math.random() * 1000000);
        this.toastContainer.insertAdjacentHTML(
            "beforeend",
            this.ToastTemplates().clipToast(randomToastId)
        );
        this._showToast(`clipToast_${randomToastId}`);
    }

    showSaveToast() {
        if (document.getElementById("saveToast") == null)
            this.toastContainer.insertAdjacentHTML(
                "beforeend",
                this.ToastTemplates().saveToast()
            );
        this._showToast(`saveToast`);
    }

    _disposeToast(toastEl){
        toastEl.addEventListener("hidden.bs.toast", () => {
            toastEl.remove();
        })
    }
    _showToast(toastElId) {
        const toastEl = document.getElementById(toastElId);
        const bsToast = new bootstrap.Toast(toastEl);
        bsToast.show();
        this._disposeToast(toastEl);
    }
}

export default new Toast();