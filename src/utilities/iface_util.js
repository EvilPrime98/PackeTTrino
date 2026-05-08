/**
 * Handles the `iface` terminal command to add or remove network interfaces on a network object.
 *
 * Supported options:
 * - `--add`: adds a new interface with the next available `enp0sX` name.
 * - `--del=<interface|all>`: removes a specific interface or all removable interfaces.
 *   The base interface `enp0s3` cannot be deleted. Interfaces with active connections
 *   cannot be deleted either.
 *
 * Errors are caught and printed to the terminal. At least one option must be provided.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Tokenised command arguments.
 *   Format: ["iface", "--add"] or ["iface", "--del=<interface|all>"]
 * @returns {void}
 */
function command_iface(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId);
    const selectedOptions = {};

    const $OPTS = catchopts([
        "--add",
        "--del:",
    ], args);

    const optionHandlers = {

        "--add": () => {
            selectedOptions["--add"] = true;
            addInterface(networkObjectId);
            terminalMessage(`iface: Interface enp0s${maxIfaceIndex(networkObjectId)} added.`, networkObjectId);
        },

        "--del": () => {

            selectedOptions["--del"] = true;

            const iface = ($OPTS["--del"]);

            if (!iface) throw new Error(`Error: You must specify an interface to remove.`);

            if (iface === "all") {

                for (const iface of availableInterfaces.slice(1)) {

                    if ($networkObject.getAttribute(`data-switch-${iface}`) !== "") {
                        terminalMessage(`iface: Cannot remove interface ${iface} because it has an active connection.`, networkObjectId);
                        continue;
                    }

                    deleteInterface(networkObjectId, iface);
                    terminalMessage(`iface: Interface ${iface} removed.`, networkObjectId);

                }

                return;

            }

            if (iface === "enp0s3") {
                throw new Error(`Error: Interface ${iface} cannot be removed.`);
            }

            if (!availableInterfaces.includes(iface)) {
                throw new Error(`Error: Interface "${iface}" does not exist.`);
            }

            if ($networkObject.getAttribute(`data-switch-${iface}`) !== "") {
                throw new Error(`Error: Interface ${iface} has an active connection.`);
            }

            deleteInterface(networkObjectId, iface);
            terminalMessage(`iface: Interface ${iface} removed.`, networkObjectId);

        },

    }


    try {

        for (option in $OPTS) if (optionHandlers[option]) optionHandlers[option]();

        if (isEmptyObject(selectedOptions)) throw new Error(`Error: A valid option must be specified.`);

    } catch (error) {

        terminalMessage(`iface: ${error.message}`, networkObjectId);

    }

}
