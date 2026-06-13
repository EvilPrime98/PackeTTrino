/**
 * Parses the content of `/etc/default/isc-dhcp-server` and applies the listen-interface
 * setting to the network device element.
 *
 * Recognised directive:
 * - `INTERFACESv4="<iface> ..."` — sets the interfaces the DHCP server listens on.
 *   The list must not be empty, and every listed interface must exist on the device.
 *
 * Comment lines (starting with `#`) and blank lines are ignored.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @param {string} content - Raw text content of the `/etc/default/isc-dhcp-server` file.
 * @returns {void}
 * @throws {Error} If `INTERFACESv4` is empty (no listen interfaces declared).
 * @throws {Error} If any listed interface does not exist on the device.
 */
// [agent-added: esm-migration phase 05]
import { splitFirst, splitLast } from '../lib/component_lib.js';
import { getInterfaces } from '../lib/network_lib.js';

// [agent-added: esm-migration phase 05]
export function iscDhcpServerInterpreter(networkObjectId, content)  {

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

        if (line.startsWith("INTERFACESv4=")) {

            const fileInterfaces = (splitLast(splitFirst(splitFirst(line, "=")[1], '"')[1], '"')[0])
            .split(" ")
            .map(iface => iface.trim())
            .filter(iface => iface !== "");

            if (fileInterfaces.length === 0) throw new Error(`/default/isc-dhcp-server: no listen interfaces specified.`);

            const availableInterfaces = getInterfaces(networkObjectId);

            if (!fileInterfaces.every(fileInterface => availableInterfaces.includes(fileInterface))) {
                throw new Error(`/default/isc-dhcp-server: unrecognised interfaces ${fileInterfaces.filter(fileInterface => !availableInterfaces.includes(fileInterface))}`);
            }

            $networkObject.setAttribute("dhcp-listen-on-interfaces", fileInterfaces.join(","));

        }

    });

}
