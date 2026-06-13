/**
 * Handles the `dns` terminal command to manage DNS zone records on a DNS server network object.
 *
 * Only available when the `named` service is active. Supports:
 * - `-s` / `--show`: prints the raw DNS records table HTML.
 * - `-f` / `--flush`: resets the DNS table to headers only.
 * - `add [<domain> <value>]`: adds a type-A record without the `-t` flag.
 * - `add -t <type> <domain> <value> [<serial> <cacheTTL>]`: adds a typed record after validation.
 * - `del <type> <domain>`: removes a specific DNS record.
 *
 * Validation errors and unsupported record types are printed to the terminal.
 *
 * @param {string} networkObjectId - The DOM element ID of the DNS server network object.
 * @param {Array<string>} args - Tokenised command arguments.
 *   Format: ["dns", <subcommand>, ...]
 * @returns {void}
 */
export function command_dns(networkObjectId, args) {

    const $serverObject = document.getElementById(networkObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const isNamedOn = $serverObject.getAttribute("named") === "true";

    if (!isNamedOn) {
        terminalMessage("Error: Utility not available on this device.", networkObjectId);
        return;
    }

    if (args[1] === "-s" || args[1] === "--show") {
        terminalMessage($dnsTable.outerHTML, networkObjectId);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {

        $dnsTable.innerHTML = `
            <tr>
                <th>Domain</th>
                <th>Type</th>
                <th>Value</th>
            </tr>
        `;

        terminalMessage("The DNS records table has been successfully cleared.", networkObjectId);
        return;
    }

    if (args[1] === "add") {

        if (args[2] !== "-t"){ //<-- if the record type is not specified, A is assumed
            const domain = args[2];
            const value = args[3];
            const record = new dnsRecord(domain, "A", value);
            addDnsEntry(networkObjectId, record);
            terminalMessage("The DNS record has been successfully added.", networkObjectId);
            return;
        }

        if (args[2] === "-t") { //<-- if the record type is specified, it is validated first

            const recordType = args[3] || "none";
            const domain = args[4];
            const value = args[5];
            const serial = args[6];
            const cacheTTL = args[7];

            const dnsRecordTypes = {
                "SOA": () => isValidSOARecord(networkObjectId, domain, value, serial, cacheTTL),
                "NS": () => isValidNSRecord(networkObjectId, domain, value),
                "A": () => isValidARecord(networkObjectId, domain, value),
                "CNAME": () => isValidCNAMERecord(networkObjectId, domain, value),
                "PTR": () => isValidPTRRecord(networkObjectId, domain, value)
            }

            if (recordType.toUpperCase() in dnsRecordTypes) { //<-- if the record type exists

                try {

                    dnsRecordTypes[recordType.toUpperCase()](); //<-- validate the record

                    const record = new dnsRecord(
                        domain,
                        recordType,
                        value,
                    );

                    record.serial = serial;
                    record.cacheTTL = cacheTTL;

                    addDnsEntry(networkObjectId, record);
                    terminalMessage(`The ${recordType.toUpperCase()} record has been successfully added.`, networkObjectId);

                } catch (error) {

                    terminalMessage(error.message, networkObjectId);

                }

            }else {

                terminalMessage("Error: Unknown Record Type.", networkObjectId);
                terminalMessage("Error: Syntax: dns add -t &lt;type&gt; &lt;domain&gt; &lt;value&gt;", networkObjectId);

            }

        }

        return;
    }

    if (args[1] === "del") { //<-- dns del <type> <domain>
        const recordType= args[2];
        const domain = args[3];
        delDnsEntry(networkObjectId, recordType, domain);
        terminalMessage("The DNS record has been successfully deleted.", networkObjectId);
        return;
    }

    terminalMessage("Error: Syntax: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]", networkObjectId);

}
