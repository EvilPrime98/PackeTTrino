/**
 * Performs an ARP resolution to discover the MAC address associated with a given IP address.
 *
 * Sends an ARP request from the specified network object through its connected switch,
 * then waits for an ARP reply. Sets and reads global `arpFlag` and `buffer` state
 * to coordinate the asynchronous response.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object sending the ARP request.
 * @param {string} destinationIp - The IP address to resolve to a MAC address.
 * @param {string} iface - The interface name used to look up the origin IP, MAC, and connected switch.
 * @returns {Promise<string|false>} The resolved MAC address string, or false if no reply was received.
 */
export async function arpResolve(networkObjectId, destinationIp, iface)  {
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-" + iface);
    const originIp = $networkObject.getAttribute("ip-" + iface);
    const originMac = $networkObject.getAttribute("mac-" + iface);
    const packet = new ArpRequest(originIp, destinationIp, originMac);
    arpFlag[networkObjectId] = false;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
    if (arpFlag[networkObjectId] === false) return false;
    if (buffer[networkObjectId]) return buffer[networkObjectId].origin_mac;
    return false;
}
