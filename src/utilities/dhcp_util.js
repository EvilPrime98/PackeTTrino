/**
 * Handles the DHCP discover flow for a DHCP client on the given interface.
 *
 * Verifies the dhclient service is active, prints status messages to the terminal, then
 * triggers a DHCPDISCOVER broadcast via `dhcpDiscoverGenerator`. Prints an error when no
 * DHCP server responds. The terminal is minimised during the operation when visual animations
 * are enabled.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object acting as the DHCP client.
 * @param {string} networkObjectInterface - The interface name from which the discover is sent.
 * @returns {Promise<void>}
 */
export async function dhcpDiscoverHandler(networkObjectId, networkObjectInterface) {

    console.log(networkObjectId, networkObjectInterface);
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);

    if ($networkObject.getAttribute("dhclient") !== "true") {
        terminalMessage("dhclient: The DHCP Client service is not active.", networkObjectId);
        return;
    }

    terminalMessage(`Listening on LPF/${networkObjectInterface}/${networkObjectMac}`, networkObjectId);
    terminalMessage(`Sending on   LPF/${networkObjectInterface}/${networkObjectMac}`, networkObjectId);
    terminalMessage("Sending on   Socket/fallback", networkObjectId);
    terminalMessage(`DHCPDISCOVER on ${networkObjectInterface} to 255.255.255.255 port 67 interval 6`, networkObjectId);

    if (visualToggle) await minimizeTerminal();

        try {

            dhcpDiscoverFlag[networkObjectId] = false;
            dhcpRequestFlag[networkObjectId] = false;
            dhcpOfferBuffer[networkObjectId] = false;

            await dhcpDiscoverGenerator(networkObjectId, networkObjectInterface);

            if (dhcpDiscoverFlag[networkObjectId] === false || dhcpRequestFlag[networkObjectId] === false) {
                terminalMessage("\ndhclient: Could not connect to any DHCP server.", networkObjectId);
            }

        }catch (error) {

            terminalMessage("dhclient: Could not connect to any DHCP server.", networkObjectId);
            console.log(error);

        }

    if (visualToggle) await maximizeTerminal();

}

/**
 * Handles a DHCP lease renewal request for a client on the given interface.
 *
 * Validates that the interface has IP, netmask, and DHCP server attributes set, then sends a
 * DHCPREQUEST via `dhcpRequestGenerator`. The `renewPhase` parameter controls whether the
 * request is unicast (normal) or broadcast (T2 fallback).
 *
 * @param {string} networkObjectId - The DOM element ID of the network object renewing its lease.
 * @param {string} renewPhase - Renewal phase: "T1" for unicast or "T2" for broadcast fallback.
 * @param {string} networkObjectInterface - The interface whose lease is being renewed.
 * @returns {Promise<void>}
 */
export async function dhcpRenewHandler(networkObjectId, renewPhase, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("dhclient: Network configuration error.", networkObjectId);
        return;
    }

    terminalMessage(`DHCPREQUEST on ${networkObjectInterface} to ${networkObjectDhcpServer} port 67`, networkObjectId);

    try {

        dhcpRequestFlag[networkObjectId] = false;
        await dhcpRequestGenerator(networkObjectId, renewPhase, networkObjectInterface);

    } catch (error) {

        terminalMessage("Error: " + error, networkObjectId);

    }

}

/**
 * Handles a DHCP lease release for a client on the given interface.
 *
 * Prints a status message and calls `dhcpReleaseGenerator` to send the DHCPRELEASE packet and
 * clear the interface configuration. The terminal is minimised during the operation when visual
 * animations are enabled.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object releasing its lease.
 * @param {string} networkObjectInterface - The interface whose lease is being released.
 * @returns {Promise<void>}
 */
export async function dhcpReleaseHandler(networkObjectId, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    const networkObjectDhcpServer = $networkObject.getAttribute(`data-dhcp-server-${networkObjectInterface}`);

    terminalMessage(`DHCPRELEASE of ${networkObjectIp} on ${networkObjectInterface} to ${networkObjectDhcpServer} port 67`, networkObjectId);

    if (visualToggle) await minimizeTerminal();

        try {
            await dhcpReleaseGenerator(networkObjectId, networkObjectInterface);
        } catch (error) {
            terminalMessage("Error: " + error, networkObjectId);
        }

    if (visualToggle) await maximizeTerminal();

}
