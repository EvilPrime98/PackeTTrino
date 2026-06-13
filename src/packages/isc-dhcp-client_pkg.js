/**
 * Installs the ISC DHCP client package on a network object.
 * Sets the `dhclient` attribute and initialises per-interface DHCP tracking
 * attributes (enabled flag, server address, lease time, current lease time, and
 * T1/T2 renewal flags) for every interface available on the device.
 *
 * @param {HTMLElement} $networkObject - The DOM element representing the network device.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
import { getInterfaces } from '../lib/network_lib.js';
// esm-migration: scope unclear — terminalMessage is defined in src/components/network_tools/terminal.js (Phase 06)

// [agent-added: esm-migration phase 05]
export function installDhclient($networkObject) {

    const networkObjectId = $networkObject.id;
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    terminalMessage("Installing DHCP Client...", networkObjectId);

        attr("dhclient", "true");

        const availableInterfaces = getInterfaces($networkObject);

        for (const iface of availableInterfaces) {
            attr(`data-dhclient-${iface}`, "false");
            attr(`data-dhcp-server-${iface}`, "");
            attr(`data-dhcp-lease-time-${iface}`, "");
            attr(`data-dhcp-current-lease-time-${iface}`, "");
            attr(`data-dhcp-flag-t1-${iface}`, "false");
            attr(`data-dhcp-flag-t2-${iface}`, "false");
        }

    terminalMessage("DHCP Client installed successfully.", networkObjectId);
}

/**
 * Uninstalls the ISC DHCP client package from a network object.
 * Removes the `dhclient` attribute and all per-interface DHCP tracking attributes
 * that were created during installation.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function uninstallDhclient(networkObjectId) {

    terminalMessage("Uninstalling DHCP Client...", networkObjectId);

        const $networkObject = document.getElementById(networkObjectId);
        const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
        const availableInterfaces = getInterfaces($networkObject);

        rattr("dhclient");

        for (const iface of availableInterfaces) {
            rattr(
                `data-dhclient-${iface}`,
                `data-dhcp-server-${iface}`,
                `data-dhcp-lease-time-${iface}`,
                `data-dhcp-current-lease-time-${iface}`,
                `data-dhcp-flag-t1-${iface}`,
                `data-dhcp-flag-t2-${iface}`
            );
        }

    terminalMessage("DHCP Client uninstalled successfully.", networkObjectId);

}
