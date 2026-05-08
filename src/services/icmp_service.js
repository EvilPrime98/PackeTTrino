/**
 * Sends a single ICMP echo request (ping) from a network object to a destination and
 * reports the result as a numeric status code.
 *
 * Resolves domain names to IPs when necessary, short-circuits for local destinations,
 * and rejects network addresses. Uses the global `icmpFlag` to detect whether a reply
 * was received.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object sending the ping.
 * @param {string} destination - Destination IP address or domain name.
 * @returns {Promise<number>} Status code:
 *   - `0` — success (reply received or local destination)
 *   - `1` — DNS resolution failed
 *   - `2` — destination is a network address
 *   - `3` — no reply received (timeout or routing failure)
 *   - `4` — the interface has no IP or netmask configured
 */
async function ping(networkObjectId, destination) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);

    if (!networkObjectIp || !networkObjectNetmask) return 4;

    if (!isValidIp(destination)) {
        destination = await domainNameResolution(networkObjectId, destination);
        if (!destination) return 1;
    }

    if (isLocalIp(networkObjectId, destination)) {
        await new Promise(resolve => setTimeout(resolve, 50)); //<-- this promise is here to prevent the terminal from visually glitching
        return 0;
    }

    if (destination === getNetwork(destination, networkObjectNetmask)) return 2;

    icmpFlag[networkObjectId] = false;

    try {
        await icmpRequestPacketGenerator(networkObjectId, networkObjectIp, destination, networkObjectInterface);
    } catch (error) {
        return 3;
    }

    if (icmpFlag[networkObjectId] === false) return 3;
    else return 0;

}

/**
 * Performs a traceroute from a network object to a destination, printing each hop to the terminal.
 *
 * Resolves domain names, skips local destinations, and iteratively sends ICMP echo requests
 * with increasing TTL values. Reads intermediate hop information from the global `traceBuffer`
 * and `traceReturn` flags. Ends by printing the final hop or a failure line with asterisks.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object originating the traceroute.
 * @param {string} destination - Destination IP address or domain name.
 * @param {boolean} [numeric=false] - When true, prefixes each output line with a hop count number.
 * @returns {Promise<void>}
 */
async function traceroute(networkObjectId, destination, numeric = false) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);

    let hops = numeric ? 1 : "";

    if (!isValidIp(destination)) {
        const domainName = destination;
        destination = await domainNameResolution(networkObjectId, destination);
        if (!destination) {
            terminalMessage(`traceroute: Name "${domainName}" or service unknown.`, networkObjectId);
            return;
        }
    }

    if (isLocalIp(networkObjectId, destination)) {
        await new Promise(resolve => setTimeout(resolve, 50)); //<-- this promise is here to prevent the terminal from visually glitching
        return;
    }

    trace[networkObjectId] = true; //<-- enable trace mode
    traceFlag[networkObjectId] = false;

    const packet = new IcmpEchoRequest(
        networkObjectIp, //source IP
        destination, //destination IP
        networkObjectMac, //source MAC
        "" //destination MAC
    );

    packet.ttl = 1; //the initial TTL is 1

    traceBuffer[networkObjectId] = [networkObjectIp]; //the starting point is the object's IP
    traceReturn[networkObjectId] = false;

    await routing(networkObjectId, packet, true);

    while (traceReturn[networkObjectId] === true) {
        //build and display the output message
        let message = `${hops}`;
        message +=` ${traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 2].toString().padEnd(15," ")}`;
        message +=` ${traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 1].toString()}`;
        terminalMessage(message, networkObjectId);
        //clear the output message buffer
        traceReturn[networkObjectId] = false;
        //increment the TTL and send the packet again
        packet.ttl++;
        hops = (numeric) ? hops + 1 : "";
        await routing(networkObjectId, packet, true);
    }

    if (traceFlag[networkObjectId] === true) {
        let message = `${hops}`;
        message +=` ${traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 2].toString().padEnd(15," ")}`;
        message +=` ${traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 1].toString()}`;
        terminalMessage(message, networkObjectId);
    } else {
        traceRouteFail(traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 1], hops, numeric);
    }

    trace[networkObjectId] = false; //<-- disable trace mode

    /**
     * Prints a traceroute failure line for an unreachable hop and starts repeating asterisk lines.
     *
     * @param {string} origin - The last known hop IP address.
     * @param {number|string} seq - The current hop sequence value.
     * @param {boolean} [numeric=false] - Whether to prefix output lines with numeric hop counts.
     * @returns {void}
     */
    function traceRouteFail(origin, seq, numeric = false) {
        if (document.querySelector(".terminal-component").style.display === "none") return;
        seq = numeric ? seq + 1 : "";
        terminalMessage(seq + " " + origin.toString().padEnd(15," ") + " *\n", networkObjectId);
        window.pingInterval = setInterval(() => {
            seq = numeric ? seq + 1 : "";
            terminalMessage(seq + " " + `*               *\n`, networkObjectId);
        }, 500);
    }

}

/**
 * Builds and routes an ICMP echo request packet from a network object.
 *
 * Reads the MAC address of the specified interface, constructs an `IcmpEchoRequest` packet,
 * and forwards it through the routing layer.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object sending the ICMP request.
 * @param {string} originIp - Source IP address to use in the ICMP packet.
 * @param {string} destinationIp - Destination IP address.
 * @param {string} [iface="enp0s3"] - Interface name used to look up the source MAC address.
 * @returns {Promise<void>}
 */
async function icmpRequestPacketGenerator(networkObjectId, originIp, destinationIp, iface = "enp0s3") {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute(`mac-${iface}`);
    const packet = new IcmpEchoRequest(originIp, destinationIp, networkObjectMac, "");
    await routing(networkObjectId, packet, true);
}
