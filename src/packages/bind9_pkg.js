/**
 * Installs the Bind9 DNS server package on a network object.
 * Appends the DNS records table and cache table to the element, sets the `named`,
 * `recursion`, and `resolved` attributes, and injects the corresponding option
 * buttons and configuration panel into the advanced-options modal.
 *
 * @param {HTMLElement} $networkObject - The DOM element representing the network device.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
// esm-migration: scope unclear — terminalMessage, dnsTable, cacheDnsTable, dnsRecordsOptionButton, dnsServerConfig, cacheDnsOptionButton are defined in src/components/ (Phase 06)

// [agent-added: esm-migration phase 05]
export function installBind9($networkObject) {

    terminalMessage("Installing Bind...", $networkObject.id);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    append(
        dnsTable(),
        cacheDnsTable()
    );

    attr("named", "true");
    attr("recursion", "false");
    attr("resolved", "false");
    addOption(dnsRecordsOptionButton(), dnsServerConfig(), cacheDnsOptionButton());

    terminalMessage("Bind installed successfully.", $networkObject.id);

}

/**
 * Uninstalls the Bind9 DNS server package from a network object.
 * Removes the DNS records table and cache table from the element, strips the
 * `named`, `recursion`, and `resolved` attributes, and removes the DNS-related
 * entries from the advanced-options modal.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function uninstallBind9(networkObjectId) {

    terminalMessage("Uninstalling Bind...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const $dnsTable = $networkObject.querySelector(".dns-table");
    const $cacheDnsTable = $networkObject.querySelector(".cache-dns-table");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    remove($dnsTable, $cacheDnsTable);
    rattr("named","recursion", "resolved");
    remOption("dns-option");
    remOption("dns-server-config");
    remOption("cache-dns-option");

    terminalMessage("Bind uninstalled successfully.", networkObjectId);
}
