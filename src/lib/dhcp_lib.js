/**
 * @description Returns a random valid IP address from within the DHCP server's configured range
 * that is not already leased or reserved. If the server has no range/netmask configured, returns
 * a random IP without availability checking.
 * @param {string} serverObjectId - DOM id of the DHCP server element.
 * @returns {string} A random available IP address in dotted-decimal notation.
 */
function getRandomIPfromDhcp(serverObjectId) {

    const $serverObject = document.getElementById(serverObjectId);
    const rangeStart = $serverObject.getAttribute("data-range-start");
    const rangeEnd = $serverObject.getAttribute("data-range-end");
    const offerNetmask = $serverObject.getAttribute("dhcp-offer-netmask");
    const startInt = parseInt(ipToBinary(rangeStart), 2);
    const endInt = parseInt(ipToBinary(rangeEnd), 2);
    let randomInt = Math.floor(Math.random() * (endInt - startInt + 1)) + startInt;
    let randomBinary = randomInt.toString(2).padStart(32, '0');
    let randomIp = binaryToIp(randomBinary);

    if (!rangeStart || !rangeEnd || !offerNetmask) return randomIp;

    while (!checkIpinDhcp(serverObjectId, randomIp)) {
        randomInt = Math.floor(Math.random() * (endInt - startInt + 1)) + startInt;
        randomBinary = randomInt.toString(2).padStart(32, '0');
        randomIp = binaryToIp(randomBinary);
    }

    return randomIp;

}

/**
 * @description Returns `true` if the given IP is available (not currently leased and not reserved
 * for another MAC) in the DHCP server's lease table.
 * @param {string} serverObjectId - DOM id of the DHCP server element.
 * @param {string} newip - IP address to check for availability.
 * @returns {boolean} `true` if the IP is available for a new offer, `false` if it is already taken.
 */
function checkIpinDhcp(serverObjectId, newip) {

    const $serverObject = document.getElementById(serverObjectId);
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $reservations = JSON.parse($serverObject.getAttribute("dhcp-reservations"));
    const $leases = $leasesTable.querySelectorAll("tr");
    let response = true;

    $leases.forEach(lease => {
        const $fields = lease.querySelectorAll("td");
        if ($fields.length < 1) return;
        if ($fields[0].innerHTML === newip) response = false;
    });

    for (const reservation in $reservations) {
        if ($reservations[reservation] === newip) response = false;
    }

    return response;

}

/**
 * @description Adds a new lease entry to the DHCP server's lease table and starts (or reuses)
 * the server's lease countdown interval.
 * @param {string} serverObjectId - DOM id of the DHCP server element.
 * @param {string} newip - IP address being leased.
 * @param {string} newmac - MAC address of the client receiving the lease.
 * @param {string} newhostname - Hostname of the client receiving the lease.
 * @returns {void}
 */
function addDhcpEntry(serverObjectId, newip, newmac, newhostname) {

    const $serverObject = document.getElementById(serverObjectId);
    const leaseTime = $serverObject.getAttribute("dhcp-offer-lease-time");
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $newLease = document.createElement("tr");

    $newLease.innerHTML = `
        <td>${newip}</td>
        <td>${newmac}</td>
        <td>${newhostname}</td>
        <td class="lease-time">${leaseTime}</td>
    `;

    $leasesTable.appendChild($newLease);
    if (!serverLeaseTimers[serverObjectId]) serverLeaseTimers[serverObjectId] = setInterval(() => updateServerLeaseTimes(serverObjectId), 1000);
}

/**
 * @description Removes the lease entry for the target IP from the DHCP server's lease table and
 * stops the lease countdown interval if no leases remain.
 * @param {string} serverObjectId - DOM id of the DHCP server element.
 * @param {string} targetip - IP address of the lease to remove.
 * @returns {void}
 */
function deleteDhcpEntry(serverObjectId, targetip) {
    const serverObject = document.getElementById(serverObjectId);
    const table = serverObject.querySelector(".dhcp-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        const $row = rows[i];
        const $cells = $row.querySelectorAll("td");
        const ip = $cells[0].innerHTML;
        if (ip === targetip) {
            $row.remove();
            if (table.querySelectorAll("tr").length === 1) { // only the header row remains
                clearInterval(window.leaseTimer);
                serverObject.setAttribute("data-interval", "false");
            }
            return;
        }
    }
}

/**
 * @description Renews the lease time and updates the IP and hostname for a client that matches
 * the MAC address in the renew packet.
 * @param {string} serverObjectId - DOM id of the DHCP server element.
 * @param {Object} renewPacket - DHCP packet containing the renewal information.
 * @param {string} renewPacket.chaddr - Client hardware (MAC) address to match.
 * @param {string} renewPacket.ciaddr - New client IP to record.
 * @param {string} renewPacket.hostname - New hostname to record.
 * @returns {boolean} `true` if a matching lease was found and updated, `false` otherwise.
 */
function updateDhcpEntry(serverObjectId, renewPacket) {

    const $serverObject = document.getElementById(serverObjectId);
    const leaseTimeOffer = $serverObject.getAttribute("dhcp-offer-lease-time");
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $leases = $leasesTable.querySelectorAll("tr");
    let response = false;

    $leases.forEach( $lease => {

        const $fields = $lease.querySelectorAll("td");

        if ($fields.length < 1) return;

        const mac = $fields[1].innerHTML;

        if (mac === renewPacket.chaddr) {
            $fields[0].innerHTML = renewPacket.ciaddr;
            $fields[2].innerHTML = renewPacket.hostname;
            $fields[3].innerHTML = leaseTimeOffer
            response = true;
        }

    });

    return response;

}

/**
 * @description Starts (or resets) the client-side DHCP lease countdown for the given interface.
 * Resets the elapsed lease time and the T1/T2 renewal flags. If a timer already exists for this
 * interface it is left running (idempotent).
 * @param {string} networkObjectId - DOM id of the DHCP client element.
 * @param {string} iface - Interface name (e.g. "enp0s3") whose lease timer to (re)start.
 * @returns {Promise<void>}
 */
async function updateClientLeaseTimer(networkObjectId, iface) {

    const $networkObject = document.getElementById(networkObjectId);

    $networkObject.setAttribute(`data-dhcp-current-lease-time-${iface}`, 0);
    $networkObject.setAttribute(`data-dhcp-flag-t1-${iface}`, "false");
    $networkObject.setAttribute(`data-dhcp-flag-t2-${iface}`, "false");

    if (Object.hasOwn(clientLeaseTimers, `${networkObjectId}-${iface}`)) return;

    const clientLeaseTimer = setInterval( async () => {
        await reduceClientLeaseTime(networkObjectId, iface)
    }, 1000 );

    clientLeaseTimers[`${networkObjectId}-${iface}`] = clientLeaseTimer;

}

/**
 * @description Called every second by the client lease interval. Increments the elapsed lease
 * time and triggers DHCP renewal (T1 unicast, then T2 broadcast) or a full rediscover when the
 * lease expires.
 * @param {string} networkObjectId - DOM id of the DHCP client element.
 * @param {string} iface - Interface name whose lease countdown to decrement.
 * @returns {Promise<void>}
 */
async function reduceClientLeaseTime(networkObjectId, iface) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute(`data-switch-${iface}`);
    const leaseTime = parseInt($networkObject.getAttribute(`data-dhcp-lease-time-${iface}`));
    const flagT1 = $networkObject.getAttribute(`data-dhcp-flag-t1-${iface}`);
    const flagT2 = $networkObject.getAttribute(`data-dhcp-flag-t2-${iface}`);
    const T1 = leaseTime * 0.5;
    const T2 = leaseTime * 0.875;

    $networkObject.setAttribute(
        `data-dhcp-current-lease-time-${iface}`,
        parseInt($networkObject.getAttribute(`data-dhcp-current-lease-time-${iface}`)) + 1
    );

    const currentLeaseTime = parseInt($networkObject.getAttribute(`data-dhcp-current-lease-time-${iface}`));

    if (currentLeaseTime > T1 && flagT1 === "false") {
        $networkObject.setAttribute(`data-dhcp-flag-t1-${iface}`, "true");
        await dhcpRenewHandler(networkObjectId, "T1", iface);
        if (dhcpRequestFlag[networkObjectId] === true) $networkObject.setAttribute(`data-dhcp-flag-t1-${iface}`, "false");
        return;
    }

    if (currentLeaseTime > T2 && flagT2 === "false") {
        $networkObject.setAttribute(`data-dhcp-flag-t2-${iface}`, "true");
        await dhcpRenewHandler(networkObjectId, "T2", iface);
        if (dhcpRequestFlag[networkObjectId] === true) $networkObject.setAttribute(`data-dhcp-flag-t2-${iface}`, "false");
        return;
    }

    if (currentLeaseTime >= leaseTime ) {
        clearInterval(clientLeaseTimers[`${networkObjectId}-${iface}`]);
        delete clientLeaseTimers[`${networkObjectId}-${iface}`];
        deleteDhcpInfo(networkObjectId, iface);
        await dhcpDiscoverGenerator(networkObjectId, iface);
        return;
    }

}

/**
 * @description Adds a static IP reservation (MAC → IP mapping) to the DHCP server's reservation
 * store. Validates that the IP is valid, belongs to the server's subnet, and the MAC is valid.
 * @param {string} networkObjectId - DOM id of the DHCP server element.
 * @param {string} mac - Client MAC address to reserve for (uppercase or lowercase accepted).
 * @param {string} ip - IP address to reserve for that MAC.
 * @returns {void}
 * @throws {Error} If the IP is invalid, out of the server's subnet range, or the MAC is invalid.
 */
function addDhcpReservation(networkObjectId, mac, ip) {

    const $networkObject = document.getElementById(networkObjectId);
    const rangeStart = $networkObject.getAttribute("data-range-start");
    const offerNetmask = $networkObject.getAttribute("dhcp-offer-netmask");
    const reservations = JSON.parse($networkObject.getAttribute("dhcp-reservations"));

    if (!isValidIp(ip)) throw new Error("Error: The entered IP is not valid.");

    if (getNetwork(ip, offerNetmask) !== getNetwork(rangeStart, offerNetmask))
        throw new Error("Error: The entered IP does not belong to the DHCP server's service range.");

    if (!isValidMac(mac)) throw new Error("Error: The entered MAC address is not valid.");

    reservations[mac] = ip;

    $networkObject.setAttribute("dhcp-reservations", JSON.stringify(reservations));

}

/**
 * @description Removes the static IP reservation for the given MAC address from the DHCP server.
 * @param {string} networkObjectId - DOM id of the DHCP server element.
 * @param {string} mac - MAC address whose reservation to remove.
 * @returns {void}
 */
function removeDhcpReservation(networkObjectId, mac) {
    const $networkObject = document.getElementById(networkObjectId);
    const reservations = JSON.parse($networkObject.getAttribute("dhcp-reservations"));
    delete reservations[mac];
    $networkObject.setAttribute("dhcp-reservations", JSON.stringify(reservations));
}

/**
 * @description Returns the statically reserved IP address for the given MAC address on a DHCP
 * server, or `false` if no reservation exists.
 * @param {string} serverObjectId - DOM id of the DHCP server element.
 * @param {string} mac - MAC address to look up (trimmed and uppercased internally).
 * @returns {string|false} The reserved IP address string, or `false` if not found.
 */
function getReservedIp(serverObjectId, mac) {
    const $serverObject = document.getElementById(serverObjectId);
    const reservations = JSON.parse($serverObject.getAttribute("dhcp-reservations"));
    const filteredMac = mac.trim().toUpperCase();
    if (reservations[filteredMac]) return reservations[filteredMac];
    return false;
}

/**
 * @description Applies the network configuration received in a DHCP ACK packet to the specified
 * interface of a client device: sets IP/netmask, default gateway, DHCP server reference, lease
 * time, and DNS servers.
 * @param {string} networkObjectId - DOM id of the DHCP client element.
 * @param {Object} packet - DHCP ACK packet object.
 * @param {string} packet.yiaddr - IP address assigned to the client.
 * @param {string} packet.netmask - Subnet mask offered.
 * @param {string} packet.gateway - Default gateway offered.
 * @param {string} packet.siaddr - DHCP server IP address.
 * @param {string} packet.dns - Comma-separated list of DNS server IPs.
 * @param {string|number} packet.leasetime - Lease duration in seconds.
 * @param {string} networkObjectInterface - Interface name to configure (e.g. "enp0s3").
 * @returns {void}
 */
function setDhcpInfo(networkObjectId, packet, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const newIp = packet.yiaddr;
    const newNetmask = packet.netmask;
    const newGateway = packet.gateway;
    const newServer = packet.siaddr;
    const newDnsServers = (packet.dns).split(",").map(item => item.trim()).filter(item => item !== "");
    const newLeaseTime = packet.leasetime;

    //configure the interface
    configureInterface(networkObjectId, newIp, newNetmask, networkObjectInterface);
    setDefaultGateway(networkObjectId, newGateway);

    //store the device's DHCP information
    $networkObject.setAttribute(`data-dhcp-server-${networkObjectInterface}`, newServer);
    $networkObject.setAttribute(`data-dhcp-lease-time-${networkObjectInterface}`, newLeaseTime);
    setDnsServers(networkObjectId, newDnsServers);

}

/**
 * @description Removes DHCP-assigned network configuration from the specified interface of a
 * client device: deconfigures the interface, clears DNS servers, resets all DHCP state attributes,
 * and cancels the client's lease countdown interval.
 * @param {string} networkObjectId - DOM id of the DHCP client element.
 * @param {string} networkObjectInterface - Interface name to deconfigure (e.g. "enp0s3").
 * @returns {void}
 */
function deleteDhcpInfo(networkObjectId, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);

    //deconfigure the interface and remove the routing table entry
    deconfigureInterface($networkObject.id, networkObjectInterface);
    setDnsServers($networkObject.id, [""]);

    //clear the device's DHCP information
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dhcp-lease-time", "");
    $networkObject.setAttribute("data-dhcp-current-lease-time", "");
    $networkObject.setAttribute("data-dhcp-flag-t1", "false");
    $networkObject.setAttribute("data-dhcp-flag-t2", "false");

    //cancel the client lease timer
    clearInterval(clientLeaseTimers[`${networkObjectId}-${networkObjectInterface}`]);
    delete clientLeaseTimers[`${networkObjectId}-${networkObjectInterface}`];
}

/**
 * @description Resumes all DHCP lease timers after loading a saved workspace. Restarts server
 * lease countdown intervals for any DHCP server that has active leases, and client lease countdown
 * intervals for any DHCP client that has a non-empty lease time on its first interface.
 * @returns {void}
 */
function startLeaseTimers() {

    const $dhcpServers = Array.from(document.querySelectorAll(".item-dropped"))
    .filter($networkObject => $networkObject.getAttribute("dhcpd") !== null);
    const $dhcpClients = Array.from(document.querySelectorAll(".item-dropped"))
    .filter($networkObject => $networkObject.getAttribute("dhclient") !== null);

    $dhcpServers.forEach(server => {
        const serverObjectId = server.id;
        const table = server.querySelector(".dhcp-table table");
        const leases = table.querySelectorAll("tr");
        if (leases.length > 1 && !serverLeaseTimers[serverObjectId]) {
            serverLeaseTimers[serverObjectId] = setInterval(() => updateServerLeaseTimes(serverObjectId), 1000);
        }
    });

    $dhcpClients.forEach(client => {
        const clientObjectId = client.id;
        const leaseTime = client.getAttribute("data-dhcp-lease-time");
        const interfaces = getInterfaces(clientObjectId);
        if (leaseTime !== "" && !clientLeaseTimers[`${clientObjectId}-${interfaces[0]}`]) {
            clientLeaseTimers[`${clientObjectId}-${interfaces[0]}`] = setInterval( async () => { await reduceClientLeaseTime(clientObjectId, interfaces[0])}, 1000 );
        }
    });

}

/**
 * @description Validates a DHCP server configuration object. Throws a descriptive error for any
 * invalid field (interfaces, IP range, netmask, gateway, DNS servers, or lease time).
 * @param {string} networkObjectId - DOM id of the DHCP server element.
 * @param {Object} configObject - Configuration object to validate.
 * @param {string[]} configObject.dhcpListenOnInterfaces - Interface names the server should listen on.
 * @param {string} configObject.rangeStart - First IP of the assignable range.
 * @param {string} configObject.rangeEnd - Last IP of the assignable range.
 * @param {string} configObject.dhcpOfferGateway - Default gateway to offer (may be empty string).
 * @param {string} configObject.dhcpOfferNetmask - Subnet mask to offer.
 * @param {string[]} configObject.dhcpOfferDnsServers - DNS server IPs to offer.
 * @param {number} configObject.dhcpOfferLeaseTime - Lease duration in seconds (120–86400).
 * @returns {void}
 * @throws {Error} If any field fails validation.
 */
function validateDhpcConfiguration(networkObjectId, configObject) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces($networkObject.id);

    //destructure the configuration object

    const dhcpListenOnInterfaces = configObject.dhcpListenOnInterfaces; //interfaces as array
    const rangeStart = configObject.rangeStart;
    const rangeEnd = configObject.rangeEnd;
    const dhcpOfferGateway = configObject.dhcpOfferGateway;
    const dhcpOfferNetmask = configObject.dhcpOfferNetmask;
    const dhcpOfferDnsServers = configObject.dhcpOfferDnsServers; //servers as array
    const dhcpOfferLeaseTime = configObject.dhcpOfferLeaseTime;

    //validate the fields

    if (!dhcpListenOnInterfaces.every(item => availableInterfaces.includes(item))) 
        throw new Error(`Error: one or more of the listen interfaces are not valid.`);

    if (!isValidIp(rangeStart)) 
        throw new Error(`Error: expected a valid start IP instead of "${rangeStart}".`);

    if (!isValidIp(rangeEnd)) 
        throw new Error(`Error: expected a valid end IP instead of "${rangeEnd}".`);

    if (!isValidIp(dhcpOfferNetmask)) 
        throw new Error(`Error: expected a valid subnet mask instead of "${dhcpOfferNetmask}".`);

    if (getNetwork(rangeStart, dhcpOfferNetmask) !== getNetwork(rangeEnd, dhcpOfferNetmask)) 
        throw new Error(`Error: the IP range is not valid.`);

    if (ipToBinary(rangeStart) >= ipToBinary(rangeEnd)) 
        throw new Error(`Error: the IP range is not valid.`);

    if (dhcpOfferGateway !== "" && !isValidIp(dhcpOfferGateway)) 
        throw new Error(`Error: expected a valid gateway instead of "${dhcpOfferGateway}".`);
    

    if (!dhcpOfferDnsServers.every(item => isValidIp(item))) 
        throw new Error(`Error: one or more of the DNS servers are not valid.`);

    if (isNaN(dhcpOfferLeaseTime)) 
        throw new Error(`Error: expected a valid lease time instead of "${dhcpOfferLeaseTime}".`);

    if (dhcpOfferLeaseTime < 120) 
        throw new Error(`Error: the lease time must be greater than 120 seconds.`);

    if (dhcpOfferLeaseTime > 86400) 
        throw new Error(`Error: the lease time must be less than 86400 seconds.`);

}
