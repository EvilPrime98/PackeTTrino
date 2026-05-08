/**
 * Executes a ping command from a network object to a destination address and handles
 * the result through a state-code dispatch table. Minimizes and restores the terminal
 * around the animated packet traversal when visual mode is active.
 *
 * State codes returned by {@link ping}:
 * - `0` — success
 * - `1` — unknown hostname / service
 * - `2` — invalid IP address
 * - `3` — host unreachable (no reply)
 * - `4` — network unreachable
 *
 * @param {string} networkObjectId - The DOM element ID of the source network object.
 * @param {string} destination - The hostname or IP address to ping.
 * @returns {Promise<void>}
 *
 * @example
 * await command_ping("pc-1", "192.168.1.1");
 * await command_ping("pc-1", "google.com");
 */
async function command_ping(networkObjectId, destination) {

    const $networkObject = document.getElementById(networkObjectId);

    const stateHandler = {
        0: () => pingSuccess(destination),
        1: () => terminalMessage(`ping: ${destination}: Name or service not known.`, networkObjectId),
        2: () => terminalMessage(`ping: ${destination}: The IP address is not valid.`, networkObjectId),
        3: () => pingFailure(destination),
        4: () => terminalMessage(`ping: ${destination}: Network is unreachable.`, networkObjectId)
    }

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

        const stateCode = await ping(networkObjectId, destination); //<-- perform the ping and get the state code
        stateHandler[stateCode](); //<-- execute the state handler

    if (visualToggle) await maximizeTerminal();

}

/**
 * Handles an interactive two-click ping on the board canvas.
 * The first call records the source object and places a visual cursor indicator on it.
 * The second call executes the ping from the recorded source to the newly selected
 * object's first available IP, then clears all cursor indicators.
 * Shows a popup error if the selected object has no configured IP address.
 *
 * @param {string} id - The DOM element ID of the network object being clicked.
 * @returns {Promise<void>}
 *
 * @example
 * // First click — sets source
 * await quickPing("pc-1");
 * // Second click — executes ping from pc-1 to pc-2's IP
 * await quickPing("pc-2");
 */
async function quickPing(id) {

    const $networkObject = document.getElementById(id);
    const $board = document.querySelector(".board");
    const networkObjectIp = getAvailableIps($networkObject.id)[0];

    if (!networkObjectIp) {
        bodyComponent.render(popupMessage("<span>Error: </span> No IP found for object " + id));
        return;
    }

    if (quickPingObject === "") {
        quickPingObject = id;
        createPacketIndicator(id);
        return;
    }

    createPacketIndicator(id);

    visualToggle =  true;

        await ping(quickPingObject, networkObjectIp);
        $board.querySelectorAll(".pack-cursor").forEach(cursor => {cursor.remove();});
        quickPingObject = "";

    visualToggle = false;


}
