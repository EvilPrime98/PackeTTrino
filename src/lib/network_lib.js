/**
 * @description Generates a random 48-bit MAC address in colon-separated hexadecimal notation.
 * @returns {string} MAC address string (e.g. "a1:b2:c3:d4:e5:f6").
 */
// [agent-added: esm-migration phase 04]
export function getRandomMac() {
    //generate the random 48 bits
    let macString = "";
    for (let i = 1; i <= 48; i++) {
        macString += Math.floor(Math.random() * 2);
    }
    //split into 8-bit blocks
    const macBlocks = macString.match(/.{1,8}/g) || [];
    //convert each block to hexadecimal
    for (let i = 0; i < macBlocks.length; i++) {
        macBlocks[i] = (parseInt(macBlocks[i], 2).toString(16)).padStart(2, '0');
    }
    //join the blocks into a string
    const mac = macBlocks.join(':');
    return mac;
}

/**
 * @description Computes the network address for a given IP and subnet mask by applying a
 * bitwise AND between corresponding octets.
 * @param {string} ip - IPv4 address in dotted-decimal notation.
 * @param {string} netmask - Subnet mask in dotted-decimal notation.
 * @returns {string} Network address in dotted-decimal notation.
 */
// [agent-added: esm-migration phase 04]
export function getNetwork(ip, netmask) {
    if (!isValidIp(ip)) throw new Error("networkd: Error: Invalid IP address.");
    if (!isValidIp(netmask)) throw new Error("networkd: Error: Invalid subnet mask.");
    ip = ip.split('.'); //split each IP octet
    netmask = netmask.split('.'); //split each netmask octet
    const network = [];
    for (let i = 0; i < 4; i++) {
        network[i] = ip[i] & netmask[i]; //apply AND between each IP and netmask octet
    }
    return network.join('.'); //join the results
}

/**
 * @description Computes the broadcast address for a given IP and subnet mask.
 * @param {string} ip - IPv4 address in dotted-decimal notation.
 * @param {string} netmask - Subnet mask in dotted-decimal notation.
 * @returns {string} Broadcast address in dotted-decimal notation.
 */
// [agent-added: esm-migration phase 04]
export function getBroadcast(ip, netmask) {
    return binaryToIp((ipToBinary(ip)).slice(0, ipToBinary(netmask).split("0")[0].length).padEnd(32, "1"))
}

/**
 * @description Converts a dotted-decimal IPv4 address to a 32-character binary string.
 * @param {string} ip - IPv4 address in dotted-decimal notation.
 * @returns {string} 32-character binary string (e.g. "11000000101010000000000000000001").
 * @throws {Error} If `ip` is not a valid IPv4 address.
 */
// [agent-added: esm-migration phase 04]
export function ipToBinary(ip) {
    if (!isValidIp(ip)) throw new Error("networkd: Error: Invalid IP address.");
    return ip
    .split('.')
    .map(oct => parseInt(oct).toString(2).padStart(8, "0"))
    .join('')
}

/**
 * @description Converts a 32-character binary string to a dotted-decimal IPv4 address.
 * @param {string} binary - 32-character binary string.
 * @returns {string} IPv4 address in dotted-decimal notation.
 */
// [agent-added: esm-migration phase 04]
export function binaryToIp(binary) {
    if (typeof binary !== 'string') throw new Error("networkd: Error: Invalid binary string.");
    if (binary.length !== 32) throw new Error("networkd: Error: Invalid binary string.");
    return binary
    .match(/.{8}/g)
    .map(b => parseInt(b, 2).toString(10))
    .join(".");   
}

/**
 * @description Converts a dotted-decimal subnet mask to its CIDR prefix length (without the "/").
 * @param {string} netmask - Subnet mask in dotted-decimal notation (e.g. "255.255.255.0").
 * @returns {number} CIDR prefix length (e.g. 24).
 */
// [agent-added: esm-migration phase 04]
export function netmaskToCidr(netmask) {
    if (!isValidIp(netmask)) throw new Error("networkd: Error: Invalid subnet mask.");
    return netmask
    .split('.')
    .map(octet => parseInt(octet).toString(2).padStart(8, '0'))
    .join('')
    .split('0')[0].length;
}

/**
 * @description Parses a CIDR notation string (e.g. "192.168.0.0/24") and returns the base IP
 * address and the corresponding subnet mask in dotted-decimal notation.
 * @param {string} cidr - IP address with CIDR prefix (e.g. "192.168.1.0/24").
 * @returns {[string, string]} Tuple of [ip, netmask] in dotted-decimal notation.
 */
// [agent-added: esm-migration phase 04]
export function parseCidr(cidr) {
    if (!isValidCidrIp(cidr)) throw new Error("networkd: Error: Invalid CIDR.");
    const ip = cidr.split("/")[0]; //192.168.0.0
    const netmask = parseInt(cidr.split("/")[1]); //24
    let dummy = "";
    for (let i = 1; i <= netmask; i++) {
        dummy += "1"; //"11111111....1"
    }
    dummy = dummy.padEnd(32, "0"); //"1111111..100....0"
    const dummy_octets = dummy.match(/.{8}/g) || []; //["11111111", ...,  "100....0"]
    for (let i = 0; i < dummy_octets.length; i++) {
        dummy_octets[i] = parseInt(dummy_octets[i], 2).toString(10); //[255, 255, ..., 0]
    }
    const netmaskBinary = dummy_octets.join(".")

    return [ip, netmaskBinary];
}

/**
 * @description Returns `true` if the given string is a valid IPv4 address in dotted-decimal
 * notation, with each octet in the range 0–255.
 * @param {string} ip - String to validate.
 * @returns {boolean} `true` if valid, `false` otherwise.
 */
// [agent-added: esm-migration phase 04]
export function isValidIp(ip) {
    if (typeof ip !== 'string') return false;
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(ip);
}

/**
 * @description Updates the MAC address cell for the given network object in a switch's MAC
 * address table. Also resets (or starts) the MAC entry TTL timer so stale entries are eventually
 * cleared.
 * @param {string} switchObjectId - DOM id of the switch element.
 * @param {string} networkObjectId - DOM id of the connected device whose MAC to update.
 * @param {string} newMac - New MAC address string to record.
 * @returns {void}
 */
// [agent-added: esm-migration phase 04]
export function updateMacEntry(switchObjectId, networkObjectId, newMac) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    //update the MAC table entry

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[0].innerHTML === networkObjectId) {
            cells[1].innerHTML = newMac;
            break;
        }
    }


    //reset or start the MAC entry timer

    if (!macEntryTimers[`${switchObjectId}-${networkObjectId}`]) {

        macEntryTimers[`${switchObjectId}-${networkObjectId}`] = setTimeout(() => {
            deleteMacEntry(switchObjectId, networkObjectId);
        }, $MACENTRYTTL * 1000);

        console.log(`MAC timer started for ${switchObjectId}-${networkObjectId}`);

    } else {

        clearTimeout(macEntryTimers[`${switchObjectId}-${networkObjectId}`]);
        macEntryTimers[`${switchObjectId}-${networkObjectId}`] = setTimeout(() => {
            deleteMacEntry(switchObjectId, networkObjectId);
        }, $MACENTRYTTL * 1000);

        console.log(`MAC timer reset for ${switchObjectId}-${networkObjectId}`);

    }

}

/**
 * @description Clears the MAC address cell for the given device in the switch's MAC address table
 * and cancels its TTL timer.
 * @param {string} switchObjectId - DOM id of the switch element.
 * @param {string} networkObjectId - DOM id of the connected device whose MAC entry to delete.
 * @returns {void}
 */
// [agent-added: esm-migration phase 04]
export function deleteMacEntry(switchObjectId, networkObjectId) {

    const $switchObject = document.getElementById(switchObjectId);
    const $macTable = $switchObject.querySelector("table");
    const $records = $macTable.querySelectorAll("tr");

    for (let i = 1; i < $records.length; i++) {
        const $record = $records[i];
        const $fields = $record.querySelectorAll("td");
        if ($fields[0].innerHTML === networkObjectId) {
            $fields[1].innerHTML = "";
            delete macEntryTimers[`${switchObjectId}-${networkObjectId}`];
            console.log(`MAC timer cleared for ${switchObjectId}-${networkObjectId}`);
            break;
        }
    }

}

/**
 * @description Appends a new port row to the switch's MAC address table, assigning the next
 * available FastEthernet port number.
 * @param {string} switchId - DOM id of the switch element.
 * @param {string} itemdId - DOM id of the device being connected to the switch.
 * @returns {void}
 */
// [agent-added: esm-migration phase 04]
export function addSwitchPort(switchId, itemdId) {
    const $switchObject = document.getElementById(switchId);
    const $macTable = $switchObject.querySelector("table");
    const $records = $macTable.querySelectorAll("tr");
    const $newMac = document.createElement("tr");
    $newMac.innerHTML = `
        <tr>
            <td class="device-name">${itemdId}</td>
            <td class="mac-address"></td>
            <td class="physical-port">FA0/${$records.length}</td>
        </tr>`;
    $macTable.appendChild($newMac);
}

/**
 * @description Removes the MAC table row associated with the given device from the switch.
 * @param {string} switchId - DOM id of the switch element.
 * @param {string} networkObjectId - DOM id of the device whose port row to remove.
 * @returns {void}
 */
// [agent-added: esm-migration phase 04]
export function deleteSwitchPort(switchId, networkObjectId) {
    const switchObject = document.getElementById(switchId);
    const table = switchObject.querySelector("table");
    const tds = table.querySelectorAll("td");

    for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        if (td.innerHTML === networkObjectId) {
            const tr = td.parentElement;
            tr.remove();
            break;
        }
    }
}

/**
 * @description Returns `true` if the given CIDR notation string represents a valid IPv4 address
 * with a prefix length between 0 and 32.
 * @param {string} cidr - String in the form "a.b.c.d/n" to validate.
 * @returns {boolean} `true` if both the IP part and the prefix length are valid, `false` otherwise.
 */
// [agent-added: esm-migration phase 04]
export function isValidCidrIp(cidr) {
    const ip = cidr.split("/")[0];
    const netmask = parseInt(cidr.split("/")[1]);
    if (!isValidIp(ip)) return false;
    if (isNaN(netmask) || netmask < 0 || netmask > 32) return false;
    return true;
}

/**
 * @description Returns `true` if the given string is a syntactically valid DNS domain name.
 * @param {string} domain - Domain name string to validate (may include a trailing dot for FQDNs).
 * @returns {boolean} `true` if the domain is valid, `false` otherwise.
 */
// [agent-added: esm-migration phase 04]
export function isValidDomain(domain) {
    return /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])\.?$/.test(domain);
}

/**
 * @description Returns `true` if the given string is a valid colon-separated MAC address.
 * @param {string} mac - MAC address string (e.g. "aa:bb:cc:dd:ee:ff").
 * @returns {boolean} `true` if the MAC address format is valid, `false` otherwise.
 */
// [agent-added: esm-migration phase 04]
export function isValidMac(mac) {
    if (typeof mac !== 'string') return false;
    return /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

/**
 * @description Returns the contents of the MAC address column for all port rows in a switch's
 * MAC table as an array (including empty strings for ports that have not yet learned a MAC).
 * @param {string} switchObjectId - DOM id of the switch element.
 * @returns {string[]} Array of MAC address strings indexed by port row order.
 */
// [agent-added: esm-migration phase 04]
export function getMACTable(switchObjectId) {

    const switchOriginObject = document.getElementById(switchObjectId);

    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");

    const macs = [];

    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    return macs;

}

/**
 * @description Returns `true` if the switch's MAC address table contains no port rows (only the
 * header row remains).
 * @param {string} switchObjectId - DOM id of the switch element.
 * @returns {boolean} `true` if the table has no device entries, `false` otherwise.
 */
// [agent-added: esm-migration phase 04]
export function isMacTableEmpty(switchObjectId) {

    const tabla = document.getElementById(switchObjectId).querySelector("table");
    const matriz = [];

    for (const fila of tabla.rows) {
        const filaArray = [];
        for (const celda of fila.cells) {
            filaArray.push(celda.innerText.trim());
        }
        matriz.push(filaArray);
    }

    if (matriz.length === 1) {
        return true;
    } else {
        return false;
    }

}

/**
 * @description Returns `true` if the given MAC address is already recorded in any port row of the
 * switch's MAC address table.
 * @param {string} switchObjectId - DOM id of the switch element.
 * @param {string} macAddress - MAC address string to search for.
 * @returns {boolean} `true` if the MAC is present, `false` otherwise.
 */
// [agent-added: esm-migration phase 04]
export function isMacInMACTable(switchObjectId, macAddress) {

    const macs = getMACTable(switchObjectId);

    for (let i = 0; i < macs.length; i++) {

        const mac = macs[i];

        if (mac === macAddress) {
            return true;
        }

    }

    return false;

}

/**
 * @description Returns the device (port) id associated with the given MAC address in a switch's
 * MAC address table.
 * @param {string} switchObjectId - DOM id of the switch element.
 * @param {string} mac - MAC address to look up.
 * @returns {string|undefined} The device id string if found, or `undefined` if not found.
 */
// [agent-added: esm-migration phase 04]
export function getDeviceFromMac(switchObjectId, mac) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[1].innerHTML === mac) {
            return cells[0].innerHTML;
        }

    }
}

/**
 * @description Returns the list of device ids connected to the switch as recorded in the
 * device-name column of the MAC address table.
 * @param {string} switchObjectId - DOM id of the switch element.
 * @returns {string[]} Array of connected device DOM id strings.
 */
// [agent-added: esm-migration phase 04]
export function getDeviceTable(switchObjectId) {

    const switchOriginObject = document.getElementById(switchObjectId);

    const devices = switchOriginObject.querySelector("table").querySelectorAll(".device-name");

    const devicesArray = [];

    for (let i = 0; i < devices.length; i++) {
        devicesArray.push(devices[i].innerHTML);
    }

    return devicesArray;

}

/**
 * @description Escapes special HTML characters in a string to prevent XSS when inserting
 * user-supplied content into the DOM via `innerHTML`.
 * @param {string} str - Input string to escape.
 * @returns {string} HTML-escaped string.
 */
// [agent-added: esm-migration phase 04]
export function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
}

/**
 * @description Parses a getopts-style option string and an argument string into an object of
 * recognised option flags and their values. The `options` string must begin with ":" and follow
 * the getopts format where a letter followed by ":" expects a value.
 * @param {string} options - getopts-style option spec (e.g. ":ab:c" for flags -a, -b <val>, -c).
 * @param {string} string - Space-separated argument string to parse (e.g. "-a -b foo").
 * @returns {Object.<string, string>} Object keyed by recognised option flags (e.g. {"-a": "", "-b": "foo"}).
 * @throws {Error} If `options` does not start with ":", or if an unrecognised option is encountered.
 */
// [agent-added: esm-migration phase 04]
export function getopts(options, string) {

    options = options.replace(/ /g, "");

    if (options.charAt(0) !== ":") {
        throw new Error("Syntax error");
    }

    const optionsObject = {};

    for (let i = 0; i < options.length; i++) {
        if (options.charAt(i) !== ":") optionsObject["-" + options.charAt(i)] = (options.charAt(i + 1) === ":") ? "value" : "novalue";
    }

    string = string.split(" ");

    response = {};

    for (let i = 0; i < string.length; i++) {
        if (optionsObject[string[i]]) {
            response[string[i]] = "";
            if (optionsObject[string[i]] === "value") {
                response[string[i]] = string[i + 1];
                i++;
            }
        } else {
            throw new Error("Unrecognised option");
        }
    }

    return response;
}

/**
 * @description Parses an argument array (starting from the second element, skipping the command
 * name) using a provided options specification array. Stops at the first non-option argument and
 * records the index of the last parsed option in the `IND` key.
 * @param {string[]} options - Array of option names; names ending with ":" expect a following value argument.
 * @param {string[]} args - Full argument array including the command as the first element.
 * @returns {Object.<string, string>} Object keyed by matched option names plus `IND` (last parsed index).
 */
// [agent-added: esm-migration phase 04]
export function catchopts(options, args) {

    const optionsObject = {};

    for (let i = 0; i < options.length; i++) {
        if (options[i].endsWith(":")) {
            optionsObject[options[i].slice(0, -1)] = "value";
        } else {
            optionsObject[options[i]] = "novalue";
        }
    }

    response = {};
    response["IND"] = 0;

    for (let i = 1; i < args.length; i++) { //skip the first element (the command name)
        if (optionsObject[args[i]]) {
            response["IND"] = i;
            response[args[i]] = "";
            if (optionsObject[args[i]] === "value") {
                response[args[i]] = args[i + 1];
                i++;
                response["IND"] = i;
            }
        } else {
            break;
        }
    }

    return response;
}

/**
 * @description Returns the list of interface names available on a network device in order
 * (enp0s3, enp0s8, enp0s9, …). Accepts either a DOM id string or the element itself.
 * @param {string|Element} identifier - DOM id of the network object or the element itself.
 * @returns {string[]} Array of interface name strings (e.g. ["enp0s3", "enp0s8"]).
 */
// [agent-added: esm-migration phase 04]
export function getInterfaces(identifier) {

    const $networkObject = (typeof identifier === "string") ? document.getElementById(identifier) : identifier;
    const response = [];
    let index = 3;
    let networkInterface = $networkObject.getAttribute("ip-enp0s" + index);

    while (networkInterface !== null) {
        response.push(`enp0s` + index);
        if (index === 3) index = 8;
        else index++;
        networkInterface = $networkObject.getAttribute("ip-enp0s" + index);
    }

    return response;

}

/**
 * @description Returns `true` if the device has at least one interface connected to a switch, or
 * (for switches) if the device table has at least one entry.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {boolean} `true` if connected, `false` otherwise.
 */
// [agent-added: esm-migration phase 04]
export function isConnected(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchAttribute = $networkObject.getAttribute("data-switch-enp0s" + index);

    while (switchAttribute !== null) {
        if (switchAttribute !== "") return true;
        if (index === 3) index = 8;
        else index++;
        switchAttribute = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    if (networkObjectId.startsWith("switch-")) return getDeviceTable(networkObjectId).length !== 0;

    return false;

}

/**
 * @description Returns the name of the first interface on the device that has no switch connection
 * (i.e. its `data-switch-<iface>` attribute is an empty string). Returns `false` if all interfaces
 * are in use.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {string|false} Interface name (e.g. "enp0s3") if an available interface exists, otherwise `false`.
 */
// [agent-added: esm-migration phase 04]
export function getAvailableInterface(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);

    while (switchConn !== null) {
        if (switchConn === "") return `enp0s${index}`;
        if (index === 3) index = 8;
        else index++;
        switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    return false;
}

/**
 * @description Returns the IP address, subnet mask, and MAC address for a given interface of a
 * network device.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} iface - Interface name (e.g. "enp0s3").
 * @returns {[string, string, string]} Tuple of [ip, netmask, mac].
 */
// [agent-added: esm-migration phase 04]
export function getIfaceData(networkObjectId, iface) {
    const $networkObject = document.getElementById(networkObjectId);
    return [$networkObject.getAttribute("ip-" + iface), $networkObject.getAttribute("netmask-" + iface), $networkObject.getAttribute("mac-" + iface)];
}

/**
 * @description Returns the IP address, subnet mask, and MAC address for the interface of a device
 * that is connected to a specific switch.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} switchObjectId - DOM id of the switch to match against.
 * @returns {[string, string, string]|[false, false, false]} Tuple of [ip, netmask, mac] for the
 *   matching interface, or [false, false, false] if no interface is connected to that switch.
 */
// [agent-added: esm-migration phase 04]
export function getInterfaceSwitchInfo(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    const response = [];

    while (switchConn !== null) {

        if (switchConn === switchObjectId) {
            response.push($networkObject.getAttribute("ip-enp0s" + index));
            response.push($networkObject.getAttribute("netmask-enp0s" + index));
            response.push($networkObject.getAttribute("mac-enp0s" + index));
            return response;
        }

        if (index === 3) index = 8;
        else index++;
        switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    return [false, false, false];

}

/**
 * @description Returns the interface name on the device that is connected to the given switch,
 * or `false` if no interface is connected to that switch.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} switchId - DOM id of the switch to match.
 * @returns {string|false} Interface name (e.g. "enp0s8") or `false`.
 */
// [agent-added: esm-migration phase 04]
export function switchToInterface(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);
    let response = false;
    interfaces.forEach(iface => { if ($networkObject.getAttribute(`data-switch-${iface}`) === switchId) response = iface; });
    return response;
}

/**
 * @description Returns all non-empty IP addresses currently assigned to any interface of the
 * given network device.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {string[]} Array of IP address strings.
 */
// [agent-added: esm-migration phase 04]
export function getAvailableIps(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let networkObjectIp = $networkObject.getAttribute("ip-enp0s" + index);
    const availableIps = [];

    while (networkObjectIp !== null) {
        if (networkObjectIp !== "") availableIps.push(networkObjectIp);
        if (index === 3) index = 8;
        else index++;
        networkObjectIp = $networkObject.getAttribute("ip-enp0s" + index);
    }

    return availableIps;

}

/**
 * @description Given an IP address assigned to one of the device's interfaces, returns the
 * interface name, the switch id it is connected to, and the MAC address. Returns
 * `[false, false, false]` if the IP is not found on any interface. If multiple interfaces share
 * the same IP (unusual), the last match is returned.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} ip - IP address to search for.
 * @returns {[string|false, string|false, string|false]} Tuple of [interfaceName, switchId, mac].
 */
// [agent-added: esm-migration phase 04]
export function getInfoFromIp(networkObjectId, ip) {

    const $networkObject = document.getElementById(networkObjectId);
    const response = [false, false, false];
    let index = 3;
    let interfaceIp = $networkObject.getAttribute("ip-enp0s" + index);

    while (interfaceIp !== null) {

        if (interfaceIp === ip) {
            response[0] = `enp0s${index}`;
            response[1] = $networkObject.getAttribute("data-switch-enp0s" + index);
            response[2] = $networkObject.getAttribute("mac-enp0s" + index);
        }

        if (index === 3) index = 8;
        else index++;

        interfaceIp = $networkObject.getAttribute("ip-enp0s" + index);

    }

    return response;

}

/**
 * @description Returns the MAC addresses of all interfaces on a network device as an array,
 * in interface order (enp0s3, enp0s8, enp0s9, …).
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {string[]} Array of MAC address strings.
 */
// [agent-added: esm-migration phase 04]
export function getMacAddresses(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let mac = $networkObject.getAttribute("mac-enp0s" + index);
    const macs = [];

    while (mac !== null) {
        macs.push(mac);
        if (index === 3) index = 8;
        else index++;
        mac = $networkObject.getAttribute("mac-enp0s" + index);
    }

    return macs;

}

/**
 * @description Returns `true` if the given IP is locally assigned to any interface of the device,
 * or if it falls within the loopback range (`127.0.0.0/8`).
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} ip - IP address to check.
 * @returns {boolean} `true` if the IP is local to the device, `false` otherwise.
 */
// [agent-added: esm-migration phase 04]
export function isLocalIp(networkObjectId, ip) {

    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);
    let response = false;

    //check if it belongs to one of the device's interfaces
    for (const iface of interfaces) if ($networkObject.getAttribute(`ip-${iface}`) === ip) response = true;

    //check if it falls within the loopback range
    if (getNetwork(ip, "255.0.0.0") === "127.0.0.0") response = true;

    return response;
}

//NETWORK SIMULATION BUILD FUNCTIONS

/**
 * @description Returns the DOM element at the given position (negative indexing supported) from
 * all elements matching the CSS selector. Useful for simulation scripts that need the last or
 * second-to-last created element.
 * @param {string} selector - CSS selector string.
 * @param {number} [position=-1] - Offset from the end of the NodeList (e.g. -1 for last, -2 for second-to-last).
 * @returns {Element|undefined} The element at the computed index, or `undefined` if out of range.
 */
// [agent-added: esm-migration phase 04]
export function getLastElement(selector, position = -1) {
    const elements = document.querySelectorAll(selector);
    return elements[elements.length + position];
}

/**
 * @description Programmatically simulates a drag-and-drop cable connection between two network
 * objects by dispatching synthetic `dragstart` and `drop` events.
 * @param {Element} elementoOrigen - Source network object element.
 * @param {Element} elementoDestino - Destination network object element.
 * @returns {{originElement: Element, targetElement: Element, dataTransfer: DataTransfer}} Object
 *   with references to both elements and the shared DataTransfer instance.
 */
// [agent-added: esm-migration phase 04]
export function createConn(elementoOrigen, elementoDestino) {

    const dragstartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    const dataTransfer = new DataTransfer();

    Object.defineProperty(dragstartEvent, 'dataTransfer', {
        value: dataTransfer,
        writable: false
    });

    elementoOrigen.dispatchEvent(dragstartEvent);

    const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        view: window,
        dataTransfer: dataTransfer
    });

    elementoDestino.dispatchEvent(dropEvent);

    return {
        originElement: elementoOrigen,
        targetElement: elementoDestino,
        dataTransfer: dataTransfer
    };
}

/**
 * @description Sets IP addresses for up to three router interfaces (enp0s3, enp0s8, enp0s9) using
 * CIDR notation and updates the corresponding direct-route rows in the routing table.
 * @param {Element} $router - Router DOM element.
 * @param {string} ip1 - CIDR address for enp0s3 (e.g. "192.168.1.1/24").
 * @param {string} [ip2=""] - CIDR address for enp0s8.
 * @param {string} [ip3=""] - CIDR address for enp0s9.
 * @returns {void}
 */
// [agent-added: esm-migration phase 04]
export function setRouterIps($router, ip1, ip2 = "", ip3 = "") {

    const [newIpEnp0s3, newNetmaskEnp0s3] = parseCidr(ip1);
    const [newIpEnp0s8, newNetmaskEnp0s8] = parseCidr(ip2);
    const [newIpEnp0s9, newNetmaskEnp0s9] = parseCidr(ip3);

    $router.setAttribute("ip-enp0s3", newIpEnp0s3);
    $router.setAttribute("ip-enp0s8", newIpEnp0s8);
    $router.setAttribute("ip-enp0s9", newIpEnp0s9);
    $router.setAttribute("netmask-enp0s3", newNetmaskEnp0s3);
    $router.setAttribute("netmask-enp0s8", newNetmaskEnp0s8);
    $router.setAttribute("netmask-enp0s9", newNetmaskEnp0s9);

    const routingTable = $router.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    const ifaces = [
        { ip: newIpEnp0s3, netmask: newNetmaskEnp0s3, interface: "enp0s3" },
        { ip: newIpEnp0s8, netmask: newNetmaskEnp0s8, interface: "enp0s8" },
        { ip: newIpEnp0s9, netmask: newNetmaskEnp0s9, interface: "enp0s9" }
    ];

    ifaces.forEach((iface, index) => {
        const row = rows[index + 1];
        const cells = row.querySelectorAll("td");
        if (getNetwork(iface.ip, iface.netmask) !== "0.0.0.0") cells[0].innerHTML = getNetwork(iface.ip, iface.netmask);
        cells[1].innerHTML = iface.netmask;
        cells[2].innerHTML = iface.ip;
        cells[3].innerHTML = iface.interface;
    });

}

/**
 * @description Parses a browser-style URL or plain address into its constituent parts: protocol,
 * host/IP, port, and resource path. Defaults to HTTP (port 80) when no protocol is specified.
 * @param {string} input - URL or address string (e.g. "http://192.168.1.1:8080/index.html",
 *   "example.com/page", or "192.168.1.1").
 * @returns {{protocol: string, address: string, port: number, resource: string}} Parsed address object.
 */
// [agent-added: esm-migration phase 04]
export function parseSearch(input) {

    let protocol;
    let addressPortResource;
    let addressPort;
    let address;
    let port;
    let resource;

    //define the maps

    const protocolMap = {
        http: 80,
        https: 443,
        ptt: 80
    };

    //
    // esm-migration: scope unclear — splitFirst is defined in src/lib/component_lib.js
    const dividebyProtocol = splitFirst(input, "://");

    if (dividebyProtocol.length < 2) {
        protocol = "http";
        addressPortResource = dividebyProtocol[0];
    } else {
        protocol = dividebyProtocol[0];
        addressPortResource = dividebyProtocol[1];
    }

    const dividebyResource = splitFirst(addressPortResource, "/");

    if (dividebyResource.length < 2) {
        addressPort = dividebyResource[0];
        resource = "";
    } else {
        addressPort = dividebyResource[0];
        resource = dividebyResource[1];
    }

    const dividebyAddressPort = splitFirst(addressPort, ":");

    if (dividebyAddressPort.length < 2) {
        address = dividebyAddressPort[0];
        port = protocolMap[protocol];
    } else {
        address = dividebyAddressPort[0];
        port = parseInt(dividebyAddressPort[1]);
    }

    return {
        protocol: protocol,
        address: address,
        port: port,
        resource: resource
    }

}

/**
 * @description Returns the highest interface index number on a device. The interface naming
 * convention uses enp0s3 as the first interface and enp0s8, enp0s9, … for additional ones, so
 * the numeric suffix is what is compared.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {number|undefined} The highest interface index (e.g. 9 for "enp0s9"), or `undefined`
 *   if the device has no interfaces.
 */
// [agent-added: esm-migration phase 04]
export function maxIfaceIndex(networkObjectId) {
    return getInterfaces(networkObjectId)
        .map(iface => parseInt(iface.split("enp0s")[1]))
        .sort((a, b) => a - b)
        .pop();
}

/**
 * @description Removes all DOM attributes and routing-table rows associated with the given
 * interface from a network device. Also removes any direct routing rule that references the
 * interface.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} iface - Interface name to delete (e.g. "enp0s8").
 * @returns {void}
 */
// [agent-added: esm-migration phase 04]
export function deleteInterface(networkObjectId, iface) {

    const $networkObject = document.getElementById(networkObjectId);

    //if the interface is configured with DHCP, release it first

    //TODO -> release dhcp

    //remove the network element's attributes

    $networkObject.removeAttribute(`ip-${iface}`);
    $networkObject.removeAttribute(`netmask-${iface}`);
    $networkObject.removeAttribute(`mac-${iface}`);
    $networkObject.removeAttribute(`data-switch-${iface}`);

    //remove routing rules that use this interface

    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $routingRules = $routingTable.querySelectorAll("tr");

    $routingRules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[3].innerHTML === iface) $rule.remove();
    });

}

/**
 * @description Adds a new network interface to a device. The new interface is assigned the next
 * available index (enp0s8 after enp0s3, then incrementing from there). Sets up all required DOM
 * attributes including a random MAC address. If DHCP client mode is active, also adds the
 * DHCP-related attributes for the new interface.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {void}
 */
// [agent-added: esm-migration phase 04]
export function addInterface(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId);
    const ifaceMaxIndex = maxIfaceIndex(networkObjectId);
    const newInterface = (ifaceMaxIndex === 3) ? "enp0s8" : `enp0s${ifaceMaxIndex + 1}`;

    //add the new interface's attributes
    $networkObject.setAttribute(`ip-${newInterface}`, "");
    $networkObject.setAttribute(`netmask-${newInterface}`, "");
    $networkObject.setAttribute(`mac-${newInterface}`, getRandomMac());
    $networkObject.setAttribute(`data-switch-${newInterface}`, "");

    //enable drag and drop for the new interface
    $networkObject.querySelector("img").draggable = true;

    //if the dhclient service is active, add the new interface's configuration
    if ($networkObject.getAttribute("dhclient") === "true") {
        $networkObject.setAttribute(`data-dhcp-server-${newInterface}`, "");
        $networkObject.setAttribute(`data-dhcp-lease-time-${newInterface}`, "");
        $networkObject.setAttribute(`data-dhcp-current-lease-time-${newInterface}`, "");
        $networkObject.setAttribute(`data-dhcp-flag-t1-${newInterface}`, "false");
        $networkObject.setAttribute(`data-dhcp-flag-t2-${newInterface}`, "false");
    }

}

/**
 * @description Returns the next-hop IP address from the device's default route row, or an empty
 * string if no default route is configured.
 * @param {string} networkObjectId - DOM id of the network object.
 * @returns {string} Default gateway IP address, or `""` if absent.
 */
// [agent-added: esm-migration phase 04]
export function getDefaultGateway(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $defaultRule = $networkObject.querySelector(".routing-table table").querySelector(".default-route");
    return $defaultRule?.querySelectorAll("td")[4]?.innerHTML || "";
}

/**
 * @description Configures the default gateway for a device by finding the direct-route row whose
 * network contains `newGateway` and writing a corresponding default route (`0.0.0.0/0.0.0.0`)
 * via `setRemoteRoutingRule`.
 * @param {string} networkObjectId - DOM id of the network object.
 * @param {string} newGateway - IP address of the default gateway to set.
 * @returns {void}
 * @throws {Error} If `newGateway` is not reachable through any directly connected network.
 */
// [agent-added: esm-migration phase 04]
export function setDefaultGateway(networkObjectId, newGateway) {

    if (!newGateway) return;

    const $networkObject = document.getElementById(networkObjectId);
    const $directRules = $networkObject.querySelector(".routing-table table").querySelectorAll(".direct-route");

    for (let i = 0; i < $directRules.length; i++) {
        const $rule = $directRules[i];
        const $fields = $rule.querySelectorAll("td");
        const ruleDestination = $fields[0].innerHTML;
        const ruleNetmask = $fields[1].innerHTML;
        const ruleGateway = $fields[2].innerHTML;
        const ruleIface = $fields[3].innerHTML;
        const ruleNextHop = $fields[4].innerHTML;

        if (getNetwork(ruleDestination, ruleNetmask) === getNetwork(newGateway, ruleNetmask)) {
            // esm-migration: scope unclear — setRemoteRoutingRule is not defined in this file
            setRemoteRoutingRule(networkObjectId,
                "0.0.0.0",
                "0.0.0.0",
                ruleGateway,
                ruleIface,
                newGateway
            );
            return;
        }
    }

    throw new Error("networkd: Error: Gateway unreachable.");

}
