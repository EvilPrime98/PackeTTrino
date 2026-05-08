/**
 * Assigns an IP address and netmask to a specific interface of a network object and
 * inserts the corresponding direct routing rule into its routing table.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object to configure.
 * @param {string} ip - The IP address to assign to the interface.
 * @param {string} netmask - The subnet mask to assign to the interface.
 * @param {string} iface - The interface name (e.g. "enp0s3").
 * @returns {void}
 */
function configureInterface(networkObjectId, ip, netmask, iface) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("ip-" + iface, ip);
    $networkObject.setAttribute("netmask-" + iface, netmask);
    setDirectRoutingRule(networkObjectId, ip, netmask, iface);
}

/**
 * Removes the IP address and netmask from a specific interface of a network object and
 * deletes all routing rules associated with that interface.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object to deconfigure.
 * @param {string} iface - The interface name to clear.
 * @returns {void}
 */
function deconfigureInterface(networkObjectId, iface) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("ip-" + iface, "");
    $networkObject.setAttribute("netmask-" + iface, "");
    removeInterfaceRoutingRules(networkObjectId, iface);
}

/**
 * Prints the network interface information for a network object to its terminal, mimicking
 * the output of `ip addr show`.
 *
 * Always includes a loopback entry, then one block per interface listing the MAC address,
 * IP address (in CIDR notation), and broadcast address when an IP is assigned.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object whose interfaces are displayed.
 * @returns {void}
 */
function showNetworkObjectInfo(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);

    let message = "1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt;\n";
    message += "    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n";
    message += "    inet 127.0.0.1/8 scope host lo\n";

    interfaces.forEach((iface, i) => {
        const ip = $networkObject.getAttribute("ip-" + iface);
        const netmask = $networkObject.getAttribute("netmask-" + iface);
        const mac = $networkObject.getAttribute("mac-" + iface);
        message += `${i + 1}: ${iface}: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;\n`;
        message += `    link/ether ${mac} brd ff:ff:ff:ff:ff:ff\n`;
        if (ip) message += `    inet ${ip}/${netmaskToCidr(netmask)} brd ${getBroadcast(ip, netmask)} scope global dynamic ${iface}\n`;
    });

    terminalMessage(message, networkObjectId);

}
