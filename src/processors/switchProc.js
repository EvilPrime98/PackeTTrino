/**
 * Simulates Layer 2 switching behaviour for an incoming packet.
 *
 * Processing steps:
 * 1. **Visualization** — if packet tracing is enabled, renders the packet travelling
 *    from the source device to the switch.
 * 2. **MAC learning** — records the source device ↔ MAC mapping in the switch's MAC
 *    address table via `updateMacEntry`.
 * 3. **Forwarding decision**:
 *    - If the destination MAC is the broadcast address (`ff:ff:ff:ff:ff:ff`) or is
 *      **not** found in the MAC table, the switch floods the packet to every connected
 *      device except the ingress port. Each flooded copy is a deep clone
 *      (`structuredClone`) to prevent shared-state mutations across concurrent paths.
 *    - If the destination MAC **is** known, the packet is unicast to the single device
 *      associated with that MAC.
 *
 * In both forwarding cases the next step is `packetProcessor_Host`, which decides
 * whether the receiving device accepts or further routes the packet.
 *
 * @param {string} switchId - The DOM element ID of the switch receiving the packet.
 * @param {string} networkObjectId - The DOM element ID of the device that sent the packet
 *   into this switch (the ingress port).
 * @param {Object} packet - The packet object being switched.
 * @returns {Promise<void>}
 */
// [agent-added: esm-migration phase 05]
import { state } from '../env.js';
import { visualize } from '../lib/packet_visualize_lib.js';
import { updateMacEntry, isMacInMACTable, getDeviceTable, getDeviceFromMac } from '../lib/network_lib.js';
import { packetProcessor_Host } from './hostProc.js';

// [agent-added: esm-migration phase 05]
export async function switchProcessor(switchId, networkObjectId, packet) {

    if (state.visualToggle) await visualize(networkObjectId, switchId, packet);

    const $switchObject = document.getElementById(switchId);

    updateMacEntry(switchId, networkObjectId, packet.origin_mac); //save the source port MAC

    if (packet.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable(switchId, packet.destination_mac)) {

        const devices = getDeviceTable($switchObject.id);

        await Promise.all(devices.map(async (device) => {

            if (device !== networkObjectId) { //do not forward through the ingress port
                const duplicatePacket = structuredClone(packet);
                await packetProcessor_Host(switchId, device, duplicatePacket);
            }

        }));

        return;

    }

    //the MAC is known to the switch

    const device = getDeviceFromMac(switchId, packet.destination_mac);
    const duplicatePacket = structuredClone(packet);
    await packetProcessor_Host(switchId, device, duplicatePacket);

}
