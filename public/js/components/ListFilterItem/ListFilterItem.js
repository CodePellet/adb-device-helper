export default class ListFilterItem {
    static getActiveList() {
        return document.querySelector(".rogcat-filter-tabs .nav-link.active").getAttribute("data-bs-target");
    }

    /**
     * @param {String} listContainer - Optional - The querySelector for the list container
     * @param {string} [filterValue=''] - Optional - The value to write to the filter input
     * @memberof ListFilterItem
     */
    static appendListItem(selector = `${ListFilterItem.getActiveList()} > ul`, filterValue = "") {
        const listContainer = document.querySelector(selector);
        listContainer.insertAdjacentHTML(
            "beforeend",
            `<li class="list-group-item">
            <div class="input-group w-100">
            <input type="text" class="form-control" value="${filterValue}" />
            <!--<button class="btn btn-outline-secondary bg-dark text-light" type="button">
                <i class="fas fa-pen fa-fw"></i>
            </button>-->
            <button class="btn btn-outline-danger bg-danger text-light btn-remove-list-item" type="button">
                <i class="fas fa-trash fa-fw"></i>
            </button>
            </div>
        </li>`
        );
        listContainer
            .querySelector("li:last-child button.btn-remove-list-item")
            .addEventListener("click", ListFilterItem.deleteListFilterItem);
    }

    static clear(selector) {
        const listContainer = document.querySelector(selector);
        listContainer.innerHTML = "";
    }

    static deleteListFilterItem(listItem) {
        listItem.target.closest("li").remove();
    }
}
