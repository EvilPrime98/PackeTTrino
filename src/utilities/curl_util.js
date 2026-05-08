/**
 * Handles the `curl` terminal command to send an HTTP request from a network object.
 *
 * Parses the `-m` (method) and `-h` (show headers) options, then performs an HTTP GET request
 * (or the specified method) to the given URL. The response is printed to the terminal.
 * When `-h` is specified the status code, method, host, content-type, keep-alive, and user-agent
 * headers are included before the body. The terminal is minimised during the request when visual
 * animations are enabled.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Tokenised command arguments.
 *   Format: ["curl", ["-m", "<METHOD>"], ["-h"], "<url>"]
 * @returns {Promise<void>}
 */
async function command_curl(networkObjectId, args) {

    //option check

    const $OPTS = catchopts([
        "-m:",
        "-h",
    ], args);

    const optionHandlers = {
        "-m": () => { method = ($OPTS["-m"]).trim(); },
        "-h": () => { showHeaders = true; }
    }

    let method = "GET";
    let showHeaders = false;

    for (option in $OPTS) if (optionHandlers[option]) optionHandlers[option]();

    args = args.slice($OPTS['IND'] + 1)

    //argument check

    const url = args[0];

    if (!url) {
        terminalMessage("Error: No URL has been specified.", networkObjectId);
        return;
    }

    if (visualToggle) await minimizeTerminal();

        try {

            const search = parseSearch(url);

            const requestFunctions = {
                "http": async () => {
                    return http(networkObjectId, {
                        address: search.address,
                        method: "GET",
                        dport: search.port,
                        resource: search.resource
                    });
                }
            };

            if (!requestFunctions[search.protocol]) throw new Error(`Protocol ${search.protocol} is not valid.`);

            const httpReply = await requestFunctions[search.protocol]();

            let message = `URL:\n ${search.protocol}://${search.address}:${search.port}\n\n`;

            if (showHeaders) {
                message += `Status Code:\n ${httpReply.statusCode}\n\n`;
                message += `Method:\n ${httpReply.method}\n\n`;
                message += `Host:\n ${httpReply.host}\n\n`;
                message += `Content-Type:\n ${httpReply.contentType}\n\n`;
                message += `Keep-Alive:\n ${httpReply.keepalive}\n\n`;
                message += `User-Agent:\n ${httpReply.userAgent}\n\n`;
            }

            message += `Body:\n ${httpReply.body}`;

            terminalMessage(message, networkObjectId, false);

        } catch (error) {

            terminalMessage(`curl: ${error.message}`, networkObjectId);

        }

    if (visualToggle) await maximizeTerminal();

}
