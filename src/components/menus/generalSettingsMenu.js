import { activateDarkMode } from "../assemblers/html";
import { dragModal } from "@/lib/component_lib";
/**
 * Builds and returns the General Options settings modal form.
 *
 * The form exposes the following global application settings:
 * - **Dark Mode** (`#dark-mode`) — checkbox; change calls `activateDarkMode`.
 * - **Visual Mode** (`#visual-toggle`) — checkbox; change sets `visualToggle`.
 * - **Hide ARP Traffic** (`#ignore-arp-traffic`) — checkbox; change sets
 *   `ignoreArpTraffic`.
 * - **ARP TTL** (`#arp-ttl`) — range slider (120–600 s); input sets `$ARPENTRYTTL`
 *   and updates the `#arp-ttl-value` label.
 * - **Tutorial** (`#start-tutorial`) — button; click calls `startTutorial`.
 *
 * The close button and draggable title bar are also wired up.
 *
 * @returns {HTMLFormElement} The assembled general options modal element.
 */
export function GeneralOptions() {

    const $generalOptions = document.createElement("form");

    $generalOptions.classList.add("settings-modal", "modal", "draggable-modal");

    $generalOptions.innerHTML = `

        <div class="window-frame"> <p> General Options </p> </div>

        <div class="options-group">
            <label for="dark-mode"> Dark Mode </label>
            <input type="checkbox" class="btn-toggle" id="dark-mode" name="dark-mode">
        </div>

        <div class="options-group">
            <label for="visual-toggle"> Visual Mode </label>
            <input type="checkbox" class="btn-toggle" id="visual-toggle" name="visual-toggle">
        </div>

        <div class="options-group">
            <label for="ignore-arp-traffic"> Hide ARP Traffic </label>
            <input type="checkbox" class="btn-toggle" id="ignore-arp-traffic" name="ignore-arp-traffic">
        </div>

        <div class="options-group">
            <label for="arp-ttl"> ARP TTL </label>
            <input type="range" class="btn-input" id="arp-ttl" name="arp-ttl" min="120" max="600" value="400">
            <span id="arp-ttl-value">400s</span>
        </div>

        <div class="options-group">
            <label for="start-tutorial"> Tutorial </label>
            <button class="btn-modern-blue" id="start-tutorial">Start</button>
        </div>

        <button class="btn-modern-blue" id="close-btn">Close</button>
    `;

    /**
     * Syncs the global `ignoreArpTraffic` flag with the checkbox state.
     *
     * @this {HTMLInputElement}
     * @returns {void}
     */
    $generalOptions.querySelector("#ignore-arp-traffic").addEventListener("change", function () { ignoreArpTraffic = this.checked; });

    /**
     * Syncs the global `visualToggle` flag with the checkbox state.
     *
     * @this {HTMLInputElement}
     * @returns {void}
     */
    $generalOptions.querySelector("#visual-toggle").addEventListener("change", function () { visualToggle = this.checked; });

    $generalOptions.querySelector("#dark-mode").addEventListener("change", activateDarkMode);
    $generalOptions.querySelector("#close-btn").addEventListener("click", generalOptionsHandler);
    $generalOptions.querySelector(".window-frame").addEventListener("mousedown", dragModal);

    /**
     * Updates the global `$ARPENTRYTTL` and the displayed value label when the
     * ARP TTL slider changes.
     *
     * @this {HTMLInputElement}
     * @returns {void}
     */
    $generalOptions.querySelector("#arp-ttl").addEventListener("input", function () {
        $ARPENTRYTTL= this.value;
        $generalOptions.querySelector("#arp-ttl-value").innerHTML = `${this.value}s`;
    });

    $generalOptions.querySelector("#start-tutorial").addEventListener("click", function (event) {
        event.preventDefault();
        startTutorial();
    });

    return $generalOptions;

}

/**
 * Toggles the visibility of the General Options modal and synchronises its
 * checkbox states with the current global flag values before showing it.
 *
 * When the modal is currently visible, hides it. When hidden, refreshes
 * `#visual-toggle`, `#ignore-arp-traffic`, and `#dark-mode` to reflect the
 * current values of `visualToggle`, `ignoreArpTraffic`, and `darkMode`, then
 * displays the modal.
 *
 * @param {Event} event - The click event fired by the close/open button.
 * @returns {void}
 */
export function generalOptionsHandler(event) {
    event.preventDefault();
    const $generalOptions = document.querySelector(".settings-modal");
    const isVisible = $generalOptions.style.display === "flex";
    $generalOptions.querySelector("#visual-toggle").checked = visualToggle;
    $generalOptions.querySelector("#ignore-arp-traffic").checked = ignoreArpTraffic;
    $generalOptions.querySelector("#dark-mode").checked = darkMode;
    (isVisible) ? $generalOptions.style.display = "none" : $generalOptions.style.display = "flex";
}
