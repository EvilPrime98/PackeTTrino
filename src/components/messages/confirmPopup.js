/**
 * Creates a confirmation popup element with "Accept" and "Cancel" buttons.
 * If a popup is already visible, this function does nothing and returns undefined.
 * Respects the global `darkMode` flag by adding the appropriate CSS class.
 *
 * @param {string} message - The confirmation message to display inside the popup.
 * @param {Function} callback - Function to invoke when the user clicks "Accept".
 * @returns {HTMLDivElement|undefined} The popup DOM element, or undefined if a popup is already open.
 *
 * @example
 * const popup = confirmPopup("Do you want to delete this element?", () => deleteItem(id));
 * if (popup) document.body.appendChild(popup);
 */
function confirmPopup(message, callback)  {

    if (document.querySelectorAll(".popup-content").length > 0) return;

    const $popup = document.createElement("div");

    $popup.classList.add("popup-content", "confirm");

    if (darkMode) $popup.classList.add("dark-mode");

    $popup.innerHTML = `
        <p>${message}</p>
        <button class="btn-modern-blue dark no-animation" id="btn-accept" style="padding: 5px;" >Accept</button>
        <button class="btn-modern-red no-animation" id="btn-cancel" style="padding: 5px;">Cancel</button>
    `;

    $popup.querySelector("#btn-accept").addEventListener("click", (event) => {
        closePopup(event);
        callback();
    });

    $popup.querySelector("#btn-cancel").addEventListener("click", closePopup);

    /**
     * Removes the popup from the DOM and cleans up its button event listeners.
     *
     * @param {MouseEvent} event - The click event fired by one of the popup buttons.
     * @returns {void}
     */
    function closePopup(event) {

        const $popup = event.target.closest(".popup-content");

        $popup.querySelector("#btn-accept").removeEventListener("click", (event) => {
            closePopup(event);
            callback();
        });

        $popup.querySelector("#btn-cancel").removeEventListener("click", closePopup);

        $popup.remove();

    }

    return $popup;

}
