/**
 * Reads one or more raw DOM attributes from a network object element and prints each
 * value to its terminal output. Useful for inspecting internal node state such as
 * IP addresses, netmasks, or interface names that are stored as HTML attributes.
 * Prints "No value found" for any attribute that is not set on the element.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object to inspect.
 * @param {Array<string>} properties - Attribute names to read from the element (e.g. `["ip-eth0", "netmask-eth0"]`).
 * @returns {void}
 *
 * @example
 * command_realnode("router-1", ["ip-eth0", "netmask-eth0", "mac-eth0"]);
 */
function command_realnode(networkObjectId, properties) {
    const $networkObject = document.getElementById(networkObjectId);
    properties.forEach(property => {
        const value = $networkObject.getAttribute(property) || "No value found";
        terminalMessage(`${property}: ${value}`, networkObjectId, false);
    });
}
