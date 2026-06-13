import { getInterfaces } from "@/lib/network_lib";
import { dnsReply } from "@/lib/packets_lib";
import { iterativeDnsQuery } from "@/lib/dns_lib";
import { isDomainInCacheDns } from "@/lib/dns_lib";
import { addDnsCacheEntryServer } from "@/lib/dns_lib";
import { getSoaRecord } from "@/lib/dns_lib";

/**
 * Processes an incoming DNS request on behalf of the named (BIND9) DNS server running on a network object.
 *
 * Handles type-A, PTR, SOA, and NS queries. For type-A queries the resolution order is:
 * local zone (iterative), DNS cache (if enabled), and recursive lookup via the Google DNS API
 * (if recursion is enabled). Caches successful recursive results when the cache is active.
 * Returns undefined when the named service is off.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object acting as the DNS server.
 * @param {Object} packet - The incoming DNS request packet.
 * @param {string} packet.origin_ip - Source IP address of the requester.
 * @param {string} packet.origin_mac - Source MAC address of the requester.
 * @param {string} packet.query - Domain name being queried.
 * @param {string} packet.answer_type - DNS record type requested: "A", "PTR", "SOA", or "NS".
 * @param {number} packet.sport - Source port of the requester (used as destination port for the reply).
 * @returns {Promise<Object|undefined>} The DNS reply packet, or undefined if named is off.
 */
export async function named_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const isNamedOn = $networkObject.getAttribute("named") === "true";
    const isRecursiveOn = $networkObject.getAttribute("recursion") === "true"; //<-- check if recursion mode is enabled
    const isCacheOn = $networkObject.getAttribute("resolved") === "true"; //<-- check if DNS cache mode is enabled

    if (!isNamedOn) return;

    const newPacket = new dnsReply( // <-- initialize the packet without a response
        networkObjectIp, // <-- source IP
        packet.origin_ip, // <-- destination IP
        networkObjectMac, // <-- source MAC
        packet.origin_mac, // <-- destination MAC
        packet.query, // <-- domain name
        "" // <-- answer
    );

    newPacket.dport = packet.sport;

    if (packet.answer_type === "A") {

        //iterative query

        let answer = iterativeDnsQuery(networkObjectId, packet.query);

        //DNS cache query

        if (!answer && isCacheOn) answer = isDomainInCacheDns(networkObjectId, packet.query)[1];

        //recursive query

        if (!answer && isRecursiveOn) {
            answer = await recursiveDnsQuery(packet.query);
            if (answer && isCacheOn) addDnsCacheEntryServer(networkObjectId, packet.query, packet.answer_type, answer[0]);
        }

        //get the TTL of the cached record

        if (answer) {
            const soaData = getSoaRecord(networkObjectId, packet.query);
            newPacket.cache_ttl = soaData["cacheTTL"];
        }

        //add the response values

        if (typeof answer === 'string') newPacket.answer = [answer];
        else newPacket.answer = answer;

        //add the record type

        newPacket.answer_type = "A";
    }

    if (packet.answer_type === "PTR") {
        const answer = iterativeDnsQuery(networkObjectId, (packet.query).split(".").reverse().join(".") + ".IN-ADDR.ARPA."); //<-- iterative query
        newPacket.answer = answer; //<-- add the answer
        newPacket.answer_type = "PTR"; //<-- add the record type
    }

    if (packet.answer_type === "SOA" || packet.answer_type === "NS") {

        const soaData = getSoaRecord(networkObjectId, packet.query);

        if (soaData["authorityNameServer"]) newPacket.authority = "1";

        newPacket.answer_type = "SOA";
        newPacket.answer = soaData["authorityNameServer"];
        newPacket.authority_domain = soaData["authorityDomain"];
        newPacket.serial = soaData["serial"];
        newPacket.cache_ttl = soaData["cacheTTL"];

    }

    return newPacket;

}

/**
 * Resolves a domain name to one or more IP addresses using the Google DNS-over-HTTPS API.
 *
 * Sends a type-A query to `dns.google.com/resolve` and extracts all valid IPv4 addresses
 * from the answer section of the JSON response.
 *
 * @param {string} domain - The fully qualified domain name to resolve.
 * @returns {Promise<Array<string>|false>} An array of resolved IPv4 addresses, or false on failure.
 */
export async function recursiveDnsQuery(domain) {

    try {

        const apiResponse = await fetch("https://dns.google.com/resolve?name=" + domain + "&type=A"); // <-- call the Google DNS API
        const apiReply = await apiResponse.json(); // <-- decode the JSON response
        const resolution = apiReply.Answer.reduce( (acc, answer) => { if (isValidIp(answer.data)) acc.push(answer.data); return acc; }, []);
        return resolution;

    } catch (error) {

        return false;

    }

}
