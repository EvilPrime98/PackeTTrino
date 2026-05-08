/**
 * Handles the `ipv4-forwarding` terminal command to get or set the IPv4 forwarding state
 * on a network object.
 *
 * When no options are provided, prints the current state. When `on` or `off` is given,
 * updates the `ipv4-forwarding` DOM attribute accordingly. Any other value results in an
 * error message printed to the terminal.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} options - Zero or one element: "on", "off", or empty for status query.
 * @returns {void}
 */
function command_ipv4_forwarding(networkObjectId, options) {

    const $networkObject = document.getElementById(networkObjectId);

    if (options.length === 0) {
        const state = ($networkObject.getAttribute("ipv4-forwarding") === "true") ? "Active (ON)" : "Disabled (OFF)";
        terminalMessage(`ipv4-forwarding: State: ${state}`, networkObjectId);
        return;
    }

    $networkObject.setAttribute("ipv4-forwarding",
        (options[0] === "on")
            ? "true"
            : (options[0] === "off")
                ? "false"
                : terminalMessage(`ipv4-forwarding: Error: unrecognized option.`, networkObjectId)
    );

}
