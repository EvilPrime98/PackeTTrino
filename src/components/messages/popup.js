/**
 * Creates a dismissible message popup element with an optional icon image.
 * If a popup is already visible, this function does nothing and returns undefined.
 * Closes all advanced-options modals before rendering, and respects the global
 * `darkMode` flag by adding the appropriate CSS class.
 *
 * @param {string} message - The message text to display inside the popup.
 * @param {string} [imgsrc=""] - Optional URL of an icon image to display alongside the message.
 *   Pass an empty string (or omit) to render no image.
 * @returns {HTMLDivElement|undefined} The popup DOM element, or undefined if a popup is already open.
 *
 * @example
 * const popup = popupMessage("Operation completed.", "./icons/success.png");
 * if (popup) document.body.appendChild(popup);
 */
function popupMessage(message, imgsrc = "") {

    if (document.querySelectorAll(".popup-content").length > 0) return;

    closeAllAdvOptsModals();

    const $popup = document.createElement("div");

    $popup.classList.add("popup-content", "message");

    if (darkMode) $popup.classList.add("dark-mode");

    const imgFragment = (imgsrc !== "") ? `<img src="${imgsrc}" alt="icon">` : "";

    $popup.innerHTML = `
        <div>
            <p>${message}</p>
            ${imgFragment}
        </div>
        <button class="btn-modern-red no-animation" style="padding: 5px;" id="btn-close" > Close </button>
    `;

    $popup.querySelector("button").addEventListener("click", closePopup);

    /**
     * Removes the popup from the DOM and cleans up its close-button event listener.
     *
     * @param {MouseEvent} event - The click event fired by the "Close" button.
     * @returns {void}
     */
    function closePopup(event) {
        const $popupComponent = event.target.closest(".popup-content");
        $popupComponent.querySelector("button").removeEventListener("click", closePopup);
        $popupComponent.remove();
    }

    return $popup;

}
