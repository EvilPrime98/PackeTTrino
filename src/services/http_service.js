import { isValidIp } from "@/lib/network_lib";
/**
 * Sends an HTTP request from a network object and returns the server's reply packet.
 *
 * Validates the port and method, resolves domain names to IPs via DNS when necessary,
 * and short-circuits through the local Apache service when the destination is a local IP.
 * For remote destinations, performs a full TCP three-way handshake before issuing the request.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object originating the request.
 * @param {Object} headers - HTTP request parameters.
 * @param {string} headers.address - Destination IP address or domain name.
 * @param {number} headers.dport - Destination port number (1–65535).
 * @param {string} headers.method - HTTP method (e.g. "GET", "POST", "PUT", "DELETE").
 * @param {string} [headers.resource] - Requested resource path.
 * @returns {Promise<Object>} The HTTP reply packet returned by the server.
 * @throws {Error} If the port or method is invalid, the domain cannot be resolved,
 *   the TCP connection cannot be established, or no response is received.
 */
export async function http(networkObjectId, headers) {

    const $networkObject = document.getElementById(networkObjectId);
    let domainName;

    //check that the port and method are valid

    if (isNaN(headers["dport"]) || headers["dport"] < 1 || headers["dport"] > 65535) throw new Error(`Error: Port ${headers["dport"]} is not valid.`);

    if (!["GET", "POST", "PUT", "DELETE"].includes(headers.method.toUpperCase())) throw new Error(`Error: Method ${headers.method} is not valid.`);

    //check whether it is an IP or a domain name

    if (!isValidIp(headers["address"])) {
        domainName = headers["address"];
        headers["address"] = await domainNameResolution(networkObjectId, headers["address"]);
        if (!headers["address"]) throw new Error(`Error: Could not resolve domain "${domainName}".`);
    }

    headers["host"] = domainName || headers["address"]; //store the domain name that was used
    headers["sport"] = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152; // <--- generate a random ephemeral source port

    //check if it is a local web server
    if (isLocalIp(networkObjectId, headers["address"])) {

        const newPacket = await apache_service(networkObjectId,

            new httpRequest(
                $networkObject.getAttribute(`ip-${getInterfaces(networkObjectId)[0]}`), //source IP
                headers["address"], //destination IP
                $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`), //source MAC
                "", //destination MAC
                headers["sport"], //source port
                headers["dport"], //destination port
                headers["method"], //method
                headers["host"], //host
                headers["resource"] //resource
            )

        );

        return newPacket;

    }

    delete httpBuffer[networkObjectId]; //<-- clear the previous response buffer

    //initiate the TCP handshake

    await tcpSynPacketGenerator(networkObjectId, headers["address"], headers["sport"], headers["dport"]);

    if (tcpSyncFlag[networkObjectId] === false) throw new Error(networkObjectId + ": Could not establish TCP connection.");

    //issue the HTTP request

    await httpRequestPacketGenerator(networkObjectId, headers);

    //check if there is a response in the buffer

    const newPacket = httpBuffer[networkObjectId];

    if (!newPacket) throw new Error("Error: Connection refused. No response received from the web server.");

    return newPacket //return the HTTPReply object

}

/**
 * Builds and routes an HTTP request packet from a network object to a remote destination.
 *
 * Reads the interface MAC and IP of the originating device, constructs an `httpRequest` packet
 * with a randomly generated source port derived from the provided headers, and forwards it
 * through the routing layer.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object sending the request.
 * @param {Object} headers - HTTP request parameters.
 * @param {string} headers.address - Destination IP address.
 * @param {number} headers.sport - Source port number (ephemeral).
 * @param {number} headers.dport - Destination port number.
 * @param {string} headers.method - HTTP method.
 * @param {string} headers.host - Host header value.
 * @param {string} [headers.resource] - Requested resource path.
 * @returns {Promise<void>}
 */
export async function httpRequestPacketGenerator(networkObjectId, headers) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkjObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkjObjectInterface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkjObjectInterface}`);

    const packet = new httpRequest(
        networkObjectIp, //source IP
        headers["address"], //destination IP
        networkObjectMac, //source MAC
        "", //destination MAC
        headers["sport"], //source port
        headers["dport"], //destination port
        headers["method"], //method
        headers["host"], //host
        headers["resource"] //resource
    );

    await routing(networkObjectId, packet, true);

}
