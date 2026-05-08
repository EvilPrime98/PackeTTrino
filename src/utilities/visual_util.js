/**
 * Configures the packet animation visual settings for the simulator.
 * Parses the provided arguments for recognized flags, applies changes to the global
 * `visualSpeed` and `visualToggle` state, and validates that any new speed value
 * falls within the accepted range [100, 1000] ms. Prints an error and aborts if
 * validation fails.
 *
 * Supported options (parsed by {@link catchopts}):
 * - `speed:<ms>` — sets animation speed in milliseconds
 * - `on`         — enables packet animation
 * - `off`        — disables packet animation
 * - `config`     — prints current speed and mode to the terminal without changing them
 *
 * @param {string} networkObjectId - The DOM element ID of the network object issuing the command.
 * @param {Array<string>} args - Raw CLI argument tokens to be parsed by catchopts.
 * @returns {void}
 *
 * @example
 * command_visual("pc-1", ["--speed", "300"]);
 * command_visual("pc-1", ["--on"]);
 * command_visual("pc-1", ["--off"]);
 * command_visual("pc-1", ["--config"]);
 */
function command_visual(networkObjectId, args) {

    const $OPTS = catchopts([
        "speed:",
        "off",
        "on",
        "config",
    ], args);

    const optionsHandler = {
        "speed": () => { newVisualSpeed = parseInt($OPTS["speed"]); },
        "off": () => { newVisualMode = "OFF"; },
        "on": () => { newVisualMode = "ON"; },
        "config": () => {
            terminalMessage(`Animation speed: ${visualSpeed} ms`, networkObjectId);
            terminalMessage(`Animation mode: ${(visualToggle ? "ON" : "OFF")}`, networkObjectId);
        },
    }

    let newVisualSpeed = visualSpeed;
    let newVisualMode = visualToggle ? "ON" : "OFF";

    for (const option in $OPTS) if (optionsHandler[option]) optionsHandler[option]();

    if (isNaN(newVisualSpeed) || newVisualSpeed > 1000 || newVisualSpeed < 100) {
        terminalMessage("Error: invalid animation speed.", networkObjectId);
        return;
    }

    visualSpeed = newVisualSpeed;
    visualToggle = newVisualMode === "ON";

}
