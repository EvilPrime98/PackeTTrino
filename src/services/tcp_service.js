/**
 * Builds and routes a TCP SYN packet to initiate a three-way handshake from a network object.
 *
 * Reads the IP and MAC of the device's primary interface, constructs a `syn` packet with the
 * provided source and destination ports, stores the initial sequence number in `tcpBuffer`,
 * resets `tcpSyncFlag` to false, and forwards the packet through the routing layer. The caller
 * should check `tcpSyncFlag[networkObjectId]` after awaiting to determine whether the handshake
 * was completed successfully.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object initiating the connection.
 * @param {string} destination - Destination IP address.
 * @param {number} source_port - Ephemeral source port number.
 * @param {number} destination_port - Destination port number of the target service.
 * @returns {Promise<void>}
 */
async function tcpSynPacketGenerator(networkObjectId, destination, source_port , destination_port) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);

    tcpSyncFlag[networkObjectId] = false;

    const packet = new syn(
        networkObjectIp, //source IP
        destination, //destination IP
        networkObjectMac, //source MAC
        "", //destination MAC
        source_port, //source port
        destination_port //destination port
    );

    tcpBuffer[networkObjectId] = packet.sequence_number; // <--- store the sequence number in the device's TCP buffer

    await routing(networkObjectId, packet, true);

}
