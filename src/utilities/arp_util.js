/**
 * Handles the `arp` terminal command on a network object.
 *
 * Supports two operations:
 * - `-a`: prints the current ARP table.
 * - `-f` / `--flush`: clears the ARP table.
 *
 * Prints a syntax error message for any unrecognised flag.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Tokenised command arguments. Expected format: ["arp", "-a"|"-f"|"--flush"].
 * @returns {void}
 */
function command_arp(networkObjectId, args) {

    if (args[1] === "-a") {
        const arpTable = getcurrentARPTable(networkObjectId);
        terminalMessage(arpTable, networkObjectId);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {
        clearARPTable(networkObjectId)
        terminalMessage("The ARP table has been successfully cleared.", networkObjectId);
        return;
    }

    terminalMessage("Error: Syntax: arp &lt;-n&gt; ", networkObjectId);

}
