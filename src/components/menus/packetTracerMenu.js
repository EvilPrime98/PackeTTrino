import { dragModal } from "@/lib/component_lib";

/**
 * Builds and returns the Packet Tracer panel widget.
 *
 * The panel contains:
 * - A draggable title bar (`.window-frame`).
 * - A filter toolbar with a text input (Enter triggers filter), a "Filtrar"
 *   button, a "Limpiar" button, and a device selector (`#filter-by-device`).
 * - A scrollable table showing captured packet fields:
 *   XID, Protocol, Type, Origin IP, Destination IP, Origin MAC, Destination MAC, TTL.
 *
 * Event listeners wired up:
 * - Text input keydown (Enter) → `filterPacketTraffic`
 * - `#filter-traffic-button` click → `filterPacketTraffic`
 * - `#clean-traffic-button` click → `cleanPacketTraffic`
 * - `#filter-by-device` change → `filterPacketTrafficbyDevice`
 * - `.window-frame` mousedown → `dragModal`
 *
 * @returns {HTMLElement} The assembled packet-traffic article element.
 */
export function packetTracer() {

    const $packetTracer = document.createElement("article");
    $packetTracer.classList.add("packet-traffic", "draggable-modal");

    $packetTracer.innerHTML = `

        <div class="window-frame"><p>Packet Tracer</p></div>

        <div class="filter-traffic">
            <input type="text">
            <button class="btn-blue" id="filter-traffic-button">Filter</button>
            <button class="btn-blue" id="clean-traffic-button">Clear</button>
            <select id="filter-by-device">
                <option value="all">All</option>
            </select>
        </div>

        <div class="table-wrapper">
            <table>
                <tr>
                    <th>XID</th>
                    <th>Protocol</th>
                    <th>Type</th>
                    <th>Origin IP</th>
                    <th>Destination IP</th>
                    <th>Origin MAC</th>
                    <th>Destination MAC</th>
                    <th>TTL</th>
                </tr>
            </table>
        </div>
    `;

    $packetTracer.querySelector("input")?.addEventListener("keydown", (event) => { if (event.key === "Enter") filterPacketTraffic(); });
    $packetTracer.querySelector("#filter-traffic-button")?.addEventListener("click", filterPacketTraffic);
    $packetTracer.querySelector("#clean-traffic-button")?.addEventListener("click", cleanPacketTraffic);
    $packetTracer.querySelector("#filter-by-device")?.addEventListener("change", filterPacketTrafficbyDevice);
    $packetTracer.querySelector(".window-frame")?.addEventListener("mousedown", dragModal);

    return $packetTracer;

}

/**
 * Appends a captured packet to the global `trafficBuffer` and inserts a new
 * row into the packet-traffic table for it.
 *
 * The XID cell contains a clickable link that calls `showPacketFields(event)`
 * with a `data-buffer` index pointing to the packet in `trafficBuffer`.
 * Missing fields default to `"N/A"`.
 *
 * @param {Object} packet - The packet object to display.
 * @param {string} [packet.protocol] - The network protocol (e.g. "TCP", "UDP").
 * @param {string} packet.type - The packet type (e.g. "REQUEST", "REPLY").
 * @param {string} packet.destination_ip - Destination IPv4 address.
 * @param {string} packet.origin_ip - Origin IPv4 address.
 * @param {string} packet.destination_mac - Destination MAC address.
 * @param {string} packet.origin_mac - Origin MAC address.
 * @param {number} [packet.ttl] - Time-to-live value.
 * @param {string} [packet.xid] - Transaction identifier.
 * @returns {void}
 */
export function addPacketTraffic(packet) {
    trafficBuffer.push(packet);
    const $table = document.querySelector(".packet-traffic table");
    const protocol = packet.protocol || "N/A";
    const type = packet.type;
    const destinationIP = packet.destination_ip;
    const originIP = packet.origin_ip;
    const destinationMAC = packet.destination_mac;
    const originMAC = packet.origin_mac;
    const ttl = packet.ttl || "N/A";
    const xid = packet.xid || "N/A";

    $table.innerHTML += `
        <tr>
            <td><a onclick="showPacketFields(event)" data-buffer="${trafficBuffer.length - 1}">${xid}</a></td>
            <td>${protocol}</td>
            <td>${type}</td>
            <td>${originIP}</td>
            <td>${destinationIP}</td>
            <td>${originMAC}</td>
            <td>${destinationMAC}</td>
            <td>${ttl}</td>
        </tr>
    `;
}

/**
 * Toggles the visibility of the packet-traffic panel.
 *
 * When hiding: calls `removeDevicesFromTraffic` to reset the device selector,
 * sets overflow to hidden, and hides the panel.
 * When showing: calls `insertDevicesToTraffic` to populate the device selector,
 * sets overflow to auto, and displays the panel.
 *
 * @returns {void}
 */
export function showPacketTraffic() {

    const $packetTraffic = document.querySelector(".packet-traffic");

    if ($packetTraffic.style.display === "flex") {
        removeDevicesFromTraffic();
        $packetTraffic.style.overflow = "hidden";
        $packetTraffic.style.display = "none";
        return;
    }

    insertDevicesToTraffic();
    $packetTraffic.style.overflow = "auto";
    $packetTraffic.style.display = "flex";
}

/**
 * Clears the global `trafficBuffer` array and removes all data rows (skipping
 * the header row) from the packet-traffic table.
 *
 * @returns {void}
 */
export function cleanPacketTraffic() {

    trafficBuffer = [];

    const $packetTraffic = document.querySelector(".packet-traffic");
    const $table = $packetTraffic.querySelector("table");
    const $trs = $table.querySelectorAll("tr");

    for (let i = 1; i < $trs.length; i++) {
        $trs[i].remove();
    }

}

/**
 * Filters the packet-traffic table rows by matching the filter text input
 * (case-insensitive) against every cell value in each row. Non-matching rows
 * are hidden; matching rows are shown.
 *
 * @returns {void}
 */
export function filterPacketTraffic() {

    const $packetTraffic = document.querySelector(".packet-traffic");
    const $table = $packetTraffic.querySelector("table");
    const $trs = $table.querySelectorAll("tr");

    const filter = document.querySelector(".filter-traffic input").value.toLowerCase();

    for (let i = 1; i < $trs.length; i++) {
        const $tr = $trs[i];
        const $tds = $tr.querySelectorAll("td");
        const protocol = $tds[0].innerHTML;
        const type = $tds[1].innerHTML;
        const originIP = $tds[2].innerHTML;
        const destinationIP = $tds[3].innerHTML;
        const originMAC = $tds[4].innerHTML;
        const destinationMAC = $tds[5].innerHTML;
        const destinationPort = $tds[6].innerHTML;
        const xid = $tds[7].innerHTML;

        if (protocol.includes(filter)
            || type.includes(filter)
            || originIP.includes(filter)
            || destinationIP.includes(filter)
            || originMAC.includes(filter)
            || destinationMAC.includes(filter)
            || destinationPort.includes(filter)
            || xid.includes(filter)
        ) {
            $tr.style.display = "table-row";
        } else {
            $tr.style.display = "none";
        }
    }

}

/**
 * Opens the detailed packet information modal for the packet row that was
 * clicked, delegating rendering to `packetInfo(event)`.
 *
 * @param {Event} event - The click event fired by the XID anchor link in the table.
 * @returns {void}
 */
export function showPacketFields(event) {
    //document.querySelector(".modal-overlay").style.display = "block";
    bodyComponent.render(packetInfo(event));
}

/**
 * Closes and removes the detailed packet fields modal, hides the overlay,
 * and cleans up the click listener to avoid duplicate handlers.
 *
 * @returns {void}
 */
export function closePacketFieldsModal() {
    const modalComponent = document.querySelector(".packet-fields-modal-container");
    document.querySelector(".modal-overlay").style.display = "none";
    modalComponent.removeEventListener("click", closePacketFieldsModal);
    modalComponent.remove();
}

/**
 * Populates the `#filter-by-device` select with all currently placed network
 * devices (`.item-dropped`), excluding switches.
 *
 * Called when the packet-traffic panel is opened to ensure the device list
 * reflects the current board state.
 *
 * @returns {void}
 */
export function insertDevicesToTraffic() {
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $packetTrafficSelect = $packetTraffic.querySelector("#filter-by-device");
    const $devices = document.querySelectorAll(".item-dropped");
    $devices.forEach(($device) => {
        const deviceName = $device.id;
        if (deviceName.startsWith("switch-")) return;
        $packetTrafficSelect.innerHTML += `<option value="${$device.id}">${$device.id}</option>`;
    });
}

/**
 * Resets the `#filter-by-device` select to its default "Todos" (all devices)
 * single-option state.
 *
 * Called when the packet-traffic panel is closed.
 *
 * @returns {void}
 */
export function removeDevicesFromTraffic() {
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $packetTrafficSelect = $packetTraffic.querySelector("#filter-by-device");
    $packetTrafficSelect.innerHTML = `<option value="all">All</option>`;
}

/**
 * Filters the packet-traffic table to show only rows whose origin or destination
 * MAC address matches one of the selected device's MAC addresses.
 * Selecting "all" restores all rows.
 *
 * Uses `getMacAddresses` to retrieve all MACs assigned to the selected device.
 *
 * @returns {void}
 */
export function filterPacketTrafficbyDevice() {
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $packetTrafficTable = $packetTraffic.querySelector("table");
    const selectValue = $packetTraffic.querySelector("#filter-by-device").value;

    if (selectValue === "all") {
        $packetTrafficTable.querySelectorAll("tr").forEach($packet => $packet.style.display = "table-row");
        return;
    }

    const $device = document.getElementById(selectValue);
    const deviceMacs = getMacAddresses($device.id);
    const $packets = $packetTrafficTable.querySelectorAll("tr");

    $packets.forEach(($packet) => {
        const $fields = $packet.querySelectorAll("td");
        if ($fields.length < 1) return;
        const originMac = $fields[5].innerHTML;
        const destinationMac = $fields[6].innerHTML;
        if (deviceMacs.includes(originMac) || deviceMacs.includes(destinationMac)) {
            $packet.style.display = "table-row";
        } else {
            $packet.style.display = "none";
        }
    });

}

/**
 * Hides the packet-traffic panel without clearing its content or resetting
 * the device selector.
 *
 * @returns {void}
 */
export function closeTraffic() {
    const $traffic = document.querySelector(".packet-traffic");
    $traffic.style.display = "none";
}
