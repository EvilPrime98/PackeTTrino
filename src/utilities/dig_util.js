/**
 * Handles the `dig` terminal command to perform a DNS query from a network object.
 *
 * Supported options:
 * - `-x`: performs a reverse (PTR) lookup on the given IP address.
 * - `-t <type>`: specifies the record type (A, SOA, PTR, NS, AAAA, MX).
 * - `@ <ip>`: queries a specific DNS server instead of the configured one.
 *
 * The first non-option argument is treated as the domain name or IP to query.
 * Validation errors are printed to the terminal. On success, the DNS reply is
 * formatted and printed via `generateDnsOuput`. The terminal is minimised during
 * the operation when visual animations are enabled.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Tokenised command arguments.
 *   Format: ["dig", ["-x"], ["-t", "<type>"], ["@", "<ip>"], "<domain|ip>"]
 * @returns {Promise<void>}
 */
export async function command_dig(networkObjectId, args) {

    let opt_x = false;
    let opt_t = false;
    let opt_server = false;
    // eslint-disable-next-line no-useless-assignment
    let domain = '';
    let dnsServer = "";
    let query_type = "A";
    const validRecordTypes = ["A", "SOA", "PTR", "NS", "AAAA", "MX"];

    const $OPTS = catchopts(["-x", "-t:", "@:"], args);

    const optionsHandler = {
        "-x": () => { opt_x = true; query_type = "PTR"; },
        "-t": () => { opt_t = true; query_type = $OPTS["-t"].toUpperCase(); },
        "@": () => { opt_server = true; dnsServer = $OPTS["@"]; }
    }

    for (option in $OPTS) if (optionsHandler[option]) optionsHandler[option]();

    args = args.slice($OPTS['IND'] + 1) //<-- skip to non-option arguments

    if (args.length === 0) {
        terminalMessage("Error: missing domain or ip argument.", networkObjectId);
        return;
    }

    domain = args[0]; //<-- the first argument is the domain

    if (opt_t && !validRecordTypes.includes(query_type)) { //<-- if the query type is specified, it is checked to be a valid type
        terminalMessage("Error: unknown record type.", networkObjectId);
        return;
    }

    if (!opt_x && !isValidDomain(domain)) { //<-- if no query type is specified, it is assumed to be a valid domain
        terminalMessage("Error: the domain is not valid.", networkObjectId);
        return;
    }

    if (opt_x && !isValidIp(domain)) { //<-- if the query type is specified as PTR, the IP is checked to be valid
        terminalMessage("Error: invalid ip for reverse lookup.", networkObjectId);
        return;
    }

    if (opt_server && !isValidIp(dnsServer)) { //<-- if a DNS server is specified, it is checked to be a valid IP
        terminalMessage("Error: invalid server ip.", networkObjectId);
        return;
    }

    if (visualToggle) await minimizeTerminal();

        try {

            const dnsReply = await getDomainFromServer(
                networkObjectId,
                domain, //domain
                dnsServer, //server ip
                query_type, //record type
            );

            generateDnsOuput(dnsReply, networkObjectId);

        } catch (error) {

            console.log(error);
            terminalMessage(error.message, networkObjectId);

        }

    if (visualToggle) await maximizeTerminal();

}
