import { dragModal } from "@/lib/component_lib";
/**
 * Builds and returns the DHCP server configuration form.
 *
 * The form has two tab sections toggled via a nav panel:
 * - **main-section** (Basic tab): interface selector, device IP/netmask/gateway,
 *   and DHCP service options (listening interfaces, IP range, offered
 *   netmask/gateway/DNS/lease-time).
 * - **reservations-section**: MAC→IP static reservation management table with
 *   add and per-row remove buttons.
 *
 * Event listeners wired up:
 * - `submit` → `saveDhcpMenu`
 * - `#btn-basic-tab` click → `showBasicTab`
 * - `#btn-reservations` click → `showReservTab`
 * - `#add-reservation` click → `addDhcpReservationHandler`
 * - `.window-frame` mousedown → `dragModal`
 * - `#close-btn` click → `closeDhcpMenu`
 * - `#iface` change → `interfaceHandler(..., "dhcp-form")`
 *
 * @returns {HTMLFormElement} The assembled DHCP server configuration form element.
 */
export function dhcp_server_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-form", "modal", "draggable-modal");
    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p> </div>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab">Basic</button>
            <button class="btn-modern-blue dark" id="btn-reservations">Reservations</button>
        </div>

        <section class="main-section">

            <section class="basic-section">

                <div>
                    <label for="iface">Interface:</label>
                    <select id="iface" name="iface"></select>
                </div>

                <div>
                    <label for="ip">IP Address (IPv4):</label>
                    <input type="text" id="ip" name="ip">
                </div>

                <div >
                    <label for="netmask">Netmask:</label>
                    <input type="text" id="netmask" name="netmask">
                </div>

                <div >
                    <label for="gateway">Gateway:</label>
                    <input type="text" id="gateway" name="gateway">
                </div>

            </section>

            <section class="dhcp-options-section">

                <p> DHCP Service Options </p>

                <div>
                    <label for="dhcp-listen-on-interfaces">Listening Interfaces:</label>
                    <input type="text" id="dhcp-listen-on-interfaces" name="dhcp-listen-on-interfaces" placeholder="enp0s3,enp0s8">
                </div>

                <div>
                    <label for="range-start">IP Range:</label>
                    <input type="text" id="range-start" name="range-start">
                    <input type="text" id="range-end" name="range-end">
                </div>

                <div>
                    <label for="dhcp-offer-netmask">Netmask:</label>
                    <input type="text" id="dhcp-offer-netmask" name="dhcp-offer-netmask">
                </div>

                <div>
                    <label for="dhcp-offer-gateway">Gateway:</label>
                    <input type="text" id="dhcp-offer-gateway" name="dhcp-offer-gateway">
                </div>

                <div>
                    <label for="dhcp-offer-dns">DNS Server:</label>
                    <input type="text" id="dhcp-offer-dns" name="dhcp-offer-dns">
                </div>

                <div>
                    <label for="dhcp-offer-lease-time">Lease Time:</label>
                    <input type="text" id="dhcp-offer-lease-time" name="dhcp-offer-lease-time">
                </div>

            </section>

            <div class="button-wrapper">
                <button class="btn-modern-blue dark" type="submit" id="btn-save-form">Save</button>
                <button class="btn-modern-red dark" id="close-btn">Close</button>
            </div>

        </section>

        <section class="reservations-section" style="display: none;">

            <div>
                <label for="mac-for-reserve">MAC Address:</label>
                <input type="text" id="mac-for-reserve" name="mac-for-reserve"
                pattern="^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$" placeholder="00:00:00:00:00:00">
            </div>

            <div>
                <label for="ip-to-reserve">IP Address (IPv4):</label>
                <input type="text" id="ip-to-reserve" name="ip-to-reserve"
                pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" placeholder="192.168.0.1">
            </div>

            <button class="btn-modern-blue dark small" id="add-reservation">Add</button>

            <div class="reservations-table-wrapper">
                <table id="reservations-table" class="inner-table">
                    <tr>
                        <th>MAC</th>
                        <th>IP</th>
                    </tr>
                </table>
            </div>

        </section>

    `;

    $menu.addEventListener("submit", saveDhcpMenu);
    $menu.querySelector("#btn-basic-tab").addEventListener("click", showBasicTab);
    $menu.querySelector("#btn-reservations").addEventListener("click", showReservTab);
    $menu.querySelector("#add-reservation").addEventListener("click", addDhcpReservationHandler);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#close-btn").addEventListener("click", closeDhcpMenu);
    $menu.querySelector("#iface").addEventListener("change", (event) => interfaceHandler(event, "dhcp-form"));

    return $menu;

}

/**
 * Opens the DHCP server configuration menu for the network device that
 * triggered the event and pre-populates all fields with its current attributes.
 *
 * - If `quickPingToggle` is active, performs a quick ping instead and returns.
 * - Hides `.basic-section` for devices that are not pure DHCP servers
 *   (id does not start with `"dhcp-server-"`).
 * - Appends existing reservation rows to `#reservations-table`.
 * - Closes the advanced-options popover before displaying the form.
 *
 * @param {Event} event - The click event originating from inside an `.item-dropped` element.
 * @returns {void}
 */
export function showDhcpMenu(event) {

    event.stopPropagation();

    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;

    if (quickPingToggle) {
        quickPing(networkObjectId);
        return;
    }

    const $menu = document.querySelector(".dhcp-form");
    $menu.dataset.id = networkObjectId;
    const networkObjectInterface = getInterfaces(networkObjectId)[0];

    //load available interfaces
    loadInterfaces("dhcp-form");

    //service attributes
    const $reservationsTable = $menu.querySelector("#reservations-table");
    const isDhcpServer = networkObjectId.startsWith("dhcp-server-");
    const reservations = genDhcpReservationsRows(networkObjectId);

    //add server attributes to the menu
    $menu.querySelector(".frame-title").innerHTML = networkObjectId;
    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    $menu.querySelector("#gateway").value = getDefaultGateway(networkObjectId);
    $menu.querySelector("#dhcp-listen-on-interfaces").value = $networkObject.getAttribute("dhcp-listen-on-interfaces");
    $menu.querySelector("#range-start").value = $networkObject.getAttribute("data-range-start");
    $menu.querySelector("#range-end").value = $networkObject.getAttribute("data-range-end");
    $menu.querySelector("#dhcp-offer-gateway").value = $networkObject.getAttribute("dhcp-offer-gateway");
    $menu.querySelector("#dhcp-offer-netmask").value = $networkObject.getAttribute("dhcp-offer-netmask");
    $menu.querySelector("#dhcp-offer-dns").value = $networkObject.getAttribute("dhcp-offer-dns");
    $menu.querySelector("#dhcp-offer-lease-time").value = $networkObject.getAttribute("dhcp-offer-lease-time");
    reservations.forEach($reservation => $reservationsTable.appendChild($reservation));

    if (!isDhcpServer) $menu.querySelector(".basic-section").classList.add("hidden");
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    $menu.style.display = "flex";

}

/**
 * Handles form submission for the DHCP server menu, validating inputs and
 * persisting the configuration to the network-object DOM element.
 *
 * For pure DHCP servers (`id` starts with `"dhcp-server-"`), also calls
 * `configureInterface` and `setDefaultGateway`. For all devices, updates the
 * DHCP service attributes (range, offered options, listening interfaces).
 * Delegates all field-level validation to `validateDHCPMenu`.
 *
 * On success renders a success popup; on failure renders the error message
 * and returns without saving.
 *
 * @param {Event} event - The form submit event.
 * @returns {void}
 */
export function saveDhcpMenu(event) {

    event.preventDefault();

    const $menu = document.querySelector(".dhcp-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const availableInterfaces = getInterfaces($networkObject.id);
    const networkObjectInterface = $menu.querySelector("#iface").value;
    const listenOnInterfaces = $menu.querySelector("#dhcp-listen-on-interfaces").value
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");
    const isDhcpServer = $networkObject.id.startsWith("dhcp-server-");

    try {

        validateDHCPMenu();

        if (isDhcpServer) {

            configureInterface($networkObject.id,
                $menu.querySelector("#ip").value,
                $menu.querySelector("#netmask").value,
                networkObjectInterface
            );

            setDefaultGateway($networkObject.id, $menu.querySelector("#gateway").value);

        }

        $networkObject.setAttribute("data-range-start", $menu.querySelector("#range-start").value);
        $networkObject.setAttribute("data-range-end", $menu.querySelector("#range-end").value);
        $networkObject.setAttribute("dhcp-offer-gateway", $menu.querySelector("#dhcp-offer-gateway").value);
        $networkObject.setAttribute("dhcp-offer-netmask", $menu.querySelector("#dhcp-offer-netmask").value);
        $networkObject.setAttribute("dhcp-offer-dns", $menu.querySelector("#dhcp-offer-dns").value);
        $networkObject.setAttribute("dhcp-offer-lease-time", $menu.querySelector("#dhcp-offer-lease-time").value);
        $networkObject.setAttribute("dhcp-listen-on-interfaces", listenOnInterfaces.join(","));

        bodyComponent.render(popupMessage(`Changes have been saved successfully.`));

    }catch (error) {

        bodyComponent.render(popupMessage(error.message));
        return;

    }

}

/**
 * Reads the current DHCP form state and throws a descriptive `Error` if any
 * field contains an invalid value.
 *
 * Validation rules:
 * - For DHCP servers: `ip` and `netmask` must be valid IPv4; `gateway` must be
 *   empty or a valid IPv4.
 * - If the DHCP options module is not entirely empty, delegates to
 *   `validateDhpcConfiguration` with the parsed options object.
 *
 * @returns {void}
 * @throws {Error} If any validated field contains an invalid value.
 */
export function validateDHCPMenu() {

    const $menu = document.querySelector(".dhcp-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const availableInterfaces = getInterfaces($networkObject.id);
    const isDhcpServer = $networkObject.id.startsWith("dhcp-server-");

    //get all form fields

    const ip = $menu.querySelector("#ip").value;

    const netmask = $menu.querySelector("#netmask").value;

    const gateway = $menu.querySelector("#gateway").value;

    const dhcpListenOnInterfaces = $menu.querySelector("#dhcp-listen-on-interfaces").value
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");

    const rangeStart = $menu.querySelector("#range-start").value;

    const rangeEnd = $menu.querySelector("#range-end").value;

    const dhcpOfferGateway = $menu.querySelector("#dhcp-offer-gateway").value;

    const dhcpOfferNetmask = $menu.querySelector("#dhcp-offer-netmask").value;

    const dhcpOfferDnsServers = $menu.querySelector("#dhcp-offer-dns").value
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");

    const dhcpOfferLeaseTime = $menu.querySelector("#dhcp-offer-lease-time").value;

    //validate fields

    if (isDhcpServer) {
        if (!isValidIp(ip)) throw new Error(`Error: expected a valid IP instead of "${ip}".`);
        if (!isValidIp(netmask)) throw new Error(`Error: expected a valid netmask instead of "${netmask}".`);
        if (gateway !== "" && !isValidIp(gateway)) throw new Error(`Error: expected a valid gateway instead of "${gateway}".`);
    }

    if (!isDhcpModuleEmpty()) {

        validateDhpcConfiguration($networkObject.id,
            {
                dhcpListenOnInterfaces: dhcpListenOnInterfaces,
                rangeStart: rangeStart,
                rangeEnd: rangeEnd,
                dhcpOfferGateway: dhcpOfferGateway,
                dhcpOfferNetmask: dhcpOfferNetmask,
                dhcpOfferDnsServers: dhcpOfferDnsServers,
                dhcpOfferLeaseTime: dhcpOfferLeaseTime
            }
        );

    }

}

/**
 * Closes the DHCP server menu, resets the reservations table to its header-only
 * state, restores visibility of `.basic-section`, and hides the form.
 *
 * @param {Event} event - The click event fired by the close button.
 * @returns {void}
 */
export function closeDhcpMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    restoreDhcpReservationTable();
    $menu.querySelector(".basic-section").classList.remove("hidden");
    $menu.style.display = "none";
}

/**
 * Switches the DHCP form to the Basic tab, showing `.main-section` and
 * hiding `.reservations-section`.
 *
 * @param {Event} event - The click event fired by the Basic tab button.
 * @returns {void}
 */
export function showBasicTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    $menu.querySelectorAll(".active").forEach($button => $button.classList.remove("active"));
    $menu.querySelector("#btn-basic-tab").classList.add("active");
    $menu.querySelector(".main-section").style.display = "flex";
    $menu.querySelector(".reservations-section").style.display = "none";
}

/**
 * Switches the DHCP form to the Reservations tab, showing `.reservations-section`
 * and hiding `.main-section`.
 *
 * @param {Event} event - The click event fired by the Reservations tab button.
 * @returns {void}
 */
export function showReservTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    $menu.querySelectorAll(".active").forEach($button => $button.classList.remove("active"));
    $menu.querySelector("#btn-reservations").classList.add("active");
    $menu.querySelector(".main-section").style.display = "none";
    $menu.querySelector(".reservations-section").style.display = "flex";
}

/**
 * Handles the "Agregar" button click in the reservations tab.
 * Reads the MAC and IP inputs, calls `addDhcpReservation`, clears the inputs,
 * refreshes the reservations table, and renders an error popup on failure.
 *
 * @param {Event} event - The click event fired by the add-reservation button.
 * @returns {void}
 */
export function addDhcpReservationHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    const $reservationsTable = $menu.querySelector("#reservations-table");
    const networkObjectId = $menu.dataset.id;
    const macForReservation = $menu.querySelector("#mac-for-reserve").value.toUpperCase();
    const ipToReserve = $menu.querySelector("#ip-to-reserve").value;

    try {
        addDhcpReservation(networkObjectId, macForReservation, ipToReserve);
        $menu.querySelector("#mac-for-reserve").value = "";
        $menu.querySelector("#ip-to-reserve").value = "";
        restoreDhcpReservationTable()
        genDhcpReservationsRows(networkObjectId).forEach($reservation => $reservationsTable.appendChild($reservation));
    } catch (error) {
        bodyComponent.render(popupMessage(error.message));
    }

}

/**
 * Removes a specific MAC→IP reservation from a network device, refreshes the
 * reservations table, and renders a confirmation popup.
 *
 * Intended to be called from inline `onclick` attributes generated by
 * `genDhcpReservationsRows`.
 *
 * @param {string} networkObjectId - The DOM id of the network device element.
 * @param {string} mac - The MAC address (uppercase) of the reservation to remove.
 * @param {Event} event - The click event fired by the remove button.
 * @returns {void}
 */
export function removeDhcpReservationHandler(networkObjectId, mac, event) {
    event.stopPropagation();
    event.preventDefault();
    const $networkObject = document.getElementById(networkObjectId);
    removeDhcpReservation($networkObject.id, mac);
    restoreDhcpReservationTable();
    genDhcpReservationsRows(networkObjectId).forEach($reservation => $reservationsTable.appendChild($reservation));
    bodyComponent.render(popupMessage(`MAC ${mac} has been removed from the reservations list.`));
}

/**
 * Resets `#reservations-table` inside `.dhcp-form` to its initial state,
 * keeping only the header row (`<th>MAC</th><th>IP</th>`).
 *
 * @returns {void}
 */
export function restoreDhcpReservationTable() {
    const $menu = document.querySelector(".dhcp-form");
    const $reservationsTable = $menu.querySelector("#reservations-table");
    $reservationsTable.innerHTML = `
    <tr>
        <th>MAC</th>
        <th>IP</th>
    </tr>
    `;
}

/**
 * Reads the `dhcp-reservations` JSON attribute from the given network device
 * and builds a `<tr>` element for each MAC→IP entry, each containing a remove
 * button that calls `removeDhcpReservationHandler`.
 *
 * @param {string} networkObjectId - The DOM id of the network device element.
 * @returns {Array<HTMLTableRowElement>} Array of `<tr>` elements, one per reservation.
 */
export function genDhcpReservationsRows(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const reservations = JSON.parse($networkObject.getAttribute("dhcp-reservations"));
    const rows = [];

    for (const reservation in reservations) {
        const $newRow = document.createElement("tr");
        $newRow.innerHTML = `
            <td>${reservation}</td>
            <td class="ip-field">
                <p>${reservations[reservation]}</p>
                <button
                class="btn-modern-blue dark small no-animation"
                onclick="removeDhcpReservationHandler('${networkObjectId}', '${reservation}',event)">
                    Remove
                </button>
            </td>
        `;
        rows.push($newRow);
    }

    return rows;
}

/**
 * Returns whether every input field in the `.dhcp-options-section` of the
 * DHCP form is currently empty.
 *
 * Used to skip DHCP service option validation when the operator has not
 * configured any DHCP service parameters.
 *
 * @returns {boolean} `true` if all DHCP option inputs are empty, `false` otherwise.
 */
export function isDhcpModuleEmpty() {
    const $dhcpMenu = document.querySelector(".dhcp-form");
    const $optionsModule = $dhcpMenu.querySelector(".dhcp-options-section");
    const $optionsModuleInputs = $optionsModule.querySelectorAll("input");
    return Array.from($optionsModuleInputs).every(input => input.value === "");
}
