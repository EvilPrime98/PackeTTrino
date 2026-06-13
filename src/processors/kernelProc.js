/**
 * Handles low-level protocol processing for a network device, acting as the kernel's
 * network stack. Packets that are not addressed to this device are silently ignored
 * (returns `undefined`).
 *
 * Supported protocols and their behaviour:
 *
 * | Protocol | Type          | Action |
 * |----------|---------------|--------|
 * | ARP      | request       | Adds the sender to the ARP table; returns an ARP reply. |
 * | ARP      | reply         | Sets `arpFlag`, adds sender to ARP table, stores packet in `buffer`. |
 * | ICMP     | request       | Returns an ICMP echo reply. |
 * | ICMP     | time-exceeded | If a traceroute is active, pushes the origin IP to `traceBuffer` and sets `traceReturn`. |
 * | ICMP     | reply         | Sets `icmpFlag`; if traceroute active, pushes origin IP and sets `traceFlag`. |
 * | TCP      | syn           | Completes handshake step 2 — returns a SYN-ACK with correct sequence/ack numbers. |
 * | TCP      | syn-ack       | Completes handshake step 3 — returns an ACK; sets `tcpSyncFlag`. |
 * | TCP      | syn-ack-reply | Validates the ACK number against `tcpBuffer`; returns nothing. |
 * | HTTP     | reply         | Stores the packet in `httpBuffer`. |
 * | DNS      | reply         | Sets `dnsRequestFlag`; stores the packet in `buffer`. |
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @param {Object} packet - The incoming packet object.
 * @param {string} inputInterface - The name of the interface on which the packet arrived.
 * @returns {Promise<Object|undefined>} A reply packet to be routed back, or `undefined`
 *   if no reply is needed (packet consumed, buffered, or not addressed to this device).
 */
// [agent-added: esm-migration phase 05]
import { state } from '../env.js';
import { getAvailableIps } from '../lib/network_lib.js';
import { addARPEntry } from '../lib/arp_lib.js';
import { ArpReply, IcmpEchoReply, synAck, Ack } from '../lib/packets_lib.js';

// [agent-added: esm-migration phase 05]
export async function kernelProcessor(networkObjectId, packet, inputInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableIps = getAvailableIps(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${inputInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${inputInterface}`);

    if (packet.protocol === "arp" && packet.type === "request") {

        if (packet.destination_ip !== networkObjectIp) return;

        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        const newPacket = new ArpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        return newPacket;

    }

    if (packet.protocol === "arp" && packet.type === "reply") {

        if (packet.destination_ip !== networkObjectIp) return;

        state.arpFlag[networkObjectId] = true;
        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        state.buffer[networkObjectId] = packet;

    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (!availableIps.includes(packet.destination_ip)) return;

        const newPacket = new IcmpEchoReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);

        return newPacket;

    }

    if (packet.protocol === "icmp" && packet.type === "time-exceeded") {

        if (!availableIps.includes(packet.destination_ip)) return;

        if (state.trace[networkObjectId] === true) {
            state.traceReturn[networkObjectId] = true;
            state.traceBuffer[networkObjectId].push(packet.origin_ip);
        }

        return;
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {

        if (!availableIps.includes(packet.destination_ip)) return;

        state.icmpFlag[networkObjectId] = true;

        if (state.trace[networkObjectId] === true) {
            state.traceBuffer[networkObjectId].push(packet.origin_ip);
            traceFlag[networkObjectId] = true;
        }

        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn") {

        if (!availableIps.includes(packet.destination_ip)) return;

        const newPacket = new synAck(
            networkObjectIp, //source IP
            packet.origin_ip, //destination IP
            networkObjectMac, //source MAC
            packet.origin_mac, //destination MAC
            packet.dport, //source port
            packet.sport //destination port
        );

        newPacket.ack_number = packet.sequence_number + 1; // <--- the ack must be the next sequence number

        state.tcpBuffer[networkObjectId] = newPacket.sequence_number;

        return newPacket;

    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack") {

        if (!availableIps.includes(packet.destination_ip)) return;

        if (packet.ack_number !== state.tcpBuffer[networkObjectId] + 1) return;

        const newPacket = new Ack(
            networkObjectIp, //source IP
            packet.origin_ip, //destination IP
            networkObjectMac, //source MAC
            packet.origin_mac, //destination MAC
            packet.dport, //source port
            packet.sport //destination port
        );

        newPacket.ack_number = packet.sequence_number + 1; // <--- the ack must be the next sequence number
        newPacket.sequence_number = packet.ack_number - 1; //<--- the packet must have the correct sequence number

        state.tcpSyncFlag[networkObjectId] = true;

        return newPacket;

    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack-reply") {
        if (!availableIps.includes(packet.destination_ip)) return;
        if (packet.ack_number !== state.tcpBuffer[networkObjectId] + 1) return;
        return;
    }

    if (packet.protocol === "http" && packet.type === "reply") {
        if (!availableIps.includes(packet.destination_ip)) return;
        state.httpBuffer[networkObjectId] = packet;
        return;
    }

    if (packet.protocol === "dns" && packet.type === "reply") {
        if (!availableIps.includes(packet.destination_ip)) return;
        state.dnsRequestFlag[networkObjectId] = true;
        state.buffer[networkObjectId] = packet;
        return;
    }

}
