/**
 * Performs an IP routing table lookup for the given packet and forwards it toward
 * its destination.
 *
 * **Broadcast handling:**
 * - If the destination is the limited broadcast (`255.255.255.255`) or a MAC broadcast,
 *   the packet is only forwarded when `isNotForward` is `true` (i.e. locally originated).
 *   In that case it is sent out through `outInterface` if specified, otherwise the first
 *   available interface. Routers never forward broadcast packets.
 *
 * **Unicast routing:**
 * The routing table (rendered as an HTML `<table>`) is scanned row by row. The first
 * rule whose network matches `getNetwork(packet.destination_ip, ruleNetmask)` is applied:
 * 1. The packet's source MAC is updated to the egress interface MAC.
 * 2. The next-hop IP is resolved: `ruleNetmask` value `0.0.0.0` means directly connected
 *    (use destination IP directly); otherwise use the explicit next-hop address.
 * 3. The next-hop MAC is resolved via the ARP table or, if missing, by sending an
 *    ARP request (`arpResolve`). If resolution fails the packet is dropped silently.
 * 4. **`isNotForward = true`** (locally originated packet): the OUTPUT firewall chain is
 *    applied; on pass, the packet is sent to the egress switch via `switchProcessor`.
 * 5. **`isNotForward = false`** (forwarded packet): `firewallProc` is called (handles
 *    NAT/MASQUERADE) before sending.
 *
 * @param {string} networkObjectId - The DOM element ID of the routing device.
 * @param {Object} packet - The packet to route. Its `origin_mac` and `destination_mac`
 *   fields are mutated in place during routing.
 * @param {boolean} [isNotForward=false] - `true` when the packet was originated locally
 *   (e.g. a service reply); `false` when the packet is being forwarded in transit.
 * @param {string} [outInterface=""] - Preferred egress interface name, used only for
 *   broadcast packets when `isNotForward` is `true`.
 * @returns {Promise<void>}
 */
// [agent-added: esm-migration phase 05]
import { state } from '../env.js';
import { getInterfaces, getNetwork, isIpInARPTable } from '../lib/network_lib.js';
import { firewallProcessorFilter, firewallProc } from '../services/iptablesd_service.js';
import { arpResolve } from '../services/arp_service.js';
import { igniteFire } from '../../animations/firewall-block.js';
import { switchProcessor } from './switchProc.js';
// esm-migration: scope unclear — addPacketTraffic is defined in src/components/menus/packetTracerMenu.js (Phase 06)

// [agent-added: esm-migration phase 05]
export async function routing(networkObjectId, packet, isNotForward = false, outInterface = "") {

    const $networkObject = document.getElementById(networkObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $routingRules = $routingTable.querySelectorAll("tr");

    if (packet.destination_ip === "255.255.255.255" || packet.destination_mac === "ff:ff:ff:ff:ff:ff") {

        if (isNotForward) {
            const iface = outInterface || getInterfaces($networkObject.id)[0];
            const switchId = $networkObject.getAttribute(`data-switch-${iface}`);
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
        }

        return; // Routers do not route broadcast traffic

    }

    for (let i = 1; i < $routingRules.length; i++) {

        const $rule = $routingRules[i];
        const $fields = $rule.querySelectorAll("td");
        const ruleNetwork = $fields[0].innerHTML;
        const ruleNetmask = $fields[1].innerHTML;
        const ruleInterface = $fields[3].innerHTML;
        const rulenexthop = $fields[4].innerHTML;

        if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) {

            packet.origin_mac = $networkObject.getAttribute("mac-" + ruleInterface);
            packet.destination_mac = "";

            const nextHop = (rulenexthop === "0.0.0.0") ? packet.destination_ip : rulenexthop;
            const nexthopMac = isIpInARPTable(networkObjectId, nextHop) || await arpResolve(networkObjectId, nextHop, ruleInterface);

            if (!nexthopMac) return;

            packet.destination_mac = nexthopMac;

            if (isNotForward) {

                if (!firewallProcessorFilter(networkObjectId, packet, "OUTPUT", "", ruleInterface)) {
                    if (state.visualToggle) igniteFire(networkObjectId);
                    return;
                }

                const nextSwitch = $networkObject.getAttribute("data-switch-" + ruleInterface);
                addPacketTraffic(packet);
                await switchProcessor(nextSwitch, networkObjectId, packet);

            } else {

                await firewallProc(networkObjectId, packet, ruleInterface);

            }

            return;

        }
    }
}
