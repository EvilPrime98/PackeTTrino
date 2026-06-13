/**
 * Processes an incoming DHCP packet on behalf of a DHCP relay agent (dhcrelay).
 *
 * Relays DHCP traffic in both directions between clients on the local segment and the
 * configured upstream DHCP server. For client-originated broadcasts (DHCPDISCOVER and
 * DHCPREQUEST), rewrites addressing fields so the packet is forwarded unicast to the server.
 * For server-originated unicast replies (DHCPOFFER and DHCPACK), rewrites addressing so the
 * packet is delivered back to the client by broadcast.
 *
 * Returns undefined when the relay service is off, the packet arrived on an unlisted interface,
 * or the relay is not the intended recipient of the server reply.
 *
 * @param {string} agentObjectId - The DOM element ID of the network object acting as the DHCP relay agent.
 * @param {Object} packet - The incoming DHCP packet (mutated in-place and returned).
 * @param {string} packet.type - DHCP message type: "discover", "request", "offer", or "ack".
 * @param {string} packet.destination_ip - Destination IP address of the packet.
 * @param {string} packet.origin_ip - Source IP address of the packet.
 * @param {string} packet.origin_mac - Source MAC address of the packet.
 * @param {string} packet.destination_mac - Destination MAC address of the packet.
 * @param {string} packet.giaddr - Relay agent IP address field.
 * @param {string} packet.chaddr - Client hardware (MAC) address.
 * @param {string} packet.ciaddr - Client IP address.
 * @param {string} networkObjectInterface - The interface name on which the packet was received.
 * @returns {Promise<Object|undefined>} The mutated packet to forward, or undefined if it should be dropped.
 */
export async function dhcrelay_service(agentObjectId, packet, networkObjectInterface) {

    //relay agent attributes
    const $agentObject = document.getElementById(agentObjectId);
    const agentObjectMac = $agentObject.getAttribute(`mac-${networkObjectInterface}`);
    const agentObjectIp = $agentObject.getAttribute(`ip-${networkObjectInterface}`);
    const availableIps = getAvailableIps(agentObjectId);

    //relay service attributes
    const mainServer = $agentObject.getAttribute("dhcrelay-main-server");
    const listenOnInterfaces = $agentObject.getAttribute("dhcrelay-listen-on-interfaces").split(",");
    const isDhcpRelayOn = $agentObject.getAttribute("dhcrelay") === "true";

    if (!isDhcpRelayOn) return; //<-- if the DHCP Relay is not active, nothing is processed

    if (!listenOnInterfaces.includes(networkObjectInterface)) return; //<-- if the DHCP Relay is not configured for the interface, nothing is processed

    if (packet.destination_ip === "255.255.255.255") { //packet comes from a client

        if (packet.type === "discover") {
            packet.origin_ip = agentObjectIp;
            packet.destination_ip = mainServer;
            packet.origin_mac = agentObjectMac;
            packet.giaddr = agentObjectIp;
        }

        if (packet.type === "request") {
            if (packet.giaddr !== agentObjectIp) return;
            packet.origin_ip = agentObjectIp;
            packet.destination_ip = mainServer;
            packet.origin_mac = agentObjectMac;
        }

        packet.destination_mac = ""; //<-- initialized empty, to be filled in by routing
        return packet;

    }

    if (availableIps.includes(packet.destination_ip)) { //packet comes from a server

        if (!availableIps.includes(packet.giaddr)) return;

        if (packet.type === "offer") {
            packet.destination_mac = packet.ciaddr;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = agentObjectMac;
            packet.destination_mac = packet.chaddr;
        }

        if (packet.type === "ack") {
            packet.origin_ip = agentObjectIp;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = agentObjectMac;
            packet.destination_mac = packet.chaddr;
        }

        return packet;

    }

}
