/**
 * @description Represents a single DNS resource record with domain, type, and value fields.
 */
class dnsRecord {
    /**
     * @param {string} domain - Fully-qualified domain name (FQDN) for the record.
     * @param {string} type - Record type (e.g. "A", "CNAME", "SOA", "NS", "PTR").
     * @param {string} value - Record value (e.g. IP address, canonical name, or authority server).
     */
    constructor(domain, type, value) {
        this.domain = domain;
        this.type = type;
        this.value = value;
    }
}

/**
 * @description Returns `true` if the DNS server already has a SOA record for the given domain.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} targetDomain - Domain name to search for a SOA record.
 * @returns {boolean} `true` if a SOA record exists for `targetDomain`, `false` otherwise.
 */
function hasSoaRecord(serverObjectId, targetDomain) {

    const $networkObject = document.getElementById(serverObjectId);
    const $dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const $soaRecords = $dnsTable.querySelectorAll(".SOA");
    let found = false;

    $soaRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const domain = $fields[0].innerHTML;
        if (domain === targetDomain) found = true;
    });

    return found;

}

/**
 * @description Returns `true` if the DNS server has a NS record for the given domain.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} targetDomain - Domain name to search for a NS record.
 * @returns {boolean} `true` if a NS record exists for `targetDomain`, `false` otherwise.
 */
function hasNsRecord(serverObjectId, targetDomain) {
    const $networkObject = document.getElementById(serverObjectId);
    const $dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const $nsRecords = $dnsTable.querySelectorAll(".NS");
    let found = false;

    $nsRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const domain = $fields[0].innerHTML;
        if (domain === targetDomain) found = true;
    });

    return found;
}

/**
 * @description Returns the value (IP address) of the first A record matching the given name in
 * the DNS server's zone table, or `false` if no matching record exists.
 * @param {string} dataId - DOM id of the DNS server element.
 * @param {string} name - FQDN to look up (e.g. "www.example.com.").
 * @returns {string|false} The IP address string if found, otherwise `false`.
 */
function getARecord(dataId, name) {
    const $networkObject = document.getElementById(dataId);
    const $dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const $aRecords = $dnsTable.querySelectorAll(".A");
    let response = false;

    $aRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const domainName = $fields[0].innerHTML
        const value = $fields[2].innerHTML;
        if (domainName === name) response = value;
    });

    return response;
}

/**
 * @description Validates a SOA record before insertion. Throws a descriptive error for any
 * invalid field.
 * @param {string} dataId - DOM id of the DNS server element.
 * @param {string} domain - FQDN of the zone (must end with ".").
 * @param {string} authorityNameServer - FQDN of the primary nameserver (must end with ".").
 * @param {string|number} serial - Zone serial number (unused in validation body but passed for context).
 * @param {number} cacheTTL - Cache TTL in seconds (0–86400).
 * @returns {void}
 * @throws {Error} If any field is invalid or a SOA record already exists for the domain.
 */
function isValidSOARecord(dataId, domain, authorityNameServer, serial, cacheTTL) {
    if (!isValidDomain(domain)) throw new Error(`Error: domain ${domain} is invalid`);
    if (!domain.endsWith(".")) throw new Error(`Error: domain ${domain} must be an FQDN`);
    if (!isValidDomain(authorityNameServer)) throw new Error(`Error: authority server ${authorityNameServer} is invalid`);
    if (!authorityNameServer.endsWith(".")) throw new Error(`Error: authority server ${authorityNameServer} must be an FQDN`);
    if (isNaN(cacheTTL)) throw new Error(`Error: TTL ${cacheTTL} is not valid.`);
    if (cacheTTL < 0 || cacheTTL > 86400) throw new Error(`Error: TTL ${cacheTTL} must be a number between 0 and 86400.`);
    if (hasSoaRecord(dataId, domain)) throw new Error(`Error: A SOA record already exists for ${domain}.`);
}

/**
 * @description Validates a NS record before insertion. Throws a descriptive error for any
 * invalid field. Requires a SOA record to already exist for the domain.
 * @param {string} dataId - DOM id of the DNS server element.
 * @param {string} domain - FQDN of the zone (must end with ".").
 * @param {string} authorityNameServer - FQDN of the nameserver (must end with ".").
 * @returns {void}
 * @throws {Error} If the domain has no SOA record, or either field is not a valid FQDN.
 */
function isValidNSRecord(dataId, domain, authorityNameServer) {
    if (!hasSoaRecord(dataId, domain)) throw new Error(`Error: Domain ${domain} must have a SOA record first.`);
    if (!isValidDomain(domain)) throw new Error("Error: Invalid Domain");
    if (!domain.endsWith(".")) throw new Error("Error: Domain Must Be An FQDN");
    if (!isValidDomain(authorityNameServer)) throw new Error("Error: Invalid Authority");
    if (!authorityNameServer.endsWith(".")) throw new Error("Error: Authority Must Be An FQDN");
}

/**
 * @description Validates an A record before insertion. Requires that the extracted domain already
 * has SOA and NS records.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} name - FQDN of the host (must end with "."; domain extracted from the second label onward).
 * @param {string} value - IPv4 address for the A record.
 * @returns {void}
 * @throws {Error} If the name or IP is invalid, or if the domain lacks SOA/NS records.
 */
function isValidARecord(serverObjectId, name, value) {
    if (!isValidDomain(name)) throw new Error(`Error: Name ${name} Is Invalid`);
    const domain = name.split(".").slice(1).join("."); //<-- extraemos el dominio del nombre
    if (!hasSoaRecord(serverObjectId, domain)) throw new Error(`Error: Domain ${domain} must have a SOA record first.`);
    if (!hasNsRecord(serverObjectId, domain)) throw new Error(`Error: Domain ${domain} must have a NS record first.`);
    if (!name.endsWith(".")) throw new Error(`Error: Name ${name} must be an FQDN`);
    if (!isValidIp(value)) throw new Error(`Error: IP ${value} Is Invalid`);
}

/**
 * @description Validates a CNAME record before insertion. Requires that an A record already
 * exists for the canonical name being aliased.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} alias - FQDN alias (must end with ".").
 * @param {string} name - Canonical FQDN that the alias points to (must end with "." and have an A record).
 * @returns {void}
 * @throws {Error} If either domain is invalid, not an FQDN, or `name` has no A record.
 */
function isValidCNAMERecord(serverObjectId, alias, name) {
    if (!isValidDomain(alias)) throw new Error(`Error: Domain ${alias} is invalid`);
    if (!alias.endsWith(".")) throw new Error(`Error: domain ${alias} must be an FQDN`);
    if (!isValidDomain(name)) throw new Error(`Error: Domain ${name} is invalid`);
    if (!name.endsWith(".")) throw new Error(`Error: domain ${name} must be an FQDN`);
    if (!getARecord(serverObjectId, name)) throw new Error(`Error: Domain ${name} must have an A record first.`);
}

/**
 * @description Resolves a domain name against the `/etc/hosts` file of a network device.
 * Returns the associated IP address if found, or `false` if the domain is not listed.
 * @param {string} networkObjectId - DOM id of the network device element.
 * @param {string} inputDomain - Domain name to look up in `/etc/hosts`.
 * @returns {string|false} IP address string if found, otherwise `false`.
 */
function getDomainFromEtcHosts(networkObjectId, inputDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    let response = false; //<-- initialize response to false
    const fileSystem = new FileSystem($networkObject); //<-- create a filesystem object
    const directoryPath = pathBuilder("/etc/hosts");
    const fileName = directoryPath.pop();

    try {

        const etcHostsContent = fileSystem.read(fileName, directoryPath); //<-- read the file content
        const lines = etcHostsContent.split("\n"); //<-- split the content into lines

        lines.forEach(line => {
            const tokens = line.replace(/\s+/g, " ").trim().split(" "); //<-- split the line into tokens
            const lineIp = tokens[0]; //<-- get the IP from each line
            const lineDomains = tokens.slice(1); //<-- get the associated domains

            lineDomains.forEach(domain => {
                if (domain === inputDomain) response = lineIp; //<-- if the domain matches the one we're looking for, return the IP
            });

        });

    } catch (e) {

        response = false;

    }

    return response;

}

/**
 * @description Appends a DNS resource record to the server's zone table. For A records, also
 * automatically generates the corresponding PTR reverse-lookup record.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {dnsRecord} newrecord - Record object to insert.
 * @param {string} newrecord.domain - FQDN for the record.
 * @param {string} newrecord.type - Record type ("A", "CNAME", "SOA", "NS", "PTR", etc.).
 * @param {string} newrecord.value - Record value.
 * @param {string} [newrecord.serial] - Serial number (SOA records only).
 * @param {number} [newrecord.cacheTTL] - Cache TTL in seconds (SOA records only).
 * @returns {void}
 */
function addDnsEntry(serverObjectId, newrecord) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table")
    const $newRecord = document.createElement("tr");

    if (newrecord.type.toUpperCase() === "SOA") {
        $newRecord.setAttribute("data-serial", newrecord.serial);
        $newRecord.setAttribute("data-cache-ttl", newrecord.cacheTTL);
    }

    $newRecord.innerHTML = `
        <td>${newrecord.domain}</td>
        <td>${(newrecord.type).toUpperCase()}</td>
        <td>${newrecord.value}</td>
    `;

    $newRecord.classList.add(newrecord.type.toUpperCase()); //<-- add the record type to the row
    $dnsTable.appendChild($newRecord);

    if (newrecord.type.toUpperCase() === "A") { //<-- for A records, a PTR reverse-lookup record is automatically generated
        const ptrRecord = document.createElement("tr");
        ptrRecord.innerHTML = `
            <td>${(newrecord.value).split(".").reverse().join(".") + ".IN-ADDR.ARPA."}</td>
            <td>PTR</td>
            <td>${newrecord.domain}</td>
        `;
        ptrRecord.classList.add("PTR");
        $dnsTable.appendChild(ptrRecord);
    }

}

/**
 * @description Removes a DNS record of the given type and domain from the server's zone table.
 * Deleting a SOA record drops the entire zone (all records whose domain matches or ends with the
 * zone domain). Deleting an A record also removes the auto-generated PTR record.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} recordType - Record type to delete (e.g. "A", "CNAME", "SOA", "NS").
 * @param {string} targetDomain - FQDN of the record to delete.
 * @returns {void}
 */
function delDnsEntry(serverObjectId, recordType, targetDomain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");

    if (recordType.toUpperCase() === "SOA") { //<-- for SOA records, the entire zone is dropped
        dropDnsZone(serverObjectId, targetDomain);
        return;
    }

    const $records = $dnsTable.querySelectorAll(`.${recordType.toUpperCase()}`);

    $records.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const domain = $fields[0].innerHTML;
        if (domain === targetDomain) $record.remove();
    });

    if (recordType.toUpperCase() === "A") { //<-- for A records, the associated PTR record is also removed
        const $ptrRecords = $dnsTable.querySelectorAll(`.${"PTR"}`);
        $ptrRecords.forEach($ptrRecord => {
            const $ptrFields = $ptrRecord.querySelectorAll("td");
            const domain = $ptrFields[2].innerHTML;
            if (domain === targetDomain) $ptrRecord.remove();
        });
    }

}

/**
 * @description Formats a DNS reply packet into a `dig`-like output string and sends it to the
 * terminal of the given network object.
 * @param {Object} packet - DNS reply packet object.
 * @param {string} packet.query - Queried domain name.
 * @param {string|string[]} [packet.answer] - Answer value(s).
 * @param {string} packet.answer_type - Record type of the answer (e.g. "A", "SOA").
 * @param {string} [packet.authority="0"] - "1" if the response is from an authority server.
 * @param {string} [packet.authority_domain=""] - Domain for the authority section.
 * @param {string} [packet.serial=""] - Serial number (SOA authority responses only).
 * @param {string} [packet.cache_ttl=""] - Cache TTL (SOA authority responses only).
 * @param {string} packet.origin_ip - IP address of the responding server.
 * @param {string} networkObjectId - DOM id of the network object whose terminal receives the output.
 * @returns {void}
 */
function generateDnsOuput(packet, networkObjectId) {

    const currentDate = new Date();
    const currentDateString = currentDate.toString();
    const query = packet.query;
    const answer = packet.answer || "";
    const answer_type = packet.answer_type;
    const authority = packet.authority || "0"; //only for SOA
    const authority_domain = packet.authority_domain || ""; //only for SOA
    const serial = packet.serial || ""; //only for SOA
    const cache_ttl = packet.cache_ttl || ""; //only for SOA
    const server_ip = packet.origin_ip;
    const answerBoolean = (!answer || (authority === "1" && query !== authority_domain)) ? "0" : "1";

    //header
    let message = `QUERY: 1, ANSWER: ${answerBoolean}, AUTHORITY: ${authority}, ADDITIONAL: 0\n`;

    //query section
    message += `\nQUESTION SECTION:\n`;
    message += `${query.padEnd(15, " ")} IN ${answer_type}\n`;

    //answer section

    if (answer && authority === "0") {

        message += `\nANSWER SECTION:\n`;

        for (let i = 0; i < answer.length; i++) {
            message += `${query.padEnd(15, " ")} 86400 IN ${answer_type} ${answer[i]}\n`;
        }

    }

    //authority section

    if (authority !== "0") {
        message += `\nAUTHORITY SECTION:\n`;
        message += `${authority_domain.padEnd(15, " ")} 86400 IN ${answer_type} ${answer} ${serial} ${cache_ttl}\n`;
    }

    //time section
    message += `\nQuery time: 4 msec\n`;
    message += `SERVER: ${server_ip}#53(${server_ip}) (UDP)\n`;
    message += `WHEN: ${currentDateString}\n`;
    message += `MSG SIZE  rcvd: 87\n`;

    terminalMessage(message, networkObjectId);
}

/**
 * @description Looks up a domain in the DNS cache table of a network device. Handles CNAME
 * chaining by recursively resolving aliases. The target domain is normalised to an FQDN before
 * matching.
 * @param {string} networkObjectId - DOM id of the network device element.
 * @param {string} targetDomain - Domain name to look up (trailing "." added if absent).
 * @returns {[string, string, string]|[false, false, false]} Tuple of [recordType, value, serverIp]
 *   if found, or [false, false, false] if not in cache.
 */
function isDomainInCacheDns(networkObjectId, targetDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const $records = dnsTable.querySelectorAll("tr");
    let FQDN_targetDomain = targetDomain;

    if (!targetDomain.endsWith(".")) FQDN_targetDomain = FQDN_targetDomain + ".";

    let i = 1;

    while (i < $records.length) {

        const $row = $records[i];
        const $server = $row.getAttribute("data-server");
        const $cells = $row.querySelectorAll("td");
        const domain = $cells[0].innerHTML;
        const type = $cells[1].innerHTML;
        const value = $cells[2].innerHTML;

        if (domain === FQDN_targetDomain) {

            if (type === "A" || type === "PTR") return [type, value, $server];

            if (type === "CNAME") {
                const [translationType, translation] = isDomainInCacheDns(networkObjectId, value);
                return [translationType, translation, $server];
            }

        }

        i++;

    }

    return [false, false, false];

}

/**
 * @description Adds a DNS reply record to the DNS cache table of a client device and starts a
 * TTL timer that will automatically remove the entry after the reply's cache TTL expires.
 * @param {string} networkObjectId - DOM id of the network device element.
 * @param {Object} dnsReplyPacket - DNS reply packet whose first answer is cached.
 * @param {string} dnsReplyPacket.query - Domain name that was queried.
 * @param {string} dnsReplyPacket.answer_type - Record type (e.g. "A").
 * @param {string[]} dnsReplyPacket.answer - Array of answer values; the first element is cached.
 * @param {string} dnsReplyPacket.origin_ip - IP of the server that provided the answer.
 * @param {number} dnsReplyPacket.cache_ttl - TTL in seconds for this cache entry.
 * @returns {void}
 */
function addDnsCacheEntry(networkObjectId, dnsReplyPacket) {

    const $networkObject = document.getElementById(networkObjectId);
    const $dnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const $newRow = document.createElement("tr");

    //destructure the reply packet

    let domain = dnsReplyPacket.query;
    const recordType = dnsReplyPacket.answer_type;
    const value = dnsReplyPacket.answer[0]; //take the first value
    const server = dnsReplyPacket.origin_ip;
    const ttl = dnsReplyPacket.cache_ttl;

    //names are stored as FQDNs

    if (!domain.endsWith(".")) domain = domain + ".";

    //add the record

    $newRow.innerHTML = `
        <td>${domain}</td>
        <td>${recordType}</td>
        <td>${value}</td>
    `;

    $newRow.setAttribute("data-server", server);
    $dnsTable.appendChild($newRow);

    //start a TTL timer for the DNS cache entry

    console.log(`DNS record for ${domain} added to ${networkObjectId} for ${ttl} seconds`);

    dnsCacheTimers[`${networkObjectId}-${domain}-${value}`] = setTimeout(() => {
        delDnsCacheEntry(networkObjectId, domain);
    }, ttl * 1000);

}

/**
 * @description Removes a DNS cache entry from the device's DNS cache table and cancels its TTL
 * timer.
 * @param {string} networkObjectId - DOM id of the network device element.
 * @param {string} domain - FQDN of the cache entry to remove.
 * @returns {void}
 */
function delDnsCacheEntry(networkObjectId, domain) {
    const $networkObject = document.getElementById(networkObjectId);
    const $cacheDnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const $records = $cacheDnsTable.querySelectorAll("tr");

    for (let i = 1; i < $records.length; i++) {
        const $record = $records[i];
        const $fields = $record.querySelectorAll("td");
        const recordDomain = $fields[0].innerText.trim();
        if (recordDomain === domain) {
            clearTimeout(dnsCacheTimers[`${networkObjectId}-${recordDomain}`]);
            delete dnsCacheTimers[`${networkObjectId}-${recordDomain}`];
            $record.remove();
            break;
        }
    }
}

/**
 * @description Appends a DNS cache entry directly to the DNS cache table of a server (without a
 * TTL timer). The domain is normalised to an FQDN before insertion.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} domain - Domain name to cache (trailing "." added if absent).
 * @param {string} recordType - Record type (e.g. "A", "CNAME").
 * @param {string} value - Cached value (e.g. IP address).
 * @returns {void}
 */
function addDnsCacheEntryServer(serverObjectId, domain, recordType, value) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".cache-dns-table").querySelector("table");
    const newRow = document.createElement("tr");

    //names are stored as FQDNs

    if (!domain.endsWith(".")) domain = domain + ".";

    //add the record

    newRow.innerHTML = `
        <td>${domain}</td>
        <td>${recordType}</td>
        <td>${value}</td>
    `;

    dnsTable.appendChild(newRow);

}

/**
 * @description Searches the DNS server's zone table for records (A, PTR, or CNAME) that match
 * the target domain and returns their values. CNAME lookups are resolved recursively.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} targetDomain - FQDN to look up in the zone table.
 * @returns {string[]|false} Array of matching record values, or `false` if no match is found.
 */
function iterativeDnsQuery(serverObjectId, targetDomain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const $records = $dnsTable.querySelectorAll("tr");
    const response = [];

    $records.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        if ($fields.length === 0) return;
        const domain = $fields[0].innerHTML;
        const recordType = $fields[1].innerHTML;
        const value = $fields[2].innerHTML;
        if (domain === targetDomain && (recordType === "A" || recordType === "PTR")) response.push(value);
        //for CNAME records, resolve the domain they point to
        if (domain === targetDomain && recordType === "CNAME") response.push(iterativeDnsQuery(serverObjectId, value));
    });

    if (response.length === 0) return false;

    return response;

}

/**
 * @description Removes all DNS records belonging to the given zone (SOA domain). A record is
 * considered part of the zone if its domain equals the zone domain or ends with `.<zoneDomain>`.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} domain - FQDN of the zone to drop (e.g. "example.com.").
 * @returns {void}
 */
function dropDnsZone(serverObjectId, domain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const $dnsRecords = $dnsTable.querySelectorAll("tr");

    $dnsRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        if ($fields.length === 0) return;
        const name = $fields[0].innerHTML;
        if (name === domain || name.endsWith(`.${domain}`)) $record.remove();
    });

}

/**
 * @description Returns the SOA record details for the zone that the target domain belongs to.
 * A zone match occurs when `targetDomain` equals the SOA domain or ends with `.<soaDomain>`.
 * @param {string} serverObjectId - DOM id of the DNS server element.
 * @param {string} targetDomain - FQDN to find the authoritative SOA for.
 * @returns {Object} Object with keys `authorityNameServer`, `authorityDomain`, `serial`, and
 *   `cacheTTL`. Returns an empty object if no matching SOA is found.
 */
function getSoaRecord(serverObjectId, targetDomain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const $soaRecords = $dnsTable.querySelectorAll(".SOA");

    const response = {};

    $soaRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const soaDomain = $fields[0].innerHTML;
        if (targetDomain.endsWith(`.${soaDomain}`) || soaDomain === targetDomain) {
            response["authorityNameServer"] = $fields[2].innerHTML;
            response["authorityDomain"] = soaDomain;
            response["serial"] = $record.getAttribute("data-serial");
            response["cacheTTL"] = $record.getAttribute("data-cache-ttl");
        }
    });

    return response;

}

/**
 * @description Reads the list of configured nameservers from the device's `/etc/resolv.conf`
 * file and returns them as an array of IP address strings. Lines that are empty, commented out,
 * or do not start with `nameserver` are ignored. Only entries with valid IPs are included.
 * @param {string} networkObjectId - DOM id of the network device element.
 * @returns {string[]} Array of DNS server IP address strings.
 */
function getDnsServers(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);
    const fileContent = networkObjectFileSystem.read("resolv.conf", ["etc"]);
    return fileContent.split("\n")
        .map(line => line.trim().replace(/\s+/g, " "))
        .filter(line => line !== "" && !line.startsWith("#") && line.startsWith("nameserver"))
        .map(line => line.split(" ")[1])
        .filter(line => isValidIp(line));
}

/**
 * @description Writes the list of DNS servers to the device's `/etc/resolv.conf` file,
 * replacing any existing content.
 * @param {string} networkObjectId - DOM id of the network device element.
 * @param {string[]} dnsServers - Array of DNS server IP address strings to write.
 * @returns {void}
 */
function setDnsServers(networkObjectId, dnsServers) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);
    let fileContent = "";
    dnsServers.forEach(dnsServer => fileContent += `nameserver ${dnsServer}\n`);
    networkObjectFileSystem.write("resolv.conf", ["etc"], fileContent);
}

/**
 * @description Clears the DNS cache table of a network device, replacing all rows with the
 * original header row only.
 * @param {string} networkObjectId - DOM id of the network device element.
 * @returns {void}
 */
function flushDnsCache(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $cacheDnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    $cacheDnsTable.innerHTML = `
        <tr>
            <th>Domain</th>
            <th>Record Type</th>
            <th>Value</th>
        </tr>
    `;
}
