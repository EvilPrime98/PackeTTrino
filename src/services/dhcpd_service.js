/**
 * Processes an incoming DHCP packet on behalf of the DHCP server (dhcpd) running on a network object.
 *
 * Handles the full DHCP lifecycle: responds to DHCPDISCOVER with a DHCPOFFER, to DHCPREQUEST
 * (initial and renewal) with a DHCPACK, and to DHCPRELEASE by removing the lease entry.
 * Returns undefined when the server is off, the packet arrived on an unlisted interface,
 * or required configuration attributes are missing.
 *
 * @param {string} serverObjectId - The DOM element ID of the network object acting as the DHCP server.
 * @param {Object} packet - The incoming DHCP packet.
 * @param {string} packet.type - DHCP message type: "discover", "request", or "release".
 * @param {string} packet.chaddr - Client hardware (MAC) address.
 * @param {string} packet.origin_mac - MAC address of the packet sender.
 * @param {string} packet.siaddr - Server IP address recorded in the packet.
 * @param {string} packet.yiaddr - IP address offered or being requested.
 * @param {string} packet.ciaddr - Client IP address (0.0.0.0 for initial request).
 * @param {string} packet.giaddr - Relay agent IP address (0.0.0.0 if no relay).
 * @param {string} packet.hostname - Client hostname.
 * @param {string} packet.gateway - Gateway offered by the client during renewal.
 * @param {string} packet.netmask - Netmask offered by the client during renewal.
 * @param {string} packet.dns - DNS server offered by the client during renewal.
 * @param {string} iface - The interface name on which the packet was received.
 * @returns {Promise<Object|undefined>} A DHCPOFFER or DHCPACK reply packet, or undefined.
 */
async function dhcpd_service(serverObjectId, packet, iface) {

    //server attributes
    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute(`mac-${iface}`);
    const serverObjectIp = $serverObject.getAttribute(`ip-${iface}`);
    const serverObjectNetmask = $serverObject.getAttribute(`netmask-${iface}`);
    const serverObjectNetwork = getNetwork(serverObjectIp, serverObjectNetmask);

    //DHCP service attributes
    const rangeStart = $serverObject.getAttribute("data-range-start");
    const rangeEnd = $serverObject.getAttribute("data-range-end");
    const netmaskOffer = $serverObject.getAttribute("dhcp-offer-netmask");
    const networkOffer = getNetwork(rangeStart, netmaskOffer);
    const leaseTime = $serverObject.getAttribute("dhcp-offer-lease-time");
    const gatewayOffer = $serverObject.getAttribute("dhcp-offer-gateway") || "";
    const dnsOffer = $serverObject.getAttribute("dhcp-offer-dns") || "";
    const isDhcpServerOn = $serverObject.getAttribute("dhcpd") === "true";
    const listenOnInterfaces = $serverObject.getAttribute("dhcp-listen-on-interfaces").split(",");

    if (!isDhcpServerOn) return; //<-- if the DHCP Server is not enabled, nothing is processed

    if (!listenOnInterfaces.includes(iface)) return; //<-- if the DHCP Server is not configured for the interface, nothing is processed

    if (packet.type === "discover") { //discovery from a client

        if (!rangeStart || !rangeEnd || !netmaskOffer || !leaseTime) return;

        const offerIP = getReservedIp(serverObjectId, packet.chaddr) || getRandomIPfromDhcp(serverObjectId);

        const newPacket = new dhcpOffer(
            serverObjectIp, //source IP
            serverObjectMac, //source MAC
            serverObjectIp, //siaddr
            offerIP, //yiaddr
            packet.origin_mac, //destination MAC
            packet.chaddr, //chaddr
            gatewayOffer, //gateway offer
            netmaskOffer, //netmask offer
            dnsOffer, //DNS offer
            leaseTime //lease time offer
        );

        if (packet.giaddr === "0.0.0.0") {
            if (networkOffer !== serverObjectNetwork ) return; //<-- check if this network segment is served
        } else {
            if (networkOffer !== getNetwork(packet.giaddr, netmaskOffer)) return; //<-- check if this network segment is served
            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;
        }

        return newPacket;

    }

    if (packet.type === "request" && packet.ciaddr === "0.0.0.0") { //request from a client without an assigned IP

        if (packet.siaddr !== serverObjectIp) return; //<-- check if it is directed to the server

        const newPacket = new dhcpAck(
            serverObjectMac, //source MAC
            packet.yiaddr, //yiaddr
            serverObjectIp, //siaddr
            gatewayOffer, //gateway offer
            netmaskOffer, //netmask offer
            dnsOffer, //DNS offer
            packet.hostname, //hostname
            leaseTime //lease time offer
        );

        newPacket.chaddr = packet.chaddr;
        newPacket.destination_mac = packet.origin_mac;

        if (packet.giaddr !== "0.0.0.0") {
            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;
        }

        addDhcpEntry(serverObjectId, packet.yiaddr, packet.chaddr, packet.hostname);
        return newPacket;

    }

    if (packet.type === "request" && packet.ciaddr !== "0.0.0.0") { //renewal of an assigned IP

        if (packet.siaddr !== serverObjectIp) return;

        if (!updateDhcpEntry(serverObjectId, packet)) return;

        const newPacket = new dhcpAck(
            serverObjectMac, //origin mac
            packet.ciaddr, //assigned IP
            serverObjectIp, //server IP
            packet.gateway, // gateway offer
            packet.netmask, //netmask offer
            packet.dns, //DNS offer
            packet.hostname, //hostname
            leaseTime //lease time offer
        );

        newPacket.destination_ip = packet.origin_ip;
        newPacket.destination_mac = packet.origin_mac;
        newPacket.chaddr = packet.chaddr;

        return newPacket;

    }

    if (packet.type === "release") { //release of an assigned IP
        if (packet.siaddr !== serverObjectIp) return;
        deleteDhcpEntry(serverObjectId, packet.ciaddr);
        return;
    }

}

/**
 * Decrements all active lease timers shown in the DHCP server's lease table and removes expired entries.
 *
 * Iterates over every `.lease-time` cell in the DHCP table of the given server element,
 * decrements each counter by one second, and removes the row when the counter reaches zero.
 * Clears the associated interval timer once the table is empty.
 *
 * @param {string} serverObjectId - The DOM element ID of the DHCP server whose lease timers are updated.
 * @returns {void}
 */
function updateServerLeaseTimes(serverObjectId) {

    const $serverObject = document.getElementById(serverObjectId);
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $leaseTimes = $leasesTable.querySelectorAll(".lease-time");

    $leaseTimes.forEach(leaseTime => {

        const time = parseInt(leaseTime.innerHTML, 10);

        if (time > 0) leaseTime.innerHTML = time - 1;

        if (time === 0) {
            const row = leaseTime.parentNode;
            row.remove();
        }

    });

    if ($leasesTable.querySelectorAll("tr").length === 1) {
        clearInterval(serverLeaseTimers[serverObjectId]);
        delete serverLeaseTimers[serverObjectId];
    }

}
