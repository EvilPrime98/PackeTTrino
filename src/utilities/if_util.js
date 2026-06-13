/**
 * Handles the `ifup` terminal command to configure network interfaces from `/etc/network/interfaces`.
 *
 * Reads the interfaces configuration file from the network object's virtual filesystem and
 * delegates to `interfacesFileInterpreter`. The special argument `-a` configures all interfaces
 * defined in the file; otherwise the named interface is configured.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {string} interfaceInput - Interface name to bring up, or "-a" to bring up all interfaces.
 * @returns {Promise<void>}
 */
export async function command_ifup(networkObjectId, interfaceInput)  {

    if (!interfaceInput) terminalMessage("Error: no interface was specified", networkObjectId);
    if (interfaceInput !== "-a" && !getInterfaces(networkObjectId).includes(interfaceInput)) terminalMessage(`Error: interface ${interfaceInput} is not recognized`, networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const networkElementFileSystem = new FileSystem($networkObject);
    const directoryPath = pathBuilder("/etc/network/interfaces");
    const fileName = directoryPath.pop();

    try {
        const interfacesContent = networkElementFileSystem.read(fileName, directoryPath);
        await interfacesFileInterpreter(networkObjectId, interfacesContent, interfaceInput);
    } catch (e) {
        terminalMessage(`ifup: ${e.message}`, networkObjectId);
    }

}

/**
 * Handles the `ifdown` terminal command to deconfigure network interfaces.
 *
 * Iterates over all interfaces matching `interfaceInput` (or all interfaces when `-a` is used).
 * If the dhclient service is active and the interface has an IP, sends a DHCP release first.
 * Otherwise calls `deconfigureInterface` to remove IP and routing rules directly.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {string} interfaceInput - Interface name to take down, or "-a" to take down all interfaces.
 * @returns {void}
 */
export function command_ifdown(networkObjectId, interfaceInput)  {

    if (!interfaceInput) terminalMessage("Error: no interface was specified", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId);

    if (interfaceInput !== "-a" && !getInterfaces(networkObjectId).includes(interfaceInput)) {
        terminalMessage(`Error: interface ${interfaceInput} is not recognized`, networkObjectId);
    }

    availableInterfaces.forEach(availableInterface => {

        if (interfaceInput === "-a" || interfaceInput === availableInterface) {

            if ($networkObject.getAttribute("dhclient") === "true") {
                const networkObjectIp = $networkObject.getAttribute(`ip-${availableInterface}`);
                if (networkObjectIp) dhcpReleaseHandler(networkObjectId, availableInterface);
                return;
            }

            deconfigureInterface(networkObjectId, availableInterface);

        }

    });

}
