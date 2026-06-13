/**
 * Parses the content of `/etc/default/isc-dhcp-relay` and applies the settings to
 * the network device element.
 *
 * Recognised directives:
 * - `INTERFACES="<iface> ..."` — sets the interfaces the relay agent listens on.
 *   Every listed interface must exist on the device.
 * - `SERVERS="<ip>"` — sets the target DHCP server IP. Only the first value is used
 *   and it must be a valid IP address.
 *
 * Comment lines (starting with `#`) and blank lines are ignored.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @param {string} content - Raw text content of the `/etc/default/isc-dhcp-relay` file.
 * @returns {void}
 * @throws {Error} If any interface listed in `INTERFACES` does not exist on the device.
 * @throws {Error} If the value in `SERVERS` is not a valid IP address.
 */
// [agent-added: esm-migration phase 05]
import { splitFirst, splitLast } from '../lib/component_lib.js';
import { getInterfaces, isValidIp } from '../lib/network_lib.js';

// [agent-added: esm-migration phase 05]
export function iscDhcpRelayInterpreter(networkObjectId, content) {

    const $networkObject = document.getElementById(networkObjectId);

    //remove commented lines
    const contentWithoutComments = content
    .split("\n")
    .map(line => line.trim())
    .filter(line => !line.startsWith("#"))
    .join("\n");

    //remove line breaks and spaces
    const contentLines = contentWithoutComments
    .split("\n")
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(line => !line.startsWith("#"))

    contentLines.forEach(line => {

        if (line.startsWith("INTERFACES=")) {

            const fileInterfaces = (splitLast(splitFirst(splitFirst(line, "=")[1], '"')[1], '"')[0])
            .split(" ")
            .map(iface => iface.trim())
            .filter(iface => iface !== "");

            const availableInterfaces = getInterfaces(networkObjectId);

            if (!fileInterfaces.every(fileInterface => availableInterfaces.includes(fileInterface))) {
                throw new Error(`/default/isc-dhcp-server: unrecognised interfaces ${fileInterfaces.filter(fileInterface => !availableInterfaces.includes(fileInterface))}`);
            }

            $networkObject.setAttribute("dhcrelay-listen-on-interfaces", fileInterfaces.join(","));

        }

        if (line.startsWith("SERVERS=")) {

            const fileServer = (splitLast(splitFirst(splitFirst(line, "=")[1], '"')[1], '"')[0])
            .split(" ")[0].trim()

            if (!isValidIp(fileServer)) throw new Error(`/default/isc-dhcp-server: unrecognised server ${fileServer}`);

            $networkObject.setAttribute("dhcrelay-main-server", fileServer);

        }

    });

}
