/**
 * Returns the advanced options menu for a given list of options.
 * Builds a modal div containing only the buttons corresponding to the
 * option keys passed in. Clicks inside the modal are stopped from
 * propagating to the document.
 *
 * @param {...string} options - Keys of the buttons to include. Valid values:
 *   "terminal", "arp", "cacheDns", "browser", "delete",
 *   "firewall", "routing", "dhcp", "dns".
 * @returns {HTMLDivElement} The assembled advanced-options modal element.
 *
 * @example
 * const menu = advancedOptionsObject("terminal", "arp", "delete");
 * document.body.appendChild(menu);
 */
export function advancedOptionsObject(...options) {

    const $advancedOptions = document.createElement("div");
    const append = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));
    $advancedOptions.classList.add("advanced-options-modal", "modal");
    $advancedOptions.setAttribute("onclick", "event.stopPropagation()");

    /**
     * Factory function for creating the advanced options buttons.
     * @param {string} option - The option key.
     * @returns {HTMLButtonElement} The button element.
     */
    const availableButtons = {
        "terminal": () => terminalOptionButton(),
        "arp": () => arpOptionButton(),
        "cacheDns": () => cacheDnsOptionButton(),
        "browser": () => browserOptionButton(),
        "delete": () => deleteOptionButton(),
        "firewall": () => firewallTableOptionButton(),
        "routing": () => routingTableOptionButton(),
        "dhcp": () => leasesTableOptionButton(),
        "dns": () => dnsRecordsOptionButton(),
    }

    options.forEach(option => {
        if (availableButtons[option]) append(availableButtons[option]())
    });

    return $advancedOptions;

}

/**
 * Creates a button that opens the terminal mode for the selected device.
 * Triggers `showTerminal(event)` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "terminal-option".
 */
export function terminalOptionButton() {
    const $button = document.createElement("button");
    $button.id = "terminal-option";
    $button.innerHTML = "Terminal Mode";
    $button.setAttribute("onclick", "showTerminal(event)");
    return $button;
}

/**
 * Creates a button that opens the ARP table modal for the selected device.
 * Triggers `showObjectModalTable(event, '.arp-table')` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "arp-option".
 */
export function arpOptionButton() {
    const $button = document.createElement("button");
    $button.id = "arp-option";
    $button.innerHTML = "View ARP Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.arp-table')");
    return $button;
}

/**
 * Creates a button that opens the DNS cache table modal for the selected device.
 * Triggers `showObjectModalTable(event, '.cache-dns-table')` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "cache-dns-option".
 */
export function cacheDnsOptionButton() {
    const $button = document.createElement("button");
    $button.id = "cache-dns-option";
    $button.innerHTML = "View DNS Cache";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.cache-dns-table')");
    return $button;
}

/**
 * Creates a button that opens the browser for the selected device.
 * Triggers `openBrowser(event)` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "browser-option".
 */
export function browserOptionButton() {
    const $button = document.createElement("button");
    $button.id = "browser-option";
    $button.innerHTML = "Browser";
    $button.setAttribute("onclick", "openBrowser(event)");
    return $button;
}

/**
 * Creates a button that deletes the selected network item.
 * Triggers `deleteItem(event)` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "delete-option".
 */
export function deleteOptionButton() {
    const $button = document.createElement("button");
    $button.id = "delete-option";
    $button.innerHTML = "Delete";
    $button.setAttribute("onclick", "deleteItem(event)");
    return $button;
}

/**
 * Creates a button that opens the firewall rules table modal for the selected device.
 * Triggers `showObjectModalTable(event, '.firewall-table')` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "firewall-option".
 */
export function firewallTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "firewall-option";
    $button.innerHTML = "View Firewall Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.firewall-table')");
    return $button;
}

/**
 * Creates a button that opens the routing table modal for the selected device.
 * Triggers `showObjectModalTable(event, '.routing-table')` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "routing-option".
 */
export function routingTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "routing-option";
    $button.innerHTML = "View Routing Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.routing-table')");
    return $button;
}

/**
 * Creates a button that opens the DHCP leases table modal for the selected device.
 * Triggers `showObjectModalTable(event, '.dhcp-table')` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "dhcp-option".
 */
export function leasesTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "dhcp-option";
    $button.innerHTML = "View Leases Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.dhcp-table')");
    return $button;
}

/**
 * Creates a button that opens the DNS records table modal for the selected device.
 * Triggers `showObjectModalTable(event, '.dns-table')` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "dns-option".
 */
export function dnsRecordsOptionButton() {
    const $button = document.createElement("button");
    $button.id = "dns-option";
    $button.innerHTML = "View DNS Records Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.dns-table')");
    return $button;
}

/**
 * Creates a button that opens the DHCP server configuration menu.
 * Triggers `showDhcpMenu(event)` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "dhcp-server-config".
 */
export function dhcpServerConfig() {
    const $button = document.createElement("button");
    $button.id = "dhcp-server-config";
    $button.innerHTML = "Configure DHCP Server";
    $button.setAttribute("onclick", "showDhcpMenu(event)");
    return $button;
}

/**
 * Creates a button that opens the DHCP relay configuration menu.
 * Triggers `showDhcpRelayMenu(event)` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "dhcp-relay-config".
 */
export function dhcpRelayConfig() {
    const $button = document.createElement("button");
    $button.id = "dhcp-relay-config";
    $button.innerHTML = "Configure DHCP Relay";
    $button.setAttribute("onclick", "showDhcpRelayMenu(event)");
    return $button;
}

/**
 * Creates a button that opens the DNS server configuration menu.
 * Triggers `showDnsServerMenu(event)` on click.
 *
 * @returns {HTMLButtonElement} Button element with id "dns-server-config".
 */
export function dnsServerConfig() {
    const $button = document.createElement("button");
    $button.id = "dns-server-config";
    $button.innerHTML = "Configure DNS Server";
    $button.setAttribute("onclick", "showDnsServerMenu(event)");
    return $button;
}
