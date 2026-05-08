/**
 * Resolves a domain name to an IP address using the network object's configured resolution stack.
 *
 * Resolution order:
 * 1. `/etc/hosts` file lookup.
 * 2. Local DNS cache (if the `resolved` service is active).
 * 3. Remote DNS server query (result cached when `resolved` is active).
 *
 * @param {string} networkObjectId - The DOM element ID of the network object performing the resolution.
 * @param {string} domain - The domain name to resolve.
 * @returns {Promise<string|false>} The first resolved IP address string, or false if resolution fails.
 */
async function domainNameResolution(networkObjectId, domain) {

    const $networkObject = document.getElementById(networkObjectId);
    const useCache = $networkObject.getAttribute("resolved") === "true";
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true";
    // eslint-disable-next-line no-useless-assignment
    let response = false;

    //check if the domain is in the /etc/hosts file

    response = getDomainFromEtcHosts(networkObjectId, domain);

    //check if the domain is in the DNS cache (if the cache is active)

    if (!response && useCache) response = isDomainInCacheDns(networkObjectId, domain)[1];

    //try to resolve the domain from the DNS server

    if (!response) {

        try {

            const dnsReply = await getDomainFromServer(
                networkObjectId, //object ID
                domain, //domain
                "", //server IP (defaults to the device's IP)
                "A", //record type
            );

            if (!dnsReply.answer) throw new Error("Error: Could not resolve the domain name.");
            if (isResolvedOn) addDnsCacheEntry(networkObjectId, dnsReply);

            response = dnsReply.answer[0]; //return the first value

        } catch (error) {

            console.log(error);
            response = false;

        }

    }

    return response;

}

/**
 * Sends a DNS query for a domain to one or more DNS servers and returns the reply packet.
 *
 * Tries each server in order. Local DNS servers are queried via direct `named_service` call;
 * remote ones are reached via the routing layer. Throws when no server responds.
 * Appends a trailing dot to the domain when it is not an IP and does not already end with one,
 * ensuring it is treated as a fully qualified domain name.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object issuing the DNS query.
 * @param {string} domain - The domain name to query (or IP for PTR lookups).
 * @param {string} [dnsServer=""] - Specific DNS server IP to query; uses the device's configured
 *   servers when empty.
 * @param {string} query_type - DNS record type to request (e.g. "A", "PTR", "SOA").
 * @returns {Promise<Object>} The DNS reply packet stored in the device's packet buffer.
 * @throws {Error} If no DNS servers are configured or all servers time out.
 */
async function getDomainFromServer(networkObjectId, domain, dnsServer = "", query_type) {

    const $networkObject = document.getElementById(networkObjectId);
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true"; //check if the device has a DNS cache

    if (!isValidIp(domain) && !domain.endsWith(".")) domain = domain + ".";

    //reseteamos el flag de comunicaciones

    dnsRequestFlag[networkObjectId] = false;

    //si no se especifico un servidor dns se usan los del equipo

    const networkObjectDnsServers = getDnsServers(networkObjectId);
    const serversToTry = (dnsServer === "") ? networkObjectDnsServers : [dnsServer];
    if (serversToTry.length === 0) throw new Error("Error: No DNS servers configured.");

    //intentamos resolver el dominio con cada uno de los servidores dns

    let answered = false; //boolean indicating whether a response was received from any DNS server
    let i = 0;

    while (i < serversToTry.length && !answered) {

        const dnsServer = serversToTry[i];

        if (isLocalIp(networkObjectId, dnsServer)) { //local DNS servers

            const newDnsRequest = new dnsRequest(
                $networkObject.getAttribute(`ip-${getInterfaces(networkObjectId)[0]}`),
                dnsServer,
                $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`),
                $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`),
                domain
            );

            newDnsRequest.answer_type = query_type;

            const dnsReply = await named_service(networkObjectId, newDnsRequest);

            if (dnsReply) {
                answered = true;
                buffer[networkObjectId] = dnsReply;
            }

        } else { //remote DNS servers

            await dnsRequestPacketGenerator(networkObjectId, domain, dnsServer, query_type);
            if (dnsRequestFlag[networkObjectId] === true) answered = true;

        }

        i++;
    }

    if (!answered) throw new Error(`Communication error with ${serversToTry[i-1]}#53: timeout`);

    //return the reply packet (in the device's packet buffer)
    return buffer[networkObjectId];

}

/**
 * Builds and routes a DNS request packet from a network object to a specific DNS server.
 *
 * Reads the IP and MAC of the device's primary interface, constructs a `dnsRequest` packet
 * with the given query type, and forwards it through the routing layer. Does nothing if
 * no DNS server IP is provided.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object sending the DNS request.
 * @param {string} domain - The domain name to query.
 * @param {string} dnsServer - The IP address of the DNS server to query.
 * @param {string} query_type - DNS record type to request (e.g. "A", "PTR", "SOA").
 * @returns {Promise<void>}
 */
async function dnsRequestPacketGenerator(networkObjectId, domain, dnsServer, query_type) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    if (!dnsServer) return;
    const packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, "", domain);
    packet.answer_type = query_type;
    await routing(networkObjectId, packet, true);
}
