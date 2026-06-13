/**
 * Parses the content of `dhcpd.conf` and applies the DHCP server configuration to
 * the network device element.
 *
 * The parser handles two top-level block types:
 *
 * **`shared-network > subnet` blocks** — each subnet block may contain:
 * - `range <start> <end>` — address pool boundaries
 * - `option subnet-mask <mask>`
 * - `option routers <gateway>`
 * - `option domain-name-servers <ip>[, <ip>...]`
 * - `lease-time <seconds>`
 *
 * Each subnet is validated with `validateDhpcConfiguration` before its values are
 * written to the element's attributes.
 *
 * **`host` blocks** — each host block may contain:
 * - `hardware ethernet <mac>` — client MAC address
 * - `fixed-address <ip>` — reserved IP
 *
 * The reserved IP must be a valid IP in the same network as the configured DHCP pool,
 * and `addDhcpReservation` is called for each valid host block.
 *
 * Comment lines (starting with `#`) and blank lines are ignored.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @param {string} content - Raw text content of the `dhcpd.conf` file.
 * @returns {void}
 * @throws {Error} If subnet validation fails (via `validateDhpcConfiguration`).
 * @throws {Error} If a host block contains an invalid MAC address.
 * @throws {Error} If a host block contains an invalid IP address.
 * @throws {Error} If a reserved IP does not belong to the DHCP server's subnet.
 */
// [agent-added: esm-migration phase 05]
import { isValidMac, isValidIp, getNetwork } from '../lib/network_lib.js';
import { validateDhpcConfiguration, addDhcpReservation } from '../lib/dhcp_lib.js';

// [agent-added: esm-migration phase 05]
export function dhcpdConfInterpreter(networkObjectId, content)  {

    const $networkObject = document.getElementById(networkObjectId);
    const dhcpListenOnInterfaces = $networkObject.getAttribute("dhcp-listen-on-interfaces").split(",");

    //remove commented lines
    const contentWithoutComments = content
    .split("\n")
    .map(line => line.trim())
    .filter(line => !line.startsWith("#"))
    .join("\n");

    //remove line breaks and spaces
    const filteredContent = contentWithoutComments
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

    //get SHARED-NETWORK blocks
    const sharedNetworkBlocks = filteredContent
    .split("shared-network")
    .map(line => (`shared-network ${line}`).replace(/\s+/g, " ")
    .trim())
    .slice(1);

    sharedNetworkBlocks.forEach(sharedNetworkBlock => {

        const tokens = sharedNetworkBlock.split(" ");
        const sharedNetworkName = tokens[1];
        const subnetBlocks = sharedNetworkBlock.split("subnet ").map(line => (`subnet ${line}`).replace(/\s+/g, " ").trim()).slice(1);

        subnetBlocks.forEach(subnetBlock => {

            const instructions = (subnetBlock.split("{")[1].split("}")[0]).split(";").map(option => option.trim()).filter(option => option !== "");

            const subnetObject = {
                "rangeStart": "",
                "rangeEnd": "",
                "netmask": "",
                "routers": "",
                "domain-name-servers": "",
                "lease-time": ""
            }

            instructions.forEach(instruction => {

                const tokens = instruction.split(" ");

                const optionsMap = {

                    "range": () => {
                        subnetObject["rangeStart"] = tokens[1];
                        subnetObject["rangeEnd"] = tokens[2];
                    },

                    "option subnet-mask": () => {
                        subnetObject["netmask"] = tokens[2];
                    },

                    "option routers": () => {
                        subnetObject["routers"] = tokens[2];
                    },

                    "option domain-name-servers": () => {
                        subnetObject["domain-name-servers"] = instruction
                        .split(" ")
                        .slice(2)
                        .join(" ")
                        .split(",")
                        .map(item => item.trim())
                        .filter(item => item !== "");
                    },

                    "lease-time": () => {
                        subnetObject["lease-time"] = tokens[1];
                    },

                }

                for (const option in optionsMap) if (instruction.startsWith(option)) optionsMap[option]();

            });

            //validate the fields

            validateDhpcConfiguration($networkObject.id,
                {
                    dhcpListenOnInterfaces: dhcpListenOnInterfaces,
                    rangeStart: subnetObject["rangeStart"],
                    rangeEnd: subnetObject["rangeEnd"],
                    dhcpOfferGateway: subnetObject["routers"],
                    dhcpOfferNetmask: subnetObject["netmask"],
                    dhcpOfferDnsServers: subnetObject["domain-name-servers"],
                    dhcpOfferLeaseTime: subnetObject["lease-time"]
                }
            )

            //apply the changes

            $networkObject.setAttribute("data-range-start", subnetObject["rangeStart"]);
            $networkObject.setAttribute("data-range-end", subnetObject["rangeEnd"]);
            $networkObject.setAttribute("dhcp-offer-netmask", subnetObject["netmask"]);
            $networkObject.setAttribute("dhcp-offer-gateway", subnetObject["routers"]);
            $networkObject.setAttribute("dhcp-offer-dns", subnetObject["domain-name-servers"].join(","));
            $networkObject.setAttribute("dhcp-offer-lease-time", subnetObject["lease-time"]);

        });

    });

    const hostBlocks = filteredContent.split("host").map(line => (`host ${line}`).replace(/\s+/g, " ").trim()).slice(1);

    hostBlocks.forEach(hostBlock => {

        const instructions = (hostBlock.split("{")[1].split("}")[0]).split(";").map(option => option.trim()).filter(option => option !== "");

        const hostObject = {
            "mac": "",
            "reservedIp": ""
        }

        instructions.forEach(instruction => {

            const tokens = instruction.split(" ");

            const optionsMap = {

                "hardware ethernet": () => {
                    hostObject["mac"] = tokens[2].toUpperCase();
                },

                "fixed-address": () => {
                    hostObject["reservedIp"] = tokens[1];
                },

            }

            for (const option in optionsMap) if (instruction.startsWith(option)) optionsMap[option]();

        });

        //validate the fields

        if (!isValidMac(hostObject["mac"])) throw new Error(`Error: MAC address "${hostObject["mac"]}" is not valid`);
        if (!isValidIp(hostObject["reservedIp"])) throw new Error(`Error: IP address "${hostObject["reservedIp"]}" is not valid`);

        const offerNetmask = $networkObject.getAttribute("dhcp-offer-netmask");
        const rangeStart = $networkObject.getAttribute("data-range-start");

        if (getNetwork(hostObject["reservedIp"], offerNetmask) !== getNetwork(rangeStart, offerNetmask))
            throw new Error(`Error: IP address "${hostObject["reservedIp"]}" does not belong to the DHCP server's service range.`);
        addDhcpReservation(networkObjectId, hostObject["mac"], hostObject["reservedIp"]);

    });
}
