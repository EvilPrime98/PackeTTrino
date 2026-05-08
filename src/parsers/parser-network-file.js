/***
 * DIFFERENCES FROM STANDARD LINUX BEHAVIOUR:
 * -a DOES NOT REPRESENT "AUTO" LINES, IT REPRESENTS ALL INTERFACES (--all)
 * INSTRUCTION BLOCKS START WITH "iface" AND MUST BE IN THE FORM "iface <INTERFACE> inet <TYPE> address <IP> netmask <MASK> gateway <IP>"
 * "AUTO <INTERFACE>" DIRECTIVES ARE NOT USED
 * ROUTING RULES MUST BE IN THE FORM "ip route add <DESTINATION_IP>/<DESTINATION_MASK> via <NEXTHOP_IP>"
 * ROUTING RULES DO NOT START WITH "up" OR "down"
 * ROUTING RULES ALWAYS INCLUDE "add"
*/

/**
 * Parses a network interfaces file (similar to `/etc/network/interfaces`) and
 * applies the configuration to the network device.
 *
 * Each `iface` block is processed in order. The block may contain:
 * - `inet static` — configures the interface with a fixed IP, netmask, and optional
 *   gateway. Any `ip route add <dst>/<mask> via <nexthop>` lines inside the block are
 *   also applied as remote routing rules.
 * - `inet dhcp` — marks the interface as DHCP-enabled and triggers a DHCP discovery.
 *   Requires the `isc-dhcp-client` package to be installed on the device.
 *
 * **Simulator differences from standard Linux `/etc/network/interfaces`:**
 * - `-a` means "all interfaces" (equivalent to `--all`), not "auto".
 * - `auto <iface>` directives are not used.
 * - Routing rules use the form `ip route add <dst>/<mask> via <nexthop>` directly
 *   inside the `iface` block (no `up`/`down` prefix).
 * - Routing rules always include the `add` keyword.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @param {string} content - Raw text content of the interfaces file.
 * @param {string} interfaceInput - Interface filter: `"-a"` to process all interfaces,
 *   or a specific interface name (e.g. `"enp0s3"`) to process only that block.
 * @returns {Promise<void>}
 * @throws {Error} If an `iface` block references an interface that does not exist on the device.
 * @throws {Error} If the `inet` type is not `"static"` or `"dhcp"`.
 * @throws {Error} If a static block has an invalid IP address, netmask, or gateway.
 * @throws {Error} If `inet dhcp` is used but `isc-dhcp-client` is not installed.
 * @throws {Error} If a routing rule has an invalid destination CIDR, the destination is
 *   not a network address, the nexthop IP is invalid, or the nexthop is unreachable from
 *   the interface's subnet.
 */
async function interfacesFileInterpreter(networkObjectId, content, interfaceInput) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId); //<-- get the available interfaces of the device

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

    //get IFACE blocks
    const ifaceBlocks = filteredContent
    .split("iface")
    .map(line => (`iface ${line}`).replace(/\s+/g, " ")
    .trim())
    .slice(1);

    // <-- example instruction: iface enp0s3 inet static address 192.168.1.100 netmask 255.255.255.0 gateway 192.168.1.1

    for (const ifaceBlock of ifaceBlocks) {

        const interfaceObject = { //<-- initialise the parse object
            "iface": "",
            "inet": "",
            "address": "",
            "netmask": "",
            "gateway": ""
        }

        const tokens = (`int ${ifaceBlock}`).split(" "); //<-- split the instruction into tokens, adding a prefix so the options parser can work

        const $OPTS = catchopts([ //<-- get the instruction options and their values
            "iface:",
            "inet:",
            "address:",
            "netmask:",
            "gateway:"
        ], tokens);

        const optionsHandler = { //<-- define the options handler
            "iface": () => { interfaceObject["iface"] = $OPTS["iface"]; },
            "inet": () => { interfaceObject["inet"] = $OPTS["inet"]; },
            "address": () => { interfaceObject["address"] = $OPTS["address"]; },
            "netmask": () => { interfaceObject["netmask"] = $OPTS["netmask"]; },
            "gateway": () => { interfaceObject["gateway"] = $OPTS["gateway"]; }
        }

        for (const option in $OPTS) if (optionsHandler[option]) optionsHandler[option]();

        if (!availableInterfaces.includes(interfaceObject["iface"])) {
            throw new Error(`Error: unrecognised interface ${interfaceObject["iface"]}`);
        }

        if (!["static", "dhcp"].includes(interfaceObject["inet"])) {
            throw new Error(`Error: unrecognised network type ${interfaceObject["inet"]}`);
        }

        if (interfaceInput !== "-a" && interfaceInput !== interfaceObject["iface"]) continue;

        if (interfaceObject["inet"] === "static") {

            if (!isValidIp(interfaceObject["address"])) {
                throw new Error(`Error: IP address ${interfaceObject["address"]} is not valid`);
            }

            if (!isValidIp(interfaceObject["netmask"])) {
                throw new Error(`Error: netmask ${interfaceObject["netmask"]} is not valid`);
            }

            if (interfaceObject["gateway"] !== "" && !isValidIp(interfaceObject["gateway"])) {
                throw new Error(`Error: gateway ${interfaceObject["gateway"]} is not valid`);
            }

            configureInterface(networkObjectId,
                interfaceObject["address"],
                interfaceObject["netmask"],
                interfaceObject["iface"]
            );

            if (interfaceObject["gateway"] !== "") setDefaultGateway(networkObjectId, interfaceObject["gateway"]);

        }

        if (interfaceObject["inet"] === "dhcp") {

            if ($networkObject.getAttribute("dhclient") !== "true") {
                throw new Error(`Error: the device does not have the DHCP client service installed.\nHint -> apt install isc-dhcp-client`);
            }

            $networkObject.setAttribute(`data-dhclient-${interfaceObject["iface"]}`, "true");

            await dhcpDiscoverHandler(networkObjectId, interfaceObject["iface"]);

            continue;

        }

        const routingInstructions = ifaceBlock.split("ip").map(rule => (`ip ${rule}`).replace(/\s+/g, " ").trim()).slice(1);

        routingInstructions.forEach(routingInstruction => {

            const tokens = routingInstruction.split(" "); //<-- get the tokens of the ip route instruction
            const destinationCIDR = tokens[3];
            const nexthop = tokens[5];

            if (!isValidCidrIp(destinationCIDR)) throw new Error(`Error: IP address ${destinationCIDR} is not valid`);

            const [destinationIp, netmaskIp] = parseCidr(destinationCIDR);

            if (getNetwork(destinationIp, netmaskIp) !== destinationIp) {
                throw new Error(`Error: IP address ${destinationCIDR} is not a network address`);
            }

            if (!isValidIp(nexthop)) throw new Error(`Error: IP address ${nexthop} is not valid`);

            if (getNetwork(nexthop, interfaceObject["netmask"]) !== getNetwork(interfaceObject["address"], interfaceObject["netmask"])) {
                throw new Error(`Error: IP address ${nexthop} is not reachable`);
            }

            setRemoteRoutingRule(networkObjectId,
                destinationIp, //<-- destination network
                netmaskIp, //<-- netmask
                interfaceObject["address"], //<-- outgoing IP
                interfaceObject["iface"], //<-- interface
                nexthop //<-- next hop
            );

        });

    };

}
