/**
 * Installs the ISC DHCP relay agent package on a network object.
 * Sets the `dhcrelay`, `dhcrelay-main-server`, and `dhcrelay-listen-on-interfaces`
 * attributes, injects the relay configuration panel into the advanced-options modal,
 * and creates the `/etc/default/isc-dhcp-relay` config file in the virtual filesystem
 * with empty SERVERS and INTERFACES fields.
 *
 * @param {HTMLElement} $networkObject - The DOM element representing the network device.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
import { FileSystem } from '../lib/fileSystem_lib.js';
// esm-migration: scope unclear — terminalMessage, dhcpRelayConfig are defined in src/components/ (Phase 06)

// [agent-added: esm-migration phase 05]
export function installDhcprelay($networkObject) {

    const networkObjectId = $networkObject.id;

    terminalMessage("Installing DHCP Relay...", networkObjectId);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    //attributes
    attr("dhcrelay", "true");
    attr("dhcrelay-main-server", "");
    attr("dhcrelay-listen-on-interfaces", "");
    addOption(dhcpRelayConfig());

    //directories and files

    const iscDhcpRelayDefaultContent = `
    #This file configures the available servers and interfaces for the DHCP Relay server
    SERVERS=""
    INTERFACES=""
    `;

    const networkObjectFileSystem = new FileSystem($networkObject);
    networkObjectFileSystem.mkdir("default", ["etc"]);
    networkObjectFileSystem.touch("isc-dhcp-relay", ["etc", "default"]);
    networkObjectFileSystem.write("isc-dhcp-relay", ["etc", "default"], iscDhcpRelayDefaultContent.split('\n').map(line => line.trimStart()).join('\n'));

    terminalMessage("DHCP Relay installed successfully.", networkObjectId);
}

/**
 * Uninstalls the ISC DHCP relay agent package from a network object.
 * Strips the relay-related attributes, removes the relay configuration panel from the
 * advanced-options modal, and deletes the `/etc/default` directory from the virtual
 * filesystem.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function uninstallDhcprelay(networkObjectId) {

    terminalMessage("Uninstalling DHCP Relay...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    rattr("dhcrelay", "dhcrelay-main-server", "dhcrelay-listen-on-interfaces");
    remOption("dhcp-relay-config");

    //delete directories and files
    const networkObjectFileSystem = new FileSystem($networkObject);
    networkObjectFileSystem.rmdir("default", ["etc"]);

    terminalMessage("DHCP Relay uninstalled successfully.", networkObjectId);

}
