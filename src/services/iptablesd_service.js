/**
 * Evaluates whether a packet is allowed through the FILTER table of the firewall on a network object.
 *
 * Iterates over the FILTER rules for the given chain (INPUT, OUTPUT, or FORWARD), matching each rule
 * against the packet's protocol, source/destination IPs (including CIDR notation), interfaces, and ports.
 * Falls back to the chain's default policy when no rule matches.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object whose firewall rules are applied.
 * @param {Object} packet - The packet being evaluated.
 * @param {string} packet.origin_ip - Source IP address of the packet.
 * @param {string} packet.destination_ip - Destination IP address of the packet.
 * @param {string} packet.transport_protocol - Transport-layer protocol identifier (e.g. "tcp", "udp").
 * @param {string} packet.protocol - Network-layer protocol identifier.
 * @param {number|string} packet.sport - Source port of the packet.
 * @param {number|string} packet.dport - Destination port of the packet.
 * @param {string} targetChain - The firewall chain to evaluate: "INPUT", "OUTPUT", or "FORWARD".
 * @param {string} inputInterface - The interface on which the packet arrived (empty string to skip matching).
 * @param {string} outputInterface - The interface on which the packet will leave (empty string to skip matching).
 * @returns {boolean} True if the packet is accepted, false if it is dropped.
 */
export function firewallProcessorFilter(networkObjectId, packet, targetChain, inputInterface, outputInterface)  {

    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicies = JSON.parse($networkObject.getAttribute("firewall-default-policy"));
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules"));
    const firewallRulesFilter = firewallRules["FILTER"];
    let response = false;
    let found = false;

    const defaultPolicy = defaultPolicies[targetChain];

    firewallRulesFilter.forEach(rule => {

        if (rule.A !== targetChain) return;

        if (rule.p !== "*" && rule.p !== packet.transport_protocol && rule.p !== packet.protocol) return;

        if (rule.s !== "*") {
            if (isValidIp(rule.s) && rule.s !== packet.origin_ip) return;
            if (isValidCidrIp(rule.s)) {
                const [networkIp, netmask] = parseCidr(rule.s);
                if (getNetwork(packet.origin_ip, netmask) !== networkIp) return;
            }
        }

        if (rule.d !== "*") {
            if (isValidIp(rule.d) && rule.d !== packet.destination_ip) return;
            if (isValidCidrIp(rule.d)) {
                const [networkIp, netmask] = parseCidr(rule.d);
                if (getNetwork(packet.destination_ip, netmask) !== networkIp) return;
            }
        }

        if (inputInterface !== "" && rule.i !== "*" && rule.i !== inputInterface) return;

        if (outputInterface !== "" && rule.o !== "*" && rule.o !== outputInterface) return;

        if (rule.sport !== "*" && parseInt(rule.sport) !== parseInt(packet.sport)) return;

        if (rule.dport !== "*" && parseInt(rule.dport) !== parseInt(packet.dport)) return;

        found = true;

        if (rule.j === "ACCEPT") response = true;

        if (rule.j === "DROP") response = false;
    });

    if (!found) response = defaultPolicy === "ACCEPT";

    return response;

}

/**
 * Applies NAT rules from the NAT table to a packet for the given chain (PREROUTING or POSTROUTING).
 *
 * Iterates over NAT rules, matching by chain, protocol, source/destination IPs, interfaces, and ports.
 * When a matching DNAT or SNAT rule is found, rewrites the packet's destination or source IP respectively.
 * Tracks the original-to-translated IP mapping in the global `connTrack` object whenever the packet is altered.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object whose NAT rules are applied.
 * @param {Object} packet - The original packet (not mutated; a deep clone is returned).
 * @param {string} packet.origin_ip - Source IP address.
 * @param {string} packet.destination_ip - Destination IP address.
 * @param {string} packet.transport_protocol - Transport-layer protocol identifier.
 * @param {string} packet.protocol - Network-layer protocol identifier.
 * @param {number|string} packet.sport - Source port.
 * @param {number|string} packet.dport - Destination port.
 * @param {string} inputInterface - The interface on which the packet arrived (empty string to skip matching).
 * @param {string} outputInterface - The interface on which the packet will leave (empty string to skip matching).
 * @param {string} targetChain - The NAT chain to process: "PREROUTING" (DNAT) or "POSTROUTING" (SNAT).
 * @returns {Object} A deep clone of the packet with any applicable address translations applied.
 */
export function firewallProcessorNat(networkObjectId, packet, inputInterface, outputInterface, targetChain)  {

    const $networkObject = document.getElementById(networkObjectId);
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules"));
    const firewallRulesNat = firewallRules["NAT"];
    const natFilteredPacket = structuredClone(packet);
    let targetAction;

    if (targetChain === "PREROUTING") targetAction = "DNAT";
    if (targetChain === "POSTROUTING") targetAction = "SNAT";

    firewallRulesNat.forEach(rule => {

        if (rule.A !== targetChain) return;

        if (rule.j !== targetAction) return;

        if (rule.p !== "*" && rule.p !== packet.transport_protocol && rule.p !== packet.protocol) return;

        if (rule.s !== "*" && rule.s !== packet.origin_ip) return;

        if (rule.d !== "*" && rule.d !== packet.destination_ip) return;

        if (inputInterface !== "" && rule.i !== "*" && rule.i !== inputInterface) return;

        if (outputInterface !== "" && rule.o !== "*" && rule.o !== outputInterface) return;

        if (rule.sport !== "*" && rule.sport !== packet.sport) return;

        if (rule.dport !== "*" && rule.dport !== packet.dport) return;

        //change the destination or source of the packet as needed
        if (targetAction === "DNAT") natFilteredPacket.destination_ip = rule.to__destination;
        if (targetAction === "SNAT") natFilteredPacket.origin_ip = rule.to__source;

    });

    //if the resulting packet differs from the original, generate and store a connection between source and destination

    if (packet.destination_ip !== natFilteredPacket.destination_ip || packet.origin_ip !== natFilteredPacket.origin_ip) {
        if (!connTrack[networkObjectId]) connTrack[networkObjectId] = {};
        connTrack[networkObjectId][packet.destination_ip] = packet.origin_ip;
    }

    return natFilteredPacket;

}

/**
 * Applies the full firewall pipeline to an outgoing packet on a router network object.
 *
 * Checks the packet against the OUTPUT chain (if originated by the router itself) or the FORWARD
 * chain (if being forwarded), triggers a visual fire animation on DROP, then applies POSTROUTING
 * SNAT before sending the packet to the next switch.
 *
 * @param {string} networkObjectId - The DOM element ID of the router network object.
 * @param {Object} packet - The packet to process (may be mutated by SNAT).
 * @param {string} outputInterface - The egress interface name used for chain matching and switch lookup.
 * @returns {Promise<void>}
 */
export async function firewallProc(networkObjectId, packet, outputInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableIps = getAvailableIps(networkObjectId);
    const nextSwitch = $networkObject.getAttribute("data-switch-" + outputInterface);

    //<-- if the source is the router itself, process via OUTPUT

    if (availableIps.includes(packet.origin_ip) && !firewallProcessorFilter(networkObjectId, packet, "OUTPUT", "", outputInterface)) {
        if (visualToggle) igniteFire(networkObjectId);
        return;
    }

    //<-- if the source is not the router itself, process via FORWARD

    if (!availableIps.includes(packet.origin_ip) && !firewallProcessorFilter(networkObjectId, packet, "FORWARD", "", outputInterface)) {
        if (visualToggle) igniteFire(networkObjectId);
        return;
    }

    //<-- process POSTROUTING (SNAT)

    packet = firewallProcessorNat(networkObjectId, packet, "", outputInterface, "POSTROUTING");

    addPacketTraffic(packet);
    await switchProcessor(nextSwitch, networkObjectId, packet);
    return;
}
