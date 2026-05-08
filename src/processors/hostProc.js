/**
 * Processes an incoming packet at a host (end-device) network element.
 *
 * If the device has IPv4 forwarding enabled (`ipv4-forwarding="true"`), the packet
 * is immediately handed off to `packetProcessor_Router` and no further processing
 * occurs here.
 *
 * Otherwise the packet goes through three stages in order:
 * 1. **Firewall INPUT chain** — the packet is dropped silently (and fire animation
 *    triggered) if the INPUT chain rejects it.
 * 2. **Kernel processor** — handles ARP, ICMP, and TCP handshake frames. If a reply
 *    packet is produced it is routed back with `isNotForward = true` and processing stops.
 * 3. **Service processor** — dispatches the packet to installed services (DHCP client,
 *    DNS, HTTP). Each response is routed back concurrently via `routing`.
 *
 * @param {string} switchId - The DOM element ID of the switch from which the packet arrived.
 * @param {string} networkObjectId - The DOM element ID of the host receiving the packet.
 * @param {Object} packet - The packet object being processed.
 * @returns {Promise<void>}
 */
async function packetProcessor_Host(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    const $networkObject = document.getElementById(networkObjectId);

    //redirect to the forwarding processor if enabled

    if ($networkObject.getAttribute("ipv4-forwarding") === "true") {
        await packetProcessor_Router(switchId, networkObjectId, packet);
        return;
    }

    //process as end device

    const networkObjectInterface = switchToInterface(networkObjectId, switchId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const activeServices = getAvailableServices(networkObjectId);

    //evaluate the firewall INPUT chain

    if (!firewallProcessorFilter(networkObjectId, packet, "INPUT", networkObjectInterface, "")) {
        if (visualToggle) igniteFire(networkObjectId);
        return;
    }

    //processing by the KERNEL

    const replyPacket = await kernelProcessor(networkObjectId, packet, networkObjectInterface);

    if (replyPacket) {
        await routing(networkObjectId, replyPacket, true);
        return;
    }

    //processing by SERVICES

    const responses = await serviceProcessor(networkObjectId, packet, networkObjectInterface);

    if (responses.length > 0) {

        const promises = responses.map(response => {
            const replyPacket = response.packet;
            const outInterface = response.outInterface;
            return routing(networkObjectId, replyPacket, true, outInterface);
        });

        await Promise.all(promises);

    }

}
