export default class MacroListItem {
    public static getActiveList(): string | null | undefined {
        return (document.querySelector(".macro-tabs .nav-link.active") as HTMLButtonElement).getAttribute("data-bs-target");
    }

    /**
     * @param {String} listContainer - Optional - The querySelector for the list container
     * @param {String} [filterValue=''] - Optional - The value to write to the filter input
     * @param {Function)} execButtonClickEvent - Function to call, when execute button is clicked
     * @param {Function} deleteButtonClickEvent - Function to call, when delete button is clicked
     * @memberof MacroListItem
     */
    public static append(selector: string = `${MacroListItem.getActiveList()} > ul`, filterValue: string = "", execButtonClickEvent: (command: string) => void, deleteButtonClickEvent: (event: MouseEvent) => void): void {
        const listContainer: HTMLUListElement = document.querySelector(selector) as HTMLUListElement;
        listContainer.insertAdjacentHTML(
            "beforeend",
            `<li class="list-group-item">
                <div class="input-group w-100">
                    <input type="text" class="form-control" value="${filterValue.replace(/"/g, '&quot;')}"/>
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

        (listContainer.querySelector("li:last-child button.btn-run-macro-item") as HTMLButtonElement)!
            .addEventListener("click", (element: MouseEvent) => {
                const button: HTMLButtonElement = (element.target as HTMLButtonElement);
                const input = button.closest("li")?.querySelector("input[type=text]") as HTMLInputElement;
                const command = input!.value;
                execButtonClickEvent(command);
            });
        (listContainer.querySelector("li:last-child button.btn-remove-macro-item") as HTMLButtonElement)
            .addEventListener("click", deleteButtonClickEvent);


        // return { execButton: listContainer.querySelector("li:last-child button.btn-run-macro-item"), deleteButton: listContainer.querySelector("li:last-child button.btn-remove-macro-item") }
    }

    public static clear(selector: string): void {
        const listContainer: HTMLUListElement = document.querySelector(selector) as HTMLUListElement;
        listContainer.innerHTML = "";
    }

    public static delete(listItem: MouseEvent): void {
        (listItem.target as HTMLButtonElement).closest("li")?.remove();
    }
}
