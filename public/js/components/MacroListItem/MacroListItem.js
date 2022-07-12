import MacroController from "../../controller/MacroController.js";
export default class MacroListItem {
    static getActiveList() {
        return document.querySelector(".macro-tabs .nav-link.active").getAttribute("data-bs-target");
    }

    /**
     * @param {String} listContainer - Optional - The querySelector for the list container
     * @param {string} [filterValue=''] - Optional - The value to write to the filter input
     * @memberof MacroListItem
     */
    static append(selector = `${MacroListItem.getActiveList()} > ul`, filterValue = "") {
        const listContainer = document.querySelector(selector);
        listContainer.insertAdjacentHTML(
            "beforeend",
            `<li class="list-group-item">
                <div class="input-group w-100">
                    <input type="text" class="form-control" value="${filterValue}"/>
                    <!--<button class="btn btn-outline-secondary bg-dark text-light" type="button">
                                <i class="fas fa-pen fa-fw"></i>
                            </button>-->
                    <button class="btn btn-outline-success bg-success text-light btn-run-macro-item"
                    type="button">
                    <i class="fas fa-play fa-fw"></i>
                    </button>
                    <button class="btn btn-outline-danger bg-danger text-light btn-remove-macro-item"
                    type="button">
                    <i class="fas fa-trash fa-fw"></i>
                    </button>
                </div>
            </li>`
        );
        listContainer.querySelector("li:last-child button.btn-run-macro-item").addEventListener("click", MacroListItem.execute);
        listContainer.querySelector("li:last-child button.btn-remove-macro-item").addEventListener("click", MacroListItem.delete);
    }

    static execute(listitem) {
        const command = listitem.target.closest("li").querySelector("input[type=text]").value;
        MacroController.macros().execute(command);
    }

    static clear(selector) {
        const listContainer = document.querySelector(selector);
        listContainer.innerHTML = "";
    }

    static delete(listItem) {
        listItem.target.closest("li").remove();
    }
}
