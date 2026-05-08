/**
 * Handles the `apt` terminal command to install or remove packages on a network object.
 *
 * Validates the argument count and the sub-command, prints the usual APT status messages,
 * then delegates to `dpkg`. Any errors from `dpkg` are caught and printed to the terminal.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Tokenised command arguments. Expected format: ["apt", "install"|"remove", "<package>"].
 * @returns {void}
 */
function command_apt(networkObjectId, args) {

    const option =  args[1];
    const package = args[2];
    const availableOptions = ["install", "remove"];

    if (args.length !== 3) {
        terminalMessage("Argument error: Syntax: apt [install|remove] &lt;package name&gt;", networkObjectId);
        return;
    }

    if (!availableOptions.includes(args[1])) {
        terminalMessage(`Error: Invalid operation: ${args[1]}`, networkObjectId);
        return;
    }

    terminalMessage(`Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done`,networkObjectId);

    try {

        dpkg(networkObjectId, option, package);

    }catch(error) {

        terminalMessage(error.message, networkObjectId);

    }

}
