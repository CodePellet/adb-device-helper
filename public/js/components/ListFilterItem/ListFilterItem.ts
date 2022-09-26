export default class ListFilterItem {
    public static getActiveList(): string | null | undefined {
        return (document.querySelector(".rogcat-filter-tabs .nav-link.active") as HTMLButtonElement).getAttribute("data-bs-target");
    }

    /**
     * @param {String} listContainer - Optional - The querySelector for the list container
     * @param {string} [filterValue=''] - Optional - The value to write to the filter input
     * @memberof ListFilterItem
     */
    public static appendListItem(selector: string = `${ListFilterItem.getActiveList()} > ul`, filterValue: string = ""): void {
        const listContainer: HTMLUListElement = document.querySelector(selector) as HTMLUListElement;
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
        (listContainer.querySelector("li:last-child button.btn-remove-list-item") as HTMLButtonElement)!
            .addEventListener("click", this.deleteListFilterItem);
    }

    public static clear(selector: string): void {
        const listContainer: HTMLUListElement = document.querySelector(selector) as HTMLUListElement;
        listContainer.innerHTML = "";
    }

    public static deleteListFilterItem(listItem: MouseEvent): void {
        (listItem.target as HTMLButtonElement).closest("li")?.remove();
    }
}
