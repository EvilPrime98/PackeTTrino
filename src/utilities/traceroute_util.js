/**
 * Executes a traceroute from a network object to a destination, tracing each hop
 * along the path. Supports the `-n` flag to suppress DNS resolution and show numeric
 * IPs only. Validates that the source node has a configured IP and netmask before
 * proceeding, and minimizes/restores the terminal during animation when visual mode
 * is active.
 *
 * Argument formats accepted:
 * - `[destination]`          — resolve hostnames at each hop
 * - `["-n", destination]`    — numeric output only, skip DNS resolution
 *
 * @param {string} networkObjectId - The DOM element ID of the source network object.
 * @param {Array<string>} args - Parsed argument list (excluding the command name itself).
 * @returns {Promise<void>}
 *
 * @example
 * await command_traceroute("pc-1", ["192.168.1.1"]);
 * await command_traceroute("pc-1", ["-n", "10.0.0.1"]);
 */
export async function command_traceroute(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);

    let destination;
    let useNumeric = false;

    if (!networkObjectIp || !networkObjectNetmask) {
        terminalMessage("traceroute: Network configuration error.", networkObjectId);
        return;
    }

    if (args.length === 1) {

        destination = args[0];

    }else if (args.length === 2 && args[0] === "-n") {

        destination = args[1];
        useNumeric = true;

    }else  {

        terminalMessage("Error: Syntax: traceroute [-n] destination", networkObjectId);
        return;

    }

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

        await traceroute(networkObjectId, destination, useNumeric);

    if (visualToggle) await maximizeTerminal();

}
