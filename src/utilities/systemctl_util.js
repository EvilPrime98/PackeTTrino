/**
 * Handles the `systemctl` terminal command for managing network services on a node.
 * Validates the option against the allowed set and dispatches to the appropriate
 * service routine. Prints usage guidance on invalid options and forwards service
 * errors to the terminal.
 *
 * Supported options:
 * - `start`      — starts the named service
 * - `restart`    — restarts the named service
 * - `stop`       — stops the named service
 * - `status`     — reports the current status of the named service
 * - `list-units` — lists all available services on the node
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Full argument list where `args[1]` is the option and `args[2]` is the service name.
 * @returns {void}
 *
 * @example
 * command_systemctl("server-1", ["systemctl", "start", "apache2"]);
 * command_systemctl("server-1", ["systemctl", "list-units"]);
 * command_systemctl("server-1", ["systemctl", "status", "dhcpd"]);
 */
export function command_systemctl(networkObjectId, args) {

    const option = args[1];
    const service = args[2];

    const validOptions = ["start", "restart", "stop", "status", "list-units"];

    if (!validOptions.includes(option)) {
        terminalMessage("Error: Unrecognized option.", networkObjectId);
        terminalMessage("Syntax: systemctl [start|restart|stop|status] &lt;service name&gt;", networkObjectId);
        return;
    }

    if (option === "list-units") {
        listallServices(networkObjectId);
        return;
    };

    try {
        systemd(networkObjectId, service, option);
    } catch (e) {
        terminalMessage(e.message, networkObjectId);
    }

}
