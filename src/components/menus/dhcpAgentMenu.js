import { dragModal } from "@/lib/component_lib";
/**
 * Builds and returns the DHCP relay agent configuration form.
 *
 * The form contains two sections:
 * - **basic-section**: IP address, netmask, and default gateway fields,
 *   plus an interface selector. This section is hidden for pure relay agents
 *   (i.e. devices whose id does not start with "dhcp-relay-server-").
 * - **dhcp-relay-section**: Main DHCP server IP and comma-separated
 *   listening-interface fields.
 *
 * Event listeners wired up:
 * - `submit` → `saveDhcpRelayMenu`
 * - `#close-btn` click → `closeDhcpRelayMenu`
 * - `.window-frame` mousedown → `dragModal` (makes the modal draggable)
 * - `#iface` change → `interfaceHandler(..., "dhcp-relay-form")`
 *
 * @returns {HTMLFormElement} The assembled DHCP relay configuration form element.
 */
export function dhcp_agent_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-relay-form", "modal", "draggable-modal");
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

        </section>

        <section class="dhcp-relay-section">

            <div class="form-item">
                <label for="main-server">Main DHCP Server:</label>
                <input type="text" id="main-server" name="main-server">
            </div>

            <div class="form-item">
                <label for="listen-on-interfaces">Listening Interfaces:</label>
                <input type="text" id="listen-on-interfaces" name="listen-on-interfaces">
            </div>

        </section>

        <div class="button-wrapper">
            <button class="btn-modern-blue" type="submit">Save</button>
            <button class="btn-modern-red"  id="close-btn">Close</button>
        </div>
    `;

    $menu.addEventListener("submit", saveDhcpRelayMenu);
    $menu.querySelector("#close-btn").addEventListener("click", closeDhcpRelayMenu);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#iface").addEventListener("change", (event) => interfaceHandler(event, "dhcp-relay-form"));


    return $menu;

}

/**
 * Displays the DHCP relay menu for the network device that triggered the event
 * and populates its fields with the device's current configuration.
 *
 * Behaviour:
 * - If `quickPingToggle` is active, performs a quick ping to the device instead
 *   of opening the menu and returns early.
 * - Hides the `.basic-section` when the device is not a DHCP relay server
 *   (i.e. its id does not start with `"dhcp-relay-server-"`).
 * - Closes the advanced-options popover before showing the menu.
 *
 * @param {Event} event - The click event originating from inside an `.item-dropped` element.
 * @returns {void}
 */
export function showDhcpRelayMenu(event) {

    event.stopPropagation();

    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;

    if (quickPingToggle) {
        quickPing(networkObjectId);
        return;
    }

    //add the id of the device to the menu
    const $menu = $('.dhcp-relay-form');
    $menu.dataset.id = networkObjectId;

    //retrieve device information
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const isDhcpRelay = networkObjectId.startsWith("dhcp-relay-server-");

    //load the available interfaces
    loadInterfaces("dhcp-relay-form");

    //assign the values of the object to the menu
    $('#ip', $menu).value = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    $('#netmask', $menu).value = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    $('#gateway', $menu).value = getDefaultGateway(networkObjectId);
    $('#main-server', $menu).value = $networkObject.getAttribute("dhcrelay-main-server");;
    $('#listen-on-interfaces', $menu).value = $networkObject.getAttribute("dhcrelay-listen-on-interfaces");
    $('.frame-title', $menu).innerHTML = networkObjectId;

    //hide the basic section for relay agents
    if (!isDhcpRelay) $('.basic-section', $menu).classList.add("hidden");

    //display menu
    $('.advanced-options-modal', $networkObject).style.display = "none";
    $menu.style.display = "flex";
}

/**
 * Handles form submission for the DHCP relay menu, validating and persisting
 * the user's configuration to the corresponding network-object DOM element.
 *
 * Validation rules applied:
 * - For DHCP relay servers (`id` starts with `"dhcp-relay-server-"`):
 *   IP, netmask must be valid IPv4 addresses; gateway may be empty or a valid IPv4.
 * - For all devices: main server must be empty or a valid IPv4 address.
 * - Listening interfaces must all exist in the device's current interface list.
 *
 * On success, calls `configureInterface`, `setDefaultGateway`, updates
 * `dhcrelay-main-server` / `dhcrelay-listen-on-interfaces` attributes, and
 * renders a success popup.
 * On failure, renders an error popup and returns without saving.
 *
 * @param {Event} event - The form submit event.
 * @returns {void}
 * @throws {Error} Validation errors are caught internally and displayed as popup messages.
 */
export function saveDhcpRelayMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $menu = $(".dhcp-relay-form");
    const $networkObject = $('#'+ $menu.dataset.id);
    const availableInterfaces = getInterfaces($networkObject.id);
    const networkObjectInterface = $('#iface', $menu).value;
    const newIp = $('#ip', $menu).value;
    const newNetmask = $('#netmask', $menu).value;
    const newGateway = $('#gateway', $menu).value;
    const newMainServer = $('#main-server', $menu).value;
    const newListenOnInterfaces = ($('#listen-on-interfaces', $menu).value)
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");
    const isDhcpRelay = $networkObject.id.startsWith("dhcp-relay-server-");

    try {

        if (isDhcpRelay) {
            if (!isValidIp(newIp)) throw new Error(`Error: "${newIp}" is not a valid IP.`);
            if (!isValidIp(newNetmask)) throw new Error(`Error: "${newNetmask}" is not a valid netmask.`);
            if (newGateway !== "" && !isValidIp(newGateway)) throw new Error(`Error: "${newGateway}" is not a valid gateway.`);
        }

        if (newMainServer !== "" && !isValidIp(newMainServer)) {
            throw new Error(`Error: "${newMainServer}" is not a valid main server IP.`);
        }

        if (newListenOnInterfaces.length !== 0 && !newListenOnInterfaces.every(item => availableInterfaces.includes(item))) {
            throw new Error(`Error: Some of the listening interfaces are not valid.`);
        }

        configureInterface($networkObject.id, newIp, newNetmask, networkObjectInterface);
        setDefaultGateway($networkObject.id, newGateway);
        $networkObject.setAttribute("dhcrelay-main-server", newMainServer);
        $networkObject.setAttribute("dhcrelay-listen-on-interfaces", newListenOnInterfaces?.join(","));
        bodyComponent.render(popupMessage(`Changes have been saved successfully.`));

    }catch(error) {

        bodyComponent.render(popupMessage(error.message));
        return;
    }

}

/**
 * Closes the DHCP relay menu, resets the form, and restores the visibility
 * of the `.basic-section` (which may have been hidden for non-relay devices).
 *
 * @param {Event} event - The click event fired by the close button.
 * @returns {void}
 */
export function closeDhcpRelayMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $form = $('.dhcp-relay-form');
    $form.querySelector(".basic-section").classList.remove("hidden");
    $form.reset();
    $form.style.display = "none";
}
