/**
 * Processes an incoming DHCP packet on behalf of a DHCP client (dhclient) running on a network object.
 *
 * Handles DHCPOFFER packets by generating a DHCPREQUEST in response, and DHCPACK packets
 * by applying the offered configuration to the interface and starting the lease renewal timer.
 * Returns undefined when the service is off, the packet is not addressed to this client,
 * or the interface already has an IP assigned.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object acting as the DHCP client.
 * @param {Object} packet - The incoming DHCP packet.
 * @param {string} packet.type - DHCP message type: "offer" or "ack".
 * @param {string} packet.yiaddr - IP address offered or acknowledged by the server.
 * @param {string} packet.siaddr - Server IP address.
 * @param {string} packet.chaddr - Client hardware (MAC) address from the DHCP packet.
 * @param {string} packet.origin_mac - MAC address of the packet sender.
 * @param {string} packet.giaddr - Relay agent IP address (0.0.0.0 if no relay).
 * @param {number} packet.leasetime - Lease duration in seconds.
 * @param {string} networkObjectInterface - The interface name on which the packet was received.
 * @returns {Promise<Object|undefined>} A DHCPREQUEST packet when responding to an offer, or undefined otherwise.
 */
async function dhclient_service(networkObjectId, packet, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const isDhclientOn = $networkObject.getAttribute("dhclient") === "true";

    if (!isDhclientOn) return;

    if (packet.type === "offer") {

        terminalMessage(`DHCPOFFER of ${packet.yiaddr} from ${packet.siaddr}`, networkObjectId);

            if (dhcpOfferBuffer[networkObjectId] === true) return; //an offer already exists in the buffer

            if ($networkObject.getAttribute(`ip-${networkObjectInterface}`) !== "") return; //already has an IP assigned on that interface

            if (packet.chaddr !== networkObjectMac) return; //the offer's MAC does not match the device's MAC

            dhcpDiscoverFlag[networkObjectId] = true;

            dhcpOfferBuffer[networkObjectId] = true; //signal that the device already has an offer in the buffer

            const newPacket = new dhcpRequest(
                networkObjectMac, //origin mac
                packet.yiaddr, //requested ip
                packet.siaddr, //server ip
                networkObjectId //hostname
            );

            newPacket.destination_mac = packet.origin_mac;
            newPacket.yiaddr = packet.yiaddr;
            newPacket.giaddr = packet.giaddr;
            newPacket.chaddr = packet.chaddr;

        terminalMessage(`DHCPREQUEST for ${packet.yiaddr} on ${networkObjectInterface} to ${packet.siaddr} port 67`, networkObjectId);

        return newPacket;

    }

    if (packet.type === "ack") {

        if (packet.chaddr !== networkObjectMac) return;

        terminalMessage(`DHCPACK of ${packet.yiaddr} from ${packet.siaddr}`, networkObjectId);

        dhcpRequestFlag[networkObjectId] = true; //<-- notify the DHCP client utility that a DHCPACK has been received

        delete dhcpOfferBuffer[networkObjectId]; //<-- clear the offer buffer

        setDhcpInfo(networkObjectId, packet, networkObjectInterface); //<-- configure the interface

        updateClientLeaseTimer(networkObjectId, networkObjectInterface); //<-- start the client lease timer

        terminalMessage(`Bound to ${packet.yiaddr} -- renewal in ${packet.leasetime} seconds.`, networkObjectId);

    }

}

/**
 * Generates and broadcasts a DHCPDISCOVER packet from a network object on the given interface.
 *
 * Builds a DHCPDISCOVER using the interface MAC address and sends it to the connected switch.
 * Does nothing if the interface has no switch or MAC configured.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object initiating the discovery.
 * @param {string} networkObjectInterface - The interface name to send the DHCPDISCOVER from.
 * @returns {Promise<void>}
 */
async function dhcpDiscoverGenerator(networkObjectId, networkObjectInterface) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const switchId = $networkObject.getAttribute(`data-switch-${networkObjectInterface}`);
    if (!switchId || !networkObjectMac) return;
    const packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
}

/**
 * Generates and sends a DHCPREQUEST packet for lease renewal from a network object.
 *
 * Reads the current IP, MAC, netmask, gateway, DNS, and lease-time attributes from the DOM element
 * and builds a unicast DHCPREQUEST directed at the DHCP server. During the T2 renewal phase,
 * falls back to a broadcast request.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object renewing its lease.
 * @param {string} renewPhase - Renewal phase identifier; use "T2" to trigger a broadcast fallback.
 * @param {string} networkObjectInterface - The interface name whose lease is being renewed.
 * @returns {Promise<void>}
 */
async function dhcpRequestGenerator(networkObjectId, renewPhase, networkObjectInterface) {

    //device attributes
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);

    //DHCP client attributes
    const networkObjectGateway = getDefaultGateway($networkObject.id);
    const networkObjectDns = getDnsServers(networkObjectId)[0];
    const networkObjectLeaseTime = $networkObject.getAttribute("data-dhcp-lease-time");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");

    const packet = new dhcpRequest(
        networkObjectMac, //origin mac
        "", //requested ip
        dhcpServerIp, //server ip
        networkObjectId //hostname
    );

    packet.origin_ip = networkObjectIp;
    packet.destination_ip = dhcpServerIp;
    packet.ciaddr = networkObjectIp;
    packet.leasetime = networkObjectLeaseTime;
    packet.gateway = networkObjectGateway;
    packet.netmask = networkObjectNetmask;
    packet.dns = networkObjectDns;
    packet.destination_mac = ""; // <-- initialized empty, to be filled in by routing

    if (renewPhase === "T2") {
        packet.destination_ip = "255.255.255.255";
        packet.destination_mac = "ff:ff:ff:ff:ff:ff"; // <-- on the second attempt, sent by broadcast
    }

    await routing(networkObjectId, packet, true);

}

/**
 * Generates and sends a DHCPRELEASE packet, then clears the DHCP configuration from the interface.
 *
 * Builds a unicast DHCPRELEASE addressed to the DHCP server recorded on the given interface,
 * routes it through the network, and removes all DHCP-assigned attributes from the interface.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object releasing its lease.
 * @param {string} networkObjectInterface - The interface name whose DHCP lease is being released.
 * @returns {Promise<void>}
 */
async function dhcpReleaseGenerator(networkObjectId, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const dhcpServerIp = $networkObject.getAttribute(`data-dhcp-server-${networkObjectInterface}`);

    const packet = new dhcpRelease(
        networkObjectIp, //source IP
        dhcpServerIp, //destination IP
        networkObjectMac, //source MAC
        "" //destination MAC
    );

    await routing(networkObjectId, packet, true);

    deleteDhcpInfo(networkObjectId, networkObjectInterface);

}
