/**
 * Processes an incoming packet at a Layer 3 device (router, or a host with
 * `ipv4-forwarding` enabled).
 *
 * Processing pipeline:
 * 1. **TTL** — decrements the packet's TTL. If it reaches zero, an ICMP Time Exceeded
 *    message is generated and routed back to the sender.
 * 2. **Connection tracking** — if the origin IP has a `state.connTrack` entry on this device
 *    (NAT-like state), the destination IP is rewritten and the entry is removed.
 * 3. **Local delivery** — if the destination IP belongs to this router or is the
 *    limited broadcast (`255.255.255.255`):
 *    - Applies the firewall INPUT chain; drops and shows fire animation on rejection.
 *    - Passes to `kernelProcessor`; if it produces a reply, routes it and returns.
 *    - Passes to `serviceProcessor`; each response is routed (with direct switch bypass
 *      when a specific output interface is provided by the service).
 * 4. **Forwarding** — for all other destinations:
 *    - Drops broadcast frames silently (no routing of broadcast).
 *    - Applies the firewall FORWARD chain; drops on rejection.
 *    - Calls `routing` to look up the next hop and forward the packet.
 *
 * @param {string} switchId - The DOM element ID of the switch from which the packet arrived.
 * @param {string} networkObjectId - The DOM element ID of the router processing the packet.
 * @param {Object} packet - The packet object being processed.
 * @returns {Promise<void>}
 */
// [agent-added: esm-migration phase 05]
import { state } from '../env.js';
import { getAvailableIps, getInterfaceSwitchInfo, switchToInterface } from '../lib/network_lib.js';
import { getAvailableServices } from '../services/systemd_service.js';
import { firewallProcessorFilter } from '../services/iptablesd_service.js';
import { igniteFire } from '../../animations/firewall-block.js';
import { IcmpTimeExceeded } from '../lib/packets_lib.js';
import { kernelProcessor } from './kernelProc.js';
import { serviceProcessor } from './serviceProc.js';
import { routing } from './routingProc.js';
import { switchProcessor } from './switchProc.js';
// esm-migration: scope unclear — addPacketTraffic is defined in src/components/menus/packetTracerMenu.js (Phase 06)

// [agent-added: esm-migration phase 05]
export async function packetProcessor_Router(switchId, networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const [networkObjectIp, networkObjectNetmask, networkObjectMac] = getInterfaceSwitchInfo(networkObjectId, switchId);
    const networkObjectInterface = switchToInterface(networkObjectId, switchId); // <-- get the input interface
    const availableIps = getAvailableIps(networkObjectId); // <-- get the list of available IPs
    const activeServices = getAvailableServices(networkObjectId); // <-- get the list of active services

    //TTL processing for the packet

    if (packet.ttl) {

        packet.ttl--;

        if (packet.ttl < 1) {
            const newPacket = new IcmpTimeExceeded(networkObjectIp, packet.origin_ip, networkObjectMac, networkObjectMac);
            await routing(networkObjectId, newPacket);
            return;
        }

    }

    //connection tracking between source and destination

    if (Object.hasOwn(state.connTrack, networkObjectId) && state.connTrack[networkObjectId][packet.origin_ip]) {
        packet.destination_ip = state.connTrack[networkObjectId][packet.origin_ip];
        delete state.connTrack[networkObjectId][packet.origin_ip];
    }

    //packet destined for a router IP, or broadcast

    if (availableIps.includes(packet.destination_ip) || packet.destination_ip === "255.255.255.255") {

        //filter the packet through the filter table with the INPUT chain

        if (!firewallProcessorFilter(networkObjectId, packet, "INPUT", networkObjectInterface, "")) {
            if (state.visualToggle) igniteFire(networkObjectId);
            return;
        }

        //process the packet through the KERNEL

        const replyPacket = await kernelProcessor(networkObjectId, packet, networkObjectInterface);

        if (replyPacket) {
            await routing(networkObjectId, replyPacket);
            return;
        }

        //process the packet through SERVICES

        const responses = await serviceProcessor(networkObjectId, packet, networkObjectInterface);

        if (responses.length > 0) {

            const promises = responses.map(async (response) => {

                const replyPacket = response.packet;
                const outputInterface = response.outInterface;

                if (outputInterface !== "") {
                    addPacketTraffic(replyPacket);
                    await switchProcessor($networkObject.getAttribute(`data-switch-${outputInterface}`), networkObjectId, replyPacket);
                    return;
                }

                await routing(networkObjectId, replyPacket);

            });

            await Promise.all(promises);

        }

        return;

    }

    //do not route broadcast traffic

    if (packet.destination_ip === "255.255.255.255" || packet.destination_mac === "ff:ff:ff:ff:ff:ff") return;

    //filter through FORWARD

    if (!firewallProcessorFilter(networkObjectId, packet, "FORWARD", networkObjectInterface, "")) {
        if (state.visualToggle) igniteFire(networkObjectId);
        return;
    }

    await routing(networkObjectId, packet);

}
