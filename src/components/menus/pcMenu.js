import { dragModal } from "@/lib/component_lib";

/**
 * Builds and returns the PC network configuration form.
 *
 * The form exposes:
 * - **basic-section**: interface selector, IPv4 address, netmask, gateway, and
 *   DNS server inputs.
 * - **modes-wrapper**: DHCP mode toggle (`#dhcp-toggle`) and an optionally
 *   visible web-server toggle (`#web-server-mode`).
 * - **button-container**: DHCP action buttons (Get/Renew/Release) and
 *   basic Save/Close buttons — visibility is managed dynamically.
 *
 * Event listeners wired up:
 * - `submit` → `pcMenuButtonsHandler`
 * - `#dhcp-toggle` change → `dhcpToggleHandler`
 * - `#web-server-toggle` change → `webServerHandler`
 * - `.window-frame` mousedown → `dragModal`
 * - `#iface` change → `interfaceHandler(..., "pc-form")` and `loadDhcpMenuConf`
 *
 * The form is initially hidden via the "hidden" CSS class.
 *
 * @returns {HTMLFormElement} The assembled PC configuration form element.
 */
export function pc_menu() {

    const $menu = document.createElement("form");

    $menu.classList.add("pc-form", "hidden", "modal", "draggable-modal");

    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p> </div>

        <section class="basic-section">

            <div class="form-item">
                <label for="iface">Interface:</label>
                <select id="iface" name="iface"></select>
            </div>

            <div class="form-item">
                <label for="ip">IP Address (IPv4):</label>
                <input type="text" id="ip" name="ip">
            </div>

            <div class="form-item">
                <label for="netmask">Netmask:</label>
                <input type="text" id="netmask" name="netmask">
            </div>

            <div class="form-item">
                <label for="gateway">Gateway:</label>
                <input type="text" id="gateway" name="gateway">
            </div>

            <div class="form-item">
                <label for="dns-server">DNS Servers:</label>
                <input type="text" id="dns-server" name="dns-server">
            </div>

        </section>

        <section class="modes-wrapper">

            <div class="form-item" id="dhcp-mode">
                <label for="dhcp-toggle"> DHCP Mode: </label>
                <input class="btn-toggle" type="checkbox" id="dhcp-toggle" name="dhcp-toggle">
            </div>

            <div class="form-item hidden" id="web-server-mode">
                <label for="web-server-toggle"> Web Server: </label>
                <input class="btn-toggle" type="checkbox" id="web-server-toggle" name="web-server-toggle">
            </div>

        </section>

        <section class="button-container">

            <div id="dhcp-buttons">
                <button class="btn-modern-blue" type="submit" id="get-btn">Get IP</button>
                <button class="btn-modern-blue" type="submit" id="renew-btn">Renew IP</button>
                <button class="btn-modern-blue" type="submit" id="release-btn">Release IP</button>
            </div>

            <div id="basic-buttons">
                <button class="btn-modern-blue" type="submit" id="save-btn">Save</button>
                <button class="btn-modern-red"  type="submit" id="close-btn">Close</button>
            </div>

        </section>

    `;

    $menu.addEventListener("submit", pcMenuButtonsHandler);
    $menu.querySelector("#dhcp-toggle").addEventListener("change", dhcpToggleHandler);
    $menu.querySelector("#web-server-toggle").addEventListener("change", webServerHandler);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#iface").addEventListener("change", (event) => interfaceHandler(event, "pc-form"));
    $menu.querySelector("#iface").addEventListener("change", loadDhcpMenuConf);

    return $menu;

}

/**
 * Opens the PC configuration form for the given network device and populates
 * its fields with the device's current attributes.
 *
 * - If `quickPingToggle` is active, performs a quick ping instead and returns.
 * - Calls `loadDhcpMenuConf` if the `dhclient` service is active on the device.
 * - Reveals `#web-server-mode` and sets the web-server toggle if `apache2` is
 *   listed as an available service.
 *
 * @param {string} networkObjectId - The DOM id of the PC network device element.
 * @returns {void}
 */
export function showPcMenu(networkObjectId) {

    if (quickPingToggle) {
        quickPing(networkObjectId);
        return;
    }

    const $networkObject = document.getElementById(networkObjectId);
    const iface = getInterfaces(networkObjectId)[0];
    const $menu = document.querySelector(".pc-form");
    $menu.dataset.id = networkObjectId;
    const $textInputs = $menu.querySelectorAll("input[type='text']");
    const $buttonSection = $menu.querySelector(".button-container");
    const activeServices = getAvailableServices(networkObjectId);

    //load available interfaces

    loadInterfaces("pc-form");

    //basic network configuration

    $menu.querySelector(".frame-title").innerHTML = networkObjectId;
    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${iface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${iface}`);
    $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
    $menu.querySelector("#dns-server").value = (getDnsServers(networkObjectId) ?? "").join(",");

    //check active services

    if (activeServices.includes("dhclient")) loadDhcpMenuConf();

    if (activeServices.includes("apache2")) {
        $menu.querySelector("#web-server-mode").classList.remove("hidden");
        if ($networkObject.getAttribute("apache2") === "true") $menu.querySelector("#web-server-toggle").checked = true;
    }

    //display the menu
    $menu.classList.remove("hidden");
}

/**
 * Unified submit handler for all buttons in the PC form.
 * Dispatches to the appropriate action based on `event.submitter.id`.
 *
 * Available actions:
 * - **save-btn**: Validates form fields (unless all are empty), calls
 *   `configureInterface`, `setDefaultGateway`, and `setDnsServers`, then
 *   renders a success popup.
 * - **get-btn**: Closes the form if visual mode is active, then calls
 *   `dhcpDiscoverHandler`.
 * - **renew-btn**: Closes the form if visual mode is active, then calls
 *   `dhcpRenewHandler` with `"T1"`.
 * - **release-btn**: Closes the form if visual mode is active, then calls
 *   `dhcpReleaseHandler`.
 * - **close-btn**: Resets and hides the form.
 *
 * After any action other than close, refreshes the displayed IP fields and
 * reloads the DHCP button state.
 *
 * @async
 * @param {Event} event - The form submit event.
 * @returns {Promise<void>}
 */
export async function pcMenuButtonsHandler(event) {

    event.preventDefault();

    const buttonId = event.submitter.id;
    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $modules = $menu.querySelector(".modes-wrapper").querySelectorAll(".form-item");
    const $buttons = $menu.querySelector(".button-container").querySelectorAll("button");
    const $basicButtons = $menu.querySelectorAll(".button-container #basic-buttons button");
    const $ifaceSelector = $menu.querySelector("#iface");
    const networkInterface = $ifaceSelector.value;
    const newIp = $menu.querySelector("#ip").value;
    const newNetmask = $menu.querySelector("#netmask").value;
    const newGateway = $menu.querySelector("#gateway").value;
    const newDnsServers = ($menu.querySelector("#dns-server").value).split(",").map(ip => ip.trim()).filter(ip => ip !== "");
    const isEmptyForm = newIp === "" && newNetmask === "" && newGateway === "" && newDnsServers.length === 0;

    //menu functions

    /**
     * Validates IP, netmask, gateway, and DNS server fields.
     * @throws {Error} If any field contains an invalid IPv4 value.
     * @returns {void}
     */
    const validateForm = () => {
        if (!isValidIp(newIp)) throw new Error(`Error: IP "${newIp}" is not valid.`);
        if (!isValidIp(newNetmask)) throw new Error(`Error: Netmask "${newNetmask}" is not valid.`);
        if (newGateway !== "" && !isValidIp(newGateway)) throw new Error(`Error: Gateway "${newGateway}" is not valid.`);
        if (newDnsServers.length !== 0 && !newDnsServers.every(isValidIp)) throw new Error(`Error: Invalid DNS servers.`);
    }

    /**
     * Refreshes the form's IP/netmask/gateway/DNS fields from the device's
     * current DOM attributes after a configuration change.
     * @returns {void}
     */
    const updatePcFormFields = () => {
        $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
        $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
        $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
        $menu.querySelector("#dns-server").value = (getDnsServers($networkObject.id) ?? "").join(",");
    }

    /**
     * Resets the form to its initial empty/hidden state, clearing all inputs,
     * checkboxes, and button visibility.
     * @returns {void}
     */
    const restorePcForm = () => {
        const $textInputs = $menu.querySelectorAll("input[type='text']");
        const $checkBoxes = $menu.querySelectorAll("input[type='checkbox']");
        $ifaceSelector.innerHTML = "";
        $modules.forEach($module => $module.classList.add("hidden"));
        $buttons.forEach(button => button.classList.add("hidden"));
        $basicButtons.forEach(button => button.classList.remove("hidden"));
        $checkBoxes.forEach(input => input.checked = false);
        $textInputs.forEach(input => input.disabled = false);
        $menu.classList.add("hidden");
    }

    const buttonFunctions = {

        "save-btn": () => {
            if (!isEmptyForm) validateForm();
            configureInterface($networkObject.id, newIp, newNetmask, networkInterface);
            setDefaultGateway($networkObject.id, newGateway);
            setDnsServers($networkObject.id, newDnsServers);
            bodyComponent.render(popupMessage("Changes have been applied successfully."));
        },

        "get-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpDiscoverHandler($networkObject.id, networkInterface);
        },

        "renew-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpRenewHandler($networkObject.id, "T1", networkInterface);
        },

        "release-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpReleaseHandler($networkObject.id, networkInterface);
        }

    }

    //execute the corresponding function

    try {
        if (buttonId in buttonFunctions) await buttonFunctions[buttonId]();
    }catch(error) {
        console.log(error);
        bodyComponent.render(popupMessage(error.message));
        return;
    }

    if (buttonId === "close-btn") {
        restorePcForm();
        return;
    }

    updatePcFormFields();
    loadDhcpMenuConf();

}

/**
 * Handles the DHCP mode toggle change in the PC form.
 * Updates the `data-dhclient-<iface>` attribute on the device element and
 * reloads the DHCP button configuration via `loadDhcpMenuConf`.
 *
 * @returns {void}
 */
export function dhcpToggleHandler() {
    const $menu = document.querySelector(".pc-form");
    const iface = $menu.querySelector("#iface").value;
    const $networkObject = document.getElementById($menu.dataset.id);
    const isDhcpOn = ($menu.querySelector("#dhcp-toggle").checked) ? "true" : "false";
    $networkObject.setAttribute(`data-dhclient-${iface}`, isDhcpOn);
    loadDhcpMenuConf();
}

/**
 * Handles the web server toggle change in the PC form.
 * Sets the `apache2` attribute on the device element and swaps the device icon
 * between the standard PC icon and the web-server icon.
 *
 * @param {Event} event - The change event fired by the web-server-toggle checkbox.
 * @returns {void}
 */
export function webServerHandler(event) {

    const $webServerToggle = event.target;
    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $networkObjectIcon = $networkObject.querySelector("img");

    if (!$webServerToggle.checked) {
        $networkObject.setAttribute("apache2", false);
        $networkObjectIcon.src = "./assets/board/pc.svg";
    } else {
        $networkObject.setAttribute("apache2", true);
        $networkObjectIcon.src = "./assets/board/www-server.svg";
    }

}

/**
 * Synchronises the PC form's DHCP section with the current DHCP client state
 * for the selected interface.
 *
 * Logic:
 * - Always shows `#dhcp-mode`.
 * - If DHCP client is **disabled** for the interface: hides DHCP buttons,
 *   enables text inputs, and unchecks the toggle.
 * - If DHCP client is **enabled**: checks the toggle, shows DHCP buttons,
 *   and disables text inputs (IP is managed by the server).
 *   - If the interface already has an IP: shows Renew and Release, hides Get.
 *   - If no IP yet: shows Get, hides Renew and Release.
 *
 * @returns {void}
 */
export function loadDhcpMenuConf() {

    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $dhcpButtons = $menu.querySelector("#dhcp-buttons");
    const $dhcpToggle = $menu.querySelector("#dhcp-toggle");
    const $inputFields = $menu.querySelectorAll("input[type='text']");
    const iface = $menu.querySelector("#iface").value;

    //show dhcp mode

    $menu.querySelector("#dhcp-mode").classList.remove("hidden");

    //the DHCP client is not enabled for that interface

    if ($networkObject.getAttribute(`data-dhclient-${iface}`) !== "true") {
        $dhcpButtons.classList.add("hidden");
        $inputFields.forEach(input => input.disabled = false);
        $dhcpToggle.checked = false;
        return;
    }

    //show the buttons

    $dhcpToggle.checked = true;
    $dhcpButtons.classList.remove("hidden");
    $inputFields.forEach(input => input.disabled = true);

    //if an IP is assigned, show the renewal and release buttons

    if ($networkObject.getAttribute(`ip-${iface}`) !== "") {
        $dhcpButtons.querySelector("#renew-btn").classList.remove("hidden");
        $dhcpButtons.querySelector("#release-btn").classList.remove("hidden");
        $dhcpButtons.querySelector("#get-btn").classList.add("hidden");
        return;
    }

    //if no IP is assigned, show the get button

    $dhcpButtons.querySelector("#get-btn").classList.remove("hidden");
    $dhcpButtons.querySelector("#renew-btn").classList.add("hidden");
    $dhcpButtons.querySelector("#release-btn").classList.add("hidden");

}
